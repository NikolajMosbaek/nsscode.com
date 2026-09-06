import { readFile } from "node:fs/promises";
import { createRequire } from "node:module";
import { Resvg } from "@resvg/resvg-js";
import type { APIRoute } from "astro";
import satori from "satori";

const require = createRequire(import.meta.url);

const fontFile = (pkg: string, file: string) =>
	readFile(require.resolve(`${pkg}/files/${file}`));

type Node = { type: string; props: Record<string, unknown> };
const el = (
	type: string,
	style: Record<string, string | number>,
	children?: Node | Node[] | string,
): Node => ({ type, props: { style, children } });

const ink = "#1c1a17";
const ground = "#f8f5ef";

const tile = (bg: string, fg: string, label: string, rotate: number): Node =>
	el(
		"div",
		{
			display: "flex",
			alignItems: "flex-end",
			width: 220,
			height: 150,
			padding: 18,
			borderRadius: 22,
			border: `4px solid ${ink}`,
			background: bg,
			color: fg,
			boxShadow: `8px 8px 0 ${ink}`,
			transform: `rotate(${rotate}deg)`,
			fontSize: 26,
			fontWeight: 800,
			letterSpacing: "-0.03em",
		},
		label,
	);

export const GET: APIRoute = async () => {
	const [bold, medium] = await Promise.all([
		fontFile(
			"@fontsource/bricolage-grotesque",
			"bricolage-grotesque-latin-800-normal.woff",
		),
		fontFile(
			"@fontsource/bricolage-grotesque",
			"bricolage-grotesque-latin-500-normal.woff",
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
			padding: "64px 72px",
			background: ground,
			color: ink,
			fontFamily: "Bricolage Grotesque",
		},
		[
			el(
				"div",
				{
					display: "flex",
					alignItems: "center",
					gap: 16,
					fontSize: 30,
					fontWeight: 800,
					letterSpacing: "-0.03em",
				},
				[
					el("span", {
						width: 44,
						height: 44,
						borderRadius: 12,
						border: `4px solid ${ink}`,
						background: "#f4795f",
						boxShadow: `5px 5px 0 ${ink}`,
					}),
					el("span", {}, "nsscode"),
				],
			),
			el(
				"div",
				{
					display: "flex",
					alignItems: "flex-end",
					justifyContent: "space-between",
					gap: 40,
				},
				[
					el(
						"div",
						{
							display: "flex",
							flexDirection: "column",
							gap: 20,
							maxWidth: 620,
						},
						[
							el(
								"div",
								{
									fontSize: 74,
									lineHeight: 0.92,
									letterSpacing: "-0.045em",
									fontWeight: 800,
								},
								"Small things that run in your browser.",
							),
							el(
								"div",
								{
									fontSize: 24,
									fontWeight: 500,
									color: "#3a3632",
									lineHeight: 1.3,
								},
								"Tools and toys. Nothing tracked, nothing to install.",
							),
						],
					),
					el(
						"div",
						{
							display: "flex",
							flexDirection: "column",
							gap: 28,
							paddingRight: 12,
						},
						[
							tile("#ffffff", ink, "Easing", -3),
							tile("#7aa2f7", ink, "OKLCH ramp", 2),
						],
					),
				],
			),
		],
	);

	const svg = await satori(tree as never, {
		width: 1200,
		height: 630,
		fonts: [
			{ name: "Bricolage Grotesque", data: bold, weight: 800, style: "normal" },
			{
				name: "Bricolage Grotesque",
				data: medium,
				weight: 500,
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
