export const load = ({ url, request, cookies }) => {
	// if the "theme" cookie isn't "dark" or "light", reset it
	const theme = cookies.get("theme") ?? "";
	if (theme !== "dark" && theme !== "light") {
		cookies.set("theme", "", {
			path: "/",
			sameSite: "lax",
			expires: new Date(0),
		});
	}
	const { pathname } = url;
	const ua = request.headers.get("user-agent");
	const isMobile = /mobile/i.test(ua || "");
	const isFirefox = /firefox/i.test(ua || "");
	return {
		pathname,
		isMobile,
		isFirefox,
	};
};
