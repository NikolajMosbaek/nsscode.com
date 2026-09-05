/*
 * Rasterise the SVG favicon for browsers that want PNG: a 32px favicon and
 * the 180px Apple touch icon. Run after editing public/favicon.svg.
 */
import { readFile, writeFile } from "node:fs/promises";
import { Resvg } from "@resvg/resvg-js";

const svg = await readFile("public/favicon.svg", "utf8");
const light = svg.replace(
	/@media \(prefers-color-scheme: dark\) \{[^}]*\{[^}]*\}[^}]*\{[^}]*\}\s*\}/s,
	"",
);

for (const [file, size] of [
	["public/favicon-32.png", 32],
	["public/apple-touch-icon.png", 180],
]) {
	const png = new Resvg(light, { fitTo: { mode: "width", value: size } })
		.render()
		.asPng();
	await writeFile(file, png);
	console.log(file, size);
}
