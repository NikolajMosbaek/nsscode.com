<script lang="ts">
let { rating, size = 15 }: { rating: number; size?: number } = $props();

const width = $derived(Math.max(0, Math.min(100, (rating / 5) * 100)));
const label = $derived(`Rated ${rating} out of 5`);
</script>

<span
  role="img"
  aria-label={label}
  title={label}
  class="relative inline-block align-middle leading-none tracking-[0.06em] select-none"
  style="font-size: {size}px"
>
  <span class="text-line-soft">★★★★★</span>
  <span
    class="text-accent absolute inset-y-0 left-0 overflow-hidden whitespace-nowrap"
    style="width: {width}%"
    aria-hidden="true">★★★★★</span
  >
</span>
