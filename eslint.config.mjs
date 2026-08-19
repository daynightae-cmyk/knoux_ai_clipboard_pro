import tsParser from "@typescript-eslint/parser";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import importPlugin from "eslint-plugin-import";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";

const browserAndNodeGlobals = {
  window: "readonly",
  document: "readonly",
  navigator: "readonly",
  localStorage: "readonly",
  console: "readonly",
  process: "readonly",
  module: "readonly",
  require: "readonly",
  Buffer: "readonly",
  __dirname: "readonly",
  setTimeout: "readonly",
  clearTimeout: "readonly",
  fetch: "readonly",
  URL: "readonly",
  Blob: "readonly",
};

export default [
  {
    ignores: [
      "build/**",
      "dist/**",
      "release/**",
      "release-*/**",
      "node_modules/**",
      "coverage/**",
      ".vite/**",
    ],
  },
  {
    files: ["**/*.{js,cjs,mjs,ts,tsx}"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: browserAndNodeGlobals,
      parser: tsParser,
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
    plugins: {
      "@typescript-eslint": tsPlugin,
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      import: importPlugin,
      "jsx-a11y": jsxA11yPlugin,
    },
    settings: {
      react: { version: "detect" },
    },
    rules: {
      "no-dupe-keys": "error",
      "no-debugger": "error",
      "react-hooks/rules-of-hooks": "error",
    },
  },
  {
    files: ["**/*.{test,spec}.{ts,tsx,js}"],
    languageOptions: {
      globals: {
        ...browserAndNodeGlobals,
        describe: "readonly",
        expect: "readonly",
        it: "readonly",
        vi: "readonly",
        beforeEach: "readonly",
        afterEach: "readonly",
      },
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "off",
    },
  },
];
