import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	let theme = event.cookies.get("theme") ?? "";
	if (theme !== "dark" && theme !== "light") {
		event.cookies.set("theme", "", {
			path: "/",
			sameSite: "strict",
		});
		theme = "";
	}
	const res = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace("%theme%", theme),
	});
	return res;
};
