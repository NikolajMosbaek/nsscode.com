/*
 * Barbell programmes generated from four one-rep maxes. Every set weight
 * is rounded to something the rack can actually load, using the Plates
 * engine. Three programmes, deliberately the classic versions with no
 * variants: the point is a printable sheet, not a coaching app.
 */
import {
	load,
	nextAbove,
	type PlateStock,
	standardStock,
} from "../plates/logic";

export type Lift = "squat" | "bench" | "deadlift" | "press";
export const lifts: { id: Lift; name: string; lower: boolean }[] = [
	{ id: "squat", name: "Squat", lower: true },
	{ id: "bench", name: "Bench", lower: false },
	{ id: "deadlift", name: "Deadlift", lower: true },
	{ id: "press", name: "Press", lower: false },
];

export type Maxes = Record<Lift, number>;

export interface Rack {
	bar: number;
	stock: PlateStock[];
}

export interface SetPlan {
	reps: number;
	/** Take as many reps as possible on this set. */
	amrap?: boolean;
	/** Target before rounding, kept so the sheet can show it. */
	target: number;
	weight: number;
	perSide: number[];
	sets: number;
}

export interface Exercise {
	lift: Lift;
	sets: SetPlan[];
	note?: string;
}

export interface Session {
	week: number;
	day: number;
	title: string;
	exercises: Exercise[];
}

export type ProgrammeId = "531" | "texas" | "linear";

export interface Programme {
	id: ProgrammeId;
	name: string;
	blurb: string;
	days: number;
	/** Fixed length, or null when the user picks the number of weeks. */
	fixedWeeks: number | null;
}

export const programmes: Programme[] = [
	{
		id: "531",
		name: "5/3/1",
		blurb:
			"Wendler. Four days, one lift each, three work sets from a training max of 90 %. The last set is as many reps as you have. Week four is a deload. Next cycle add 2,5 kg to the upper and 5 kg to the lower maxes.",
		days: 4,
		fixedWeeks: 4,
	},
	{
		id: "texas",
		name: "Texas Method",
		blurb:
			"Rippetoe. Three days a week: volume Monday at 90 % of Friday's weight, a light Wednesday, and a new five-rep record every Friday. Bench and press swap weekly. Add 2,5 kg a week until you cannot.",
		days: 3,
		fixedWeeks: null,
	},
	{
		id: "linear",
		name: "Linear progression",
		blurb:
			"Three days a week, alternating two sessions. Three sets of five, and the bar goes up every time: 2,5 kg on squat, bench and press, 5 kg on deadlift. Start light. It stops working when it stops working.",
		days: 3,
		fixedWeeks: null,
	},
];

export const defaultRack: Rack = {
	bar: 20,
	stock: standardStock.map((p) => ({ ...p })),
};

/** Nearest loadable total, below or above, never below the bar. */
export function nearest(
	target: number,
	rack: Rack,
): { weight: number; perSide: number[] } {
	const below = load(target, rack.bar, rack.stock);
	if (below.exact) return { weight: below.total, perSide: below.perSide };
	const above = nextAbove(target, rack.bar, rack.stock);
	if (above !== null && above - target < target - below.total) {
		const l = load(above, rack.bar, rack.stock);
		return { weight: l.total, perSide: l.perSide };
	}
	return { weight: below.total, perSide: below.perSide };
}

function set(
	target: number,
	reps: number,
	sets: number,
	rack: Rack,
	amrap = false,
): SetPlan {
	const n = nearest(target, rack);
	return { reps, sets, target, weight: n.weight, perSide: n.perSide, amrap };
}

/** Estimated five-rep max from a one-rep max, Epley. */
export function fiveRepMax(oneRm: number): number {
	return oneRm / (1 + 5 / 30);
}

export function build531(maxes: Maxes, rack: Rack): Session[] {
	const tm = (lift: Lift) => maxes[lift] * 0.9;
	const weeks: { pct: number[]; reps: number[]; deload?: boolean }[] = [
		{ pct: [0.65, 0.75, 0.85], reps: [5, 5, 5] },
		{ pct: [0.7, 0.8, 0.9], reps: [3, 3, 3] },
		{ pct: [0.75, 0.85, 0.95], reps: [5, 3, 1] },
		{ pct: [0.4, 0.5, 0.6], reps: [5, 5, 5], deload: true },
	];
	const order: Lift[] = ["press", "deadlift", "bench", "squat"];
	const out: Session[] = [];
	weeks.forEach((w, wi) => {
		order.forEach((lift, di) => {
			out.push({
				week: wi + 1,
				day: di + 1,
				title: w.deload ? "deload" : `${w.reps.join("/")}`,
				exercises: [
					{
						lift,
						sets: w.pct.map((p, i) =>
							set(tm(lift) * p, w.reps[i], 1, rack, !w.deload && i === 2),
						),
						note: `training max ${Math.round(tm(lift) * 2) / 2} kg`,
					},
				],
			});
		});
	});
	return out;
}

export function buildTexas(maxes: Maxes, rack: Rack, weeks: number): Session[] {
	const out: Session[] = [];
	for (let w = 1; w <= weeks; w++) {
		const bump = 2.5 * (w - 1);
		const squatFri = fiveRepMax(maxes.squat) + bump;
		const benchWeeks = w % 2 === 1;
		const upper: Lift = benchWeeks ? "bench" : "press";
		const light: Lift = benchWeeks ? "press" : "bench";
		const upperFri = fiveRepMax(maxes[upper]) + 2.5 * Math.floor((w - 1) / 2);
		const deadFri = fiveRepMax(maxes.deadlift) + 5 * (w - 1);
		out.push({
			week: w,
			day: 1,
			title: "volume",
			exercises: [
				{ lift: "squat", sets: [set(squatFri * 0.9, 5, 5, rack)] },
				{ lift: upper, sets: [set(upperFri * 0.9, 5, 5, rack)] },
			],
		});
		out.push({
			week: w,
			day: 2,
			title: "light",
			exercises: [
				{ lift: "squat", sets: [set(squatFri * 0.9 * 0.8, 5, 2, rack)] },
				{
					lift: light,
					sets: [set(fiveRepMax(maxes[light]) * 0.8, 5, 3, rack)],
				},
			],
		});
		out.push({
			week: w,
			day: 3,
			title: "intensity",
			exercises: [
				{ lift: "squat", sets: [set(squatFri, 5, 1, rack)], note: "new 5RM" },
				{ lift: upper, sets: [set(upperFri, 5, 1, rack)], note: "new 5RM" },
				{ lift: "deadlift", sets: [set(deadFri, 5, 1, rack)] },
			],
		});
	}
	return out;
}

export function buildLinear(
	maxes: Maxes,
	rack: Rack,
	weeks: number,
): Session[] {
	/* Start at 80 % of the estimated 5RM so the first weeks are easy on purpose. */
	const start = (lift: Lift) => fiveRepMax(maxes[lift]) * 0.8;
	const out: Session[] = [];
	let squat = 0;
	let bench = 0;
	let press = 0;
	let dead = 0;
	for (let i = 0; i < weeks * 3; i++) {
		const a = i % 2 === 0;
		const upper: Lift = a ? "press" : "bench";
		const upperCount = a ? press++ : bench++;
		out.push({
			week: Math.floor(i / 3) + 1,
			day: (i % 3) + 1,
			title: a ? "A" : "B",
			exercises: [
				{
					lift: "squat",
					sets: [set(start("squat") + 2.5 * squat++, 5, 3, rack)],
				},
				{
					lift: upper,
					sets: [set(start(upper) + 2.5 * upperCount, 5, 3, rack)],
				},
				{
					lift: "deadlift",
					sets: [set(start("deadlift") + 5 * dead++, 5, 1, rack)],
				},
			],
		});
	}
	return out;
}

export function build(
	id: ProgrammeId,
	maxes: Maxes,
	rack: Rack,
	weeks: number,
): Session[] {
	if (id === "531") return build531(maxes, rack);
	if (id === "texas") return buildTexas(maxes, rack, weeks);
	return buildLinear(maxes, rack, weeks);
}

/* URL state, so a sheet can be bookmarked or sent. */

export interface State {
	programme: ProgrammeId;
	maxes: Maxes;
	bar: number;
	weeks: number;
	ramp: boolean;
}

export const defaultState: State = {
	programme: "531",
	maxes: { squat: 120, bench: 90, deadlift: 150, press: 60 },
	bar: 20,
	weeks: 4,
	ramp: false,
};

export function encode(s: State): string {
	const q = new URLSearchParams({
		p: s.programme,
		sq: String(s.maxes.squat),
		bp: String(s.maxes.bench),
		dl: String(s.maxes.deadlift),
		pr: String(s.maxes.press),
		bar: String(s.bar),
		w: String(s.weeks),
	});
	if (s.ramp) q.set("ramp", "1");
	return q.toString();
}

export function decode(query: string): State {
	const q = new URLSearchParams(query);
	const num = (key: string, fallback: number, min: number, max: number) => {
		const v = Number(q.get(key));
		return Number.isFinite(v) && v >= min && v <= max && q.has(key)
			? v
			: fallback;
	};
	const p = q.get("p");
	const programme = programmes.some((x) => x.id === p)
		? (p as ProgrammeId)
		: defaultState.programme;
	return {
		programme,
		maxes: {
			squat: num("sq", defaultState.maxes.squat, 20, 500),
			bench: num("bp", defaultState.maxes.bench, 20, 400),
			deadlift: num("dl", defaultState.maxes.deadlift, 20, 500),
			press: num("pr", defaultState.maxes.press, 20, 300),
		},
		bar: num("bar", defaultState.bar, 5, 30),
		weeks: Math.round(num("w", defaultState.weeks, 1, 16)),
		ramp: q.get("ramp") === "1",
	};
}
