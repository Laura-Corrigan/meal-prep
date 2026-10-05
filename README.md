# What's for Tea?

A personal weekly dinner assistant for two: plan Monday–Friday dinners, get one consolidated shopping list, and work through the Tesco shop in about five minutes a week.

**Weekly rhythm:** at the weekend the app drafts next week → swap / lock / mark nights out → approve → tick off what you already have → step through the Tesco shop → Monday delivery → cook.

## Run it

```bash
npm install
npm run dev      # http://localhost:5173
npm test         # planner, shopping list, packs, agent commands
```

`?today=2026-10-10` overrides today's date (handy for testing weekend vs weekday behaviour).

Without Supabase env vars the app runs fully on-device. With them (see `.env.example`), both phones share one plan via a private household link (Settings → Share with your partner).

## Architecture

```
src/
  data/        recipes.js (35 recipes, 4 servings, 15–45 mins) · ingredients.js (catalogue, categories, Tesco pack sizes)
  domain/      week dates · preferences & diet rules · recipe indicators · shopping-list merging · custom-recipe parser
  agent/       planner.js (scoring planner) · rules.js (natural language → ops) · ops.js (validated op schema + apply)
  tesco/       provider.js (Tesco integration boundary) · packs.js (need → realistic packs)
  store/       local-first state + optional Supabase sync
  components/  Home, DayCard, SwapSheet, RecipeSheet, ShoppingPage, TescoFlow, Settings, Setup
supabase/migrations/   households table + mp_load / mp_save functions
```

**Agent.** Requests like "we're out Thursday", "more fish", "nothing over 30 minutes", "use up the broccoli" or "make Friday fun" are turned into structured ops (`mark_out`, `replan`, `use_up`, `more_protein`, `limit_time`, `cheaper` …). Every op is validated against a schema before it touches the plan, so an LLM interpreter can be added later behind a server endpoint (see `src/agent/index.js`) with the rules as fallback.

**Planner** scores each recipe on: ratings (❤️ / 👍 / 👎), how recently you ate it, protein/cuisine/carb variety, 20–35 min sweet spot, a fun Friday, budget, and ingredient efficiency (it rewards recipes that use up the spare from packs already being bought).

## Tesco

Tesco has **no public API** for product search, baskets or orders (the old Tesco Labs developer programme is retired), and tools that drive a logged-in Tesco account require sharing credentials and break Tesco's terms. So the app:

- maps each ingredient to a realistic pack ("400g chicken breast" → one 650g pack),
- opens a targeted Tesco search (or a remembered exact product link) for each item in your own logged-in Tesco session,
- tracks what you've added, and only marks the order as placed when you say so.

Everything goes through `src/tesco/provider.js`, so a real basket integration could replace the deep links without touching the planner. Pack sizes are typical Tesco sizes and may differ slightly from what's in stock.

Recipe photos are from [Unsplash](https://unsplash.com), credited on each recipe.
