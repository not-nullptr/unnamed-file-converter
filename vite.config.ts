import { sveltekit } from "@sveltejs/kit/vite";
import { defineConfig } from "vite";

export default defineConfig({
	plugins: [
		sveltekit(),
		{
			name: "vips-request-middleware",
			configureServer(server) {
				server.middlewares.use((req, res, next) => {
					res.setHeader(
						"Cross-Origin-Embedder-Policy",
						"require-corp",
					);
					res.setHeader("Cross-Origin-Opener-Policy", "same-origin");
					next();
				});
			},
		},
	],
	optimizeDeps: {
		exclude: [
			"wasm-vips",
			"@ffmpeg/core-mt",
			"@ffmpeg/ffmpeg",
			"@ffmpeg/util",
		],
	},
});
