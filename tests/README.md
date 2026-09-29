# tests/

The directory mirrors `src/`:

- `core/` — type-level assertions for `src/core/`: one directory per
  single-module action, `core/query/` for `src/core/query/`.
- `envelope/` — assertions for the response envelope (`src/envelope/`):
  errors and warnings under both `errorformat` families.
- `extensions/` — assertions for the opt-in packs in `src/extensions/`.

Assertions (`.test-d.ts`, using `expect-type`) are compiled by
`pnpm typecheck` / CI. Precise conformance is asserted with `satisfies`
literals; imported fixtures are used only for widening-tolerant structural
checks (see `core/query/info.test-d.ts` for the recipe).

- `fixtures/`: real API response samples — the source of truth for the
  hand-written types, grouped to match `src/` (`core/`, `envelope/`,
  `extensions/`).
- `typeutil.ts`: shared assertion helpers (`ExtraKeys`).
