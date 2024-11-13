import type { EasingFunction, TransitionConfig } from "svelte/transition";
import type { AnimationConfig, FlipParams } from "svelte/animate";
import { cubicOut } from "svelte/easing";

export const transition =
	"linear(0,0.006,0.025 2.8%,0.101 6.1%,0.539 18.9%,0.721 25.3%,0.849 31.5%,0.937 38.1%,0.968 41.8%,0.991 45.7%,1.006 50.1%,1.015 55%,1.017 63.9%,1.001)";

export const duration = 500;

const remap = (
	value: number,
	low1: number,
	high1: number,
	low2: number,
	high2: number,
) => low2 + ((high2 - low2) * (value - low1)) / (high1 - low1);

const choose = (
	direction: "in" | "out" | "both",
	defaultValue: number,
	inValue?: number,
	outValue?: number,
) =>
	direction !== "out"
		? typeof inValue === "number"
			? inValue
			: defaultValue
		: typeof outValue === "number"
			? outValue
			: defaultValue;

type Combination<T extends string, U extends string> = `${T} ${U}`;

export const blur = (
	_: HTMLElement,
	config:
		| Partial<{
				blurMultiplier: number;
				duration: number;
				easing: EasingFunction;
				scale: {
					start: number;
					end: number;
				};
				x: {
					start: number;
					end: number;
				};
				y: {
					start: number;
					end: number;
				};
				delay: number;
				opacity: boolean;
				origin: Combination<
					"top" | "bottom" | "left" | "right" | "center",
					"top" | "bottom" | "left" | "right" | "center"
				>;
		  }>
		| undefined,
	dir: {
		direction: "in" | "out" | "both";
	},
): TransitionConfig => {
	const prefersReducedMotion = window.matchMedia(
		"(prefers-reduced-motion: reduce)",
	).matches;
	if (typeof config?.opacity === "undefined" && config) config.opacity = true;
	const isUsingTranslate = !!config?.x || !!config?.y || !!config?.scale;
	return {
		delay: config?.delay || 0,
		duration: prefersReducedMotion ? 0 : config?.duration || 300,
		css: (t) => {
			if (prefersReducedMotion) return "";
			const translate = isUsingTranslate
				? `translate(${remap(
						t,
						0,
						1,
						choose(
							dir.direction,
							0,
							config?.x?.start,
							config?.x?.end,
						),
						choose(
							dir.direction,
							0,
							config?.x?.end,
							config?.x?.start,
						),
					)}px, ${remap(
						t,
						0,
						1,
						choose(
							dir.direction,
							0,
							config?.y?.start,
							config?.y?.end,
						),
						choose(
							dir.direction,
							0,
							config?.y?.end,
							config?.y?.start,
						),
					)}px) scale(${remap(
						t,
						0,
						1,
						choose(
							dir.direction,
							0.9,
							config?.scale?.start,
							config?.scale?.end,
						),
						choose(
							dir.direction,
							1,
							config?.scale?.end,
							config?.scale?.start,
						),
					)})`
				: ``;
			return `filter: blur(${(1 - t) * (config?.blurMultiplier || 1)}px); opacity: ${config?.opacity ? t : 1}; transform: ${
				translate
			}; ${config?.origin ? `transform-origin: ${config.origin};` : ""}`;
		},
		easing: config?.easing,
	};
};

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
export function is_function(thing: unknown): thing is Function {
	return typeof thing === "function";
}

type Params = FlipParams & {};

/**
 * The flip function calculates the start and end position of an element and animates between them, translating the x and y values.
 * `flip` stands for [First, Last, Invert, Play](https://aerotwist.com/blog/flip-your-animations/).
 *
 * https://svelte.dev/docs/svelte-animate#flip
 */
export function flip(
	node: HTMLElement,
	{ from, to }: { from: DOMRect; to: DOMRect },
	params: Params = {},
): AnimationConfig {
	const style = getComputedStyle(node);
	const transform = style.transform === "none" ? "" : style.transform;
	const [ox, oy] = style.transformOrigin.split(" ").map(parseFloat);
	const dx = from.left + (from.width * ox) / to.width - (to.left + ox);
	const dy = from.top + (from.height * oy) / to.height - (to.top + oy);
	const {
		delay = 0,
		duration = (d) => Math.sqrt(d) * 120,
		easing = cubicOut,
	} = params;
	return {
		delay,
		duration: is_function(duration)
			? duration(Math.sqrt(dx * dx + dy * dy))
			: duration,
		easing,
		css: (t, u) => {
			const x = u * dx;
			const y = u * dy;
			// const sx = scale ? t + (u * from.width) / to.width : 1;
			// const sy = scale ? t + (u * from.height) / to.height : 1;
			return `transform: ${transform} translate(${x}px, ${y}px);`;
		},
	};
}
