/**
 * The single description of the recipe format, shared by the upload tool's help
 * panel, the prompt it hands to Claude, and the `add-recipe` skill. Keep it in
 * step with `parse.ts` — that file is what actually enforces it.
 */
export const RECIPE_CONTRACT = `Every recipe is one JSON object with these fields.

Required
  title         string   the dish name
  description   string   one sentence on what it is
  servings      integer  how many people the quantities below feed
  rating        number   0-5, in half steps
  ingredients   array    at least one { quantity, unit, item, note, scales }
                         quantity/unit/note may be omitted; omitting quantity
                         means unmeasured ("to taste") and never scales
                         scales: false pins a quantity when the head count changes
  steps         array    at least one string, or { text, minutes }
  macros        object   { calories, protein, carbs, fat } per serving,
                         plus optional fiber; grams for everything but calories
                         add "basis": "total" if the numbers are for the whole
                         recipe instead of one serving

Optional
  tags          array    lowercase keywords, e.g. ["weeknight", "vegetarian"]
  prepMinutes   number   hands-on time
  cookMinutes   number   time on the heat
  source        string   where it came from`;

export const RECIPE_EXAMPLE = `{
  "title": "Lemon Orzo with Chicken Thighs",
  "description": "One skillet, crisp skin, and orzo that cooks in the pan juices.",
  "servings": 4,
  "rating": 4.5,
  "tags": ["weeknight", "one-pan", "chicken"],
  "prepMinutes": 15,
  "cookMinutes": 30,
  "source": "adapted from a half-remembered magazine clipping",
  "ingredients": [
    { "quantity": 800, "unit": "g", "item": "bone-in chicken thighs" },
    { "quantity": 300, "unit": "g", "item": "orzo" },
    { "quantity": 1, "unit": "", "item": "lemon", "note": "zest and juice" },
    { "item": "sea salt", "note": "to taste" }
  ],
  "steps": [
    { "text": "Salt the thighs and leave them skin-up while the oven heats.", "minutes": 15 },
    "Brown the thighs skin-down in a cold, dry skillet over medium heat.",
    { "text": "Add the orzo and stock, then bake until the liquid is gone.", "minutes": 25 }
  ],
  "macros": { "calories": 640, "protein": 42, "carbs": 58, "fat": 24, "fiber": 3 }
}`;

/** The message to hand Claude when you want a recipe back in this shape. */
export function claudePrompt(dish = "<the dish>"): string {
	return `Write me a recipe for ${dish} as a single JSON object, and nothing else — no prose, no markdown fence.

${RECIPE_CONTRACT}

Example of the exact shape:

${RECIPE_EXAMPLE}

Estimate the macros per serving as best you can. Rate it honestly out of 5.`;
}
