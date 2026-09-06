/*
 * What I use. Notes are one clause and opinionated, or absent.
 * TODO(owner): extend (plan, Q11).
 */

export interface StackItem {
	name: string;
	note?: string;
}

export interface StackGroup {
	group: string;
	items: StackItem[];
}

export const stack: StackGroup[] = [
	{
		group: "Apple platforms",
		items: [
			{ name: "Swift 6", note: "Strict concurrency on, always." },
			{ name: "SwiftUI", note: "UIKit where it earns it." },
			{
				name: "The Composable Architecture",
				note: "One reducer tree, one source of truth.",
			},
			{
				name: "Swift Testing",
				note: "XCTest only where a dependency forces it.",
			},
			{ name: "Xcode", note: "Yes, still." },
		],
	},
	{
		group: "This site",
		items: [
			{ name: "Astro", note: "Zero JavaScript unless a page asks for it." },
			{ name: "Tailwind CSS 4", note: "Tokens in CSS, not in a config file." },
			{ name: "TypeScript", note: "Strict." },
			{ name: "Biome", note: "One binary for lint and format." },
			{ name: "GitHub Pages", note: "Deploys on push to main." },
		],
	},
];
