import { log } from "$lib/logger";
import { VertFile } from "$lib/types";

class Files {
	public files = $state<VertFile[]>([]);
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
