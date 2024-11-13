import { FFmpegConverter } from "./ffmpeg.svelte";
import { VipsConverter } from "./vips.svelte";

export const converters = [new VipsConverter(), new FFmpegConverter()];
