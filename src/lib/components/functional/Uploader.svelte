<script lang="ts">
	import clsx from "clsx";
	import { Upload } from "lucide-svelte";
	import { onMount } from "svelte";

	let fileList = $state<FileList>();
	let dragBtn = $state<HTMLButtonElement>();

	interface Props {
		files: File[] | undefined;
		onupload?: () => void;
		isMobile: boolean;
		acceptedFormats?: string[];
	}

	$effect(() => {
		if (!fileList) return;
		files = Array.from(fileList);
	});

	let fileInput = $state<HTMLInputElement>();
	let dragOver = $state(false);

	let {
		files = $bindable(),
		onupload,
		isMobile,
		acceptedFormats,
	}: Props = $props();

	function upload() {
		if (!fileInput) return;
		fileInput.click();
	}

	onMount(() => {
		const handler = (e: Event) => e.preventDefault();
		if (!dragBtn) return;
		dragBtn.addEventListener("dragenter", handler);
		dragBtn.addEventListener("dragstart", handler);
		dragBtn.addEventListener("dragend", handler);
		dragBtn.addEventListener("dragleave", handler);
		dragBtn.addEventListener("dragover", handler);
		dragBtn.addEventListener("drag", handler);
		dragBtn.addEventListener("drop", handler);

		return () => {
			if (!dragBtn) return;
			dragBtn.removeEventListener("dragenter", handler);
			dragBtn.removeEventListener("dragstart", handler);
			dragBtn.removeEventListener("dragend", handler);
			dragBtn.removeEventListener("dragleave", handler);
			dragBtn.removeEventListener("dragover", handler);
			dragBtn.removeEventListener("drag", handler);
			dragBtn.removeEventListener("drop", handler);
		};
	});

	function drop(event: DragEvent) {
		event.preventDefault();
		dragOver = false;
		if (!event.dataTransfer) return;
		if (!files) files = Array.from(event.dataTransfer.files);
		else files.push(...Array.from(event.dataTransfer.files));
		onupload?.();
		return true;
	}

	function addFiles() {
		if (!fileInput) return;
		if (!fileInput.files) return;
		if (!files) files = Array.from(fileInput.files);
		else files.push(...Array.from(fileInput.files));
		onupload?.();
	}
</script>

<button
	bind:this={dragBtn}
	onclick={upload}
	ondragover={() => (dragOver = true)}
	ondragleave={() => (dragOver = false)}
	class={clsx(
		"file-uploader",
		"w-full h-80 flex items-center justify-center cursor-pointer",
		"border-2 border-solid border-foreground-muted-alt rounded-2xl",
		"hover:scale-95 hover:opacity-70 transition-all duration-150 ease-out",
		{
			"scale-95 opacity-70 blur-xs": dragOver,
		},
	)}
	class:_drag-over={dragOver}
	ondrop={drop}
>
	<div
		class="file-uploader-center flex items-center justify-center flex-col transition-all duration-150 ease-out px-8"
	>
		<div
			class="size-16 rounded-full text-accent-foreground bg-accent-background flex items-center justify-center"
		>
			<Upload class="size-8" />
		</div>
		<h2 class="font-display text-2xl mt-6">
			{isMobile ? "Tap" : "Drop or click"} to upload files
		</h2>
		<p class="text-foreground-muted mt-4">
			All processing is done on your device. No file or size limit.
		</p>
	</div>
</button>

<input
	type="file"
	class="hidden"
	bind:this={fileInput}
	onchange={addFiles}
	accept={acceptedFormats?.join(",") ?? "*"}
	multiple
/>

<style>
	.file-uploader:hover .file-uploader-center,
	.file-uploader._drag-over .file-uploader-center {
		@apply scale-105;
	}
</style>
