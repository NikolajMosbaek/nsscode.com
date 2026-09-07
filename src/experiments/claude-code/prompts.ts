import type { IngredientId } from "./logic";

/** A segment of a good prompt, optionally tagged with the ingredient it supplies. */
export interface Segment {
	t: string;
	i?: IngredientId;
}

export interface Pair {
	slug: string;
	kind: string;
	bad: string;
	badWhy: string;
	good: Segment[];
	goodWhy: string;
}

export const pairs: Pair[] = [
	{
		slug: "bug",
		kind: "Fixing a bug",
		bad: "the login is broken, fix it",
		badWhy:
			"Broken how? Which login? Claude has to search the whole repo, guess a symptom, and pick a fix you may not want. Every guess is a place to be wrong.",
		good: [
			{ t: "In ", i: "context" },
			{ t: "LoginFeature.swift", i: "context" },
			{ t: " the retry button stays disabled after a failed request. " },
			{ t: "Make it re-enable once the request finishes, ", i: "goal" },
			{ t: "success or failure. ", i: "goal" },
			{ t: "Do not change the reducer's public actions. ", i: "constraints" },
			{
				t: "Done when the existing tests pass and a new test covers the retry path. ",
				i: "done",
			},
			{ t: "Run swift test.", i: "verify" },
		],
		goodWhy:
			"Symptom, place, desired behaviour, one boundary, and a way to check. Claude can start on the right file and stop when the tests say so.",
	},
	{
		slug: "feature",
		kind: "Adding a feature",
		bad: "add dark mode",
		badWhy:
			"Three words for a change that touches every screen. Claude will invent a colour system, a toggle, a persistence layer and a settings screen you did not ask for.",
		good: [
			{ t: "Add a dark theme. ", i: "goal" },
			{
				t: "We already have colour tokens in DesignTokens.swift; ",
				i: "context",
			},
			{
				t: "add dark values for each token rather than new colours in views. ",
				i: "constraints",
			},
			{
				t: "Follow the system setting, no in-app toggle yet. ",
				i: "constraints",
			},
			{
				t: "Done when every screen in the Previews folder renders in both schemes ",
				i: "done",
			},
			{ t: "and the snapshot tests are updated and green.", i: "verify" },
		],
		goodWhy:
			"Points at the existing token file so the change lands in one place, says what not to build, and turns previews plus snapshot tests into the finish line.",
	},
	{
		slug: "explore",
		kind: "Understanding code",
		bad: "explain the app",
		badWhy:
			"You will get a five-page summary of folders you already know. Ask the question you actually have.",
		good: [
			{
				t: "How does a push notification end up opening the right screen? ",
				i: "goal",
			},
			{
				t: "Start from AppDelegate and follow it to the router. ",
				i: "context",
			},
			{ t: "Do not change anything; ", i: "constraints" },
			{
				t: "give me the call chain as a list with file and line for each hop.",
				i: "done",
			},
		],
		goodWhy:
			"A specific question, a starting point, read-only, and the shape of the answer you want. Good for onboarding to a codebase you did not write.",
	},
	{
		slug: "refactor",
		kind: "Refactoring",
		bad: "clean up NetworkClient, it's a mess",
		badWhy:
			"Mess is not a spec. Claude will rename things, reorder methods and reformat, and you will not be able to tell what actually changed.",
		good: [
			{ t: "NetworkClient.swift", i: "context" },
			{ t: " builds URLRequests in six places with the same headers. " },
			{ t: "Extract one private helper and use it everywhere. ", i: "goal" },
			{
				t: "Behaviour and public API stay identical, no other changes in the file. ",
				i: "constraints",
			},
			{ t: "Existing NetworkClientTests must pass unchanged.", i: "verify" },
		],
		goodWhy:
			"One mechanical change with a clear before and after. The diff will be reviewable, and unchanged tests prove nothing else moved.",
	},
	{
		slug: "tests",
		kind: "Writing tests",
		bad: "write tests for this",
		badWhy:
			"Claude will write tests that pass against the current code, bugs included, and test trivial getters. You wanted confidence, you got line coverage.",
		good: [
			{ t: "Write tests for CartReducer ", i: "goal" },
			{ t: "in CartFeature/CartReducer.swift ", i: "context" },
			{
				t: "using Swift Testing and TestStore, like the ones in CheckoutReducerTests. ",
				i: "constraints",
			},
			{
				t: "Cover: adding an item twice merges quantities; removing the last item empties the cart; a failed price fetch keeps the old price. ",
				i: "done",
			},
			{ t: "Run swift test and show me the output.", i: "verify" },
		],
		goodWhy:
			"Names the framework, points at an example to copy the style from, and lists the behaviours worth protecting instead of asking for tests in general.",
	},
	{
		slug: "review",
		kind: "Getting a review",
		bad: "is this good?",
		badWhy:
			"It will say yes with three minor suggestions. A review needs a lens: what are you worried about?",
		good: [
			{ t: "Review the diff on this branch against main ", i: "context" },
			{ t: "for concurrency problems only: ", i: "goal" },
			{
				t: "Sendable violations, actor hops on the hot path, anything that could race. ",
				i: "done",
			},
			{ t: "Do not comment on naming or style. ", i: "constraints" },
			{
				t: "For each finding, give the file, line and a concrete failing scenario.",
				i: "done",
			},
		],
		goodWhy:
			"One lens, an explicit exclusion, and a format that forces each finding to be real. Run it again with a different lens rather than asking for everything at once.",
	},
	{
		slug: "chain",
		kind: "Too much at once",
		bad: "add the settings screen, then fix the crash on launch, update the readme and bump the version, and then make a PR",
		badWhy:
			"Four unrelated tasks. When one goes wrong the others are tangled into the same diff, and you cannot review or revert any of them alone.",
		good: [
			{ t: "Fix the crash on launch. ", i: "goal" },
			{ t: "Crash log is in crash.txt; ", i: "context" },
			{ t: "it points at SceneDelegate. ", i: "context" },
			{ t: "Only fix the crash, ", i: "constraints" },
			{ t: "done when the app launches in the simulator ", i: "done" },
			{ t: "and the launch UI test passes. ", i: "verify" },
			{ t: "I will ask for the settings screen separately.", i: "scope" },
		],
		goodWhy:
			"One task, one prompt, one commit. Use /clear between unrelated tasks so the second one does not inherit the first one's context.",
	},
	{
		slug: "vague-ui",
		kind: "UI work",
		bad: "make the profile page look better",
		badWhy:
			"Better according to whom? Claude will pick a random direction and you will spend the session undoing it.",
		good: [
			{ t: "On ProfileView ", i: "context" },
			{
				t: "the avatar, name and stats are three separate stacks with inconsistent spacing. ",
			},
			{ t: "Put them in one header card ", i: "goal" },
			{
				t: "using the spacing and card style from DESIGN.md. ",
				i: "constraints",
			},
			{ t: "Do not touch the list below. ", i: "constraints" },
			{
				t: "Show me a screenshot of the preview at iPhone 15 and iPhone SE sizes when done.",
				i: "verify",
			},
		],
		goodWhy:
			"Describes what is wrong, names the source of truth for style, fences the change, and asks for visual proof at two sizes.",
	},
];
