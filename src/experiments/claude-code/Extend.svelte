<script lang="ts">
import Code from "../../components/Code.svelte";

type Tab = "rules" | "skills" | "agents" | "hooks";
let tab = $state<Tab>("rules");

const tabs: { id: Tab; title: string; one: string }[] = [
	{
		id: "rules",
		title: "Rules",
		one: "Instructions that apply to some files, not all.",
	},
	{
		id: "skills",
		title: "Skills",
		one: "A procedure you run again and again.",
	},
	{
		id: "agents",
		title: "Agents",
		one: "A helper with its own context and its own job.",
	},
	{
		id: "hooks",
		title: "Hooks",
		one: "Something that must happen every time, no matter what.",
	},
];

const rule = `---
paths:
  - "Sources/UI/**/*.swift"
---
# SwiftUI views

- Views are dumb. State and logic live in the reducer.
- Use the components in DESIGN.md before writing a new one.
- Every new view gets a Preview with light and dark schemes.`;

const skill = `---
name: release-notes
description: Draft release notes from the commits since the last tag. Use when asked for release notes or a changelog.
allowed-tools: Bash(git log *) Bash(git tag *)
---
Run \`git log $(git describe --tags --abbrev=0)..HEAD --oneline\`.
Group the commits into Added, Changed, Fixed. One line each, user
language, no commit hashes. Ask before including anything that looks
internal.`;

const agent = `---
name: reviewer
description: Reviews a diff for concurrency and correctness bugs. Use proactively after any change touching actors or async code.
tools: Read, Grep, Glob, Bash
model: opus
effort: xhigh
---
You review Swift diffs for Sendable violations, actor reentrancy bugs
and races. Report each finding as file, line, and a concrete failing
scenario. Do not comment on style. If you find nothing, say so.`;

const hook = `{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command", "command": "swiftformat --quiet $CLAUDE_PROJECT_DIR" }
        ]
      }
    ]
  }
}`;

const picker = [
	["Every time it edits a file under Sources/UI, follow these rules.", "rule"],
	["Every Friday I ask it to draft release notes the same way.", "skill"],
	[
		"I want a second opinion on a diff, without polluting the main conversation.",
		"agent",
	],
	["Run the formatter after every edit, even if it forgets.", "hook"],
	["Explain our error handling convention, everywhere.", "CLAUDE.md"],
];
</script>

<div class="grid gap-8">
  <p class="text-body text-ink-soft m-0 max-w-[70ch] font-medium text-pretty">
    Four ways to teach Claude Code something once instead of every session. They live in the <span class="font-mono">.claude/</span> folder of your repo (shared with the team) or in <span class="font-mono">~/.claude/</span> (just you). Pick by the shape of the problem, not by which sounds most advanced.
  </p>

  <div class="grid gap-4">
    <div class="flex flex-wrap gap-2.5" role="group" aria-label="Kind">
      {#each tabs as t (t.id)}
        <button type="button" class="pill {tab === t.id ? 'pill-active' : ''}" aria-pressed={tab === t.id} onclick={() => (tab = t.id)}>{t.title}</button>
      {/each}
    </div>

    {#if tab === "rules"}
      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <div class="grid content-start gap-3">
          <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Rules</h3>
          <p class="text-body text-ink-soft m-0 font-medium text-pretty">A rule is a Markdown file in <span class="font-mono">.claude/rules/</span>. Without a <span class="font-mono">paths</span> header it behaves like a section of CLAUDE.md that you moved out to keep things tidy. With one, it loads only when Claude touches a matching file. That is the useful part: UI rules do not clutter a database migration.</p>
          <p class="text-small text-ink-muted m-0">Use rules when CLAUDE.md passes 100 lines, or when a convention only applies to part of the tree. <span class="font-mono">~/.claude/rules/</span> does the same across all your projects.</p>
        </div>
        <Code code={rule} file=".claude/rules/swiftui.md" />
      </div>
    {:else if tab === "skills"}
      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <div class="grid content-start gap-3">
          <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Skills</h3>
          <p class="text-body text-ink-soft m-0 font-medium text-pretty">A skill is a folder with a <span class="font-mono">SKILL.md</span>: a recipe Claude follows. You run it with <span class="font-mono">/release-notes</span>, or Claude picks it up itself when your request matches the description. Anything you have explained three times is a skill waiting to be written.</p>
          <p class="text-small text-ink-muted m-0">Good candidates: release notes, the steps to add a new screen in your architecture, your PR checklist, "set up a new module". The old <span class="font-mono">.claude/commands/</span> files still work; skills replaced them.</p>
        </div>
        <Code code={skill} file=".claude/skills/release-notes/SKILL.md" />
      </div>
    {:else if tab === "agents"}
      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <div class="grid content-start gap-3">
          <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Agents</h3>
          <p class="text-body text-ink-soft m-0 font-medium text-pretty">A subagent is a separate Claude with its own instructions, its own tools and, crucially, its own context window. The main session hands it a job, it works, and only its summary comes back. Your conversation stays clean. Claude Code ships with a few (Explore for reading around, Plan for planning); you add yours in <span class="font-mono">.claude/agents/</span>.</p>
          <p class="text-small text-ink-muted m-0">Use them for reviews, research across many files, or anything noisy. Claude delegates on its own when the description fits; say <span class="font-mono">@reviewer</span> to force it. Do not build ten agents on day one. One reviewer is plenty.</p>
        </div>
        <Code code={agent} file=".claude/agents/reviewer.md" />
      </div>
    {:else}
      <div class="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
        <div class="grid content-start gap-3">
          <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Hooks</h3>
          <p class="text-body text-ink-soft m-0 font-medium text-pretty">Instructions are followed most of the time. A hook is a shell command that runs every time, at a point you choose: before a tool runs, after a file is edited, when the session starts. It does not depend on Claude remembering. Formatters, lint gates and "never touch this folder" checks belong here.</p>
          <p class="text-small text-ink-muted m-0">Hooks go in <span class="font-mono">.claude/settings.json</span> (shared) or <span class="font-mono">settings.local.json</span> (yours). A hook that exits with code 2 blocks the action and its message tells Claude why.</p>
        </div>
        <Code code={hook} file=".claude/settings.json" />
      </div>
    {/if}
  </div>

  <div class="grid gap-3">
    <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Which one?</h3>
    <ul class="m-0 grid list-none gap-2 p-0">
      {#each picker as [need, answer] (need)}
        <li class="card-flat flex flex-wrap items-center justify-between gap-x-6 gap-y-1 px-4 py-3">
          <span class="text-small text-ink-soft font-medium">{need}</span>
          <span class="pill pill-active min-h-7 px-3 text-[11px]">{answer}</span>
        </li>
      {/each}
    </ul>
  </div>
</div>
