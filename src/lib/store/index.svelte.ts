import { log } from "$lib/logger";
import type { IFile } from "$lib/types";

class Files {
	public files = $state<
		{
			file: File;
			from: string;
			to: string;
			blobUrl: string;
			id: string;
			result?: (IFile & { blobUrl: string; animating: boolean }) | null;
		}[]
	>([]);
}

class Theme {
	public dark = $state(false);
	public toggle = () => {
		this.dark = !this.dark;
		log(["theme"], `set to ${this.dark ? "dark" : "light"}`);
	};
}

export const files = new Files();

export const theme = new Theme();

export const outputFilenameOption = ["default", "original"];
