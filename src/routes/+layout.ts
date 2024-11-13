import { browser } from "$app/environment";
import { theme } from "$lib/store/index.svelte";
import { getCookie, setCookie } from "typescript-cookie";

export const load = ({ data }) => {
	if (!browser) return;
	const themeStr = getCookie("theme");
	if (typeof themeStr === "undefined") {
		theme.dark = window.matchMedia("(prefers-color-scheme: dark)").matches;
		setCookie("theme", theme.dark ? "dark" : "light");
	} else {
		theme.dark = themeStr === "dark";
	}
	theme.dark = getCookie("theme") === "dark";
	return data;
};
