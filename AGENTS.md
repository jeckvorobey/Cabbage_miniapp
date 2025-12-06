# Repository Guidelines

## Project Structure & Module Organization
- Quasar + Vue 3 app; entry at `src/App.vue` with shell in `src/layouts/MainLayout.vue` and routes in `src/router/routes.ts`.
- Feature pages live in `src/pages/`; shared UI in `src/components/`; composables in `src/use/` and `src/hooks/`; Pinia stores in `src/stores/`; localization assets in `src/i18n/`; static assets in `src/assets/` and global styles in `src/css/`.
- Public files ship directly from `public/`; Vite/Quasar config sits in `quasar.config.ts`; tooling and lint settings are root-level (`eslint.config.js`, `postcss.config.js`, `tsconfig.json`).

## Build, Test, and Development Commands
- `yarn dev` / `npm run dev`: start the Quasar dev server with hot reload.
- `yarn build` / `npm run build`: produce the production bundle in `dist/`.
- `yarn lint`: ESLint check for `.ts/.js/.vue` across `src`.
- `yarn format`: Prettier write for JS/TS/Vue/SCSS/HTML/MD/JSON.
- `yarn test`: current placeholder; treat lint + manual verification as required.

## Coding Style & Naming Conventions
- TypeScript-first (`<script setup lang="ts">`); prefer the Composition API and keep props/emit typed.
- Components and layouts use PascalCase (`UserCard.vue`); composables in `useThing.ts`; stores in `stores/thing-store.ts`; route names mirror page intent (`users`, `units`, `categories`).
- Single quotes, trailing commas, and Prettier defaults (2-space indent); avoid implicit `any` and keep imports ordered logically.
- Keep copy in `src/i18n` when keys exist; avoid hard-coded strings in templates where localization is available.

## Testing Guidelines
- No automated suites yet; run `yarn lint` plus a quick manual pass of key flows (auth gating, dashboard, user/unit/category management, Telegram start) before opening a PR.
- If adding tests, mirror page names and prefer `*.spec.ts` colocated with code or under `tests/`; prioritize coverage for routing guards and Pinia store actions.

## Commit & Pull Request Guidelines
- Используй формат коммитов: `<type>(core): <короткое действие в повелительном наклонении>` на русском языке (например, `feat(core): добавить фильтрацию единиц`, `fix(core): исправить ошибку корзины`). Сообщения должны быть краткими, максимум ~50 символов после двоеточия. Squash local noise before pushing.
- Branch naming: `feature/<topic>` or `fix/<issue>`.
- PRs should include intent summary, linked issue/Telegram task when relevant, screenshots/GIFs for UI changes, and the commands you ran (lint/build).
- Do not commit secrets; keep credentials in `.env` (not versioned) and note new env vars in the PR description.
