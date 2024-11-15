<script lang="ts">
	import "../app.scss";
	import { goto } from "$app/navigation";
	import { blur, duration } from "$lib/animation";
	import { quintOut } from "svelte/easing";
	import { files, theme } from "$lib/store/index.svelte";
	import Logo from "$lib/components/visual/svg/Logo.svelte";
	import featuredImage from "$lib/assets/VERT_Feature.webp";
	import { PUB_HOSTNAME, PUB_PLAUSIBLE_URL } from "$env/static/public";
	import FancyMenu from "$lib/components/functional/FancyMenu.svelte";
	import { writable } from "svelte/store";
	import { MoonIcon, SunIcon } from "lucide-svelte";
	import { browser } from "$app/environment";
	import JSCookie from "js-cookie";
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

	$effect(() => {
		if (!browser) return;
		if (theme.dark) {
			document.body.classList.add("dark");
			document.body.classList.remove("light");
			JSCookie.set("theme", "dark", {
				path: "/",
				sameSite: "lax",
				expires: 2147483647,
			});
		} else {
			document.body.classList.add("light");
			document.body.classList.remove("dark");
			JSCookie.set("theme", "light", {
				path: "/",
				sameSite: "lax",
				expires: 2147483647,
			});
		}
	});
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
			class="px-4 relative h-14 mr-3 justify-center items-center bg-accent-background fill-accent-foreground rounded-xl md:hidden flex"
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
		<div class="h-16 px-4 flex items-center">
			<button onclick={theme.toggle} class="grid-cols-1 grid-rows-1 grid">
				<!-- {#if theme.dark}
					<div
						class="w-full h-full flex items-center justify-center row-start-1 col-start-1"
					>
						<MoonIcon />
					</div>
				{:else}
					<div
						class="w-full h-full flex items-center justify-center row-start-1 col-start-1"
					>
						<SunIcon />
					</div>
				{/if} -->
				{#if browser}
					{#if theme.dark}
						<div
							in:blur={{
								blurMultiplier: 1,
								duration,
								easing: quintOut,
								scale: {
									start: 0.5,
									end: 1,
								},
							}}
							out:blur={{
								blurMultiplier: 1,
								duration,
								easing: quintOut,
								scale: {
									start: 1,
									end: 1.5,
								},
							}}
							class="w-full h-full flex items-center justify-center row-start-1 col-start-1"
						>
							<MoonIcon class="w-8" />
						</div>
					{:else}
						<div
							in:blur={{
								blurMultiplier: 1,
								duration,
								easing: quintOut,
								scale: {
									start: 0.5,
									end: 1,
								},
							}}
							out:blur={{
								blurMultiplier: 1,
								duration,
								easing: quintOut,
								scale: {
									start: 1,
									end: 1.5,
								},
							}}
							class="w-full h-full flex items-center justify-center row-start-1 col-start-1"
						>
							<SunIcon class="w-8" />
						</div>
					{/if}
				{:else}
					<div
						class="w-full h-full flex items-center justify-center row-start-1 col-start-1 dynadark:hidden"
					>
						<SunIcon class="w-8" />
					</div>
					<div
						class="w-full h-full hidden items-center justify-center row-start-1 col-start-1 dynadark:flex"
					>
						<MoonIcon class="w-8" />
					</div>
				{/if}
			</button>
		</div>
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
						y: {
							start: 100,
							end: 0,
						},
						scale: {
							start: 0.75,
							end: 1,
						},
						origin: "top center",
					}}
					out:blur={{
						duration,
						easing: quintOut,
						blurMultiplier: 12,
						x: {
							start: 0,
							end: !$shouldGoBack ? -250 : 250,
						},
						y: {
							start: 0,
							end: 100,
						},
						scale: {
							start: 1,
							end: 0.75,
						},
						origin: "top center",
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
