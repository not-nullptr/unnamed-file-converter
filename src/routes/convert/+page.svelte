<script lang="ts">
	import { goto } from "$app/navigation";
	import { blur, duration, flip } from "$lib/animation";
	import Dropdown from "$lib/components/functional/Dropdown.svelte";
	import ProgressiveBlur from "$lib/components/visual/effects/ProgressiveBlur.svelte";
	import ProgressBar from "$lib/components/visual/ProgressBar.svelte";
	import { converters } from "$lib/converters";
	import type { Converter } from "$lib/converters/converter.svelte";
	import { log } from "$lib/logger";
	import { files } from "$lib/store/index.svelte";
	import type { VertFile } from "$lib/types";
	import clsx from "clsx";
	import { ArrowRight, XIcon } from "lucide-svelte";
	import { onMount } from "svelte";
	import { quintOut } from "svelte/easing";

	const reversedFiles = $derived(files.files.slice().reverse());

	let finisheds = $state(
		Array.from({ length: files.files.length }, () => false),
	);

	let isSm = $state(false);
	let isLg = $state(false);

	let processings = $state<boolean[]>([]);

	const convertersRequired = $derived.by(() => {
		const required: Converter[] = [];
		for (let i = 0; i < files.files.length; i++) {
			const file = files.files[i];
			const converter = converters.find(
				(c) =>
					c.supportedFormats.includes(file.from) &&
					c.supportedFormats.includes(file.to),
			);
			if (!converter) throw new Error("No converter found");
			required.push(converter);
		}
		return Array.from(new Set(required));
	});

	const multipleConverters = $derived(convertersRequired.length > 1);

	const noMultConverter = $derived(
		multipleConverters ? null : convertersRequired[0],
	);

	const allConvertersReady = $derived(
		convertersRequired.every((c) => c.ready),
	);

	onMount(() => {
		isSm = window.innerWidth < 640;
		isLg = window.innerWidth > 1024;
		window.addEventListener("resize", () => {
			isSm = window.innerWidth < 640;
			isLg = window.innerWidth > 1024;
		});
	});

	let disabled = $derived(files.files.some((f) => !f.result));

	onMount(() => {
		finisheds.forEach((_, i) => {
			const duration = 575 + i * 50 - 32;
			setTimeout(() => {
				finisheds[i] = true;
			}, duration);
		});
	});

	const convertAll = async () => {
		const perf = performance.now();
		files.files.forEach((f) => (f.result = null));
		const promises: Promise<void>[] = [];
		for (let i = 0; i < files.files.length; i++) {
			promises.push(
				(async (i) => {
					await convert(files.files[i], i);
				})(i),
			);
		}

		await Promise.all(promises);
		const ms = performance.now() - perf;
		const seconds = (ms / 1000).toFixed(2);
		log(["converter"], `converted all files in ${seconds}s`);
	};

	const convert = async (file: VertFile, index: number) => {
		file.progress = 0;
		processings[index] = true;
		await file.convert();
		processings[index] = false;
	};

	const downloadAll = async () => {
		const dlFiles: any[] = [];
		for (let i = 0; i < files.files.length; i++) {
			const file = files.files[i];
			const result = file.result;
			if (!result) {
				console.error("No result found");
				continue;
			}
			dlFiles.push({
				name: file.file.name.replace(/\.[^/.]+$/, "") + file.to,
				lastModified: Date.now(),
				input: await result.file.arrayBuffer(),
			});
		}
		if (files.files.length === 0) return;
		if (files.files.length === 1) {
			// download the image only
			const blob = URL.createObjectURL(
				new Blob([dlFiles[0].input], {
					type: files.files[0].to.slice(1),
				}),
			);
			const a = document.createElement("a");
			a.href = blob;
			a.download = `VERT-Converted_${new Date().toISOString()}${
				files.files[0].to
			}`;
			a.click();
			URL.revokeObjectURL(blob);
			a.remove();
			return;
		}
		const { downloadZip } = await import("client-zip");
		const blob = await downloadZip(dlFiles, "converted.zip").blob();
		const url = URL.createObjectURL(blob);
		const a = document.createElement("a");
		a.href = url;
		a.download = `VERT-Converted_${new Date().toISOString()}.zip`;
		a.click();
		URL.revokeObjectURL(url);
		a.remove();
	};
</script>

<svelte:head>
	<title>Your Conversions</title>
	<meta name="title" content="Your Conversions — VERT.sh" />
	<meta property="og:title" content="Your Conversions — VERT.sh" />
	<meta property="twitter:title" content="Your Conversions — VERT.sh" />
</svelte:head>

<div class="grid grid-cols-1 grid-rows-1 w-full">
	{#if files.files.length === 0}
		<p class="text-foreground-muted col-start-1 row-start-1 text-center">
			No files uploaded. Head to the Upload tab to begin!
		</p>
	{:else}
		<div
			class="flex flex-col gap-4 w-full items-center col-start-1 row-start-1"
			out:blur={{
				duration,
				easing: quintOut,
				blurMultiplier: 16,
			}}
		>
			<div
				class="w-full p-4 max-w-screen-lg border-solid flex-col border-2 rounded-2xl border-foreground-muted-alt flex flex-shrink-0"
			>
				<h2 class="font-bold text-xl mb-1">Options</h2>
				<div class="flex flex-col w-full gap-4 mt-2">
					<div class="flex flex-col gap-3 w-fit">
						<h3>Set all target formats</h3>
						<div class="grid grid-rows-1 grid-cols-1">
							{#if !multipleConverters && noMultConverter}
								<div
									transition:blur={{
										blurMultiplier: 8,
										duration,
										easing: quintOut,
									}}
									class="row-start-1 col-start-1 w-fit"
								>
									<Dropdown
										options={noMultConverter.supportedFormats}
										onselect={(o) => {
											// files.conversionTypes = Array.from(
											// 	{ length: files.files.length },
											// 	() => o,
											// );

											files.files.forEach((file) => {
												file.result = null;
												file.to = o;
											});
										}}
									/>
								</div>
							{:else}
								<div
									class="italic w-fit text-foreground-muted-alt h-11 flex items-center row-start-1 col-start-1"
									transition:blur={{
										blurMultiplier: 8,
										duration,
										easing: quintOut,
									}}
								>
									The listed files require different
									converters, so you can't set them in bulk.
								</div>
							{/if}
						</div>
					</div>
				</div>

				<div class="grid md:grid-cols-2 gap-3 mt-4">
					<button
						onclick={convertAll}
						class={clsx("btn flex-grow", {
							"btn-highlight": disabled,
						})}
						disabled={!allConvertersReady}
					>
						{#if allConvertersReady}
							Convert {files.files.length > 1 ? "All" : ""}
						{:else}
							Loading...
						{/if}
					</button>
					<button
						onclick={downloadAll}
						class={clsx("btn flex-grow", {
							"btn-highlight": !disabled,
						})}
						{disabled}
						>Download {files.files.length > 1 ? "All" : ""}</button
					>
				</div>
			</div>
			<div
				class="w-full flex flex-col gap-4 lg:grid"
				style="grid-template-columns: repeat(2, 1fr)"
			>
				{#each reversedFiles as file, i (file.id)}
					{@const converter = (() => {
						return converters.find((c) =>
							c.supportedFormats.includes(file.from),
						);
					})()}
					<div
						class="rounded-xl relative lg:h-48"
						animate:flip={{ duration, easing: quintOut }}
						out:blur={{
							duration,
							easing: quintOut,
							blurMultiplier: 16,
						}}
					>
						<div
							class={clsx(
								"sm:h-full lg:py-0 py-4 px-3 flex relative flex-shrink-0 items-center w-full rounded-xl",
								{
									"initial-fade": !finisheds[i],
									processing: processings[i] && !isLg,
								},
							)}
							style="--delay: {i * 50}ms; z-index: {files.files
								.length - i}; border: solid 2px {file.result
								? 'var(--accent-bg)'
								: 'var(--fg-muted-alt)'}; transition: border 1000ms ease; transition: filter {duration}ms var(--transition), transform {duration}ms var(--transition);"
						>
							<!-- <div
							class="absolute top-0 left-0 bg-red-500 h-full"
							style="width: {file.progress}%; transition: width 500ms linear;"
						></div> -->
							<div
								class="flex gap-8 lg:flex-grow lg:h-full sm:gap-0 lg:py-4 lg:justify-normal sm:flex-row lg:flex-col flex-col items-center justify-between w-full z-50 relative sm:h-fit h-full"
							>
								<div class="w-full lg:flex-grow">
									<div
										class={clsx(
											"py-2 px-3 lg:w-full lg:flex rounded-xl transition-colors duration-300 sm:w-fit w-full flex-shrink sm:text-left text-center",
											{
												"bg-accent-background text-accent-foreground":
													file.result,
												"bg-background text-foreground":
													!file.result,
											},
										)}
									>
										<h3
											class="lg:flex-grow flex-shrink whitespace-nowrap overflow-hidden text-ellipsis sm:max-w-96"
										>
											{file.file.name}
										</h3>
										<button
											onclick={() => {
												// delete the file from the list
												files.files =
													files.files.filter(
														(f) => f !== file,
													);
												if (files.files.length === 0)
													goto("/");
											}}
											class="ml-2 mr-1 lg:block hidden flex-shrink-0"
										>
											<XIcon size="18" />
										</button>
									</div>
								</div>
								<div
									class="flex items-center gap-3 sm:justify-normal w-full sm:w-fit flex-shrink-0 lg:w-full"
								>
									<div
										class="flex flex-col items-center gap-3 w-full"
									>
										{#if processings[files.files.length - i - 1]}
											<div
												class="w-full lg:block hidden"
												transition:blur={{
													blurMultiplier: 6,
													duration,
													easing: quintOut,
													scale: {
														start: 0.9,
														end: 1,
													},
												}}
											>
												<ProgressBar
													min={0}
													max={100}
													progress={file.result
														? 100
														: file.progress}
												/>
											</div>
										{/if}
										<div
											class="flex items-center gap-3 w-full"
										>
											{#if converter && converter.supportedFormats.includes(file.from)}
												<span
													class="sm:block hidden lg:hidden"
													>from</span
												>
												<span
													class="py-2 lg:hidden px-3 font-display bg-foreground text-background rounded-xl sm:block hidden"
													>{file.from}</span
												>
												<span
													class="sm:block lg:hidden hidden"
													>to</span
												>
												<span
													class="hidden lg:block whitespace-nowrap"
													>Convert to</span
												>
												<div
													class="sm:block hidden lg:w-full"
												>
													<Dropdown
														options={converter.supportedFormats}
														bind:selected={files
															.files[
															files.files.length -
																i -
																1
														].to}
														onselect={() => {
															file.result = null;
														}}
													/>
												</div>
												<div
													class="w-full sm:hidden block h-11"
												>
													<div
														class="py-2 px-3 font-display bg-foreground text-background rounded-xl"
													>
														{file.from}
													</div>
												</div>
												<div
													class="w-full sm:hidden h-full flex justify-center items-center"
												>
													<ArrowRight
														class="w-6 h-6 text-accent-foreground"
													/>
												</div>
												<div
													class="w-full sm:hidden block h-full"
												>
													<Dropdown
														options={converter.supportedFormats}
														bind:selected={files
															.files[
															files.files.length -
																1 -
																i
														].to}
														onselect={() => {
															file.result = null;
														}}
													/>
												</div>
											{:else}
												<span
													class="py-2 px-3 font-display bg-foreground-failure text-white rounded-xl"
													>{file.from}</span
												>

												<span
													class="text-foreground-failure"
												>
													is not supported!
												</span>
											{/if}
										</div>
										<!-- <div
											class="hidden lg:flex gap-4 w-full"
										>
											<button
												class="btn flex-grow flex-shrink-0"
												onclick={() => convert(file)}
											>
												Convert
											</button>
											<button
												class="btn flex-grow flex-shrink-0"
												disabled={!file.result}
												onclick={file.download}
											>
												Download
											</button>
										</div> -->
									</div>
									<button
										onclick={() => {
											// delete the file from the list
											files.files = files.files.filter(
												(f) => f !== file,
											);
											if (files.files.length === 0)
												goto("/");
										}}
										class="ml-2 mr-1 sm:block hidden lg:hidden"
									>
										<XIcon size="18" />
									</button>
								</div>
							</div>
							{#if converter && converter.supportedFormats.includes(file.from)}
								<!-- god knows why, but setting opacity > 0.98 causes a z-ordering issue in firefox ??? -->
								<div
									class="absolute top-0 -z-50 left-0 w-full h-full rounded-[10px] overflow-hidden opacity-[0.98]"
								>
									<div
										class="bg-cover bg-center w-full h-full"
										style="background-image: url({file.blobUrl});"
									></div>
									<div
										class="absolute sm:top-0 bottom-0 sm:left-0 h-5/6 w-full sm:h-full"
									>
										<ProgressiveBlur
											direction={isSm
												? "bottom"
												: isLg
													? "bottom"
													: "right"}
											endIntensity={isLg ? 64 : 128}
											iterations={6}
											fadeTo="var(--bg-transparent)"
										/>
									</div>
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
			<div class="w-full h-4 flex-shrink-0"></div>
		</div>
	{/if}
</div>

<style>
	@keyframes initial-transition {
		0% {
			transform: translateY(50px);
			filter: blur(16px);
			opacity: 0;
		}

		100% {
			transform: translateY(0);
			filter: blur(0);
			opacity: 1;
		}
	}

	.initial-fade {
		animation: initial-transition 600ms var(--delay) var(--transition);
		opacity: 0;
	}

	.initial-fade.finished {
		animation: none;
		opacity: 1 !important;
	}

	@keyframes processing {
		0% {
			transform: scale(1);
			filter: blur(0px);
			animation-timing-function: ease-in-out;
		}

		50% {
			transform: scale(1.05);
			filter: blur(4px);
			animation-timing-function: ease-in-out;
		}

		100% {
			transform: scale(1);
			filter: blur(0px);
			animation-timing-function: ease-in-out;
		}
	}

	.processing {
		animation: processing 2000ms infinite;
		pointer-events: none;
	}

	.file-list {
		transition:
			filter 500ms var(--transition),
			transform 500ms var(--transition);
	}
</style>
