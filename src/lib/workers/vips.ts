import {
	type WorkerMessage,
	type OmitBetterStrict,
	VertFile,
} from "$lib/types";
import Vips from "wasm-vips";

const vipsPromise = Vips({
	// see https://github.com/kleisauke/wasm-vips/issues/85
	dynamicLibraries: [],
});

vipsPromise
	.then(() => {
		postMessage({ type: "loaded" });
	})
	.catch((error) => {
		postMessage({ type: "error", error });
	});

const handleMessage = async (
	message: WorkerMessage,
): Promise<OmitBetterStrict<WorkerMessage, "id"> | undefined> => {
	const vips = await vipsPromise;
	switch (message.type) {
		case "convert": {
			if (!message.to.startsWith(".")) message.to = `.${message.to}`;
			const image = vips.Image.newFromBuffer(
				await message.input.file.arrayBuffer(),
			);
			const output = image.writeToBuffer(message.to);
			image.delete();
			return {
				type: "finished",
				output: new VertFile(
					new File([output.buffer], message.input.name),
					message.to,
				),
			};
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
