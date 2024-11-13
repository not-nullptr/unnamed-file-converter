<script lang="ts">
	import { page } from "$app/stores";
	import { fly } from "svelte/transition";
	import { duration } from "$lib/animation";
	import { quintOut } from "svelte/easing";
	import type { Writable } from "svelte/store";

	interface Props {
		links: {
			name: string;
			url: string;
			activeMatch: (pathname: string) => boolean;
		}[];
		shouldGoBack: Writable<boolean> | null;
	}

	let { links, shouldGoBack = null }: Props = $props();

	let navWidth = $state(1);
	let linkCount = $derived(links.length);
	let activeLinkIndex = $derived(
		links.findIndex((i) => i.activeMatch($page.url.pathname)),
	);
</script>

<div
	bind:clientWidth={navWidth}
	class="w-full flex bg-background relative h-16"
>
	{#if activeLinkIndex !== -1}
		<div
			class="absolute pointer-events-none top-1 bg-foreground h-[calc(100%-8px)] rounded-xl"
			style="width: {navWidth / linkCount - 8}px; left: {(navWidth /
				linkCount) *
				activeLinkIndex +
				4}px; transition: {duration - 200}ms ease left;"
		></div>
	{/if}
	{#each links as { name, url } (url)}
		<a
			class="w-1/2 px-2 h-[calc(100%-16px)] mt-2 flex items-center justify-center rounded-xl relative font-display overflow-hidden"
			href={url}
			onclick={() => {
				if (shouldGoBack) {
					const currentIndex = links.findIndex((i) =>
						i.activeMatch($page.url.pathname),
					);
					const nextIndex = links.findIndex((i) =>
						i.activeMatch(url),
					);
					$shouldGoBack = nextIndex < currentIndex;
				}
			}}
		>
			<div class="grid grid-cols-1 grid-rows-1">
				{#key name}
					<span
						class="mix-blend-difference invert col-start-1 row-start-1 text-center"
						in:fly={{
							duration,
							easing: quintOut,
							y: -50,
						}}
						out:fly={{
							duration,
							easing: quintOut,
							y: 50,
						}}
					>
						{name}
					</span>
				{/key}
			</div>
		</a>
	{/each}
</div>
