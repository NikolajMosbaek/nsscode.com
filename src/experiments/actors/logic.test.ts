import { describe, expect, it } from "vitest";
import {
	createWorld,
	isFinished,
	run,
	type Scenario,
	scenarios,
	step,
} from "./logic";

const byS = (slug: string): Scenario => {
	const s = scenarios.find((x) => x.slug === slug);
	if (!s) throw new Error(slug);
	return s;
};

describe("step", () => {
	it("does not mutate the previous world", () => {
		const before = createWorld(byS("contention"));
		const snapshot = JSON.stringify(before);
		step(before);
		expect(JSON.stringify(before)).toBe(snapshot);
	});

	it("admits exactly one task per actor at a time", () => {
		let world = createWorld(byS("contention"));
		for (let i = 0; i < 40; i++) {
			world = step(world);
			const running = world.tasks.filter((t) => t.phase === "running");
			expect(running.length).toBeLessThanOrEqual(1);
			for (const actor of world.actors) {
				const inside = world.tasks.filter(
					(t) => t.phase === "running" && t.steps[t.index].actor === actor.id,
				);
				expect(inside.length).toBeLessThanOrEqual(1);
			}
		}
	});

	it("admits in arrival order", () => {
		const world = run(byS("contention"));
		const entries = world.log
			.filter((e) => e.text.includes("enters Counter"))
			.map((e) => e.task);
		expect(entries).toEqual([0, 1, 2, 3, 4, 5]);
	});
});

describe("reentrancy", () => {
	it("lets another task in while the first awaits elsewhere", () => {
		const world = run(byS("reentrancy"));
		const texts = world.log.map((e) => e.text);
		const leaves = texts.findIndex((t) => t.startsWith("Task 1 awaits Logger"));
		const twoEnters = texts.indexOf("Task 2 enters Counter.");
		const oneBack = texts.findIndex((t) =>
			t.startsWith("Task 1 re-enters Counter"),
		);
		expect(leaves).toBeGreaterThan(-1);
		expect(twoEnters).toBeGreaterThan(leaves);
		expect(oneBack).toBeGreaterThan(twoEnters);
		expect(world.log.some((e) => e.reentry)).toBe(true);
	});
});

describe("run", () => {
	it("finishes every scenario", () => {
		for (const scenario of scenarios) {
			const world = run(scenario);
			expect(isFinished(world)).toBe(true);
			expect(world.tick).toBeLessThan(100);
		}
	});

	it("is deterministic", () => {
		const a = run(byS("main-actor"));
		const b = run(byS("main-actor"));
		expect(a).toEqual(b);
	});
});
