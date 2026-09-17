import type { Step } from "./progress.svelte";

/* Every chapter's "do it now" list, in one place so the nav can count them. */
export const steps: Record<string, Step[]> = {
	install: [
		{
			id: "install.cli",
			text: "Install Claude Code with the command for your system.",
			expect: "claude --version prints a version number.",
		},
		{
			id: "install.login",
			text: "Run claude in any folder and sign in when the browser opens.",
			expect:
				"The prompt says you are logged in and shows a > waiting for you.",
		},
		{
			id: "install.repo",
			text: "Pick a practice repo: something small of your own, with tests, that you can afford to break. Open a terminal in it.",
			expect: "git status works there.",
		},
		{
			id: "install.trust",
			text: "Run claude in that repo and answer the trust prompt.",
			expect: "You see the welcome box and the > prompt.",
		},
		{
			id: "install.help",
			text: "Type /help, read it, then /exit.",
			expect: "You know at least three slash commands exist.",
		},
	],
	start: [
		{
			id: "start.plan",
			text: 'Start claude in your practice repo. Press Shift+Tab until the status line says plan mode. Ask: "What does this project do, and where is the entry point? Read, do not change anything."',
			expect:
				"A short answer naming real files. Nothing changed; git status is clean.",
		},
		{
			id: "start.esc",
			text: 'Ask it to explain the biggest file. Halfway through, press Esc. Then type: "Shorter, five bullets."',
			expect: "It stops and answers again, shorter. You now trust Esc.",
		},
		{
			id: "start.file",
			text: "Type @ and start typing a filename. Pick one. Ask a question about it.",
			expect: "Autocomplete appeared. The answer refers to that file.",
		},
		{
			id: "start.shell",
			text: "Run your test command with ! in front, for example !npm test.",
			expect: "The output appears in the conversation, and Claude can see it.",
		},
	],
	"claude-md": [
		{
			id: "memory.init",
			text: "Run /init and read what it wrote.",
			expect: "A CLAUDE.md exists at the repo root.",
		},
		{
			id: "memory.cut",
			text: "Delete every line it could have learned from the code. Add your exact test and lint commands, and one rule you care about.",
			expect: "Under 40 lines. Every line is something it could not guess.",
		},
		{
			id: "memory.check",
			text: "Run /memory.",
			expect: "Your CLAUDE.md is listed as loaded.",
		},
	],
	prompts: [
		{
			id: "prompts.grade",
			text: "Paste the last thing you asked Claude, or would have asked, into the grader below.",
			expect: "You can name which ingredient was missing.",
		},
		{
			id: "prompts.rewrite",
			text: "Rewrite it with all six. Send that version to Claude Code, in plan mode.",
			expect: "The plan it proposes matches what you meant on the first try.",
		},
		{
			id: "prompts.clear",
			text: "Type /clear.",
			expect: "An empty conversation. This is how every new task starts.",
		},
	],
	workflow: [
		{
			id: "workflow.task",
			text: "Pick one small real change in your practice repo: a bug, a rename, a missing validation. In plan mode, ask for a plan that names files and the test that proves it.",
			expect:
				"A plan you could have written yourself. Edit anything you disagree with.",
		},
		{
			id: "workflow.go",
			text: 'Leave plan mode (Shift+Tab). Say: "Go. Run the tests when you are done and show me the output."',
			expect:
				"Edits happen, tests run, output is pasted. You read the diff with git diff.",
		},
		{
			id: "workflow.commit",
			text: 'If the diff is right, say: "Commit this with a message that says why." Then /clear.',
			expect: "One commit, one change. You just did the loop once.",
		},
	],
	"project-files": [
		{
			id: "docs.generate",
			text: "Generate a starter set below with your real stack and commands. Copy CLAUDE.md over the one from /init if it is better.",
			expect: "CLAUDE.md points at ARCHITECTURE.md with @.",
		},
		{
			id: "docs.learn",
			text: 'Ask Claude: "What did you learn about this repo today that is not in CLAUDE.md or ARCHITECTURE.md? Propose additions." Keep the good ones.',
			expect: "The docs grew by a few true lines.",
		},
	],
	models: [
		{
			id: "models.effort",
			text: "Run /model and look at what is selected. Run /effort and set it to medium for the next small task.",
			expect: "The status line reflects the change.",
		},
		{
			id: "models.pick",
			text: "Answer the three questions below for the task you did in Workflow.",
			expect: "You know what you would set next time, and why.",
		},
	],
	extend: [
		{
			id: "extend.rule",
			text: "Move one convention out of CLAUDE.md into .claude/rules/<name>.md with a paths header for the folder it applies to.",
			expect: "CLAUDE.md is shorter. /memory lists the rule.",
		},
		{
			id: "extend.skill",
			text: "Create .claude/skills/pr/SKILL.md describing your PR checklist. Run /pr.",
			expect: "Claude follows the checklist without being told.",
		},
	],
};

export const allSteps = Object.values(steps).flat();
