export class VertFile {
	public id: string = Math.random().toString(36).slice(2, 8);

	public get from() {
		return "." + this.file.name.split(".").pop()!;
	}

	public get name() {
		return this.file.name;
	}

	public progress = $state(0);
	// public result: VertFile | null = null;
	public result = $state<VertFile | null>(null);

	public to = $state("");

	constructor(
		public readonly file: File,
		to: string,
		public readonly blobUrl?: string,
	) {
		this.to = to;
	}
}
