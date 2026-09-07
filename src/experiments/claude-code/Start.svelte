<script lang="ts">
import Code from "./Code.svelte";

const first = `cd your-project
claude          # start a session in this folder
/init           # let it write a first CLAUDE.md
/help           # everything it can do`;

const keys = [
	[
		"Shift+Tab",
		"Cycle permission modes: ask me, accept edits, plan (read only), auto.",
	],
	["Esc", "Stop what it is doing. Context stays; tell it what to do instead."],
	[
		"@file",
		"Put a file in the conversation instead of describing where it is.",
	],
	[
		"!command",
		"Run a shell command yourself; the output lands in the context.",
	],
	["/clear", "New task, empty context. Use it more than you think."],
	["/compact", "Long session, context filling up: summarise and carry on."],
	["/model", "Pick the model. /effort picks how hard it thinks."],
	["/cost", "How much context is used and roughly what it cost."],
];
</script>

<div class="grid gap-8">
  <div class="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:gap-10">
    <div class="grid content-start gap-4">
      <p class="text-body text-ink-soft m-0 font-medium text-pretty">
        Claude Code is a program in your terminal. You type what you want, it reads your files, edits them, runs your tests and commands, and shows you what it did. It is not autocomplete. It is closer to a colleague who has never seen your codebase, reads very fast, and does exactly what you asked, including the parts you did not think through.
      </p>
      <p class="text-body text-ink-soft m-0 font-medium text-pretty">
        The one idea behind everything on this page: <strong class="text-ink">it can only work with what is in its context.</strong> Your files, your instructions, the output of the commands it ran. Every technique here is a way of putting the right things in that context and keeping the wrong things out.
      </p>
    </div>
    <Code code={first} label="terminal" />
  </div>

  <div class="grid gap-3">
    <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Eight keys and commands to know on day one</h3>
    <dl class="m-0 grid gap-x-8 gap-y-3 sm:grid-cols-2">
      {#each keys as [k, v] (k)}
        <div class="card-flat grid gap-1 p-3.5">
          <dt class="m-0 font-mono text-sm font-bold">{k}</dt>
          <dd class="text-small text-ink-muted m-0">{v}</dd>
        </div>
      {/each}
    </dl>
  </div>

  <div class="card p-5 sm:p-6">
    <p class="eyebrow m-0 mb-2">The loop that works</p>
    <ol class="m-0 grid gap-2 pl-5 text-body text-ink-soft font-medium">
      <li><strong class="text-ink">Ask it to look before it touches.</strong> Plan mode (Shift+Tab until it says plan) reads and proposes; nothing changes until you say so.</li>
      <li><strong class="text-ink">Give it one task with a finish line.</strong> A file, a behaviour, a test that should pass.</li>
      <li><strong class="text-ink">Read the diff.</strong> Every time. You are the reviewer now, not the typist.</li>
      <li><strong class="text-ink">Correct early.</strong> Two corrections on the same thing means the prompt was wrong. /clear and write a better one.</li>
      <li><strong class="text-ink">Commit small.</strong> One task, one commit. Ask it to commit; do not let it decide when.</li>
    </ol>
  </div>
</div>
