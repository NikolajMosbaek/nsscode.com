<script lang="ts">
import Code from "./Code.svelte";

const steps = [
	{
		n: "Explore",
		text: "Plan mode on (Shift+Tab). Ask it to read the relevant code and tell you how it works today. Nothing changes yet.",
		cmd: "How does checkout call the payment API? Read, don't edit.",
	},
	{
		n: "Plan",
		text: "Ask for a plan: which files, what changes, how it will verify. Edit the plan. This is the cheapest place to be wrong.",
		cmd: "Plan the change. List files, steps, and the tests that prove it.",
	},
	{
		n: "Implement",
		text: "Leave plan mode. Let it work through the plan. Watch the first few edits; walk away for the rest if it has a test to run.",
		cmd: "Go. Run swift test after each step.",
	},
	{
		n: "Verify",
		text: "Tests, build, a screenshot. Read the diff yourself. If something is off, say exactly what, once.",
		cmd: "The retry test fails on line 42. Fix the cause, not the test.",
	},
	{
		n: "Commit",
		text: "One task, one commit, a message that says why. Then /clear before the next task.",
		cmd: "Commit this. Then I'll start something new.",
	},
];

const habits = [
	[
		"Give it a way to check its own work.",
		"A test, a build, a script, a screenshot. A session with a check is one you can leave; a session without one is one you babysit.",
	],
	[
		"/clear between tasks.",
		"Leftover context from the last job makes the next job worse. Start clean.",
	],
	[
		"Correct once, then rewrite.",
		"If you have corrected the same thing twice, the prompt or CLAUDE.md is wrong. Fix that instead.",
	],
	[
		"Point, do not describe.",
		'@Sources/Cart/CartReducer.swift beats "the cart file". A pasted error beats "it crashes".',
	],
	[
		"Ask for the diff in pieces.",
		'"Show me the reducer change before you touch the view." Small diffs get read; large ones get skimmed.',
	],
	[
		"Say what done looks like.",
		'"Done when the three tests pass and the preview renders in both schemes." Otherwise done is whenever it stops.',
	],
	[
		"Fence the change.",
		'"Do not touch anything outside Sources/Checkout." It will respect a fence it can see.',
	],
	[
		"Use plan mode for anything over one file.",
		"Reading a plan costs a minute. Reverting a wrong afternoon costs an afternoon.",
	],
	[
		"Let it run the tests, and make it paste the output.",
		'"It should work now" is not a test result.',
	],
	[
		"Feed the docs.",
		"Every time it learns something about your repo, put it in CLAUDE.md or ARCHITECTURE.md. Next session starts from there.",
	],
];

const worktree = `claude --worktree payments   # separate checkout, separate branch
claude -p "Summarise the failing tests in ci.log"   # one shot, no chat`;
</script>

<div class="grid gap-8">
  <p class="text-body text-ink-soft m-0 max-w-[70ch] font-medium text-pretty">
    The failure mode for beginners is the same every time: a big vague request, a long wait, a huge diff nobody reads, and a slow slide into fixing things by hand. The fix is a rhythm, not a trick.
  </p>

  <ol class="m-0 grid list-none gap-3 p-0 lg:grid-cols-5">
    {#each steps as s, i (s.n)}
      <li class="card-flat grid content-start gap-2 p-4">
        <p class="m-0 flex items-baseline gap-2"><span class="eyebrow">{i + 1}</span><span class="font-bold">{s.n}</span></p>
        <p class="text-small text-ink-muted m-0">{s.text}</p>
        <p class="m-0 mt-auto rounded-lg bg-surface-strong px-2.5 py-2 font-mono text-[11.5px] leading-snug">“{s.cmd}”</p>
      </li>
    {/each}
  </ol>

  <div class="grid gap-3">
    <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Ten habits</h3>
    <ol class="m-0 grid list-none gap-2 p-0 sm:grid-cols-2">
      {#each habits as [h, t], i (h)}
        <li class="card-flat grid content-start gap-1 px-4 py-3">
          <p class="m-0 flex items-baseline gap-2"><span class="eyebrow tabular-nums">{String(i + 1).padStart(2, "0")}</span><span class="font-bold">{h}</span></p>
          <p class="text-small text-ink-muted m-0">{t}</p>
        </li>
      {/each}
    </ol>
  </div>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
    <div class="grid content-start gap-3">
      <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">When you are ready for more</h3>
      <ul class="text-small text-ink-muted m-0 grid gap-2 pl-4">
        <li><strong class="text-ink">Worktrees</strong> give each task its own checkout so two sessions do not step on each other.</li>
        <li><strong class="text-ink">Headless mode</strong> (<span class="font-mono">claude -p</span>) runs one prompt and exits. Scripts, CI, git hooks.</li>
        <li><strong class="text-ink">MCP servers</strong> connect tools: your issue tracker, a database, a browser. <span class="font-mono">/mcp</span> lists what is connected.</li>
        <li><strong class="text-ink">Permission modes</strong>: accept edits when you trust the task, auto when you want a classifier to watch instead of you. Bypass is for containers, not laptops.</li>
        <li><strong class="text-ink">/compact</strong> with instructions ("keep the API decisions") when a long session starts to forget.</li>
      </ul>
    </div>
    <Code code={worktree} label="terminal" />
  </div>

  <div class="card p-5 sm:p-6">
    <p class="eyebrow m-0 mb-2">If you remember one thing</p>
    <p class="text-body text-ink-soft m-0 max-w-[70ch] font-medium text-pretty">
      You are not typing code any more. You are writing work orders, reviewing diffs and maintaining the documentation that makes the next work order shorter. The people who get a lot out of Claude Code are the ones who were already good at explaining a task to a colleague. That is the skill to practise.
    </p>
  </div>
</div>
