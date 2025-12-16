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

## Best Practices & Development Workflow

- **Всегда используй лучшие практики**: следуй принципам SOLID, KISS, DRY; пиши чистый, читаемый код; избегай преждевременной оптимизации.
- **Обязательная проверка качества**: перед завершением работы запускай `yarn lint` для проверки кода на ошибки и соответствие стандартам.
- **Тестирование**: после всех изменений обязательно запускай `yarn test` и убеждайся, что все тесты проходят (см. раздел Testing Guidelines).
- **Рефакторинг**: при изменении существующего кода улучшай его качество, если это не противоречит задаче; исправляй найденные проблемы (code smells, дублирование, неиспользуемый код).
- **Валидация**: проверяй входные данные, обрабатывай ошибки явно, предоставляй понятные сообщения об ошибках.
- **Документация**: добавляй комментарии к неочевидной логике; для новых функций пиши документацию на русском языке.

## Testing Guidelines

- **Обязательно**: Всегда писать тесты для всех изменений кода (новые функции, исправления багов, рефакторинг).
- **Обязательно**: Если тесты не проходят после изменений, исправлять их до завершения работы.
- **Обязательно**: После всех изменений запускать тесты (`yarn test`) и убеждаться, что все тесты проходят.
- Если добавляешь тесты, используй формат `*.spec.ts` рядом с кодом или в `__tests__/` директориях; приоритет покрытию для routing guards и Pinia store actions.
- Структура тестов должна соответствовать структуре кода: тесты для компонентов в `components/__tests__/`, для stores в `stores/__tests__/`, для hooks в `hooks/__tests__/`, для pages в `pages/__tests__/`.
- Используй Vitest для написания тестов; следуй существующим паттернам тестирования в проекте.

## Commit Guidelines

- Пиши сообщения коммитов на русском языке в повелительном наклонении (что делает коммит, а не что сделал).
- Формат заголовка: `<тип>: <краткое действие>`; типы: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`, `build`, `ci`, `perf`, `style`.
- Длина заголовка до 72 символов, без точки в конце; при необходимости добавляй тело с деталями и списками изменений.
- В теле используй строки до 72 символов, указывай мотивацию изменений и последствия; если нужно, добавь `Refs:` или `Closes:` для связей с задачами.
