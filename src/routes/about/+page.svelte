<script lang="ts">
	import avatarNullptr from "$lib/assets/avatars/nullptr.jpg";
	import avatarRealmy from "$lib/assets/avatars/realmy.jpg";

	const multiplier = 50;

	const credits = [
		{
			name: "nullptr",
			avatar: avatarNullptr,
			url: "https://nullp.tr",
			description: "conversion backend, UI, animations, promotion",
		},
		{
			name: "Realmy",
			avatar: avatarRealmy,
			url: "https://realmy.net",
			description: "idea, UI, branding, operational costs",
		},
	];
</script>

<svelte:head>
	<title>About VERT</title>
	<meta name="title" content="About VERT — VERT.sh" />
	<meta property="og:title" content="About VERT — VERT.sh" />
	<meta property="twitter:title" content="About VERT — VERT.sh" />
</svelte:head>

<div class="text-lg mx-auto max-w-screen-md">
	<h1
		class="font-display text-3xl text-transition"
		style="--delay: {0 * multiplier}ms"
	>
		⁉️ about VERT
	</h1>
	<p class="mt-6 text-transition" style="--delay: {1 * multiplier}ms">
		You know what sucks? File converters! They're usually riddled with ads,
		and take an ungodly amount of time to complete. <b
			>So we made a better one!</b
		>
	</p>
	<p class="mt-4 text-transition" style="--delay: {2 * multiplier}ms">
		VERT is a file converter that's open source, completely ad free, and
		much much faster than you're used to. All the converting is done on your
		device, which makes it both private and very speedy. And it of course
		has a beautiful UI! ✨
	</p>

	<h2
		class="font-display text-3xl mt-12 text-transition"
		style="--delay: {3 * multiplier}ms"
	>
		🖼️ supported formats
	</h2>
	<p class="mt-6 text-transition" style="--delay: {4 * multiplier}ms">
		As of right now, VERT only supports image conversion of most popular
		formats. Don't worry though, as we'll add more options and support for
		more formats in the future!
	</p>

	<h2
		class="font-display text-3xl mt-12 text-transition"
		style="--delay: {5 * multiplier}ms"
	>
		🔗 resources
	</h2>
	<ul class="list-disc list-inside mt-6">
		<li class="text-transition" style="--delay: {6 * multiplier}ms">
			<a
				href="https://github.com/notnullptr/VERT"
				class="text-foreground-highlight hover:underline">Source code</a
			> (hosted on GitHub, licensed under AGPL-3.0)
		</li>

		<li class="text-transition" style="--delay: {7 * multiplier}ms">
			<a
				href="https://discord.gg/8XXZ7TFFrK"
				class="text-foreground-highlight hover:underline"
				>Discord server</a
			> (for chit-chat, suggestions, and support)
		</li>
	</ul>

	<h2
		class="font-display text-3xl mt-12 text-transition"
		style="--delay: {8 * multiplier}ms"
	>
		🎨 credits
	</h2>
	<div class="flex gap-4 mt-8">
		{#each credits as credit, i}
			<div class="hover:scale-105 w-56 transition-transform">
				<div
					class="border-2 credit-transition border-solid border-foreground-muted-alt rounded-2xl overflow-hidden"
					style="--delay: {i * 50 + multiplier * 9}ms;"
				>
					<a class="w-48" href={credit.url} target="_blank">
						<img src={credit.avatar} alt="{credit.name}'s avatar" />
						<div class="text-center py-4 px-2">
							<p class="font-display text-xl">{credit.name}</p>
							<p class="text-sm text-foreground-muted mt-2">
								{credit.description}
							</p>
						</div>
					</a>
				</div>
			</div>
		{/each}
	</div>

	<p
		class="text-foreground-muted text-base mt-10 text-transition"
		style="--delay: {10 * multiplier}ms"
	>
		(obviously inspired by <a
			href="https://cobalt.tools"
			class="hover:underline">cobalt.tools</a
		>)
	</p>
</div>

<style>
	@keyframes credit-transition {
		from {
			opacity: 0;
			transform: translateX(60px);
			filter: blur(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}

	@keyframes text-transition {
		from {
			opacity: 0;
			transform: translateY(60px);
			filter: blur(18px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
			filter: blur(0);
		}
	}

	.credit-transition {
		animation: credit-transition 750ms var(--transition) var(--delay)
			forwards;
		opacity: 0;
	}

	.text-transition {
		animation: text-transition 750ms var(--transition) var(--delay) forwards;
		opacity: 0;
	}
</style>
