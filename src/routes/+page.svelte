<script lang="ts">
	import { goto } from "$app/navigation";
	import Uploader from "$lib/components/functional/Uploader.svelte";
	import { converters } from "$lib/converters";
	import { log } from "$lib/logger";
	import { files } from "$lib/store/index.svelte";
	import { VertFile } from "$lib/types/file.svelte";
	import { Check } from "lucide-svelte";
	import jsmediatags from "jsmediatags";
	import type { TagType } from "jsmediatags/types/index.js";

	const { data } = $props();

	let ourFiles = $state<File[]>();

	const runUpload = async () => {
		const newFilePromises = (ourFiles || []).map(async (f) => {
			return new Promise<(typeof files.files)[0] | void>(
				(resolve, reject) => {
					const from =
						"." + f.name.toLowerCase().split(".").slice(-1);
					const converter = converters.find((c) =>
						c.supportedFormats.includes(from),
					);
					if (!converter) resolve();
					const to =
						converter?.supportedFormats.find((f) => f !== from) ||
						converters[0].supportedFormats[0];
					log(
						["uploader", "converter"],
						`converting ${from} to ${to} using ${converter?.name || "... no converter??"}`,
					);
					const canvas = document.createElement("canvas");
					const ctx = canvas.getContext("2d");
					const img = new Image();
					img.src = URL.createObjectURL(f);
					const maxSize = 512;
					img.onload = () => {
						const scale = Math.max(
							maxSize / img.width,
							maxSize / img.height,
						);
						canvas.width = img.width * scale;
						canvas.height = img.height * scale;
						ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
						// get the blob
						canvas.toBlob(
							async (blob) => {
								resolve(
									new VertFile(
										f,
										to,
										converter,
										URL.createObjectURL(blob!),
									),
								);
							},
							"image/jpeg",
							0.75,
						);
					};

					img.onerror = async () => {
						// resolve(new VertFile(f, to, converter));
						const reader = new FileReader();
						reader.onload = async (e) => {
							try {
								const tags = await new Promise<TagType>(
									(resolve, reject) => {
										jsmediatags.read(
											new Blob([
												new Uint8Array(
													e.target
														?.result as ArrayBuffer,
												),
											]),
											{
												onSuccess: (tag) =>
													resolve(tag),
												onError: (error) =>
													reject(error),
											},
										);
									},
								);
								console.log(tags);
								const picture = tags.tags.picture;
								if (!picture) {
									resolve(new VertFile(f, to, converter));
									return;
								}
								const blob = new Blob(
									[new Uint8Array(picture.data)],
									{
										type: picture.format,
									},
								);
								resolve(
									new VertFile(
										f,
										to,
										converter,
										URL.createObjectURL(blob),
									),
								);
							} catch {
								resolve(new VertFile(f, to, converter));
							}
						};
						reader.readAsArrayBuffer(f);
					};
				},
			);
		});
		let oldLen = files.files.length;
		files.files = [
			...files.files,
			...(await Promise.all(newFilePromises)).filter(
				(f) => typeof f !== "undefined",
			),
		];
		let newLen = files.files.length;
		log(["uploader"], `handled ${newLen - oldLen} files`);
		ourFiles = [];

		if (files.files.length > 0) goto("/convert");
	};
</script>

<svelte:head>
	<title>VERT.sh — Free, fast, and awesome file convert</title>
	<meta
		name="title"
		content="VERT.sh — Free, fast, and awesome file convert"
	/>
	<meta
		name="description"
		content="With VERT you can convert images to PNG, JPG, WEBP, GIF, AVIF, and more. No ads, no tracking, open source, and all processing is done on your device."
	/>
	<meta property="og:type" content="website" />
	<meta
		property="og:title"
		content="VERT.sh — Free, fast, and awesome file convert"
	/>
	<meta
		property="og:description"
		content="With VERT you can convert images to PNG, JPG, WEBP, GIF, AVIF, and more. No ads, no tracking, open source, and all processing is done on your device."
	/>
	<meta property="twitter:card" content="summary_large_image" />
	<meta
		property="twitter:title"
		content="VERT.sh — Free, fast, and awesome file convert"
	/>
	<meta
		property="twitter:description"
		content="With VERT you can convert images to PNG, JPG, WEBP, GIF, AVIF, and more. No ads, no tracking, open source, and all processing is done on your device."
	/>
</svelte:head>

{#snippet sellingPoint(text: string)}
	<li
		class="grid items-center gap-4"
		style="grid-template-columns: 2rem auto"
	>
		<div
			class="h-8 w-8 bg-accent-background text-accent-foreground rounded-full flex items-center justify-center"
		>
			<Check />
		</div>
		<span class="text-lg">{text}</span>
	</li>
{/snippet}

<div class="[@media(max-height:768px)]:block mt-10 picker-fly">
	<Uploader
		isMobile={data.isMobile || false}
		bind:files={ourFiles}
		onupload={runUpload}
		acceptedFormats={[
			...new Set(converters.flatMap((c) => c.supportedFormats)),
		]}
	/>
</div>

<div class="mt-20">
	<h1 class="text-3xl text-center font-display header-fly-in">
		Free, fast, and awesome file converting <span
			class="px-2 py-1 text-xl bg-accent-background text-accent-foreground rounded-lg"
			>BETA</span
		>
	</h1>
	<div class="flex justify-center mt-10">
		<div class="grid gap-4">
			<!-- {@render sellingPoint("Very fast, all processing done on device")}
			{@render sellingPoint("No ads, and open source")}
			{@render sellingPoint("Beautiful and straightforward UI")} -->
			{#each ["Very fast, all processing done on device", "No file or size limit", "No ads, and open source", "Beautiful and straightforward UI"] as text, i}
				<div class="fly-in" style="--delay: {i * 50}ms;">
					{@render sellingPoint(text)}
				</div>
			{/each}
		</div>
	</div>
</div>

<style>
	/* for this page specifically */
	:global(html, body) {
		height: 100%;
	}

	@keyframes fly-in {
		from {
			opacity: 0;
			transform: translateY(50px);
			filter: blur(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}

	@keyframes picker-fly {
		from {
			opacity: 0;
			transform: translateY(48px);
			filter: blur(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}

	@keyframes header-fly-in {
		from {
			opacity: 0;
			transform: translateY(30px) scale(0.9);
			filter: blur(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0) scale(1);
			filter: blur(0);
		}
	}

	.header-fly-in {
		animation: header-fly-in var(--transition) 750ms forwards;
		opacity: 0;
	}

	.fly-in {
		animation: fly-in var(--transition) 750ms var(--delay) forwards;
		opacity: 0;
	}

	.picker-fly {
		animation: picker-fly var(--transition) 750ms forwards;
		opacity: 0;
	}
</style>
