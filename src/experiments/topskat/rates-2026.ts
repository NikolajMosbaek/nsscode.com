/*
 * Danish personal income tax, 2026. Thresholds are in kroner of personal
 * income after AM-bidrag, as Skatteministeriet publishes them. Copy this
 * file with the next year's name when the numbers change; nothing else
 * should need to.
 */
export interface Rates {
	year: number;
	/** Arbejdsmarkedsbidrag on all earned income, including pension contributions. */
	amBidrag: number;
	personfradrag: number;
	bundskat: number;
	mellemskat: { rate: number; threshold: number };
	topskat: { rate: number; threshold: number };
	topTopskat: { rate: number; threshold: number };
	/** Skatteloft for bund+kommune plus, cumulatively, mellem, top and top-top. */
	loft: { mellem: number; top: number; topTop: number };
	/** Beskæftigelsesfradrag, a ligningsmæssigt fradrag on the AM base. */
	beskaeftigelsesfradrag: { rate: number; max: number };
	/** Jobfradrag, on the AM base above a floor. */
	jobfradrag: { rate: number; threshold: number; max: number };
	kommune: { average: number; lowest: number; highest: number };
	kirke: { average: number };
}

export const rates2026: Rates = {
	year: 2026,
	amBidrag: 0.08,
	personfradrag: 54_100,
	bundskat: 0.1201,
	mellemskat: { rate: 0.075, threshold: 641_200 },
	topskat: { rate: 0.075, threshold: 777_900 },
	topTopskat: { rate: 0.05, threshold: 2_592_700 },
	loft: { mellem: 0.4457, top: 0.5207, topTop: 0.5707 },
	beskaeftigelsesfradrag: { rate: 0.1275, max: 63_300 },
	jobfradrag: { rate: 0.045, threshold: 235_200, max: 3_100 },
	kommune: { average: 0.25, lowest: 0.2339, highest: 0.263 },
	kirke: { average: 0.0087 },
};

export const kommuner: { name: string; rate: number }[] = [
	{ name: "København", rate: 0.2339 },
	{ name: "Gennemsnit", rate: 0.25 },
	{ name: "Aarhus", rate: 0.2519 },
	{ name: "Odense", rate: 0.255 },
	{ name: "Aalborg", rate: 0.2564 },
	{ name: "Højeste", rate: 0.263 },
];
