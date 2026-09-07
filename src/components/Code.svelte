<script lang="ts">
/* A code block with an optional file name and a copy button. */
interface Props {
	code: string;
	file?: string;
	label?: string;
}
const { code, file, label }: Props = $props();
let copied = $state(false);

async function copy() {
	try {
		await navigator.clipboard.writeText(code);
		copied = true;
		setTimeout(() => (copied = false), 1600);
	} catch {
		copied = false;
	}
}
</script>

<div class="card-flat min-w-0 overflow-hidden">
  <div class="border-line flex items-center justify-between gap-3 border-b-3 px-4 py-2">
    <span class="eyebrow truncate">{file ?? label ?? "code"}</span>
    <button type="button" onclick={copy} class="pill min-h-8 px-3 text-[11px]">{copied ? "Copied" : "Copy"}</button>
  </div>
  <pre tabindex="0" class="m-0 overflow-x-auto p-4 font-mono text-[12.5px] leading-relaxed">{code}</pre>
</div>
