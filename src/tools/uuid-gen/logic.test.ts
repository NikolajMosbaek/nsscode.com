import { describe, expect, it } from "vitest";
import { generateUuids } from "./logic";

const UUID_V4 =
	/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe("generateUuids", () => {
	it("returns the requested number of v4 UUIDs", () => {
		const r = generateUuids(3);
		expect(r.ok).toBe(true);
		if (r.ok) {
			expect(r.value).toHaveLength(3);
			for (const id of r.value) expect(id).toMatch(UUID_V4);
		}
	});

	it("returns distinct values", () => {
		const r = generateUuids(50);
		if (r.ok) expect(new Set(r.value).size).toBe(50);
		else throw new Error("expected success");
	});

	it("rejects a count below one", () => {
		expect(generateUuids(0).ok).toBe(false);
	});

	it("rejects a count above one hundred", () => {
		expect(generateUuids(101).ok).toBe(false);
	});

	it("rejects a non-integer count", () => {
		expect(generateUuids(2.5).ok).toBe(false);
	});
});
