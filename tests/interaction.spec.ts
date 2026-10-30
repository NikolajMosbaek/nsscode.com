import { expect, test } from "@playwright/test";

/*
 * A Svelte effect that writes state and then reads it back re-runs
 * without end: the page renders, but it never stops working, so clicks
 * land on a starved event loop. It looks like "the buttons do nothing".
 * Nothing else in the suite catches that, so these check the islands
 * that keep state in the address bar.
 */

/** Frames rendered in one second. A runaway effect starves this. */
async function framesPerSecond(page: import("@playwright/test").Page) {
	return page.evaluate(
		() =>
			new Promise<number>((resolve) => {
				let frames = 0;
				const start = performance.now();
				const tick = () => {
					frames += 1;
					if (performance.now() - start < 1000) requestAnimationFrame(tick);
					else resolve(frames);
				};
				requestAnimationFrame(tick);
			}),
	);
}

test("Programme keeps rendering frames and answers its buttons", async ({
	page,
}) => {
	await page.goto("/lab/programme/");
	await expect(page.locator("#session-title")).toHaveText("Week 1, day 1");

	expect(await framesPerSecond(page)).toBeGreaterThan(30);

	await page.getByRole("button", { name: "Next session →" }).click();
	await expect(page.locator("#session-title")).toHaveText("Week 1, day 2");

	await page.getByRole("button", { name: "Texas Method" }).click();
	await expect(page.locator("#session-title")).toHaveText("Week 1, day 1");

	await page.locator("#max-squat").fill("160");
	await expect(page).toHaveURL(/sq=160/);
});

test("Programme opens on the session named in the address", async ({
	page,
}) => {
	await page.goto(
		"/lab/programme/?p=531&sq=140&bp=100&dl=180&pr=60&bar=20&w=4&s=w3d2",
	);
	await expect(page.locator("#session-title")).toHaveText("Week 3, day 2");
});

test("Life and Boids keep rendering frames", async ({ page }) => {
	for (const route of ["/lab/life/", "/lab/boids/"]) {
		await page.goto(route);
		await expect(page.locator("canvas")).toBeVisible();
		expect(await framesPerSecond(page)).toBeGreaterThan(30);
	}
});

test("Plates keeps updating after the weight field is cleared or given a comma", async ({
	page,
}) => {
	const errors: string[] = [];
	page.on("pageerror", (error) => errors.push(error.message));
	await page.goto("/lab/plates/");
	const field = page.locator("#plates-target");
	const perSide = page.locator("section[aria-live] .text-h2");

	await expect(perSide).toHaveText("20 · 20");
	await field.fill("");
	await field.fill("140");
	await expect(perSide).toHaveText("20 · 20 · 20");
	await field.fill("102,5");
	await expect(perSide).toHaveText("20 · 20 · 1.25");
	await field.fill("90");
	await expect(perSide).toHaveText("20 · 10 · 5");
	expect(errors).toEqual([]);
});
