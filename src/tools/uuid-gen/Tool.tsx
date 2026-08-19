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
		<div className="flex flex-col gap-[18px]">
			<div className="flex flex-wrap items-end gap-3">
				<label className="block">
					<span className="text-ink-soft mb-[7px] block text-[13px] font-medium">
						How many
					</span>
					<input
						type="number"
						value={count}
						min={1}
						max={100}
						onChange={(e) => setCount(Number(e.target.value))}
						className="bg-surface border-line shadow-inset-field focus:border-accent w-28 rounded-xl border px-4 py-2.5 font-mono text-[13.5px] outline-none transition-colors"
					/>
				</label>
				<button
					type="button"
					onClick={run}
					className="bg-accent hover:bg-accent-deep rounded-xl px-5 py-2.5 text-[13.5px] font-semibold text-white transition-colors"
				>
					Generate UUIDs
				</button>
			</div>

			{error && (
				<p className="bg-danger-ground border-danger-line text-danger-ink flex items-start gap-[11px] rounded-xl border px-4 py-3.5 text-[13.5px] leading-snug">
					<svg
						width="17"
						height="17"
						viewBox="0 0 24 24"
						fill="none"
						stroke="currentColor"
						strokeWidth="1.8"
						strokeLinecap="round"
						className="text-danger-icon mt-0.5 shrink-0"
						aria-hidden="true"
					>
						<circle cx="12" cy="12" r="9" />
						<path d="M12 8v5" />
						<path d="M12 16.5v.01" />
					</svg>
					{error}
				</p>
			)}

			{ids.length > 0 && (
				<pre className="bg-surface border-line shadow-card overflow-x-auto rounded-xl border px-4 py-3.5 font-mono text-[13.5px] leading-relaxed">
					{ids.join("\n")}
				</pre>
			)}
		</div>
	);
}
