<script lang="ts">
  import { goto } from "$app/navigation";
  import { onDestroy, onMount } from "svelte";
  import { PencilLine, RefreshCcw } from "@lucide/svelte";
  import { api } from "../ts/api";
  import type { CurrentSong } from "../ts/apiObjects/CurrentSong";
  import type { SongLyrics } from "../ts/apiObjects/SongLyrics";

  let username: string | null = null;
  let password: string | null = null;
  let lyricsUrl: string | null = null;
  let nowPlayingUrl: string | null = null;
  let fontsize: string = "";

  let credentialsReady = false;

  // Songs info area
  const checkDelay = 500;
  const checkInterval = 5000;
  let currentSong: CurrentSong | undefined = undefined;
  let nextSongChecker: number | undefined = undefined; // Interval used to auto refresh
  let songCheckIntervalRoutine: number | undefined = undefined;
  let currentSongLyrics: SongLyrics | undefined = undefined;

  const lyricStepInterval = 100;
  let lyricUpdater: number | undefined = undefined;
  let currentTimestamp = -1;
  let songStartTime: number = 0;
  let songProgress: number = 0;

  async function registerNewSong(newSong: CurrentSong) {
    // const currentTimestamp = Date.now()
    currentSong = newSong;
    const timeLeft = newSong.duration.ms - newSong.progress.ms;
    nextSongChecker = setTimeout(async () => {
      console.log("Song finished. Checking for next song");
      onRefresh();
    }, timeLeft + checkDelay);

    currentTimestamp = Date.now();
    songStartTime = currentTimestamp - currentSong.progress.ms;

    currentSongLyrics = await api.GetSongLyric(currentSong); // Update lyrics
    // console.log(currentSongLyrics);
  }

  async function onRefresh(forced: boolean = false) {
    const fetchedSong = await api.GetCurrentSong();
    if (currentSong?.track_id != fetchedSong.track_id || forced) {
      registerNewSong(fetchedSong);
      console.log("New song found: " + fetchedSong.name);
    }
  }

  onMount(() => {
    username = localStorage.getItem("username");
    password = localStorage.getItem("password");
    lyricsUrl = localStorage.getItem("lyricsUrl");
    nowPlayingUrl = localStorage.getItem("nowPlayingUrl");
    fontsize = localStorage.getItem("font-size") || "4rem";
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
      songCheckIntervalRoutine = setInterval(() => {
        onRefresh();
      }, checkInterval);
      lyricUpdater = setInterval(() => {
        currentTimestamp = Date.now();
        songProgress = currentTimestamp - songStartTime;
        // console.log(songProgress);
      }, lyricStepInterval);
    }
  });

  onDestroy(() => {
    clearInterval(checkInterval);
    clearInterval(lyricUpdater);
    clearTimeout(nextSongChecker);
  });
</script>

<div class="forced-simplified flex w-full min-h-full justify-end">
  <div
    class="bg-black w-full max-h-screen forced-simplified overflow-y-scroll"
    style="font-size: {fontsize};"
  >
    <div class="w-full flex flex-col justify-center items-center">
      {#if currentSongLyrics != undefined}
        {#each currentSongLyrics?.lines as line, i}
          <span
            class="{line.endTime < songProgress
              ? 'opacity-50'
              : ''} {line.startTime < songProgress &&
            songProgress < line.endTime
              ? 'text-white'
              : ''}">{line.words}</span
          >
        {/each}
      {:else}
        <span>Nothing loaded yet...</span>
      {/if}
    </div>
  </div>
  <div class="p-2 flex flex-col gap-2">
    <a href="/login" class="btn btn-square"><PencilLine /></a>
    <button
      on:click={() => {
        onRefresh(true);
      }}
      class="btn btn-square"><RefreshCcw /></button
    >
    <div>{songProgress}</div>
  </div>
</div>
