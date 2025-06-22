// eslint.config.mjs
import next from "@next/eslint-plugin-next";
import js from "@eslint/js";
import globals from "globals";

export default [
  js.configs.recommended,
  {
    plugins: {
      "@next/next": next,
    },
    rules: {
      ...next.configs.recommended.rules,
      ...next.configs["core-web-vitals"].rules,
      // Add your custom rules here
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
    },
  },
];