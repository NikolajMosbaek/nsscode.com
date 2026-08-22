---
name: add-recipe
description: Add a recipe to nsscode.com. Use when the user wants a recipe put on the site, uploaded, published, or added to the recipe shelf — including when they paste a recipe, link one, dictate one from memory, or just name a dish and ask for it to go up.
---

# Adding a recipe

Recipes are JSON files in `src/recipes/`. One file per recipe, one recipe per
file. The route, the card on `/recipes/`, and the scaling all come from that
file — nothing else needs editing.

## The format

`src/lib/recipe/contract.ts` holds the field-by-field contract and a worked
example. **Read it first.** `src/lib/recipe/parse.ts` is what enforces it, so
that file is the final word if the two ever disagree.

Five things are required of every recipe, and a build fails without them:
an ingredient list, a step-by-step method, the number of people the
quantities feed, macros, and a rating.

## Doing it

1. Read `src/lib/recipe/contract.ts`.
2. Write `src/recipes/<slug>.json` — lowercase, hyphenated, ASCII slug; tab
   indentation, to match the existing files.
3. Fill in the recipe:
   - `servings` is the head count the quantities are written for.
   - Quantities go in metric. Omit `quantity` for anything unmeasured
     ("salt, to taste") — it then never scales. Add `"scales": false` to pin a
     measured quantity that shouldn't grow with the head count, like a pinch of
     salt or a teaspoon of baking soda.
   - `macros` are **per serving** unless you add `"basis": "total"`.
   - `rating` is out of 5 in half steps. Rate it honestly; a shelf where
     everything is a 5 is worth nothing.
   - `tags` are lowercase and few — two or three.
4. Run the gates: `npm run lint && npm run typecheck && npm run test && npm run build`.
   The build validates every recipe file, so a missing or malformed field shows
   up there naming the file and the field.
5. Commit the new file on its own.

## When the user is not in Claude Code

Point them at `/tools/recipe-upload/`. It hands them a prompt to paste into
Claude anywhere, checks what comes back against the same contract, previews it,
and either keeps it in their browser or gives them the file to commit.
