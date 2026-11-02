/*
 * Every fact about the owner lives here once. Pages read from this file
 * and never hard-code a name, a title or a link.
 */

export interface SocialLink {
	label: string;
	handle: string;
	href: string;
}

export const site = {
	url: "https://nsscode.com",
	name: "Nikolaj Søgaard Simonsen",
	/* The domain is the initials. The monogram reuses them. */
	initials: "NSS",
	title: "Senior iOS Engineer",
	location: "Copenhagen, Denmark",
	description:
		"nsscode.com. A lab of small tools and toys that run in the browser. Nothing tracked, nothing stored, nothing to install.",
	/* First year of iOS work. A year rather than a count, so the front page does not drift each January. */
	iosSince: 2015,
	links: [
		{
			label: "GitHub",
			handle: "NikolajMosbaek",
			href: "https://github.com/NikolajMosbaek",
		},
		{
			label: "LinkedIn",
			handle: "nikolaj-mos",
			href: "https://www.linkedin.com/in/nikolaj-mos",
		},
		{
			label: "X",
			handle: "@NikolajMosb",
			href: "https://x.com/NikolajMosb",
		},
	] satisfies SocialLink[],
	source: "https://github.com/NikolajMosbaek/nsscode.com",
} as const;
