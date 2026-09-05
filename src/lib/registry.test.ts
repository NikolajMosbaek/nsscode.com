import { describe, expect, it } from "vitest";
import {
	buildRegistry,
	type ExperimentMeta,
	listed,
	slugFromPath,
	wrapperFor,
} from "./registry";

const meta = (
	over: Partial<ExperimentMeta> = {},
): { default: ExperimentMeta } => ({
	default: {
		title: "T",
		summary: "S",
		date: "2026-01-01",
		listed: true,
		...over,
	},
});

describe("slugFromPath", () => {
	it("takes the folder name under experiments", () => {
		expect(slugFromPath("../experiments/palette/meta.ts")).toBe("palette");
	});

	it("throws for a path outside experiments", () => {
		expect(() => slugFromPath("../pages/index.astro")).toThrow();
	});
});

describe("buildRegistry", () => {
	it("orders newest first, then by title", () => {
		const entries = buildRegistry({
			"../experiments/b/meta.ts": meta({ title: "B", date: "2026-02-01" }),
			"../experiments/a/meta.ts": meta({ title: "A", date: "2026-02-01" }),
			"../experiments/old/meta.ts": meta({ title: "Old", date: "2025-01-01" }),
		});
		expect(entries.map((e) => e.slug)).toEqual(["a", "b", "old"]);
	});

	it("derives the href from the slug", () => {
		const [entry] = buildRegistry({
			"../experiments/palette/meta.ts": meta(),
		});
		expect(entry.href).toBe("/lab/palette/");
	});
});

describe("listed", () => {
	it("drops unlisted experiments", () => {
		const entries = buildRegistry({
			"../experiments/shown/meta.ts": meta(),
			"../experiments/hidden/meta.ts": meta({ listed: false }),
		});
		expect(listed(entries).map((e) => e.slug)).toEqual(["shown"]);
	});
});

describe("wrapperFor", () => {
	it("finds the module for a slug", () => {
		const modules = {
			"../experiments/palette/Experiment.astro": { default: "P" },
		};
		expect(wrapperFor(modules, "palette")).toBe("P");
	});

	it("throws for an unknown slug", () => {
		expect(() => wrapperFor({}, "nope")).toThrow();
	});
});
