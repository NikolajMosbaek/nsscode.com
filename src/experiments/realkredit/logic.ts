/*
 * Danish realkredit. The parts a generic mortgage calculator gets wrong:
 *
 * - You may borrow at most 80 % of the price as realkredit. The gap down
 *   to your udbetaling is a bank loan at a higher rate.
 * - The loan is sold as bonds at a kurs. Below 100 you must issue more
 *   debt than you receive, and you owe and repay the larger number.
 * - Bidrag is a yearly percentage of the remaining debt, charged in
 *   bands by how far up the property's value that debt sits, and it is
 *   on top of the annuity rather than inside it.
 * - Interest and bidrag are both deductible. The tax value is higher on
 *   the first 50.000 kr. of negative net capital income than above it.
 *
 * Everything is in kroner per year unless a name says otherwise.
 */

export type LoanKind = "fast" | "f5" | "f3" | "flexkort";

export interface Product {
	id: LoanKind;
	name: string;
	note: string;
	rate: number;
	kurs: number;
	/** Whether the rate is refixed during the term. */
	variable: boolean;
}

/* Starting points, not an offer. The page says to replace them. */
export const products: Product[] = [
	{
		id: "fast",
		name: "Fast 30 år",
		note: "Renten ligger fast i hele løbetiden. Kan konverteres, og restgælden falder når renten stiger.",
		rate: 4,
		kurs: 97,
		variable: false,
	},
	{
		id: "f5",
		name: "F5",
		note: "Renten er fast i fem år ad gangen. Lavere nu, ukendt om fem år.",
		rate: 2.6,
		kurs: 99.5,
		variable: true,
	},
	{
		id: "f3",
		name: "F3",
		note: "Renten sættes hvert tredje år.",
		rate: 2.4,
		kurs: 99.8,
		variable: true,
	},
	{
		id: "flexkort",
		name: "FlexKort",
		note: "Kort rente, sat hvert halve år. Billigst og mest udsat.",
		rate: 2.2,
		kurs: 100,
		variable: true,
	},
];

export function productOf(id: LoanKind): Product {
	return products.find((p) => p.id === id) ?? products[0];
}

/** Bidrag by how far up the property's value the debt sits. */
export interface BidragBand {
	/** Upper edge of the band as a share of the property's value. */
	upTo: number;
	fast: number;
	variable: number;
}

export const bidragBands: BidragBand[] = [
	{ upTo: 0.4, fast: 0.4, variable: 0.5 },
	{ upTo: 0.6, fast: 0.6, variable: 0.75 },
	{ upTo: 0.8, fast: 0.85, variable: 1.05 },
];

/** Extra bidrag on the part of an interest-only loan above 60 % of value. */
export const afdragsfrihedTillaeg = 0.65;

/**
 * The bidrag rate for a loan, as a percentage of the whole loan. Each
 * band is charged on the part of the debt inside it, so the rate the
 * loan actually pays is the weighted average.
 */
export function bidragssats(
	debt: number,
	value: number,
	variable: boolean,
	interestOnly: boolean,
): number {
	if (debt <= 0 || value <= 0) return 0;
	let covered = 0;
	let weighted = 0;
	for (const band of bidragBands) {
		const top = Math.min(debt, band.upTo * value);
		const slice = Math.max(0, top - covered);
		if (slice === 0) continue;
		let rate = variable ? band.variable : band.fast;
		if (interestOnly && band.upTo > 0.6) rate += afdragsfrihedTillaeg;
		weighted += slice * rate;
		covered = top;
	}
	/* Anything above the top band keeps the top band's rate. */
	if (debt > covered) {
		const band = bidragBands[bidragBands.length - 1];
		let rate = variable ? band.variable : band.fast;
		if (interestOnly) rate += afdragsfrihedTillaeg;
		weighted += (debt - covered) * rate;
	}
	return weighted / debt;
}

export interface Deal {
	price: number;
	/** Cash down, at least 5 % of the price. */
	udbetaling: number;
	kind: LoanKind;
	rate: number;
	kurs: number;
	years: number;
	interestOnlyYears: number;
	/** The bank loan covering the gap between udbetaling and 20 %. */
	bankRate: number;
	/** Two people share a doubled threshold for the interest deduction. */
	couple: boolean;
}

export const defaultDeal: Deal = {
	price: 4_000_000,
	udbetaling: 400_000,
	kind: "fast",
	rate: 4,
	kurs: 97,
	years: 30,
	interestOnlyYears: 0,
	bankRate: 7,
	couple: true,
};

/* The tax value of negative net capital income. */
export const rentefradrag = {
	/** Below the threshold. */
	high: 0.336,
	/** Above it. */
	low: 0.256,
	threshold: 50_000,
};

export function deductionValue(interest: number, couple: boolean): number {
	const limit = rentefradrag.threshold * (couple ? 2 : 1);
	const below = Math.min(interest, limit);
	const above = Math.max(0, interest - limit);
	return below * rentefradrag.high + above * rentefradrag.low;
}

export interface YearRow {
	year: number;
	/** Debt at the start of the year, realkredit plus bank. */
	debt: number;
	interest: number;
	bidrag: number;
	afdrag: number;
	/** Interest, bidrag and afdrag for the year. */
	payment: number;
	deduction: number;
	afterTax: number;
	interestOnly: boolean;
}

export interface Plan {
	/** What the realkredit loan is worth on paper, after kurs. */
	hovedstol: number;
	/** Cash the realkredit loan actually delivers. */
	provenu: number;
	kurstab: number;
	bankLoan: number;
	/** Bidrag as a share of the realkredit debt at the start. */
	startBidragssats: number;
	years: YearRow[];
	firstMonth: number;
	firstMonthAfterTax: number;
	totalPaid: number;
	totalInterest: number;
	totalBidrag: number;
	totalAfterTax: number;
	/** True when the price cannot be covered by the inputs. */
	impossible: boolean;
}

/** Yearly annuity that clears `balance` over `years` at `rate` a year. */
export function annuity(balance: number, rate: number, years: number): number {
	if (years <= 0) return balance;
	if (rate === 0) return balance / years;
	const r = rate / 100;
	return (balance * r) / (1 - (1 + r) ** -years);
}

export function plan(deal: Deal): Plan {
	const price = Math.max(0, deal.price);
	const udbetaling = Math.min(price, Math.max(0, deal.udbetaling));
	const product = productOf(deal.kind);

	/* Realkredit covers at most 80 % of the price. */
	const realkreditCap = price * 0.8;
	const needed = price - udbetaling;
	const provenu = Math.min(needed, realkreditCap);
	const bankLoan = Math.max(0, needed - provenu);
	const kurs = Math.min(100, Math.max(50, deal.kurs));
	const hovedstol = provenu / (kurs / 100);
	const kurstab = hovedstol - provenu;

	const io = Math.min(deal.interestOnlyYears, 10, deal.years - 1);
	const startBidragssats = bidragssats(
		hovedstol,
		price,
		product.variable,
		io > 0,
	);

	const years: YearRow[] = [];
	let debt = hovedstol;
	let bank = bankLoan;
	const bankAnnuity = annuity(
		bankLoan,
		deal.bankRate,
		Math.min(deal.years, 30),
	);
	let afterIo = 0;

	for (let y = 1; y <= deal.years; y++) {
		const interestOnly = y <= io;
		const startDebt = debt;
		const rate = deal.rate / 100;
		const interest = startDebt * rate;
		const sats = bidragssats(startDebt, price, product.variable, interestOnly);
		const bidrag = startDebt * (sats / 100);

		if (interestOnly) {
			afterIo = 0;
		} else {
			if (afterIo === 0) {
				afterIo = annuity(startDebt, deal.rate, deal.years - io);
			}
		}
		const afdrag = interestOnly ? 0 : Math.min(startDebt, afterIo - interest);
		debt = Math.max(0, startDebt - afdrag);

		/* The bank loan runs alongside, always amortising. */
		const bankInterest = bank * (deal.bankRate / 100);
		const bankAfdrag =
			bank > 0 ? Math.min(bank, bankAnnuity - bankInterest) : 0;
		bank = Math.max(0, bank - bankAfdrag);

		const totalInterest = interest + bankInterest;
		const deductible = totalInterest + bidrag;
		const deduction = deductionValue(deductible, deal.couple);
		const payment = totalInterest + bidrag + afdrag + bankAfdrag;

		years.push({
			year: y,
			debt: startDebt + bank + bankAfdrag,
			interest: totalInterest,
			bidrag,
			afdrag: afdrag + bankAfdrag,
			payment,
			deduction,
			afterTax: payment - deduction,
			interestOnly,
		});
	}

	const totalPaid = years.reduce((s, r) => s + r.payment, 0);
	const first = years[0];
	return {
		hovedstol,
		provenu,
		kurstab,
		bankLoan,
		startBidragssats,
		years,
		firstMonth: first ? first.payment / 12 : 0,
		firstMonthAfterTax: first ? first.afterTax / 12 : 0,
		totalPaid,
		totalInterest: years.reduce((s, r) => s + r.interest, 0),
		totalBidrag: years.reduce((s, r) => s + r.bidrag, 0),
		totalAfterTax: years.reduce((s, r) => s + r.afterTax, 0),
		impossible: udbetaling < price * 0.05,
	};
}

/** The same deal with the rate moved, for the "what if" on a flex loan. */
export function shifted(deal: Deal, points: number): Deal {
	return { ...deal, rate: Math.max(0, deal.rate + points) };
}

export function kr(v: number): string {
	return `${Math.round(v).toLocaleString("da-DK")} kr.`;
}

export function pct(v: number, digits = 2): string {
	return `${v.toLocaleString("da-DK", { minimumFractionDigits: digits, maximumFractionDigits: digits })} %`;
}
