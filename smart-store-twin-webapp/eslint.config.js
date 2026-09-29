import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: ["dist", "build", "node_modules"],
  },
  {
    files: ["**/*.{ts,tsx}"],
    extends: [
      js.configs.recommended,
      ...tseslint.configs.recommended,
      reactHooks.configs["recommended-latest"],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // Não travar MVP por variável/import/parâmetro não usado
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "warn",

      // Permitir any no MVP
      "@typescript-eslint/no-explicit-any": "off",

      // Evitar travar por empty object/interface provisória
      "@typescript-eslint/no-empty-object-type": "off",
      "@typescript-eslint/no-empty-interface": "off",

      // Evitar travar por require/ban-types em código temporário
      "@typescript-eslint/no-var-requires": "off",
      "@typescript-eslint/ban-types": "off",

      // Evitar travar por constantes em switch
      "no-case-declarations": "off",

      // Deixa hook como warning, não erro
      "react-hooks/exhaustive-deps": "warn",

      // Em Vite, isso costuma incomodar quando exporta helper junto de componente
      "react-refresh/only-export-components": "warn",
    },
  },
);
