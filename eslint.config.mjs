import { defineConfig } from "eslint/config";
import globals from "globals";
import js from "@eslint/js";
import tseslint from "typescript-eslint";
import astro from "eslint-plugin-astro";
import prettier from "eslint-plugin-prettier";

const tsParser = tseslint.parser;

export default defineConfig([
	{
		files: ["src/**"],
		languageOptions: {
			globals: {
				...globals.browser,
				...globals.node,
			},
		},
	},

	{
		files: ["src/**"],
		rules: {
			...js.configs.recommended.rules,
		},
	},

	{
		files: ["src/**"],
		languageOptions: {
			parser: tsParser,
			sourceType: "module",
		},
		plugins: {
			"@typescript-eslint": tseslint.plugin,
		},
		rules: {
			...tseslint.configs.recommended[2].rules,
		},
	},

	{
		files: ["src/**"],
		plugins: {
			prettier: prettier,
		},
		rules: {
			"prettier/prettier": "off",
		},
	},

	...astro.configs["flat/base"].map((config) => {
		if (!config.files) return config;
		return {
			...config,
			files: config.files.map((pattern) => {
				if (pattern.startsWith("**/")) {
					return `src/**/${pattern.slice(3)}`;
				}
				if (pattern.startsWith("*.")) {
					return `src/*.${pattern.slice(2)}`;
				}
				return pattern;
			}),
		};
	}),

	{
		files: ["src/**/*.astro"],
		rules: {
			...astro.configs.recommended.rules,
		},
	},
	{
		files: ["src/**/*.astro"],
		rules: {
			...astro.configs["jsx-a11y-recommended"].rules,
		},
	},

	{
		ignores: ["dist/**", "**/*.d.ts", ".github/", ".agents/**"],
	},
]);
