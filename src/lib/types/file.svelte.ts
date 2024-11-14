import type { Converter } from "$lib/converters/converter.svelte";

export class VertFile {
	public id: string = Math.random().toString(36).slice(2, 8);

	public get from() {
		return "." + this.file.name.split(".").pop()!;
	}

	public get name() {
		return this.file.name;
	}

	public progress = $state(0);
	public result = $state<VertFile | null>(null);

	public to = $state("");

	public converter: Converter | null = null;

	constructor(
		public readonly file: File,
		to: string,
		converter?: Converter,
		public readonly blobUrl?: string,
	) {
		this.to = to;
		this.converter = converter ?? null;
		this.convert = this.convert.bind(this);
		this.download = this.download.bind(this);
	}

	public async convert() {
		console.log(this.converter);
		if (!this.converter) throw new Error("No converter found");
		this.result = null;
		this.progress = 0;
		const res = await this.converter.convert(this, this.to);
		this.result = res;
		return res;
	}

	public async download() {
		if (!this.result) throw new Error("No result found");
		const blob = URL.createObjectURL(
			new Blob([await this.result.file.arrayBuffer()], {
				type: this.to.slice(1),
			}),
		);
		const a = document.createElement("a");
		a.href = blob;
		a.download = `VERT-Converted_${new Date().toISOString()}${this.to}`;
		a.click();
		URL.revokeObjectURL(blob);
		a.remove();
	}
}
