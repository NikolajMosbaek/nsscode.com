<script lang="ts">
import Code from "./Code.svelte";
import { starters } from "./logic";

let name = $state("Shop");
let stack = $state("Swift 6 with strict concurrency, TCA, Xcode 26.");
let test = $state("swift test");
let lint = $state("swiftlint --strict");
let docs = $state({ architecture: true, design: true, specs: true });

const files = $derived(starters({ name, stack, test, lint, docs }));

const why = [
	{
		file: "ARCHITECTURE.md",
		what: "The shape of the system: modules, what each owns, how data flows, and the decisions you would otherwise explain in every prompt.",
		saves: "Claude stops inventing a fourth way to do networking.",
	},
	{
		file: "DESIGN.md",
		what: "Tokens, components that exist, spacing rules, how copy is written. The source of truth for anything visual.",
		saves: "You stop getting a new shade of blue in every pull request.",
	},
	{
		file: "SPECS.md",
		what: "What the product does, feature by feature, in plain sentences. What is deliberately out of scope.",
		saves: "It builds the feature you have, not the one it imagines.",
	},
];
</script>

<div class="grid gap-8">
  <p class="text-body text-ink-soft m-0 max-w-[70ch] font-medium text-pretty">
    CLAUDE.md is for rules. It is a bad place for a description of your whole system, because every line of it is loaded on every prompt. Put the long stuff in separate files at the root of the repo and let CLAUDE.md point at them with <span class="font-mono">@</span>. Claude reads them when the work calls for it, and so do your human colleagues.
  </p>

  <div class="grid gap-3 lg:grid-cols-3">
    {#each why as w (w.file)}
      <div class="card-flat grid content-start gap-2 p-4">
        <p class="m-0 font-mono text-sm font-bold">{w.file}</p>
        <p class="text-small text-ink-muted m-0">{w.what}</p>
        <p class="text-small text-ink m-0 font-medium">{w.saves}</p>
      </div>
    {/each}
  </div>

  <div class="grid gap-6 lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-10">
    <form class="grid content-start gap-4" onsubmit={(e) => e.preventDefault()}>
      <h3 class="m-0 text-h3 font-extrabold tracking-[-0.02em]">Make a starter set</h3>
      <label class="grid gap-1.5">
        <span class="eyebrow">Project name</span>
        <input type="text" bind:value={name} class="card-flat focus:border-accent min-w-0 rounded-xl px-3 py-2 font-mono text-sm outline-none" />
      </label>
      <label class="grid gap-1.5">
        <span class="eyebrow">Stack, one line</span>
        <input type="text" bind:value={stack} class="card-flat focus:border-accent min-w-0 rounded-xl px-3 py-2 font-mono text-sm outline-none" />
      </label>
      <label class="grid gap-1.5">
        <span class="eyebrow">Test command</span>
        <input type="text" bind:value={test} class="card-flat focus:border-accent min-w-0 rounded-xl px-3 py-2 font-mono text-sm outline-none" />
      </label>
      <label class="grid gap-1.5">
        <span class="eyebrow">Lint command</span>
        <input type="text" bind:value={lint} class="card-flat focus:border-accent min-w-0 rounded-xl px-3 py-2 font-mono text-sm outline-none" />
      </label>
      <fieldset class="grid gap-2">
        <legend class="eyebrow mb-2">Extra files</legend>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={docs.architecture} class="accent-accent size-4" /> ARCHITECTURE.md</label>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={docs.design} class="accent-accent size-4" /> DESIGN.md</label>
        <label class="flex items-center gap-2 text-sm"><input type="checkbox" bind:checked={docs.specs} class="accent-accent size-4" /> SPECS.md</label>
      </fieldset>
      <p class="text-small text-ink-muted m-0">These are skeletons. The value is in what you write into them, and in keeping them current when the code moves.</p>
    </form>
    <div class="grid min-w-0 content-start gap-4">
      {#each files as f (f.file)}
        <Code code={f.body} file={f.file} />
      {/each}
    </div>
  </div>

  <div class="card p-5 sm:p-6">
    <p class="eyebrow m-0 mb-2">A habit worth forming</p>
    <p class="text-body text-ink-soft m-0 max-w-[70ch] font-medium text-pretty">
      End a session by asking: "What did you learn about this codebase that is not in CLAUDE.md or ARCHITECTURE.md? Propose additions." Read them, keep the good ones, commit. The documentation compounds, and the next session starts smarter than this one did.
    </p>
  </div>
</div>
