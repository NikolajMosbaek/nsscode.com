/*
 * Every built page, both themes, zero axe violations. Runs against
 * `astro preview` over the `dist/` folder, so build first.
 */
import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

function routesIn(dir: string, prefix = "/"): string[] {
	const routes: string[] = [];
	for (const entry of readdirSync(dir)) {
		const full = join(dir, entry);
		if (statSync(full).isDirectory()) {
			if (entry === "_astro") continue;
			routes.push(...routesIn(full, `${prefix}${entry}/`));
		} else if (entry === "index.html") {
			routes.push(prefix);
		}
	}
	return routes.sort();
}

const routes = routesIn("dist");
const themes = ["light", "dark"] as const;

test("the build produced pages", () => {
	expect(routes).toContain("/");
	expect(routes).toContain("/lab/");
});

for (const route of routes) {
	for (const theme of themes) {
		test(`${route} has no accessibility violations in ${theme}`, async ({
			page,
		}) => {
			/* Reduced motion switches the scroll reveal off, so axe sees the whole page. */
			await page.emulateMedia({ colorScheme: theme, reducedMotion: "reduce" });
			await page.goto(route);

			const results = await new AxeBuilder({ page })
				.withTags([
					"wcag2a",
					"wcag2aa",
					"wcag21aa",
					"wcag22aa",
					"best-practice",
				])
				.analyze();
			expect(
				results.violations.map((v) => `${v.id}: ${v.help} (${v.nodes.length})`),
			).toEqual([]);

			await expect(page.locator("h1")).toHaveCount(1);
			await expect(page.locator("main#main")).toHaveCount(1);
		});
	}

	test(`${route} puts the skip link first in the tab order`, async ({
		page,
	}) => {
		await page.goto(route);
		await page.keyboard.press("Tab");
		await expect(page.locator(":focus")).toHaveText("Skip to content");
		await page.keyboard.press("Enter");
		await expect(page).toHaveURL(new RegExp(`${route}#main$`));
	});
}

test("the theme toggle switches and persists", async ({ page }) => {
	await page.emulateMedia({ colorScheme: "light" });
	await page.goto("/");
	const toggle = page.locator("[data-theme-toggle]").first();
	await expect(toggle).toHaveAttribute("aria-label", "Switch to dark theme");
	await toggle.click();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
	await page.reload();
	await expect(page.locator("html")).toHaveAttribute("data-theme", "dark");
});

test("unlisted experiments are noindex and off the sitemap", async ({
	page,
	request,
}) => {
	await page.goto("/lab/tokens/");
	await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
		"content",
		/noindex/,
	);
	const sitemap = await (await request.get("/sitemap.xml")).text();
	expect(sitemap).toContain("/lab/palette/");
	expect(sitemap).not.toContain("/lab/tokens/");
	await page.goto("/lab/");
	await expect(page.locator('a[href="/lab/tokens/"]')).toHaveCount(0);
});
