import { useState } from "react";
import { generateUuids } from "./logic";

export default function Tool() {
	const [count, setCount] = useState(5);
	const [ids, setIds] = useState<string[]>([]);
	const [error, setError] = useState<string | null>(null);

	function run() {
		const result = generateUuids(count);
		if (result.ok) {
			setIds(result.value);
			setError(null);
		} else {
			setIds([]);
			setError(result.error);
		}
	}

	return (
		<div className="space-y-4">
			<div className="flex items-center gap-3">
				<input
					type="number"
					value={count}
					min={1}
					max={100}
					onChange={(e) => setCount(Number(e.target.value))}
					className="w-24 rounded border border-zinc-800 bg-zinc-900 px-2 py-1"
				/>
				<button
					type="button"
					onClick={run}
					className="rounded-lg bg-zinc-100 px-3 py-1 font-medium text-zinc-900 hover:bg-white"
				>
					Generate UUIDs
				</button>
			</div>

			{error && (
				<p className="rounded-lg border border-red-900 bg-red-950 p-3 text-sm text-red-300">
					{error}
				</p>
			)}

			{ids.length > 0 && (
				<pre className="overflow-x-auto rounded-lg border border-zinc-800 bg-zinc-900 p-3 font-mono text-sm">
					{ids.join("\n")}
				</pre>
			)}
		</div>
	);
}
