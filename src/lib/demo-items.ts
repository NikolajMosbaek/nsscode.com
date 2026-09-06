/*
 * What the demo home pages list: the real listed experiments from the
 * registry, followed by the experiments proposed in the plan. Planned
 * items are marked and never link anywhere, so the demos show a full
 * shelf without pretending anything exists that does not.
 */

import { buildRegistry, type ExperimentMeta, listed } from "./registry";

export type Kind = "tool" | "toy";

export interface DemoItem {
	slug: string;
	title: string;
	summary: string;
	kind: Kind;
	href?: string;
	planned: boolean;
	isNew: boolean;
}

const planned: Omit<DemoItem, "planned" | "isNew">[] = [
	{
		slug: "plates",
		title: "Plates",
		summary: "Type a weight in kg, see which plates go on the bar.",
		kind: "tool",
	},
	{
		slug: "actors",
		title: "Actors",
		summary: "Swift actor isolation, drawn as rooms with doors.",
		kind: "toy",
	},
	{
		slug: "topskat",
		title: "Topskat 2026",
		summary: "Where the Danish tax brackets bite. DKK in, DKK out.",
		kind: "tool",
	},
	{
		slug: "life",
		title: "Life",
		summary: "Conway's game, because every lab needs one.",
		kind: "toy",
	},
	{
		slug: "timestamp",
		title: "Timestamp",
		summary: "Unix, ISO and Copenhagen local, in every direction.",
		kind: "tool",
	},
];

export function demoItems(
	modules: Record<string, { default: ExperimentMeta }>,
): DemoItem[] {
	const real = listed(buildRegistry(modules)).map((e, index) => ({
		slug: e.slug,
		title: e.title,
		summary: e.summary,
		kind: e.kind ?? "tool",
		href: e.href,
		planned: false,
		isNew: index === 0,
	}));
	return [
		...real,
		...planned.map((p) => ({ ...p, planned: true, isNew: false })),
	];
}
