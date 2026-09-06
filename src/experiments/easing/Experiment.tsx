import { type PointerEvent, useId, useRef, useState } from "react";
import { type Bezier, isValid, presets, samples, toCss } from "./logic";

const labels = ["x1", "y1", "x2", "y2"] as const;

/* The curve lives in a 200 by 200 box; y may overshoot by half a box. */
const SIZE = 200;
const PAD = 24;
const OVER = 100;

export default function Experiment() {
	const [points, setPoints] = useState<Bezier>([0.2, 0.7, 0.2, 1]);
	const [copied, setCopied] = useState(false);
	const [dragging, setDragging] = useState<0 | 1 | null>(null);
	const svgRef = useRef<SVGSVGElement>(null);
	const id = useId();

	const css = toCss(points);
	const valid = isValid(points);
	const path = samples(points, 40)
		.map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x * SIZE} ${SIZE - y * SIZE}`)
		.join(" ");
	const activePreset = presets.find((p) => toCss(p.points) === css)?.name;

	function update(index: number, value: number) {
		setPoints((prev) => {
			const next = [...prev] as [number, number, number, number];
			next[index] = value;
			return next;
		});
	}

	function toCurve(event: PointerEvent): [number, number] {
		const svg = svgRef.current;
		if (!svg) return [0, 0];
		const rect = svg.getBoundingClientRect();
		const viewW = SIZE + PAD * 2;
		const viewH = SIZE + OVER * 2;
		const x = ((event.clientX - rect.left) / rect.width) * viewW - PAD;
		const y = ((event.clientY - rect.top) / rect.height) * viewH - OVER;
		return [
			Math.min(1, Math.max(0, x / SIZE)),
			Math.min(1.5, Math.max(-0.5, (SIZE - y) / SIZE)),
		];
	}

	function startDrag(handle: 0 | 1) {
		return (event: PointerEvent) => {
			event.preventDefault();
			(event.target as Element).setPointerCapture?.(event.pointerId);
			setDragging(handle);
		};
	}

	function moveDrag(event: PointerEvent) {
		if (dragging === null) return;
		const [x, y] = toCurve(event);
		const round = (v: number) => Math.round(v * 100) / 100;
		setPoints((prev) => {
			const next = [...prev] as [number, number, number, number];
			next[dragging * 2] = round(x);
			next[dragging * 2 + 1] = round(y);
			return next;
		});
	}

	function endDrag() {
		setDragging(null);
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

	const handles: [number, number][] = [
		[points[0], points[1]],
		[points[2], points[3]],
	];

	return (
		<div className="grid grid-cols-[minmax(0,1fr)] gap-8 lg:grid-cols-12 lg:gap-x-10">
			<div className="grid min-w-0 content-start gap-6 lg:col-span-4">
				<fieldset className="grid gap-2.5">
					<legend className="eyebrow mb-2">Presets</legend>
					<div className="flex flex-wrap gap-2">
						{presets.map((preset) => (
							<button
								type="button"
								key={preset.name}
								onClick={() => setPoints(preset.points)}
								aria-pressed={preset.name === activePreset}
								className={`pill min-h-9 px-3.5 ${preset.name === activePreset ? "pill-active" : ""}`}
							>
								{preset.name}
							</button>
						))}
					</div>
				</fieldset>
				{labels.map((label, index) => (
					<label key={label} className="grid gap-2">
						<span className="eyebrow flex justify-between">
							<span>
								{label}
								<span className="text-ink-muted">
									{" "}
									{index % 2 === 0 ? "time" : "progress"}
								</span>
							</span>
							<span className="text-ink tabular-nums">
								{points[index].toFixed(2)}
							</span>
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

			<div className="grid min-w-0 gap-6 lg:col-span-8">
				<div className="grid gap-6 sm:grid-cols-[minmax(0,260px)_1fr]">
					<div className="grid gap-2">
						<span className="eyebrow">Curve, drag the handles</span>
						<svg
							ref={svgRef}
							viewBox={`${-PAD} ${-OVER} ${SIZE + PAD * 2} ${SIZE + OVER * 2}`}
							className={`card-flat w-full touch-none select-none ${dragging !== null ? "cursor-grabbing" : ""}`}
							role="img"
							aria-labelledby={`${id}-title`}
							onPointerMove={moveDrag}
							onPointerUp={endDrag}
							onPointerCancel={endDrag}
						>
							<title id={`${id}-title`}>
								Curve of {css}. Drag the two handles.
							</title>
							<rect
								x="0"
								y="0"
								width={SIZE}
								height={SIZE}
								fill="none"
								stroke="var(--line-soft)"
								strokeWidth="2"
							/>
							<line
								x1="0"
								y1={SIZE}
								x2={SIZE}
								y2="0"
								stroke="var(--line-soft)"
								strokeWidth="2"
								strokeDasharray="4 4"
							/>
							<line
								x1="0"
								y1={SIZE}
								x2={points[0] * SIZE}
								y2={SIZE - points[1] * SIZE}
								stroke="var(--ink-faint)"
								strokeWidth="2"
							/>
							<line
								x1={SIZE}
								y1="0"
								x2={points[2] * SIZE}
								y2={SIZE - points[3] * SIZE}
								stroke="var(--ink-faint)"
								strokeWidth="2"
							/>
							<path
								d={path}
								fill="none"
								stroke="var(--ink)"
								strokeWidth="3"
								strokeLinecap="round"
							/>
							{handles.map(([x, y], i) => (
								<circle
									key={i === 0 ? "start-handle" : "end-handle"}
									cx={x * SIZE}
									cy={SIZE - y * SIZE}
									r="11"
									fill="var(--accent)"
									stroke="var(--line)"
									strokeWidth="3"
									className="cursor-grab"
									onPointerDown={startDrag(i as 0 | 1)}
								/>
							))}
						</svg>
					</div>

					<div className="grid content-start gap-4">
						<span className="eyebrow">Preview</span>
						<div className="card-flat relative h-14 overflow-hidden [container-type:inline-size]">
							<span
								aria-hidden="true"
								className="bg-ink absolute top-1/2 left-2 size-7 -translate-y-1/2 rounded-full motion-safe:animate-[slide_1.6s_infinite_alternate]"
								style={{ animationTimingFunction: valid ? css : "linear" }}
							/>
							<style>{`@keyframes slide { to { transform: translate(calc(100cqw - 2.75rem), -50%); } }`}</style>
						</div>
						<p className="text-small text-ink-muted">
							The ball crosses on this curve, back and forth. Linear is the
							dashed diagonal; above it is fast early, below it is slow early.
						</p>
						{!valid && (
							<p className="bg-yellow text-accent-ink border-line rounded-xl border-3 px-3 py-2 text-sm font-medium">
								x1 and x2 must stay between 0 and 1 for CSS to accept the curve.
							</p>
						)}
					</div>
				</div>

				<div className="card-flat min-w-0 overflow-hidden">
					<div className="border-line flex items-center justify-between gap-3 border-b-3 px-4 py-2.5">
						<span className="eyebrow">CSS</span>
						<button
							type="button"
							onClick={copy}
							className="pill min-h-9 px-3.5"
						>
							{copied ? "Copied" : "Copy"}
						</button>
					</div>
					<pre
						// biome-ignore lint/a11y/noNoninteractiveTabindex: a scrollable region must be reachable by keyboard
						tabIndex={0}
						className="m-0 overflow-x-auto p-4 font-mono text-[13px] leading-relaxed"
					>
						{`transition-timing-function: ${css};`}
					</pre>
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
