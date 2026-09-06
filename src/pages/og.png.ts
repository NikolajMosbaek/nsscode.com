import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { Resvg } from "@resvg/resvg-js";
import type { APIRoute } from "astro";
import satori from "satori";
import { site } from "../data/site";

const require = createRequire(import.meta.url);

const fontFile = (pkg: string, file: string) =>
	readFile(require.resolve(`${pkg}/files/${file}`));

type Node = { type: string; props: Record<string, unknown> };
const el = (
	type: string,
	style: Record<string, string | number>,
	children?: Node | Node[] | string,
): Node => ({ type, props: { style, children } });

export const GET: APIRoute = async () => {
	/* Commit Mono's WOFF trips satori's font parser, so labels use the sans. */
	const [sans, sansRegular] = await Promise.all([
		fontFile(
			"@fontsource/schibsted-grotesk",
			"schibsted-grotesk-latin-600-normal.woff",
		),
		fontFile(
			"@fontsource/schibsted-grotesk",
			"schibsted-grotesk-latin-400-normal.woff",
		),
	]);

	const tree = el(
		"div",
		{
			width: "100%",
			height: "100%",
			display: "flex",
			flexDirection: "column",
			justifyContent: "space-between",
			padding: "72px 80px",
			background: "#fbfaf8",
			color: "#1c1a17",
			fontFamily: "Schibsted Grotesk",
		},
		[
			el(
				"div",
				{
					display: "flex",
					justifyContent: "space-between",
					fontSize: 24,
					fontWeight: 400,
					letterSpacing: "0.08em",
					textTransform: "uppercase",
					color: "#6f6a63",
				},
				[
					el("span", {}, "tools and toys, in the browser"),
					el("span", {}, "nsscode.com"),
				],
			),
			el("div", { display: "flex", flexDirection: "column", gap: 28 }, [
				el(
					"div",
					{
						display: "flex",
						alignItems: "center",
						gap: 20,
						fontSize: 26,
						fontWeight: 400,
						color: "#6f6a63",
					},
					[
						el("span", {
							width: 14,
							height: 14,
							borderRadius: 999,
							background: "#c0392b",
						}),
						el("span", {}, "no tracking, nothing to install"),
					],
				),
				el(
					"div",
					{
						fontSize: 92,
						lineHeight: 0.98,
						letterSpacing: "-0.035em",
						fontWeight: 600,
						maxWidth: 1000,
					},
					"Small things that run in your browser.",
				),
			]),
		],
	);

	const svg = await satori(tree as never, {
		width: 1200,
		height: 630,
		fonts: [
			{ name: "Schibsted Grotesk", data: sans, weight: 600, style: "normal" },
			{
				name: "Schibsted Grotesk",
				data: sansRegular,
				weight: 400,
				style: "normal",
			},
		],
	});

	const png = new Resvg(svg, { fitTo: { mode: "width", value: 1200 } })
		.render()
		.asPng();

	return new Response(new Uint8Array(png), {
		headers: { "Content-Type": "image/png" },
	});
};
