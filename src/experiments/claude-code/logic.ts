/*
 * The small amount of logic behind the Claude Code guide: a heuristic that
 * grades a prompt for the ingredients a good one has, a picker for model
 * and effort, a resolver showing which instruction files load for a given
 * working directory, and starter templates for the project files.
 */

export type IngredientId =
	| "goal"
	| "context"
	| "constraints"
	| "done"
	| "verify"
	| "scope";

export interface Ingredient {
	id: IngredientId;
	label: string;
	question: string;
	colour: string;
}

export const ingredients: Ingredient[] = [
	{
		id: "goal",
		label: "Goal",
		question: "What should be different when it is done?",
		colour: "var(--accent)",
	},
	{
		id: "context",
		label: "Where",
		question: "Which files, functions or screens are involved?",
		colour: "var(--blue)",
	},
	{
		id: "constraints",
		label: "Constraints",
		question: "What must it not touch, break or change?",
		colour: "var(--yellow)",
	},
	{
		id: "done",
		label: "Done when",
		question: "How will you both know it is finished?",
		colour: "var(--green)",
	},
	{
		id: "verify",
		label: "Verify",
		question: "Which test, command or check proves it works?",
		colour: "var(--ink)",
	},
	{
		id: "scope",
		label: "Size",
		question: "Is it one task, or three tasks in a trench coat?",
		colour: "var(--surface-strong)",
	},
];

export interface Assessment {
	found: Record<IngredientId, boolean>;
	score: number;
	words: number;
	notes: string[];
}

const patterns: Record<Exclude<IngredientId, "scope">, RegExp[]> = {
	goal: [
		/\b(add|fix|make|change|remove|rename|refactor|migrate|implement|write|create|build|convert|replace|update|extract|move|split|merge|show|hide|return|throw|log|stop|prevent|support|handle|explain|find|investigate|why)\b/i,
	],
	context: [
		/[\w\-./]+\.(swift|ts|tsx|js|jsx|py|rb|go|rs|kt|java|md|json|yml|yaml|css|astro|svelte|vue|sql|sh)\b/i,
		/@[\w\-./]+/,
		/\b(in|inside|under|at)\s+(the\s+)?[`'"]?[A-Z][A-Za-z0-9]+(View|Feature|Reducer|Client|Service|Controller|Store|Model|Screen|Component|Page|Module|Repository|Manager)\b/,
		/\b(src|lib|app|tests?|spec|components?|features?|pages?|packages?|modules?)\//i,
		/\bline\s+\d+/i,
		/\b(function|method|class|struct|enum|protocol|actor|component|reducer|endpoint|table|migration|hook)\s+[`'"]?[\w.]+/i,
	],
	constraints: [
		/\b(don'?t|do not|never|must not|without|avoid|keep|leave|only|no other|nothing else|except|preserve|unchanged|as is|same|existing|not the)\b/i,
	],
	done: [
		/\b(done when|finished when|until|so that|should (now )?(show|return|pass|compile|build|render|work|be|have)|expected|the result (is|should)|acceptance|when .+ (then|should))\b/i,
	],
	verify: [
		/\b(tests?|spec|xctest|swift test|npm (run )?test|pytest|vitest|jest|go test|cargo test|lint|biome|eslint|tsc|typecheck|type-?check|build (passes|succeeds|is green)|compile|run it|screenshot|verify|check that|assert|ci|green)\b/i,
	],
};

export function assess(prompt: string): Assessment {
	const text = prompt.trim();
	const words = text ? text.split(/\s+/).length : 0;
	const found = {
		goal: false,
		context: false,
		constraints: false,
		done: false,
		verify: false,
		scope: false,
	};
	for (const key of Object.keys(patterns) as (keyof typeof patterns)[]) {
		found[key] = patterns[key].some((re) => re.test(text));
	}
	const asks = (
		text.match(/\b(and then|also|after that|then|plus|as well as)\b/gi) ?? []
	).length;
	const sentences = text.split(/[.!?\n]+/).filter((s) => s.trim()).length;
	found.scope = words > 0 && asks <= 2 && sentences <= 12;

	const notes: string[] = [];
	if (words === 0) notes.push("Nothing to grade yet.");
	else if (words < 6)
		notes.push("Too short to carry intent. Claude will guess.");
	if (!found.goal && words > 0) notes.push("No verb. Say what should change.");
	if (!found.context && words > 5)
		notes.push("Name a file, type or folder so it does not have to search.");
	if (!found.verify && words > 5)
		notes.push("Tell it how to prove the work: a test, a build, a command.");
	if (!found.scope && words > 0)
		notes.push("This reads like several tasks. Split it, one per prompt.");
	if (words > 250)
		notes.push("Long. Put durable context in CLAUDE.md instead.");

	const score = (Object.values(found).filter(Boolean).length / 6) * 100;
	return { found, score: Math.round(score), words, notes };
}

/* Model and effort. */

export type TaskSize = "tiny" | "medium" | "large";
export type Novelty = "routine" | "some" | "hard";
export type Risk = "low" | "high";
export type Effort = "low" | "medium" | "high" | "xhigh" | "max";

export interface Pick {
	model: "Sonnet" | "Opus";
	effort: Effort;
	why: string;
	mode: "just do it" | "plan first";
}

export const efforts: { level: Effort; means: string }[] = [
	{
		level: "low",
		means:
			"Barely thinks. Fast. Renames, one-line fixes, questions with one answer.",
	},
	{
		level: "medium",
		means: "Thinks a little. Routine changes you will read anyway.",
	},
	{
		level: "high",
		means: "The default. Balanced. Most feature work and bug hunts.",
	},
	{
		level: "xhigh",
		means: "Thinks hard. Unfamiliar code, tricky concurrency, subtle bugs.",
	},
	{
		level: "max",
		means:
			"Thinks hardest, and sometimes too much. Rare. Genuinely hard problems.",
	},
];

export function recommend(size: TaskSize, novelty: Novelty, risk: Risk): Pick {
	const hard = novelty === "hard" || (size === "large" && novelty === "some");
	const easy = novelty === "routine" && size !== "large";
	const model: Pick["model"] = easy ? "Sonnet" : "Opus";
	let effort: Effort = "high";
	if (hard) effort = risk === "high" ? "max" : "xhigh";
	else if (easy) effort = size === "tiny" && risk === "low" ? "low" : "medium";
	const mode: Pick["mode"] =
		size === "large" || (risk === "high" && novelty !== "routine")
			? "plan first"
			: "just do it";
	const why = hard
		? "Unfamiliar or wide work is where the stronger model and more thinking pay for themselves."
		: easy
			? "A routine change does not need the biggest model. Sonnet is faster and cheaper; keep the effort down and read the diff."
			: "Middle of the road: Opus at the default effort, and you read the diff before it lands.";
	return { model, effort, why, mode };
}

/* Which instruction files load. */

export interface MemoryFile {
	path: string;
	kind: "user" | "project" | "local" | "directory" | "rule";
	/** For rules with a paths frontmatter: the glob they apply to. */
	glob?: string;
}

export const exampleFiles: MemoryFile[] = [
	{ path: "~/.claude/CLAUDE.md", kind: "user" },
	{ path: "CLAUDE.md", kind: "project" },
	{ path: "CLAUDE.local.md", kind: "local" },
	{ path: ".claude/rules/testing.md", kind: "rule" },
	{ path: ".claude/rules/swiftui.md", kind: "rule", glob: "Sources/UI/**" },
	{ path: "Sources/UI/CLAUDE.md", kind: "directory" },
	{ path: "Sources/Network/CLAUDE.md", kind: "directory" },
];

/**
 * Given the file the user is working on, which instruction files are in
 * play. User, project, local and unscoped rules always are. A directory
 * CLAUDE.md loads when Claude touches a file under it. A rule with a
 * paths glob applies only to matching files.
 */
export function loadedFor(file: string, files: MemoryFile[]): MemoryFile[] {
	return files.filter((f) => {
		if (f.kind === "user" || f.kind === "project" || f.kind === "local") {
			return true;
		}
		if (f.kind === "rule") return !f.glob || matchGlob(f.glob, file);
		const dir = f.path.replace(/\/?CLAUDE\.md$/, "");
		return dir === "" || file === dir || file.startsWith(`${dir}/`);
	});
}

export function matchGlob(glob: string, file: string): boolean {
	const re = glob
		.split("**")
		.map((part) =>
			part
				.replace(/[.+^${}()|[\]\\]/g, "\\$&")
				.replace(/\*/g, "[^/]*")
				.replace(/\?/g, "[^/]"),
		)
		.join(".*");
	return new RegExp(`^${re}$`).test(file);
}

/* Starter files. */

export interface StarterOptions {
	name: string;
	stack: string;
	test: string;
	lint: string;
	docs: { architecture: boolean; design: boolean; specs: boolean };
}

export interface Starter {
	file: string;
	body: string;
}

export function starters(o: StarterOptions): Starter[] {
	const name = o.name.trim() || "this project";
	const out: Starter[] = [];
	const imports = [
		o.docs.architecture ? "@ARCHITECTURE.md" : "",
		o.docs.design ? "@DESIGN.md" : "",
		o.docs.specs ? "@SPECS.md" : "",
	].filter(Boolean);
	out.push({
		file: "CLAUDE.md",
		body: [
			`# ${name}`,
			"",
			`${o.stack.trim() || "Describe the stack in one line."}`,
			"",
			"## Commands",
			"",
			`- Test: \`${o.test.trim() || "<test command>"}\``,
			`- Lint: \`${o.lint.trim() || "<lint command>"}\``,
			"",
			"## Rules",
			"",
			"- Run the tests before you say something works.",
			"- Small commits, one change each. Do not commit unless asked.",
			"- Ask before adding a dependency.",
			"",
			...(imports.length
				? [
						"## Read before larger changes",
						"",
						...imports.map((i) => `- ${i}`),
						"",
					]
				: []),
		].join("\n"),
	});
	if (o.docs.architecture) {
		out.push({
			file: "ARCHITECTURE.md",
			body: [
				"# Architecture",
				"",
				"## Modules",
				"",
				"One line per module: what it owns and what it must not know about.",
				"",
				"## Data flow",
				"",
				"How a request or user action travels through the layers.",
				"",
				"## Decisions",
				"",
				"- YYYY-MM-DD: We chose X over Y because Z.",
				"",
			].join("\n"),
		});
	}
	if (o.docs.design) {
		out.push({
			file: "DESIGN.md",
			body: [
				"# Design",
				"",
				"## Tokens",
				"",
				"Colours, type scale, spacing. Names, not values, where the code has them.",
				"",
				"## Components",
				"",
				"Which ones exist, when to use each, and what not to build again.",
				"",
				"## Voice",
				"",
				"How copy is written: tone, capitalisation, error message shape.",
				"",
			].join("\n"),
		});
	}
	if (o.docs.specs) {
		out.push({
			file: "SPECS.md",
			body: [
				"# Specs",
				"",
				"One section per feature. Keep them short and keep them current.",
				"",
				"## <Feature>",
				"",
				"- Users can ...",
				"- When ..., then ...",
				"- Out of scope: ...",
				"",
			].join("\n"),
		});
	}
	return out;
}
