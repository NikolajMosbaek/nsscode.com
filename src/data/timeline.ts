/*
 * Roles, newest first. Periods are strings so an unconfirmed year can be left
 * out rather than guessed.
 *
 * Source: public LinkedIn snippets, retrieved 2026-09-05, unverified.
 * TODO(owner): confirm employers, titles and years; add what came before 2018
 * so the timeline accounts for eleven years (plan, Q8 and Q9).
 */

export interface TimelineEntry {
	period: string;
	role: string;
	org: string;
	summary: string;
	href?: string;
	current?: boolean;
}

export const timeline: TimelineEntry[] = [
	{
		period: "Now",
		role: "Senior Software Engineer, iOS",
		org: "FOSS",
		summary:
			"Native iOS and iPadOS software for a Danish analytical-instruments company. Swift 6, strict concurrency, The Composable Architecture.",
		href: "https://www.fossanalytics.com",
		current: true,
	},
	{
		period: "Before that",
		role: "External consultant, lead designer and developer",
		org: "Capgemini",
		summary:
			"Designed and built an internal iPadOS application as the lead, then joined the client to own it.",
	},
	{
		period: "2018 to 2020",
		role: "Co-founder and director",
		org: "ZyborgApps",
		summary:
			"Two and a half years running a small app company: product, code, App Store and the parts nobody warns you about.",
	},
];
