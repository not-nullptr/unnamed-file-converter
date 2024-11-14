import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

export default {
	content: ["./src/**/*.{html,js,svelte,ts}"],
	theme: {
		extend: {
			colors: {
				background: "var(--bg)",
				foreground: "var(--fg)",
				"foreground-muted": "var(--fg-muted)",
				"foreground-muted-alt": "var(--fg-muted-alt)",
				"foreground-failure": "var(--fg-failure)",
				"foreground-highlight": "var(--fg-highlight)",
				"accent-background": "var(--accent-bg)",
				"accent-foreground": "var(--accent-fg)",
			},
			fontFamily: {
				display: "var(--font-display)",
				body: "var(--font-body)",
			},
			blur: {
				xs: "2px",
			},
		},
	},

	plugins: [
		plugin(function ({ addVariant }) {
			addVariant("dynadark", [
				"body:not(.light).dark &",
				"@media (prefers-color-scheme: dark) { body:not(.light) &",
			]);
		}),
	],
} satisfies Config;
