import { useId, useState } from "react";
import { type Bezier, isValid, presets, samples, toCss } from "./logic";

const labels = ["x1", "y1", "x2", "y2"] as const;

export default function Experiment() {
	const [points, setPoints] = useState<Bezier>([0.2, 0.7, 0.2, 1]);
	const [copied, setCopied] = useState(false);
	const id = useId();

	const css = toCss(points);
	const valid = isValid(points);
	const path = samples(points, 40)
		.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x * 200} ${200 - y * 200}`)
		.join(" ");

	function update(index: number, value: number) {
		setPoints((prev) => {
			const next = [...prev] as [number, number, number, number];
			next[index] = value;
			return next;
		});
	}

	async function copy() {
		try {
			await navigator.clipboard.writeText(css);
			setCopied(true);
			setTimeout(() => setCopied(false), 1600);
		} catch {
			setCopied(false);
		}
	}

	return (
		<div className="grid gap-10 lg:grid-cols-12 lg:gap-x-10">
			<div className="grid gap-6 lg:col-span-4">
				<fieldset className="eyebrow flex flex-wrap gap-x-4 gap-y-2">
					<legend className="sr-only">Presets</legend>
					{presets.map((preset) => (
						<button
							type="button"
							key={preset.name}
							onClick={() => setPoints(preset.points)}
							aria-pressed={toCss(preset.points) === css}
							className="hover:text-ink aria-pressed:text-ink aria-pressed:underline decoration-accent underline-offset-4 transition-colors"
						>
							{preset.name}
						</button>
					))}
				</fieldset>
				{labels.map((label, index) => (
					<label key={label} className="grid gap-2">
						<span className="eyebrow flex justify-between">
							<span>{label}</span>
							<span className="text-ink">{points[index].toFixed(2)}</span>
						</span>
						<input
							type="range"
							min={label.startsWith("x") ? 0 : -0.5}
							max={label.startsWith("x") ? 1 : 1.5}
							step={0.01}
							value={points[index]}
							onChange={(event) => update(index, Number(event.target.value))}
							className="accent-accent"
						/>
					</label>
				))}
			</div>

			<div className="grid gap-6 lg:col-span-8">
				<div className="grid gap-6 sm:grid-cols-[240px_1fr]">
					<svg
						viewBox="-20 -110 240 420"
						width="240"
						height="420"
						className="border-line-soft bg-surface rounded-md border"
						role="img"
						aria-labelledby={`${id}-title`}
					>
						<title id={`${id}-title`}>Curve of {css}</title>
						<rect
							x="0"
							y="0"
							width="200"
							height="200"
							fill="none"
							stroke="var(--line)"
						/>
						<line
							x1="0"
							y1="200"
							x2="200"
							y2="0"
							stroke="var(--line)"
							strokeDasharray="4 4"
						/>
						<line
							x1="0"
							y1="200"
							x2={points[0] * 200}
							y2={200 - points[1] * 200}
							stroke="var(--ink-faint)"
						/>
						<line
							x1="200"
							y1="0"
							x2={points[2] * 200}
							y2={200 - points[3] * 200}
							stroke="var(--ink-faint)"
						/>
						<path
							d={path}
							fill="none"
							stroke="var(--ink)"
							strokeWidth="2.5"
							strokeLinecap="round"
						/>
						<circle
							cx={points[0] * 200}
							cy={200 - points[1] * 200}
							r="6"
							fill="var(--accent)"
						/>
						<circle
							cx={points[2] * 200}
							cy={200 - points[3] * 200}
							r="6"
							fill="var(--accent)"
						/>
					</svg>

					<div className="grid content-start gap-4">
						<p className="eyebrow">Preview</p>
						<div className="border-line-soft relative h-12 overflow-hidden rounded-md border">
							<span
								aria-hidden="true"
								className="bg-ink absolute top-1/2 left-2 size-6 -translate-y-1/2 rounded-full motion-safe:animate-[slide_1.6s_infinite_alternate]"
								style={{ animationTimingFunction: valid ? css : "linear" }}
							/>
							<style>{`@keyframes slide { to { transform: translate(calc(100cqw - 2.5rem), -50%); } }`}</style>
						</div>
						{!valid && (
							<p className="text-small text-accent">
								x1 and x2 must stay between 0 and 1 for CSS to accept the curve.
							</p>
						)}
					</div>
				</div>

				<div className="relative">
					<pre className="bg-surface border-line text-small overflow-x-auto rounded-md border p-4 font-mono leading-relaxed">
						{`transition-timing-function: ${css};`}
					</pre>
					<button
						type="button"
						onClick={copy}
						className="eyebrow bg-ground border-line hover:border-accent hover:text-ink absolute top-3 right-3 rounded-md border px-2.5 py-1.5 transition-colors"
					>
						{copied ? "Copied" : "Copy"}
					</button>
				</div>
				<p className="text-small text-ink-muted max-w-[60ch]">
					The y handles may leave the box; that is an overshoot, and it is how a
					spring-like settle is faked in plain CSS. The x handles may not,
					because time only moves forward.
				</p>
			</div>
		</div>
	);
}
