import type { ExperimentMeta } from "../../lib/registry";

export default {
	title: "Actors",
	summary:
		"Swift actor isolation, drawn as rooms with doors. One task inside at a time, the rest wait outside, and every await opens the door again.",
	date: "2026-09-06",
	listed: true,
	kind: "toy",
	tags: ["swift", "concurrency", "svelte"],
} satisfies ExperimentMeta;
