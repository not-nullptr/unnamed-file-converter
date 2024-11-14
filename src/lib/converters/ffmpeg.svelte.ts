import type { IFile } from "$lib/types";
import { Converter } from "./converter.svelte";
import type { OmitBetterStrict } from "$lib/types";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { browser } from "$app/environment";
import { log } from "$lib/logger";

export class FFmpegConverter extends Converter {
	private ffmpeg: FFmpeg = null!;
	public name = "ffmpeg";
	public ready = $state(false);

	public supportedFormats = [
		".mp3",
		".wav",
		".flac",
		".ogg",
		".aac",
		".m4a",
		".wma",
		".m4a",
		".amr",
		".ac3",
		".alac",
		".aiff",
	];

	constructor() {
		super();
		log(["converters", this.name], `created converter`);
		if (!browser) return;
		this.ffmpeg = new FFmpeg();
		(async () => {
			const baseURL =
				"https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm";
			await this.ffmpeg.load({
				coreURL: `${baseURL}/ffmpeg-core.js`,
				wasmURL: `${baseURL}/ffmpeg-core.wasm`,
			});
			this.ready = true;
		})();
	}

	public async convert(
		input: OmitBetterStrict<IFile, "extension">,
		to: string,
	): Promise<IFile> {
		if (!to.startsWith(".")) to = `.${to}`;
		const buf = new Uint8Array(input.buffer);
		await this.ffmpeg.writeFile("input", buf);
		log(
			["converters", this.name],
			`wrote ${input.name} to ffmpeg virtual fs`,
		);
		await this.ffmpeg.exec(["-i", "input", "output" + to]);
		log(["converters", this.name], `executed ffmpeg command`);
		const output = (await this.ffmpeg.readFile(
			"output" + to,
		)) as unknown as Uint8Array;
		log(
			["converters", this.name],
			`read ${input.name.split(".").slice(0, -1).join(".") + to} from ffmpeg virtual fs`,
		);
		return {
			...input,
			buffer: output.buffer,
			extension: to,
		};
	}
}
