/*
 * A discrete-time model of Swift actors. An actor is a room with one door:
 * at most one task is inside at a time, the rest wait at the door in
 * arrival order. A task's work is a list of steps, each "spend N ticks
 * inside actor X". Moving from one step to the next is an `await` across
 * actors: the task leaves its room, which frees it for whoever is waiting.
 * When the task comes back it queues again. That is reentrancy, and it is
 * the whole point of the toy.
 */

export type ActorId = string;
export type TaskId = number;

export interface Step {
	actor: ActorId;
	ticks: number;
}

export interface TaskSpec {
	/** Tick at which the task is created. */
	spawnAt: number;
	steps: Step[];
}

export type Phase = "pending" | "queued" | "running" | "done";

export interface TaskState {
	id: TaskId;
	steps: Step[];
	spawnAt: number;
	/** Index of the current step. */
	index: number;
	/** Ticks left in the current step while running. */
	remaining: number;
	phase: Phase;
	/** Per actor: how many admissions that actor had counted when this task last left it. */
	leftAt: Record<ActorId, number>;
}

export interface ActorState {
	id: ActorId;
	occupant: TaskId | null;
	queue: TaskId[];
	/** Total admissions so far. Lets a returning task see whether anyone else was in. */
	admissions: number;
}

export interface Event {
	tick: number;
	task: TaskId;
	text: string;
	/** Marks the moment a task re-enters an actor it left mid-work. */
	reentry?: boolean;
}

export interface World {
	tick: number;
	actors: ActorState[];
	tasks: TaskState[];
	log: Event[];
}

export interface Scenario {
	slug: string;
	title: string;
	summary: string;
	actors: ActorId[];
	tasks: TaskSpec[];
	swift: string;
}

export function createWorld(scenario: Scenario): World {
	return {
		tick: 0,
		actors: scenario.actors.map((id) => ({
			id,
			occupant: null,
			queue: [],
			admissions: 0,
		})),
		tasks: scenario.tasks.map((spec, id) => ({
			id,
			steps: spec.steps,
			spawnAt: spec.spawnAt,
			index: 0,
			remaining: 0,
			phase: "pending",
			leftAt: {},
		})),
		log: [],
	};
}

function actorOf(world: World, id: ActorId): ActorState {
	const actor = world.actors.find((a) => a.id === id);
	if (!actor) throw new Error(`Unknown actor "${id}"`);
	return actor;
}

/** One tick. Pure: returns a new world, never mutates the argument. */
export function step(previous: World): World {
	const world: World = {
		tick: previous.tick + 1,
		actors: previous.actors.map((a) => ({ ...a, queue: [...a.queue] })),
		tasks: previous.tasks.map((t) => ({ ...t, leftAt: { ...t.leftAt } })),
		log: [...previous.log],
	};
	const say = (task: TaskId, text: string, reentry = false) =>
		world.log.push({ tick: world.tick, task, text, reentry });
	const name = (id: TaskId) => `Task ${id + 1}`;

	/* 1. Running tasks do a tick of work; finished steps leave the room. */
	for (const task of world.tasks) {
		if (task.phase !== "running") continue;
		task.remaining -= 1;
		if (task.remaining > 0) continue;
		const current = task.steps[task.index];
		const actor = actorOf(world, current.actor);
		actor.occupant = null;
		task.leftAt[actor.id] = actor.admissions;
		task.index += 1;
		if (task.index >= task.steps.length) {
			task.phase = "done";
			say(
				task.id,
				`${name(task.id)} finishes in ${current.actor} and returns.`,
			);
		} else {
			const next = task.steps[task.index];
			task.phase = "queued";
			actorOf(world, next.actor).queue.push(task.id);
			say(
				task.id,
				`${name(task.id)} awaits ${next.actor} and leaves ${current.actor}. The door is open again.`,
			);
		}
	}

	/* 2. New tasks arrive at their first door. */
	for (const task of world.tasks) {
		if (task.phase !== "pending" || task.spawnAt > world.tick) continue;
		task.phase = "queued";
		const first = task.steps[0];
		actorOf(world, first.actor).queue.push(task.id);
		say(task.id, `${name(task.id)} arrives at ${first.actor}.`);
	}

	/* 3. Every empty room admits the first task at its door. */
	for (const actor of world.actors) {
		if (actor.occupant !== null || actor.queue.length === 0) continue;
		const id = actor.queue.shift() as TaskId;
		const task = world.tasks[id];
		actor.occupant = id;
		actor.admissions += 1;
		task.phase = "running";
		task.remaining = task.steps[task.index].ticks;
		const left = task.leftAt[actor.id];
		const cameBack = left !== undefined;
		const othersVisited = cameBack && actor.admissions - 1 > left;
		if (cameBack && othersVisited) {
			say(
				id,
				`${name(id)} re-enters ${actor.id}. Someone else was in here while it was away: assume the state changed.`,
				true,
			);
		} else if (cameBack) {
			say(
				id,
				`${name(id)} re-enters ${actor.id}. Nobody came in meanwhile, this time.`,
			);
		} else {
			say(id, `${name(id)} enters ${actor.id}.`);
		}
	}

	return world;
}

export function isFinished(world: World): boolean {
	return world.tasks.every((t) => t.phase === "done");
}

/** Run to completion, with a guard against a scenario that never ends. */
export function run(scenario: Scenario, maxTicks = 500): World {
	let world = createWorld(scenario);
	while (!isFinished(world) && world.tick < maxTicks) world = step(world);
	return world;
}

export const scenarios: Scenario[] = [
	{
		slug: "contention",
		title: "One at a time",
		summary:
			"Six tasks call the same actor. The actor lets one in; the others wait at the door in arrival order. That is isolation: no two tasks touch the state at once.",
		actors: ["Counter"],
		tasks: [0, 0, 1, 1, 2, 3].map((spawnAt) => ({
			spawnAt,
			steps: [{ actor: "Counter", ticks: 3 }],
		})),
		swift: `actor Counter {
    var value = 0

    func increment() {
        value += 1  // one caller in here at a time
    }
}

for _ in 0..<6 {
    Task { await counter.increment() }
}`,
	},
	{
		slug: "reentrancy",
		title: "The door reopens on await",
		summary:
			"Task 1 is inside Counter, then awaits Logger. Awaiting means leaving the room, so Task 2 walks in. When Task 1 comes back, Counter's state is not what it left behind.",
		actors: ["Counter", "Logger"],
		tasks: [
			{
				spawnAt: 0,
				steps: [
					{ actor: "Counter", ticks: 2 },
					{ actor: "Logger", ticks: 4 },
					{ actor: "Counter", ticks: 2 },
				],
			},
			{ spawnAt: 1, steps: [{ actor: "Counter", ticks: 3 }] },
		],
		swift: `actor Counter {
    var value = 0

    func incrementAndLog() async {
        value += 1
        await logger.log("\\(value)")  // suspension point
        // Someone else may have run here.
        // Do not trust the value you wrote.
        value += 1
    }
}`,
	},
	{
		slug: "main-actor",
		title: "Everyone wants the main actor",
		summary:
			"Four tasks do work on a background actor, then hop to the main actor to update the UI. Work overlaps at Worker's door; the UI updates queue at MainActor's.",
		actors: ["Worker", "MainActor"],
		tasks: [0, 0, 1, 2].map((spawnAt) => ({
			spawnAt,
			steps: [
				{ actor: "Worker", ticks: 3 },
				{ actor: "MainActor", ticks: 1 },
			],
		})),
		swift: `actor Worker {
    func crunch() -> Result { /* ... */ }
}

for item in items {
    Task {
        let result = await worker.crunch()
        await MainActor.run { show(result) }  // hop
    }
}`,
	},
];
