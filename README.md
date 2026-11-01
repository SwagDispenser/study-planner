# React + TypeScript + Vite

## Вимоги до середовища

- Node.js 22.22.0 або новіший (мінімальна версія зазначена в `package.json`).
- React та React DOM 19.x (версії залежностей зафіксовані у `package-lock.json`).
- Для розробки використовується Node.js 24.21.0, зазначений у `.nvmrc`.

Якщо встановлено nvm, у папці `study-planner` можна вибрати версію Node.js:

```bash
nvm install
nvm use
```

## Запуск через npm

Усі команди виконуйте в папці `study-planner`.

Встановіть залежності за версіями з `package-lock.json` та запустіть сервер розробки:

```bash
npm ci
npm run dev
```

Відкрийте адресу з термінала (за замовчуванням `http://localhost:5173`).
Якщо порт зайнятий, Vite вибере інший і покаже актуальну адресу.
Щоб зупинити сервер, натисніть `Ctrl+C`.

Для створення production-збірки та її локального перегляду:

```bash
npm run build
npm run preview
```

Збірка зберігається в папці `dist`. Сервер перегляду показує адресу в терміналі
(за замовчуванням `http://localhost:4173`).

## Перевірка TypeScript та ESLint

```bash
npm run typecheck
npm run lint
```

`typecheck` перевіряє типи коду застосунку та конфігурації Vite без створення
production-збірки. Для обох частин проєкту ввімкнено строгий режим TypeScript
(`strict: true`). `lint` перевіряє правила TypeScript, React Hooks та Fast Refresh.

Команда `npm run build` також перевіряє типи перед створенням збірки Vite.

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
# study-planner
