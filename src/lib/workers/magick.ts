import type { WorkerMessage, OmitBetterStrict } from "$lib/types";
import {
	ImageMagick,
	initializeImageMagick,
	MagickFormat,
} from "@imagemagick/magick-wasm";
import wasmUrl from "@imagemagick/magick-wasm/magick.wasm?url";

const magickPromise = fetch(wasmUrl)
	.then((r) => r.arrayBuffer())
	.then((r) => initializeImageMagick(r));

magickPromise
	.then(() => {
		postMessage({ type: "loaded" });
	})
	.catch((error) => {
		postMessage({ type: "error", error });
	});

const handleMessage = async (
	message: WorkerMessage,
): Promise<OmitBetterStrict<WorkerMessage, "id"> | undefined> => {
	await magickPromise;
	switch (message.type) {
		case "convert": {
			if (!message.to.startsWith(".")) message.to = `.${message.to}`;
			message.to = message.to.slice(1);

			// unfortunately this lib uses some hacks to dispose images when the promise is resolved
			// this means we can't promisify it :(
			return new Promise((resolve) => {
				ImageMagick.read(
					new Uint8Array(message.input.buffer),
					(img) => {
						const keys = Object.keys(MagickFormat);
						const values = Object.values(MagickFormat);
						const index = keys.findIndex(
							(key) =>
								key.toLowerCase() === message.to.toLowerCase(),
						);
						const format = values[index];
						img.write(format, (output) => {
							resolve({
								type: "finished",
								output: {
									...message.input,
									buffer: output,
									extension: message.to,
								},
							});
						});
						img.dispose();
					},
				);
			});
		}
	}
};

onmessage = async (e) => {
	const message: WorkerMessage = e.data;
	try {
		const res = await handleMessage(message);
		if (!res) return;
		postMessage({
			...res,
			id: message.id,
		});
	} catch (e) {
		postMessage({
			type: "error",
			error: e,
			id: message.id,
		});
	}
};
