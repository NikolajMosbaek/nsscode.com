<script lang="ts">
import Code from "../../components/Code.svelte";
import Steps from "./Steps.svelte";
import { steps } from "./steps";

let os = $state<"mac" | "win" | "npm">("mac");
const installs = {
	mac: {
		label: "macOS, Linux, WSL",
		code: "curl -fsSL https://claude.ai/install.sh | bash",
	},
	win: {
		label: "Windows PowerShell",
		code: "irm https://claude.ai/install.ps1 | iex",
	},
	npm: {
		label: "npm (Node 22+)",
		code: "npm install -g @anthropic-ai/claude-code",
	},
};

const verify = `claude --version   # prints a version
claude doctor      # checks the install and your settings`;

const first = `cd ~/code/my-small-project
claude
# Browser opens: sign in with your Claude account (Pro or Max include Claude Code).
# "Do you trust the files in this folder?"  y
# You are now at the > prompt. Type /help.`;
</script>

<div class="grid gap-8">
  <p class="text-body text-ink-soft m-0 max-w-[70ch] font-medium text-pretty">
    Twenty minutes, one terminal. By the end of this chapter Claude Code is installed, signed in, and sitting in a repo of yours waiting for instructions. Do the steps in order; the checklist at the bottom is yours to tick.
  </p>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
    <div class="grid content-start gap-3">
      <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">1. Install</h3>
      <div class="flex flex-wrap gap-2" role="group" aria-label="System">
        {#each Object.entries(installs) as [key, v] (key)}
          <button type="button" class="pill min-h-8 px-3 text-[11px] {os === key ? 'pill-active' : ''}" aria-pressed={os === key} onclick={() => (os = key as typeof os)}>{v.label}</button>
        {/each}
      </div>
      <Code code={installs[os].code} label="terminal" />
      <p class="text-small text-ink-muted m-0">The native installer keeps itself up to date. Homebrew (<span class="font-mono">brew install --cask claude-code</span>) and WinGet work too but do not auto-update. On Windows without WSL, install Git for Windows first so Claude has a Bash to run commands in.</p>
    </div>
    <div class="grid content-start gap-3">
      <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">2. Check it</h3>
      <Code code={verify} label="terminal" />
      <p class="text-small text-ink-muted m-0">If <span class="font-mono">claude</span> is not found, open a new terminal window first; the installer edits your shell profile and the old window has not read it.</p>
    </div>
  </div>

  <div class="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
    <div class="grid content-start gap-3">
      <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">3. Pick a practice repo</h3>
      <p class="text-body text-ink-soft m-0 font-medium text-pretty">Not work. Not a fresh empty folder either. Something small of your own that already has tests and a git history, and that you would not mind breaking. A side project, an old exercise, a fork of a small library you know. You will use it for every chapter here.</p>
      <p class="text-small text-ink-muted m-0">No such repo? Clone one you understand and add two or three tests first. Ten minutes well spent: every technique below leans on having a test to run.</p>
    </div>
    <div class="grid content-start gap-3">
      <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">4. First start</h3>
      <Code code={first} label="terminal" />
      <p class="text-small text-ink-muted m-0">The trust prompt appears once per folder. It exists because a repo can carry instructions (CLAUDE.md, hooks) that Claude will follow; say yes to your own code, think twice about a stranger's. To leave: <span class="font-mono">/exit</span>, or Ctrl+D twice.</p>
    </div>
  </div>

  <div class="card-flat grid gap-3 p-4 sm:grid-cols-3">
    <div>
      <p class="eyebrow m-0">Signing in</p>
      <p class="text-small text-ink-muted m-0">A Claude Pro or Max subscription includes Claude Code. <span class="font-mono">/login</span> switches accounts, <span class="font-mono">/status</span> shows which one is active.</p>
    </div>
    <div>
      <p class="eyebrow m-0">Updating</p>
      <p class="text-small text-ink-muted m-0"><span class="font-mono">claude update</span> when you want it now. The native installer does it on its own otherwise.</p>
    </div>
    <div>
      <p class="eyebrow m-0">Editor</p>
      <p class="text-small text-ink-muted m-0">There is a VS Code extension and a JetBrains plugin. Learn the terminal first; the editor versions are the same thing with a diff viewer.</p>
    </div>
  </div>

  <Steps steps={steps.install} />
</div>
