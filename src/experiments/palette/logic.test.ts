import { describe, expect, it } from "vitest";
import { ramp, toCustomProperties } from "./logic";

describe("ramp", () => {
	it("produces the requested number of steps", () => {
		expect(ramp({ hue: 30, chroma: 0.2, steps: 7 })).toHaveLength(7);
	});

	it("goes from light to dark", () => {
		const swatches = ramp({ hue: 30, chroma: 0.2, steps: 5 });
		expect(swatches[0].lightness).toBeGreaterThan(swatches[4].lightness);
		expect(swatches[0].lightness).toBe(0.97);
		expect(swatches[4].lightness).toBe(0.18);
	});

	it("tapers chroma at the ends", () => {
		const swatches = ramp({ hue: 30, chroma: 0.2, steps: 5 });
		const chromaOf = (css: string) => Number(css.split(" ")[1]);
		expect(chromaOf(swatches[0].css)).toBeLessThan(chromaOf(swatches[2].css));
		expect(chromaOf(swatches[4].css)).toBeLessThan(chromaOf(swatches[2].css));
	});

	it("names steps 100, 200, ...", () => {
		expect(ramp({ hue: 0, chroma: 0, steps: 3 }).map((s) => s.name)).toEqual([
			"100",
			"200",
			"300",
		]);
	});

	it("rejects fewer than two steps", () => {
		expect(() => ramp({ hue: 0, chroma: 0, steps: 1 })).toThrow(RangeError);
	});
});

describe("toCustomProperties", () => {
	it("emits one declaration per swatch", () => {
		const css = toCustomProperties(
			"red",
			ramp({ hue: 30, chroma: 0.2, steps: 2 }),
		);
		expect(css.split("\n")).toEqual([
			"--red-100: oklch(0.97 0.07 30);",
			"--red-200: oklch(0.18 0.07 30);",
		]);
	});
});
