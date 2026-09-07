import { describe, expect, it } from "vitest";
import {
	assess,
	exampleFiles,
	loadedFor,
	matchGlob,
	recommend,
	starters,
} from "./logic";

describe("assess", () => {
	it("grades an empty prompt as nothing", () => {
		const a = assess("");
		expect(a.score).toBe(0);
		expect(a.notes[0]).toMatch(/nothing/i);
	});

	it("marks a vague prompt low", () => {
		const a = assess("fix the bug");
		expect(a.found.goal).toBe(true);
		expect(a.found.context).toBe(false);
		expect(a.found.verify).toBe(false);
		expect(a.score).toBeLessThan(50);
	});

	it("finds every ingredient in a good prompt", () => {
		const a = assess(
			"In LoginFeature.swift the retry button stays disabled after a failed request. Fix it so it re-enables once the request finishes, without changing the public API. Done when the existing LoginFeatureTests pass and a new test covers the retry path; run swift test.",
		);
		expect(a.found).toEqual({
			goal: true,
			context: true,
			constraints: true,
			done: true,
			verify: true,
			scope: true,
		});
		expect(a.score).toBe(100);
	});

	it("flags a prompt that chains many tasks", () => {
		const a = assess(
			"Add dark mode and then fix the login bug and also update the README and then deploy it.",
		);
		expect(a.found.scope).toBe(false);
		expect(a.notes.join(" ")).toMatch(/split/i);
	});
});

describe("recommend", () => {
	it("sends routine small work to the smaller model at low effort", () => {
		const p = recommend("tiny", "routine", "low");
		expect(p.model).toBe("Sonnet");
		expect(p.effort).toBe("low");
		expect(p.mode).toBe("just do it");
	});

	it("plans first for large or risky unfamiliar work", () => {
		expect(recommend("large", "some", "low").mode).toBe("plan first");
		expect(recommend("medium", "hard", "high").mode).toBe("plan first");
		expect(recommend("medium", "hard", "high").effort).toBe("max");
		expect(recommend("medium", "hard", "low").effort).toBe("xhigh");
		expect(recommend("medium", "some", "low").effort).toBe("high");
	});

	it("does not plan for a routine change even if risky", () => {
		expect(recommend("tiny", "routine", "high").mode).toBe("just do it");
	});
});

describe("loadedFor", () => {
	it("always includes user, project and local files", () => {
		const paths = loadedFor("README.md", exampleFiles).map((f) => f.path);
		expect(paths).toContain("~/.claude/CLAUDE.md");
		expect(paths).toContain("CLAUDE.md");
		expect(paths).toContain("CLAUDE.local.md");
		expect(paths).toContain(".claude/rules/testing.md");
		expect(paths).not.toContain("Sources/UI/CLAUDE.md");
		expect(paths).not.toContain(".claude/rules/swiftui.md");
	});

	it("adds directory files and scoped rules for a file under them", () => {
		const paths = loadedFor(
			"Sources/UI/Login/LoginView.swift",
			exampleFiles,
		).map((f) => f.path);
		expect(paths).toContain("Sources/UI/CLAUDE.md");
		expect(paths).toContain(".claude/rules/swiftui.md");
		expect(paths).not.toContain("Sources/Network/CLAUDE.md");
	});
});

describe("matchGlob", () => {
	it("handles ** and *", () => {
		expect(matchGlob("Sources/UI/**", "Sources/UI/a/b.swift")).toBe(true);
		expect(matchGlob("Sources/UI/**", "Sources/Net/b.swift")).toBe(false);
		expect(matchGlob("**/*.test.ts", "src/x/y.test.ts")).toBe(true);
		expect(matchGlob("*.md", "docs/a.md")).toBe(false);
	});
});

describe("starters", () => {
	it("always writes CLAUDE.md and imports the docs chosen", () => {
		const files = starters({
			name: "Shop",
			stack: "Swift 6, TCA",
			test: "swift test",
			lint: "swiftlint",
			docs: { architecture: true, design: false, specs: true },
		});
		expect(files.map((f) => f.file)).toEqual([
			"CLAUDE.md",
			"ARCHITECTURE.md",
			"SPECS.md",
		]);
		expect(files[0].body).toContain("@ARCHITECTURE.md");
		expect(files[0].body).not.toContain("@DESIGN.md");
		expect(files[0].body).toContain("`swift test`");
	});
});
