/*
 * The apps shown on the front page. Each one keeps its own site on a
 * subdomain; this file only points at it. Set `appStoreUrl` once a listing
 * is live and the status line and button follow.
 */

export interface AppLink {
	label: string;
	href: string;
}

export interface App {
	slug: "dbf" | "meal-planner";
	name: string;
	/* Shown next to the name while the name is not final. */
	nameNote?: string;
	subject: string;
	subtitle: string;
	summary: string;
	features: string[];
	status: string;
	appStoreUrl?: string;
	links: AppLink[];
	/* Screen accent, used for the glow behind the phones. */
	accent: string;
}

export const apps: App[] = [
	{
		slug: "dbf",
		name: "Don't Break Fast",
		subject: "Fasting",
		subtitle: "Your weekly fasting rhythm.",
		summary:
			"A focused fasting timer that shows the shape of your week, not just today. Start a fast in one tap, glance at it from the Lock Screen, and see when you actually fast over time.",
		features: [
			"16:8, 18:6, 20:4, OMAD, 24 and 36 hours, or any length up to 72",
			"Weekly Rhythm: each day's fasting window, side by side",
			"Live Activity and Dynamic Island",
			"Widgets, Control Center and Shortcuts",
			"In English and Danish",
		],
		status: "Coming to the App Store",
		links: [
			{ label: "Website", href: "https://dbf.nsscode.com/" },
			{ label: "Support", href: "https://dbf.nsscode.com/support/" },
			{ label: "Privacy", href: "https://dbf.nsscode.com/privacy/" },
		],
		accent: "#36c6b8",
	},
	{
		slug: "meal-planner",
		name: "Meal Planner",
		nameNote: "working title",
		subject: "Food",
		subtitle: "Weekly food, on your numbers.",
		summary:
			"Plan the week from your own recipes and watch each day land against your protein, carbs and fat before it arrives. The shopping list builds itself from the plan.",
		features: [
			"Plan a week from your own recipes",
			"Each day's macros against your targets, while you plan",
			"A shopping list added up across every recipe",
			"Cooking mode that reads from arm's length",
			"Built for iOS 26 and Liquid Glass",
		],
		status: "In development",
		links: [],
		accent: "#82c69f",
	},
];
