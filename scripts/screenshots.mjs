import { chromium } from "@playwright/test";

const out = process.argv[2] ?? "shots";
const browser = await chromium.launch();
const shots = [
	{ name: "home-light-desktop", path: "/", width: 1440, scheme: "light" },
	{ name: "home-dark-desktop", path: "/", width: 1440, scheme: "dark" },
	{ name: "home-light-mobile", path: "/", width: 390, scheme: "light" },
	{ name: "lab-dark-desktop", path: "/lab/", width: 1440, scheme: "dark" },
	{
		name: "palette-light-desktop",
		path: "/lab/palette/",
		width: 1440,
		scheme: "light",
	},
	{
		name: "tokens-dark-mobile",
		path: "/lab/tokens/",
		width: 390,
		scheme: "dark",
	},
];
for (const shot of shots) {
	const context = await browser.newContext({
		viewport: { width: shot.width, height: 5000 },
		colorScheme: shot.scheme,
		deviceScaleFactor: 1,
		reducedMotion: "reduce",
	});
	const page = await context.newPage();
	await page.goto(`http://localhost:4321${shot.path}`, {
		waitUntil: "networkidle",
	});
	await page.screenshot({ path: `${out}/${shot.name}.png`, fullPage: true });
	await context.close();
}
await browser.close();
