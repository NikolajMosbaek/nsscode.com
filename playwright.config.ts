import { defineConfig } from "@playwright/test";

export default defineConfig({
	testDir: "tests",
	fullyParallel: true,
	reporter: process.env.CI ? "github" : "list",
	use: {
		baseURL: "http://localhost:4321",
	},
	webServer: {
		command: "npm run preview -- --port 4321",
		url: "http://localhost:4321",
		reuseExistingServer: !process.env.CI,
		timeout: 30_000,
	},
});
