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
	public beenToConverterPage = $state(false);
	public shouldShowAlert = $derived(
		!this.beenToConverterPage && this.files.length > 0,
	);
}

class Theme {
	public dark = $state(false);
	public toggle = () => {
		this.dark = !this.dark;
	};
}

export const files = new Files();
export const theme = new Theme();
