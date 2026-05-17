# Reline Configurator

Single-page React app for building Reline manga upscaling pipeline configs (JSON). Deployed to GitHub Pages.

## Stack

- **Runtime**: Bun (not npm/pnpm). Lockfile: `bun.lock`
- **Framework**: React 19 + Vite 6 + TypeScript 5.7
- **Styling**: Tailwind CSS 4 (`@tailwindcss/vite` plugin, no `tailwind.config.*`); CSS variables in `app/index.css` under `@theme`
- **UI**: shadcn/ui (base-nova style) in `app/components/ui/`; icons from `@tabler/icons-react`
- **Lint/Format**: Biome 1.9 — semicolons `asNeeded` (codebase uses **no semicolons**), trailing commas `all`, line width 150, indent 2 spaces
- **i18n**: `i18next` + `react-i18next` + `i18next-browser-languagedetector`; locales at `app/i18n/locales/{en,ru}.json`

## Path aliases

```
~/* → ./app/*
@/* → ./app/*
```

Use `~/` consistently (existing code uses both; `~` is the convention).

## Commands

| Command | What it does |
|---|---|
| `bun run dev` | Start Vite dev server |
| `bun run build` | **Typecheck then build**: `tsc -b && vite build`. Output to `dist/` |
| `bun run typecheck` | `tsc` only |
| `bun run lint` | `biome lint --write --unsafe .` — ⚠️ Never run on whole project; only on specific new/changed files |
| `bun run format` | `biome format --write --no-errors-on-unmatched .` |

**Safety**: Never run `bun run lint` (or `biome lint --write --unsafe .`) on the whole project. The `--unsafe` flag applies auto-fixes like `useImportType` project-wide, which turns runtime `import * as React` into `import type * as React` incorrectly. Always target specific files:
```powershell
.\node_modules\.bin\biome lint --write --unsafe "path/to/file.tsx"
```

**CI** (`.github/workflows/pages.yaml`): `bun install --frozen-lockfile && bun run build` with `GITHUB_PAGES=true`.

## Architecture

**Entrypoint**: `index.html:12` → `app/main.tsx` → `app/App.tsx`

**State**: `useReducer` + `NodesContext` / `NodesDispatchContext` (contexts). Nodes persist to `localStorage` under key `"nodes-data"`.

**Pipeline node types** (in order): `folder_reader → upscale → sharp → screentone → resize → level → cvt_color → folder_writer`. Defined in `app/types/enums.ts:NodeType`; options in `app/constants.ts:DEFAULT_NODE_OPTIONS`.

**Drag-and-drop**: `@dnd-kit/react` for node reorder. Uses `PointerSensor` with 200ms delay on mobile.

**Config format**: Converts `StackNode[]` to/from `PureNode[]` via `app/lib/convert/` before JSON serialization. Backward-compat migrations in `app/lib/config-migration.ts`.

**Models**: Fetched from `https://mdb.yor.ovh/v1/files` (fallback list in `app/constants.ts:MODELS`). `staleTime: Infinity`.

**Docs**: MDX files imported via `@mdx-js/rollup` in `app/docs/` with per-node and per-section articles in en/ru.

## Conventions

- No semicolons in JS/TS. Run `bun run lint` and `bun run format` before committing.
- Use `cn()` from `~/lib/utils` for class merging.
- Use `import type` for type-only imports.
- Tailwind CSS 4: use `@theme` + CSS variables; avoid legacy `@apply` patterns where possible.

## Notes

- No test setup exists (no test dependencies in `package.json`).
- `react-router-dom` is in dependencies but **not used**.
- `.gitignore` excludes `.ai/`, `.claude/`, and `tsconfig.tsbuildinfo`.
- No README or contributing guide.
- Favicon: `/favicon.png`.
