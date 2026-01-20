<script lang="ts">
  import { onMount } from "svelte";
  import { regex, s } from "../ts/translator";
  import pinyin from "pinyin";

  export let line = "";
  let isReady = false;

  onMount(() => {
    line = line.replace(regex, (matched: string) => s.get(matched));
    isReady = true;
  });
</script>

<div class="flex">
  {#if isReady}
    {#each line as char}
      {@const pin = pinyin(char)[0][0]}
      <div class="grid justify-center">
        <div class="">{char}</div>
        <div class="text-center" style="top-margin: 1rem; font-size: 1.5rem;">
          {#if char == " "}
            &nbsp &nbsp
          {/if}
          {#if char != pin}
            {pin}
          {/if}
        </div>
      </div>
    {/each}
  {/if}
</div>
