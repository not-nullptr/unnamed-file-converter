<script lang="ts">
	import "../app.css";
	import { goto } from "$app/navigation";
	import { blur, duration } from "$lib/animation";
	import { quintOut } from "svelte/easing";
	import { files } from "$lib/store/index.svelte";
	import Logo from "$lib/components/visual/svg/Logo.svelte";
	import featuredImage from "$lib/assets/VERT_Feature.webp";
	import { PUB_HOSTNAME, PUB_PLAUSIBLE_URL } from "$env/static/public";
	import FancyMenu from "$lib/components/functional/FancyMenu.svelte";
	import { writable } from "svelte/store";
	let { children, data } = $props();

	let shouldGoBack = writable(false);

	const links = $derived<
		{
			name: string;
			url: string;
			activeMatch: (pathname: string) => boolean;
		}[]
	>([
		{
			name: "Upload",
			url: "/",
			activeMatch: (pathname) => pathname === "/",
		},
		{
			name:
				files.files.length > 0
					? `Convert (${files.files.length})`
					: `Convert`,
			url: "/convert",
			activeMatch: (pathname) => pathname === "/convert",
		},
		{
			name: "About",
			url: "/about",
			activeMatch: (pathname) => pathname.startsWith("/about"),
		},
	]);

	const maybeNavToHome = (e: DragEvent) => {
		if (e.dataTransfer?.types.includes("Files")) {
			e.preventDefault();
			goto("/");
		}
	};
</script>

<svelte:head>
	<title>VERT.sh</title>
	<meta name="theme-color" content="#F2ABEE" />
	<meta property="og:image" content={featuredImage} />
	<meta property="twitter:image" content={featuredImage} />
	{#if PUB_PLAUSIBLE_URL}<script
			defer
			data-domain={PUB_HOSTNAME || "vert.sh"}
			src="{PUB_PLAUSIBLE_URL}/js/script.js"
		></script>{/if}
</svelte:head>

<div
	role="main"
	class="w-full h-full max-w-screen-lg mx-auto p-4"
	ondragenter={maybeNavToHome}
>
	<div class="flex justify-center mb-5 lg:hidden">
		<a
			href="/"
			class="px-6 relative h-16 mr-3 justify-center items-center bg-accent-background fill-accent-foreground rounded-xl md:hidden flex"
		>
			<div class="h-6 w-24 items-center flex justify-center">
				<Logo />
			</div>
		</a>
	</div>

	<div
		class="w-full max-w-screen-md p-1 border-solid border-2 rounded-2xl border-foreground-muted-alt flex mb-10 mx-auto lg:mt-5"
	>
		<div class="md:p-1">
			<a
				href="/"
				class="px-3 relative w-full h-full mr-3 justify-center items-center bg-accent-background fill-accent-foreground rounded-xl md:flex hidden"
			>
				<div class="h-6 w-24 items-center flex justify-center">
					<Logo />
				</div>
			</a>
		</div>

		<FancyMenu {links} {shouldGoBack} />
	</div>
	<div class="w-full max-w-screen-lg grid grid-cols-1 grid-rows-1 relative">
		{#key data.pathname}
			<div class="w-full">
				<div
					class="absolute top-0 left-0 w-full"
					in:blur={{
						duration,
						easing: quintOut,
						blurMultiplier: 12,
						x: {
							start: !$shouldGoBack ? 250 : -250,
							end: 0,
						},
						scale: {
							start: 0.75,
							end: 1,
						},
					}}
					out:blur={{
						duration,
						easing: quintOut,
						blurMultiplier: 12,
						x: {
							start: 0,
							end: !$shouldGoBack ? -250 : 250,
						},
						scale: {
							start: 1,
							end: 0.75,
						},
					}}
				>
					<div class="pb-20">
						{@render children()}
					</div>
				</div>
			</div>
		{/key}
	</div>
</div>
