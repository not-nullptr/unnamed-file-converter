import { VertFile } from "./file.svelte";

interface ConvertMessage {
	type: "convert";
	input: VertFile;
	to: string;
}

interface FinishedMessage {
	type: "finished";
	output: VertFile;
}

interface LoadedMessage {
	type: "loaded";
}

interface ErrorMessage {
	type: "error";
	error: string;
}

export type WorkerMessage = (
	| ConvertMessage
	| FinishedMessage
	| LoadedMessage
	| ErrorMessage
) & {
	id: number;
};
