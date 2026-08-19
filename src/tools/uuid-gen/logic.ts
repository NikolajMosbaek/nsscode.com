import { err, ok, type Result } from "../../lib/result";

export function generateUuids(count: number): Result<string[]> {
	if (!Number.isInteger(count)) return err("Count must be a whole number");
	if (count < 1) return err("Count must be at least 1");
	if (count > 100) return err("Count must be 100 or fewer");
	return ok(Array.from({ length: count }, () => crypto.randomUUID()));
}
