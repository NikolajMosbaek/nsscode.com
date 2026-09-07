/*
 * A damped spring the way SwiftUI parameterises it: `response` is the
 * period of one undamped oscillation in seconds, `dampingFraction` is the
 * damping ratio. Mass is one. From those two numbers everything else
 * follows: stiffness, damping, the curve, and how long it takes to settle.
 */

export interface SpringSpec {
	response: number;
	dampingFraction: number;
}

export interface Derived extends SpringSpec {
	/** Undamped angular frequency, 2π / response. */
	omega: number;
	/** Stiffness with unit mass, omega squared. */
	stiffness: number;
	/** Damping coefficient with unit mass, 2 · ζ · omega. */
	damping: number;
	/** Apple's `bounce`: 1 − ζ above zero, 1/ζ − 1 below. */
	bounce: number;
}

export function derive(spec: SpringSpec): Derived {
	const omega = (2 * Math.PI) / spec.response;
	const zeta = spec.dampingFraction;
	return {
		...spec,
		omega,
		stiffness: omega * omega,
		damping: 2 * zeta * omega,
		bounce: zeta <= 1 ? 1 - zeta : 1 / zeta - 1,
	};
}

/** Apple's `Spring(duration:bounce:)` expressed as response and damping. */
export function fromBounce(duration: number, bounce: number): SpringSpec {
	const dampingFraction = bounce >= 0 ? 1 - bounce : 1 / (1 + bounce);
	return { response: duration, dampingFraction };
}

/**
 * Position at time t, going from 0 to 1 with zero initial velocity.
 * Handles under-, critically and over-damped springs.
 */
export function position(t: number, spec: SpringSpec): number {
	if (t <= 0) return 0;
	const { omega } = derive(spec);
	const z = spec.dampingFraction;
	if (Math.abs(z - 1) < 1e-6) {
		return 1 - Math.exp(-omega * t) * (1 + omega * t);
	}
	if (z < 1) {
		const wd = omega * Math.sqrt(1 - z * z);
		const decay = Math.exp(-z * omega * t);
		return (
			1 - decay * (Math.cos(wd * t) + ((z * omega) / wd) * Math.sin(wd * t))
		);
	}
	const s = omega * Math.sqrt(z * z - 1);
	const decay = Math.exp(-z * omega * t);
	return 1 - decay * (Math.cosh(s * t) + ((z * omega) / s) * Math.sinh(s * t));
}

/** Time at which the spring stays within `epsilon` of the target for good. */
export function settleTime(spec: SpringSpec, epsilon = 0.001): number {
	const step = spec.response / 200;
	const max = spec.response * 40;
	let lastOutside = 0;
	for (let t = 0; t <= max; t += step) {
		if (Math.abs(position(t, spec) - 1) > epsilon) lastOutside = t;
		else if (t - lastOutside > spec.response * 1.5) break;
	}
	return Math.round((lastOutside + step) * 1000) / 1000;
}

/** Peak position; above 1 means overshoot. */
export function overshoot(spec: SpringSpec): number {
	const end = settleTime(spec);
	let peak = 0;
	for (let i = 0; i <= 400; i++) {
		peak = Math.max(peak, position((end * i) / 400, spec));
	}
	return Math.round(peak * 1000) / 1000;
}

export function samples(spec: SpringSpec, count: number, duration?: number) {
	const end = duration ?? settleTime(spec);
	const out: [number, number][] = [];
	for (let i = 0; i <= count; i++) {
		const t = (end * i) / count;
		out.push([t, position(t, spec)]);
	}
	return out;
}

/**
 * CSS `linear()` approximation over the settle time. Points are dropped
 * where a straight line between neighbours is within `tolerance`, so
 * the output stays short.
 */
export function toLinear(
	spec: SpringSpec,
	tolerance = 0.002,
): {
	duration: number;
	stops: string;
} {
	const duration = settleTime(spec);
	const n = 160;
	const pts = samples(spec, n, duration).map(([t, y]) => [t / duration, y]);
	const keep: number[] = [0];
	let anchor = 0;
	for (let i = 1; i < pts.length - 1; i++) {
		const [x0, y0] = pts[anchor];
		const [x2, y2] = pts[i + 1];
		let ok = true;
		for (let j = anchor + 1; j <= i; j++) {
			const [x, y] = pts[j];
			const interp = y0 + ((y2 - y0) * (x - x0)) / (x2 - x0);
			if (Math.abs(interp - y) > tolerance) {
				ok = false;
				break;
			}
		}
		if (!ok) {
			keep.push(i);
			anchor = i;
		}
	}
	keep.push(pts.length - 1);
	const fmt = (v: number) => String(Math.round(v * 1000) / 1000);
	const stops = keep
		.map((i, k) => {
			const [x, y] = pts[i];
			if (k === 0) return fmt(y);
			if (k === keep.length - 1) return "1";
			return `${fmt(y)} ${fmt(x * 100)}%`;
		})
		.join(", ");
	return { duration: Math.round(duration * 100) / 100, stops };
}

export interface Preset {
	slug: string;
	name: string;
	spec: SpringSpec;
	note: string;
}

export const presets: Preset[] = [
	{
		slug: "default",
		name: ".spring()",
		spec: { response: 0.55, dampingFraction: 0.825 },
		note: "SwiftUI's default spring.",
	},
	{
		slug: "smooth",
		name: ".smooth",
		spec: fromBounce(0.5, 0),
		note: "No bounce at all. Settles cleanly.",
	},
	{
		slug: "snappy",
		name: ".snappy",
		spec: fromBounce(0.5, 0.15),
		note: "A little bounce, feels quick.",
	},
	{
		slug: "bouncy",
		name: ".bouncy",
		spec: fromBounce(0.5, 0.3),
		note: "Visible overshoot. Use sparingly.",
	},
	{
		slug: "interactive",
		name: ".interactiveSpring()",
		spec: { response: 0.15, dampingFraction: 0.86 },
		note: "For things that follow a finger.",
	},
	{
		slug: "sluggish",
		name: "sluggish",
		spec: { response: 1.2, dampingFraction: 1 },
		note: "Critically damped, slow. Feels heavy.",
	},
];

export function formatNumber(v: number, digits = 2): string {
	return String(Math.round(v * 10 ** digits) / 10 ** digits);
}

export function swift(spec: SpringSpec): string {
	const d = derive(spec);
	return [
		`.spring(response: ${formatNumber(spec.response)}, dampingFraction: ${formatNumber(spec.dampingFraction, 3)})`,
		"",
		"// iOS 17 and later",
		`.spring(duration: ${formatNumber(spec.response)}, bounce: ${formatNumber(d.bounce, 3)})`,
	].join("\n");
}

export function css(spec: SpringSpec, property = "transform"): string {
	const { duration, stops } = toLinear(spec);
	return `transition: ${property} ${duration}s linear(${stops});`;
}

export function compose(spec: SpringSpec): string {
	const d = derive(spec);
	return `spring(dampingRatio = ${formatNumber(spec.dampingFraction, 3)}f, stiffness = ${formatNumber(d.stiffness, 1)}f)`;
}

export function framer(spec: SpringSpec): string {
	const d = derive(spec);
	return `{ type: "spring", stiffness: ${formatNumber(d.stiffness, 1)}, damping: ${formatNumber(d.damping, 2)}, mass: 1 }`;
}
