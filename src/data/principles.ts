/*
 * How I work. Written as claims that can be disagreed with, not adjectives.
 * TODO(owner): strike what is wrong, add what is missing (plan, Q10).
 */

export interface Principle {
	title: string;
	body: string;
}

export const principles: Principle[] = [
	{
		title: "Concurrency is decided at design time.",
		body: "Strict concurrency is a design constraint, not a compiler setting. Which type is Sendable and which actor owns what is settled before the first line of code, so the compiler confirms the design instead of dictating it.",
	},
	{
		title: "One architecture per app.",
		body: "The Composable Architecture, unless there is a reason not to, and the reason is written down. An app with three ways of doing state has none.",
	},
	{
		title: "Tests use the seams the code uses.",
		body: "TestStore and injected dependencies. Never a mock of the framework, never a test that passes because it re-implements the thing it is testing.",
	},
	{
		title: "Documentation belongs on interfaces.",
		body: "DocC on public surface, nothing on implementation. If a method body needs a comment, the method needs a better name or a smaller body. Section markers are a sign the file is too long.",
	},
	{
		title: "Direct feedback, in both directions.",
		body: "Say when an idea is weak. Say when you are wrong. Do not soften it and do not apologise for it. A team that cannot disagree in a review cannot ship anything hard.",
	},
	{
		title: "Answer the question that was asked.",
		body: "Not the adjacent one, not the strategic one nobody raised. Scope is a decision, and it belongs to the person who asked.",
	},
];
