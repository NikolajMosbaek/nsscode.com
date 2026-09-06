/** Control points of a CSS cubic-bezier: x1, y1, x2, y2. */
export type Bezier = readonly [number, number, number, number];

export interface Preset {
	name: string;
	points: Bezier;
}

export const presets: Preset[] = [
	{ name: "ease", points: [0.25, 0.1, 0.25, 1] },
	{ name: "ease-in", points: [0.42, 0, 1, 1] },
	{ name: "ease-out", points: [0, 0, 0.58, 1] },
	{ name: "ease-in-out", points: [0.42, 0, 0.58, 1] },
	{ name: "site out", points: [0.2, 0.7, 0.2, 1] },
	{ name: "site in-out", points: [0.6, 0, 0.2, 1] },
];

/** CSS requires the x control points inside [0, 1]; y may overshoot. */
export function isValid([x1, , x2]: Bezier): boolean {
	return x1 >= 0 && x1 <= 1 && x2 >= 0 && x2 <= 1;
}

function round(value: number): number {
	return Math.round(value * 1000) / 1000;
}

export function toCss(points: Bezier): string {
	return `cubic-bezier(${points.map(round).join(", ")})`;
}

function bezierAxis(t: number, a: number, b: number): number {
	const mt = 1 - t;
	return 3 * mt * mt * t * a + 3 * mt * t * t * b + t * t * t;
}

/**
 * The timing function itself: for progress `x` in [0, 1], the eased output.
 * Solves the x polynomial for t with a few Newton steps, then evaluates y.
 */
export function ease(points: Bezier, x: number): number {
	const [x1, y1, x2, y2] = points;
	if (x <= 0) return 0;
	if (x >= 1) return 1;
	let t = x;
	for (let i = 0; i < 8; i++) {
		const current = bezierAxis(t, x1, x2) - x;
		if (Math.abs(current) < 1e-6) break;
		const mt = 1 - t;
		const slope =
			3 * mt * mt * x1 + 6 * mt * t * (x2 - x1) + 3 * t * t * (1 - x2);
		if (slope === 0) break;
		t -= current / slope;
		t = Math.min(1, Math.max(0, t));
	}
	return bezierAxis(t, y1, y2);
}

/** Points along the curve in control-point space, for drawing. */
export function samples(points: Bezier, count: number): [number, number][] {
	const [x1, y1, x2, y2] = points;
	const out: [number, number][] = [];
	for (let i = 0; i <= count; i++) {
		const t = i / count;
		out.push([bezierAxis(t, x1, x2), bezierAxis(t, y1, y2)]);
	}
	return out;
}
