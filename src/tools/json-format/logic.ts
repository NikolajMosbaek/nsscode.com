import { err, ok, type Result } from "../../lib/result";

export function formatJson(input: string, indent = 2): Result<string> {
	if (input.trim() === "") return err("Nothing to format");
	try {
		return ok(JSON.stringify(JSON.parse(input), null, indent));
	} catch (e) {
		return err(e instanceof Error ? e.message : "Invalid JSON");
	}
}
