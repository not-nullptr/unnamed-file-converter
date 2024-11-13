import type { Handle } from "@sveltejs/kit";

export const handle: Handle = async ({ event, resolve }) => {
	const theme = event.cookies.get("theme") ?? "";
	const res = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace("%theme%", theme),
	});
	return res;
};
