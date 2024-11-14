import { VertFile } from "$lib/types";
import { Converter } from "./converter.svelte";
import VipsWorker from "$lib/workers/vips?worker";
import { browser } from "$app/environment";
import type { WorkerMessage, OmitBetterStrict } from "$lib/types";
import { log } from "$lib/logger";

export class VipsConverter extends Converter {
	private worker: Worker = browser ? new VipsWorker() : null!;
	private id = 0;
	public name = "libvips";
	public ready = $state(false);
	public supportedFormats = [
		".png",
		".jpeg",
		".jpg",
		".webp",
		".gif",
		".hdr",
		".jpe",
		".mat",
		".pbm",
		".pfm",
		".pgm",
		".pnm",
		".ppm",
		".raw",
		".tif",
		".tiff",
	];

	constructor() {
		super();
		log(["converters", this.name], `created converter`);
		if (!browser) return;
		this.worker.onmessage = (e) => {
			const message: WorkerMessage = e.data;
			if (message.type === "loaded") this.ready = true;
		};
	}

	public async convert(input: VertFile, to: string): Promise<VertFile> {
		log(["converters", this.name], `converting ${input.name} to ${to}`);
		const res = await this.sendMessage({
			type: "convert",
			input,
			to,
		});

		if (res.type === "finished") {
			log(["converters", this.name], `converted ${input.name} to ${to}`);
			return res.output;
		}

		if (res.type === "error") {
			throw new Error(res.error);
		}

		throw new Error("Unknown message type");
	}

	private sendMessage(
		message: OmitBetterStrict<WorkerMessage, "id">,
	): Promise<OmitBetterStrict<WorkerMessage, "id">> {
		const id = this.id++;
		let resolved = false;
		return new Promise((resolve) => {
			const onMessage = (e: MessageEvent) => {
				if (e.data.id === id) {
					this.worker.removeEventListener("message", onMessage);
					resolve(e.data);
					resolved = true;
				}
			};

			setTimeout(() => {
				if (!resolved) {
					this.worker.removeEventListener("message", onMessage);
					throw new Error("Timeout");
				}
			}, 60000);

			this.worker.addEventListener("message", onMessage);

			this.worker.postMessage({ ...message, id });
		});
	}
}
