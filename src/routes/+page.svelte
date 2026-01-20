<script lang="ts">
  import { goto } from "$app/navigation";
  import { onDestroy, onMount, tick } from "svelte";
  import { PencilLine, RefreshCcw, Pause } from "@lucide/svelte";
  import { api } from "../ts/api";
  import type { CurrentSong } from "../ts/apiObjects/CurrentSong";
  import type { SongLyrics } from "../ts/apiObjects/SongLyrics";
  import CSentence from "./CSentence.svelte";

  let username: string | null = null;
  let password: string | null = null;
  let lyricsUrl: string | null = null;
  let nowPlayingUrl: string | null = null;
  let fontsize: string = "";
  let flipX = false;
  let flipY = false;
  let chinaMode = false;

  let credentialsReady = false;

  // Songs info area
  const checkDelay = 500;
  const checkInterval = 3000;
  let currentSong: CurrentSong | undefined = undefined;
  let nextSongChecker: number | undefined = undefined; // Interval used to auto refresh
  let songCheckIntervalRoutine: number | undefined = undefined;
  let currentSongLyrics: SongLyrics | undefined = undefined;

  const lyricStepInterval = 100;
  let lyricUpdater: number | undefined = undefined;
  let currentTimestamp = -1;
  let songStartTime: number = 0;
  let songProgress: number = 0;
  // refs for each lyric line + active index
  let lineEls: HTMLSpanElement[] = [];
  let activeIndex = -1;
  let isPaused = false;

  async function registerNewSong(
    newSong: CurrentSong,
    noUpdateLyrics: boolean = false,
  ) {
    // const currentTimestamp = Date.now()
    currentSong = newSong;
    const timeLeft = newSong.duration.ms - newSong.progress.ms;
    nextSongChecker = setTimeout(async () => {
      console.log("Song finished. Checking for next song");
      onRefresh();
    }, timeLeft + checkDelay);

    isPaused = !newSong.is_playing;
    currentTimestamp = Date.now();
    songStartTime = currentTimestamp - currentSong.progress.ms;

    if (!noUpdateLyrics) currentSongLyrics = await api.GetSongLyric(newSong); // Update lyrics
    // console.log(currentSongLyrics);
  }

  // On check of song
  async function onRefresh(forced: boolean = false) {
    const fetchedSong = await api.GetCurrentSong();
    if (!fetchedSong) {
      return;
    }
    if (currentSong?.track_id != fetchedSong.track_id || forced) {
      registerNewSong(fetchedSong);
      console.log("New song found: " + fetchedSong.name);
      const el = lineEls[0];
      el?.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "nearest",
      });
    } else {
      registerNewSong(fetchedSong, true);
    }
  }

  onMount(() => {
    username = localStorage.getItem("username");
    password = localStorage.getItem("password");
    lyricsUrl = localStorage.getItem("lyricsUrl");
    nowPlayingUrl = localStorage.getItem("nowPlayingUrl");
    fontsize = localStorage.getItem("font-size") || "4rem";
    flipX = localStorage.getItem("flipX") === "true";
    flipY = localStorage.getItem("flipY") === "true";
    chinaMode = localStorage.getItem("china") === "true";
    if (
      username === null ||
      password === null ||
      lyricsUrl === null ||
      nowPlayingUrl === null
    ) {
      goto("/login");
    } else {
      credentialsReady = true;
      onRefresh();

      // Start song checker interval
      songCheckIntervalRoutine = setInterval(() => {
        onRefresh();
      }, checkInterval);

      // Start Lyrics sync
      lyricUpdater = setInterval(() => {
        if (!isPaused) {
          currentTimestamp = Date.now();
        }
        songProgress = currentTimestamp - songStartTime;
      }, lyricStepInterval);
    }
  });

  // Scroll when the active line changes
  async function scrollToActive() {
    await tick(); // make sure DOM is updated
    const el = lineEls[activeIndex];
    el?.scrollIntoView({
      behavior: "smooth",
      block: "center",
      inline: "nearest",
    });
  }
  $: if (activeIndex !== -1) scrollToActive();

  // Recompute active line whenever progress or lyrics change
  $: {
    if (currentSongLyrics) {
      const idx = currentSongLyrics.lines.findIndex(
        (l) => songProgress >= l.startTime && songProgress < l.endTime,
      );
      if (idx !== -1 && idx !== activeIndex) activeIndex = idx;
    }
  }

  onDestroy(() => {
    if (songCheckIntervalRoutine) clearInterval(songCheckIntervalRoutine);
    if (lyricUpdater) clearInterval(lyricUpdater);
    if (nextSongChecker) clearTimeout(nextSongChecker);
  });
</script>

<div class="forced-simplified flex w-full min-h-full justify-end">
  <div
    class="bg-black w-full max-h-screen forced-simplified overflow-y-scroll"
    style="font-size: {fontsize};"
  >
    <div
      class="w-full flex flex-col justify-center items-center {flipX
        ? '-scale-x-100'
        : ''} {flipY ? '-scale-y-100' : ''}"
    >
      {#if currentSongLyrics != undefined}
        {#each currentSongLyrics.lines as line, i}
          <div
            bind:this={lineEls[i]}
            class="block py-2
              {line.endTime < songProgress ? 'opacity-50' : ''}
              {i === activeIndex ? 'text-white font-semibold' : ''}"
          >
            {#if line}
              {#if chinaMode}
                <CSentence line={line.words} />
              {:else}
                {line.words}
              {/if}
            {/if}
          </div>
        {/each}
      {:else}
        <span>Nothing loaded yet...</span>
      {/if}
    </div>
  </div>
  <div class="absolute p-2 flex flex-col gap-2">
    <a
      href="/login"
      class="btn btn-square accent-slate-500 opacity-50 backdrop-blur-xl"
      ><PencilLine /></a
    >
    <button
      on:click={() => {
        onRefresh(true);
      }}
      class="btn btn-square accent-slate-500 opacity-50 backdrop-blur-xl"
      ><RefreshCcw /></button
    >
    <!-- <div>{songProgress}</div> -->
  </div>

  {#if isPaused}
    <Pause class="absolute left-0 m-8 w-16 h-16" />
  {/if}
</div>
