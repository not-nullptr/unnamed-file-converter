<script lang="ts">
	import { goto } from "$app/navigation";
	import Uploader from "$lib/components/functional/Uploader.svelte";
	import { converters } from "$lib/converters";
	import { files } from "$lib/store/index.svelte";
	import { Check } from "lucide-svelte";

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
					console.log(converter);
					if (!converter) resolve();
					const to =
						converter?.supportedFormats.find((f) => f !== from) ||
						converters[0].supportedFormats[0];
					// create a canvas and clamp the width or height to 1024, whichever is larger
					// also, maintain aspect ratio
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
							(blob) => {
								if (blob === null)
									reject("Failed to convert image to blob");
								resolve({
									file: f,
									from,
									to,
									blobUrl: URL.createObjectURL(blob!),
									id: Math.random().toString(36).substring(2),
								});
							},
							"image/jpeg",
							0.75,
						);
					};
				},
			);
		});
		files.files = [
			...files.files,
			...(await Promise.all(newFilePromises)).filter(
				(f) => typeof f !== "undefined",
			),
		];

		ourFiles = [];

		if (files.files.length > 0 && !files.beenToConverterPage)
			goto("/convert");
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
