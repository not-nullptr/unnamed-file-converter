export const load = ({ url, request }) => {
	const { pathname } = url;
	const ua = request.headers.get("user-agent");
	const isMobile = /mobile/i.test(ua || "");
	return {
		pathname,
		isMobile,
	};
};