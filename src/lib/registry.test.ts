import { describe, expect, it } from "vitest";
import { buildRegistry, slugFromPath, wrapperFor } from "./registry";

describe("slugFromPath", () => {
	it("takes the folder name under tools/", () => {
		expect(slugFromPath("../tools/json-format/meta.ts")).toBe("json-format");
	});

	it("works for the deeper path used by dynamic routes", () => {
		expect(slugFromPath("../../tools/uuid-gen/Tool.astro")).toBe("uuid-gen");
	});

	it("throws when the path is not inside tools/", () => {
		expect(() => slugFromPath("../lib/result.ts")).toThrow();
	});
});

describe("buildRegistry", () => {
	const modules = {
		"../tools/zebra/meta.ts": {
			default: { title: "Zebra", description: "z", tags: ["x"] },
		},
		"../tools/apple/meta.ts": {
			default: { title: "Apple", description: "a", tags: ["y"] },
		},
	};

	it("derives a slug for every tool", () => {
		expect(buildRegistry(modules).map((t) => t.slug)).toEqual([
			"apple",
			"zebra",
		]);
	});

	it("sorts entries by title", () => {
		expect(buildRegistry(modules).map((t) => t.title)).toEqual([
			"Apple",
			"Zebra",
		]);
	});

	it("carries the metadata through", () => {
		const apple = buildRegistry(modules)[0];
		expect(apple.description).toBe("a");
		expect(apple.tags).toEqual(["y"]);
	});

	it("returns an empty list when there are no tools", () => {
		expect(buildRegistry({})).toEqual([]);
	});
});

describe("wrapperFor", () => {
	const wrappers = {
		"../../tools/json-format/Tool.astro": { default: "JSON_WRAPPER" },
		"../../tools/uuid-gen/Tool.astro": { default: "UUID_WRAPPER" },
	};

	it("finds the wrapper whose folder matches the slug", () => {
		expect(wrapperFor(wrappers, "uuid-gen")).toBe("UUID_WRAPPER");
	});

	it("throws when no wrapper exists for the slug", () => {
		expect(() => wrapperFor(wrappers, "missing")).toThrow(/missing/);
	});
});
