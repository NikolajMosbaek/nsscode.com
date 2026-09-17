/*
 * Collections group experiments by subject, which is what a visitor
 * actually chooses on. Colour follows the collection, so the shelf reads
 * as a few groups rather than a wall of coloured boxes. Adding an
 * experiment means naming its collection in meta.ts.
 */

export type CollectionId = "software" | "finance" | "training" | "games";

export interface Collection {
	id: CollectionId;
	label: string;
	blurb: string;
	/* A CSS custom property from the palette. */
	colour: string;
}

export const collections: Collection[] = [
	{
		id: "software",
		label: "Software development",
		blurb: "Colour, motion, concurrency and the tools around the work.",
		colour: "var(--blue)",
	},
	{
		id: "finance",
		label: "Finance",
		blurb: "Danish kroner, and where they actually go.",
		colour: "var(--green)",
	},
	{
		id: "training",
		label: "Training",
		blurb: "Barbells, and the arithmetic around them.",
		colour: "var(--accent)",
	},
	{
		id: "games",
		label: "Games",
		blurb: "Small rules, left alone, doing something you did not write.",
		colour: "var(--yellow)",
	},
];

export function collectionOf(id: CollectionId): Collection {
	return collections.find((c) => c.id === id) ?? collections[0];
}
