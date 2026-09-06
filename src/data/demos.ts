/*
 * The four home-page directions built as live demos under /demo/.
 * Each entry carries the honest case for and against, shown by the
 * "about" button on its page.
 */

export interface Demo {
	slug: string;
	letter: string;
	name: string;
	tagline: string;
	pros: string[];
	cons: string[];
	/** Google Fonts stylesheet for the demo. The chosen one gets self-hosted. */
	fonts: string;
}

export const demos: Demo[] = [
	{
		slug: "toybox",
		letter: "A",
		name: "Toybox",
		tagline:
			"Chunky tiles, hard offset shadows, four accents at equal chroma. Every tile is a live miniature of its experiment. The site feels like a shelf of gadgets.",
		pros: [
			"The most fun per pixel while still working as an index.",
			"A tile is just an experiment folder plus a small preview component, so adding things stays cheap.",
			"Light ground and black outlines keep contrast trivially high; accessibility comes for free.",
			"Scales down to a phone as a single column without losing the idea.",
		],
		cons: [
			"Playful reads as less serious. If the site is ever meant to impress a hiring manager, this is the one they will squint at.",
			"Every experiment needs a mini-preview or the grid goes flat and generic.",
			"Hue-rotating and bobbing tiles are charming for ten seconds; they must calm down after load.",
		],
		fonts:
			"https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,500;12..96,800&family=JetBrains+Mono:wght@500&display=swap",
	},
	{
		slug: "bench",
		letter: "B",
		name: "Bench",
		tagline:
			"A lab instrument panel: mono type, amber phosphor, blinking status LEDs, a live trace, gauges for real numbers. Every experiment is a module you power up.",
		pros: [
			"The strongest identity of the four. Nobody mistakes it for a template.",
			"The readouts can be real: build time, module count, commit log, all known at build.",
			"Ties to the world of analytical instruments without saying a word about anyone.",
			"Dense by nature, so it scales to thirty modules without redesign.",
		],
		cons: [
			"One note. The joke is the whole design, and it does not modulate.",
			"Dark terminal aesthetics are common; the LEDs and traces are what set it apart, and they need upkeep.",
			"Amber on black tires the eyes over long pages; the experiments themselves may need a lighter surface.",
		],
		fonts:
			"https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap",
	},
	{
		slug: "posters",
		letter: "C",
		name: "Poster wall",
		tagline:
			"Acid yellow, a display face at 300px, a running ticker, experiments as numbered posters pinned at angles with a red stamp for new. The site is an issue reprinted on every push.",
		pros: [
			"The loudest and the most memorable. People will send the link to each other.",
			"The issue-number framing gives you a reason to ship often and a place to say what changed.",
			"Type does all the work; there is almost nothing to maintain beyond words.",
		],
		cons: [
			"Shouting gets old. Ten posters is a wall; thirty is noise.",
			"Rotated cards and a marquee are the two effects most likely to annoy on a phone.",
			"Yellow needs care: black on it is fine, but any second colour has to be checked against both.",
		],
		fonts:
			"https://fonts.googleapis.com/css2?family=Anton&family=Newsreader:ital,opsz,wght@1,6..72,400;1,6..72,500&display=swap",
	},
	{
		slug: "constellation",
		letter: "D",
		name: "Constellation",
		tagline:
			"Deep blue, a field of pulsing dots, experiments placed as stars with a line drawn between them. The home page is itself the first toy. A serif for warmth.",
		pros: [
			"Atmospheric and calm but alive. The one that photographs best.",
			"Scales to many experiments if a list view sits next to the map.",
			"The home page can grow into a real interactive piece over time.",
		],
		cons: [
			"The least legible as an index. Finding a specific thing means reading a sky.",
			"A map is a gimmick unless position means something: age, kind, or size. That is a design constraint you inherit.",
			"Hundreds of animated dots cost battery; the reduced-motion path has to be first class, not a fallback.",
		],
		fonts:
			"https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500&display=swap",
	},
];

export function demoBySlug(slug: string): Demo {
	const demo = demos.find((d) => d.slug === slug);
	if (!demo) throw new Error(`No demo "${slug}"`);
	return demo;
}
