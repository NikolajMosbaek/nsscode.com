/*
 * What the shelf shows: the real listed experiments from the registry,
 * followed by the experiments proposed in the plan. Planned items are
 * marked and never link anywhere, so the lab index is honest about what
 * is coming without pretending it exists. A real experiment with the
 * same slug replaces its placeholder.
 */

import type { CollectionId } from "./collections";
import { buildRegistry, type ExperimentMeta, listed } from "./registry";

export type Kind = "tool" | "toy";

export interface ShelfItem {
	slug: string;
	title: string;
	summary: string;
	kind: Kind;
	collection: CollectionId;
	date: string;
	tags: string[];
	href?: string;
	planned: boolean;
	isNew: boolean;
}

const planned: Omit<ShelfItem, "planned" | "isNew" | "date" | "tags">[] = [
	{
		slug: "concurrency",
		title: "Concurrency",
		summary:
			"Write a small Swift program with tasks and actors, watch it run as rooms and doors.",
		kind: "toy",
		collection: "software",
	},
	{
		slug: "regex",
		title: "Regex",
		summary: "A pattern as a railroad diagram, matching as you type.",
		kind: "tool",
		collection: "software",
	},
	{
		slug: "timestamp",
		title: "Timestamp",
		summary: "Unix, ISO and Copenhagen local, in every direction.",
		kind: "tool",
		collection: "software",
	},
	{
		slug: "realkredit",
		title: "Realkredit",
		summary:
			"Fixed against flex, bidragssats by LTV, and the conversion game when the bond price moves.",
		kind: "tool",
		collection: "finance",
	},
];

export function shelfItems(
	modules: Record<string, { default: ExperimentMeta }>,
): ShelfItem[] {
	const real = listed(buildRegistry(modules)).map((e, index) => ({
		slug: e.slug,
		title: e.title,
		summary: e.summary,
		kind: e.kind ?? "tool",
		collection: e.collection,
		date: e.date,
		tags: e.tags ?? [],
		href: e.href,
		planned: false,
		isNew: index === 0,
	}));
	const realSlugs = new Set(real.map((r) => r.slug));
	return [
		...real,
		...planned
			.filter((p) => !realSlugs.has(p.slug))
			.map((p) => ({ ...p, date: "", tags: [], planned: true, isNew: false })),
	];
}

/** Listed, real experiments in one collection, newest first. */
export function inCollection(
	items: ShelfItem[],
	collection: CollectionId,
): ShelfItem[] {
	return items.filter((i) => !i.planned && i.collection === collection);
}
