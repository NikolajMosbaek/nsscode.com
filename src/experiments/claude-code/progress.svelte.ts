/*
 * Which "do it now" steps the reader has ticked. Kept in localStorage so
 * the guide remembers where they got to; nothing leaves the browser.
 */
const KEY = "claude-code-guide";

function read(): Record<string, boolean> {
	try {
		const raw = localStorage.getItem(KEY);
		return raw ? (JSON.parse(raw) as Record<string, boolean>) : {};
	} catch {
		return {};
	}
}

export const progress = $state<{
	done: Record<string, boolean>;
	loaded: boolean;
}>({
	done: {},
	loaded: false,
});

export function loadProgress() {
	progress.done = read();
	progress.loaded = true;
}

export function toggle(id: string) {
	progress.done[id] = !progress.done[id];
	try {
		localStorage.setItem(KEY, JSON.stringify(progress.done));
	} catch {
		/* private mode; the tick still shows this session */
	}
}

export function resetProgress() {
	progress.done = {};
	try {
		localStorage.removeItem(KEY);
	} catch {
		/* nothing to clear */
	}
}

export interface Step {
	id: string;
	text: string;
	/** What the reader should see if it worked. */
	expect?: string;
}

export function doneCount(steps: Step[]): number {
	return steps.filter((s) => progress.done[s.id]).length;
}
