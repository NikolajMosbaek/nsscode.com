import { type Rates, rates2026 } from "./rates-2026";

export type { Rates };
export { rates2026 };

export interface Input {
	/** Gross yearly salary before AM-bidrag, including any own pension contribution. */
	salary: number;
	/** Share of salary paid into pension before tax, 0 to 0.5. */
	pensionShare: number;
	kommuneskat: number;
	kirkeskat: number;
	kirke: boolean;
}

export interface Breakdown {
	salary: number;
	pension: number;
	am: number;
	personligIndkomst: number;
	beskaeftigelsesfradrag: number;
	jobfradrag: number;
	skattepligtigIndkomst: number;
	bund: number;
	mellem: number;
	top: number;
	topTop: number;
	kommune: number;
	kirke: number;
	tax: number;
	/** Take-home after tax and pension. */
	net: number;
	/** Tax as a share of gross salary, pension excluded. */
	effective: number;
	/** Effective state rates after the skatteloft. */
	effectiveRates: { mellem: number; top: number; topTop: number };
}

function clampRates(input: Input, r: Rates) {
	const base = r.bundskat + input.kommuneskat;
	const mellem = Math.max(0, Math.min(r.mellemskat.rate, r.loft.mellem - base));
	const top = Math.max(0, Math.min(r.topskat.rate, r.loft.top - base - mellem));
	const topTop = Math.max(
		0,
		Math.min(r.topTopskat.rate, r.loft.topTop - base - mellem - top),
	);
	return { mellem, top, topTop };
}

export function compute(input: Input, r: Rates = rates2026): Breakdown {
	const salary = Math.max(0, input.salary);
	const pension = salary * Math.min(0.5, Math.max(0, input.pensionShare));
	const am = (salary - pension) * r.amBidrag;
	const pi = salary - pension - am;

	const beskaeftigelsesfradrag = Math.min(
		r.beskaeftigelsesfradrag.max,
		salary * r.beskaeftigelsesfradrag.rate,
	);
	const jobfradrag = Math.min(
		r.jobfradrag.max,
		Math.max(0, salary - r.jobfradrag.threshold) * r.jobfradrag.rate,
	);
	const fradrag = beskaeftigelsesfradrag + jobfradrag;

	const bundBase = Math.max(0, pi - r.personfradrag);
	const skattepligtig = Math.max(0, pi - fradrag - r.personfradrag);
	const eff = clampRates(input, r);

	const bund = bundBase * r.bundskat;
	const mellem = Math.max(0, pi - r.mellemskat.threshold) * eff.mellem;
	const top = Math.max(0, pi - r.topskat.threshold) * eff.top;
	const topTop = Math.max(0, pi - r.topTopskat.threshold) * eff.topTop;
	const kommune = skattepligtig * input.kommuneskat;
	const kirke = input.kirke ? skattepligtig * input.kirkeskat : 0;

	const tax = am + bund + mellem + top + topTop + kommune + kirke;
	return {
		salary,
		pension,
		am,
		personligIndkomst: pi,
		beskaeftigelsesfradrag,
		jobfradrag,
		skattepligtigIndkomst: skattepligtig,
		bund,
		mellem,
		top,
		topTop,
		kommune,
		kirke,
		tax,
		net: salary - pension - tax,
		effective: salary > 0 ? tax / salary : 0,
		effectiveRates: eff,
	};
}

/** Share of the next krone that goes to tax. */
export function marginal(
	input: Input,
	r: Rates = rates2026,
	step = 1000,
): number {
	const a = compute(input, r).tax;
	const b = compute({ ...input, salary: input.salary + step }, r).tax;
	return (b - a) / step;
}

/** Gross salary at which personal income after AM reaches a threshold. */
export function grossFor(
	threshold: number,
	pensionShare: number,
	r: Rates = rates2026,
): number {
	return threshold / ((1 - r.amBidrag) * (1 - pensionShare));
}

export interface Bracket {
	id: "bund" | "mellem" | "top" | "topTop";
	label: string;
	/** Gross salary where it starts. */
	from: number;
}

export function brackets(
	pensionShare: number,
	r: Rates = rates2026,
): Bracket[] {
	return [
		{
			id: "bund",
			label: "bundskat",
			from: grossFor(r.personfradrag, pensionShare, r),
		},
		{
			id: "mellem",
			label: "mellemskat",
			from: grossFor(r.mellemskat.threshold, pensionShare, r),
		},
		{
			id: "top",
			label: "topskat",
			from: grossFor(r.topskat.threshold, pensionShare, r),
		},
		{
			id: "topTop",
			label: "top-topskat",
			from: grossFor(r.topTopskat.threshold, pensionShare, r),
		},
	];
}

/** Marginal rate sampled across a salary range, for the step chart. */
export function marginalCurve(
	input: Input,
	max: number,
	points: number,
	r: Rates = rates2026,
): [number, number][] {
	const out: [number, number][] = [];
	for (let i = 0; i <= points; i++) {
		const salary = (max * i) / points;
		out.push([salary, marginal({ ...input, salary }, r, 500)]);
	}
	return out;
}

export function kr(v: number): string {
	const n = Math.round(v) || 0;
	return `${n.toLocaleString("da-DK")} kr.`;
}

export function pct(v: number, digits = 1): string {
	return `${(v * 100).toLocaleString("da-DK", { minimumFractionDigits: digits, maximumFractionDigits: digits })} %`;
}
