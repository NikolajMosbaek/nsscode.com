/*
 * Collections group experiments by what they are for, which is what a
 * visitor actually chooses on. Colour follows the collection, so the
 * shelf reads as three groups rather than a wall of coloured boxes.
 * Adding an experiment means naming its collection in meta.ts.
 */

export type CollectionId = "making" | "numbers" | "alive";

export interface Collection {
	id: CollectionId;
	label: string;
	blurb: string;
	/* A CSS custom property from the palette. */
	colour: string;
}

export const collections: Collection[] = [
	{
		id: "making",
		label: "For making software",
		blurb: "Colour, motion and the tools around the work.",
		colour: "var(--accent)",
	},
	{
		id: "numbers",
		label: "Answers a number",
		blurb: "You have a question with a number at the end of it.",
		colour: "var(--yellow)",
	},
	{
		id: "alive",
		label: "Runs on its own",
		blurb: "Small rules, left alone, doing something you did not write.",
		colour: "var(--green)",
	},
];

export function collectionOf(id: CollectionId): Collection {
	return collections.find((c) => c.id === id) ?? collections[0];
}
