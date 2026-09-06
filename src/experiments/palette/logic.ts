export interface RampOptions {
	hue: number;
	chroma: number;
	steps: number;
	/** Lightness of the first step, 0 to 1. */
	from?: number;
	/** Lightness of the last step, 0 to 1. */
	to?: number;
}

export interface Swatch {
	name: string;
	lightness: number;
	css: string;
}

function round(value: number, places: number): number {
	const factor = 10 ** places;
	return Math.round(value * factor) / factor;
}

/**
 * A ramp of `steps` colours with evenly spaced lightness in OKLCH. Chroma is
 * tapered towards both ends so very light and very dark steps stay in gamut.
 */
export function ramp({
	hue,
	chroma,
	steps,
	from = 0.97,
	to = 0.18,
}: RampOptions): Swatch[] {
	if (steps < 2) throw new RangeError("A ramp needs at least two steps");
	const swatches: Swatch[] = [];
	for (let index = 0; index < steps; index++) {
		const t = index / (steps - 1);
		const lightness = from + (to - from) * t;
		const taper = 1 - (2 * Math.abs(t - 0.5)) ** 2;
		const c = round(chroma * (0.35 + 0.65 * taper), 3);
		const name = String((index + 1) * 100).padStart(3, "0");
		swatches.push({
			name,
			lightness: round(lightness, 3),
			css: `oklch(${round(lightness, 3)} ${c} ${round(hue, 1)})`,
		});
	}
	return swatches;
}

export function toCustomProperties(prefix: string, swatches: Swatch[]): string {
	return swatches.map((s) => `--${prefix}-${s.name}: ${s.css};`).join("\n");
}
