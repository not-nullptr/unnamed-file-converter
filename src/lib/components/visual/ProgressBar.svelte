<script lang="ts">
	type Props = {
		progress: number;
		min: number;
		max: number;
	};

	let { progress, min, max }: Props = $props();

	const percent = $derived(((progress - min) / (max - min)) * 100);
</script>

<div
	class="w-full h-1 dynadark:bg-foreground-muted-alt bg-foreground-muted rounded-full overflow-hidden"
>
	<div
		class="h-full bg-accent-background dynadark:bg-accent-foreground"
		style="width: {percent}%; transition: 500ms linear width;"
	></div>
</div>
