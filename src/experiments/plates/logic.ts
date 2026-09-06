/*
 * Plate maths for a barbell. Everything is in kilograms and per side.
 * The heaviest plate goes on first, closest to the collar; the lightest
 * sits furthest out. Loading is an exact-change problem with a limited
 * number of each plate, so it is solved as a bounded knapsack over 0.25 kg
 * steps rather than greedily: 30 kg with 25, 20 and 10 available is
 * 20 + 10, not 25 and a shrug.
 */

export interface PlateStock {
	kg: number;
	/** Plates of this size available per side. */
	perSide: number;
}

export interface Loading {
	target: number;
	bar: number;
	/** Plates for one side, heaviest first. Mirror it for the other side. */
	perSide: number[];
	/** What is actually on the bar. */
	total: number;
	exact: boolean;
}

export const STEP = 0.25;

export const standardStock: PlateStock[] = [
	{ kg: 25, perSide: 2 },
	{ kg: 20, perSide: 2 },
	{ kg: 15, perSide: 1 },
	{ kg: 10, perSide: 2 },
	{ kg: 5, perSide: 2 },
	{ kg: 2.5, perSide: 2 },
	{ kg: 1.25, perSide: 2 },
];

export const bars = [
	{ kg: 20, label: "20 kg", note: "men's olympic bar" },
	{ kg: 15, label: "15 kg", note: "women's olympic bar" },
	{ kg: 10, label: "10 kg", note: "technique bar" },
];

function toUnits(kg: number): number {
	return Math.round(kg / STEP);
}

function fromUnits(units: number): number {
	return units * STEP;
}

/**
 * Which per-side weights the stock can make at all, as the fewest plates
 * needed for each: a bounded knapsack over quarter-kilo units. Used to find
 * the nearest achievable weight; the exact combination is chosen separately.
 */
function table(stock: PlateStock[], maxUnits: number) {
	const INF = Number.POSITIVE_INFINITY;
	const best = new Array<number>(maxUnits + 1).fill(INF);
	best[0] = 0;
	/* Expand each plate into single items, so every copy is a 0/1 choice. */
	const items: number[] = [];
	for (const plate of stock) {
		for (let i = 0; i < plate.perSide; i++) items.push(toUnits(plate.kg));
	}
	for (const units of items) {
		for (let w = maxUnits; w >= units; w--) {
			if (best[w - units] + 1 < best[w]) best[w] = best[w - units] + 1;
		}
	}
	return { best };
}

/**
 * The exact combination for `units` per side: fewest plates, and among
 * equals the one that puts heavier plates first. Depth-first over plate
 * sizes heaviest-first, so the first exact hit at a given count is the
 * lexicographically heaviest one.
 */
function combination(stock: PlateStock[], units: number): number[] | null {
	const sizes = [...stock].sort((a, b) => b.kg - a.kg);
	const unitsOf = sizes.map((p) => toUnits(p.kg));
	const suffixCapacity = new Array<number>(sizes.length + 1).fill(0);
	for (let i = sizes.length - 1; i >= 0; i--) {
		suffixCapacity[i] = suffixCapacity[i + 1] + unitsOf[i] * sizes[i].perSide;
	}
	let best: number[] | null = null;
	const walk = (i: number, left: number, picked: number[]) => {
		if (best && picked.length >= best.length) return;
		if (left === 0) {
			best = [...picked];
			return;
		}
		if (i >= sizes.length || suffixCapacity[i] < left) return;
		const max = Math.min(sizes[i].perSide, Math.floor(left / unitsOf[i]));
		for (let n = max; n >= 0; n--) {
			for (let k = 0; k < n; k++) picked.push(sizes[i].kg);
			walk(i + 1, left - n * unitsOf[i], picked);
			for (let k = 0; k < n; k++) picked.pop();
		}
	};
	walk(0, units, []);
	return best;
}

/**
 * Load `target` kilograms onto a `bar` from `stock`. If the exact weight is
 * not possible, returns the nearest achievable weight below it. The plates
 * come back heaviest first.
 */
export function load(
	target: number,
	bar: number,
	stock: PlateStock[],
): Loading {
	const usable = stock.filter((p) => p.kg > 0 && p.perSide > 0);
	const perSideKg = (target - bar) / 2;
	if (perSideKg <= 0) {
		return { target, bar, perSide: [], total: bar, exact: target === bar };
	}
	const wanted = toUnits(perSideKg);
	const capacity = usable.reduce(
		(sum, p) => sum + toUnits(p.kg) * p.perSide,
		0,
	);
	const maxUnits = Math.min(wanted, capacity);
	const { best } = table(usable, maxUnits);

	let units = maxUnits;
	while (units > 0 && !Number.isFinite(best[units])) units--;
	const perSide = combination(usable, units) ?? [];
	const total = bar + fromUnits(units) * 2;
	return { target, bar, perSide, total, exact: total === target };
}

/** The smallest total above `target` that the stock can make, if any. */
export function nextAbove(
	target: number,
	bar: number,
	stock: PlateStock[],
): number | null {
	const usable = stock.filter((p) => p.kg > 0 && p.perSide > 0);
	const capacity = usable.reduce(
		(sum, p) => sum + toUnits(p.kg) * p.perSide,
		0,
	);
	const wanted = toUnits((target - bar) / 2);
	if (wanted >= capacity) return null;
	const { best } = table(usable, capacity);
	for (let units = wanted + 1; units <= capacity; units++) {
		if (Number.isFinite(best[units])) return bar + fromUnits(units) * 2;
	}
	return null;
}

export interface RampStep {
	label: string;
	loading: Loading;
	reps: string;
}

/**
 * A warm-up ramp towards a work weight: the empty bar, then rising
 * fractions, each rounded to the nearest loadable weight.
 */
export function ramp(
	target: number,
	bar: number,
	stock: PlateStock[],
): RampStep[] {
	const fractions: [number, string][] = [
		[0.5, "5"],
		[0.7, "3"],
		[0.85, "2"],
		[0.93, "1"],
	];
	const steps: RampStep[] = [
		...(bar > 0
			? [{ label: "bar", loading: load(bar, bar, stock), reps: "8 to 10" }]
			: []),
	];
	let last = bar;
	for (const [fraction, reps] of fractions) {
		const wanted = Math.max(bar, roundTo(target * fraction, 2.5));
		if (wanted <= last || wanted > target - 5) continue;
		const loading = load(wanted, bar, stock);
		if (loading.total <= last) continue;
		steps.push({ label: `${Math.round(fraction * 100)}%`, loading, reps });
		last = loading.total;
	}
	steps.push({
		label: "work",
		loading: load(target, bar, stock),
		reps: "as planned",
	});
	return steps;
}

export function roundTo(value: number, step: number): number {
	return Math.round(value / step) * step;
}

export function formatKg(kg: number): string {
	return Number.isInteger(kg)
		? String(kg)
		: kg.toFixed(kg * 4 === Math.round(kg * 4) ? 2 : 1).replace(/0$/, "");
}
