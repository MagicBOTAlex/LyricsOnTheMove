<script lang="ts">
  import { goto } from "$app/navigation";
  import { onDestroy, onMount } from "svelte";
  import { PencilLine, RefreshCcw } from "@lucide/svelte";
  import { api } from "../ts/api";
  import type { CurrentSong } from "../ts/apiObjects/CurrentSong";

  let username: string | null = null;
  let password: string | null = null;
  let lyricsUrl: string | null = null;
  let nowPlayingUrl: string | null = null;
  let fontsize: string = "";

  let credentialsReady = false;

  // Songs info area
  const checkDelay = 500;
  const checkInterval = 3000;
  let currentSong: CurrentSong | undefined = undefined;
  let nextSongChecker: number | undefined = undefined; // Interval used to auto refresh
  let songCheckIntervalRoutine: number | undefined = undefined;

  async function registerNewSong(newSong: CurrentSong) {
    // const currentTimestamp = Date.now()
    currentSong = newSong;
    const timeLeft = newSong.duration.ms - newSong.progress.ms;
    nextSongChecker = setTimeout(async () => {
      onRefresh();
    }, timeLeft + checkDelay);
  }

  async function onRefresh() {
    const fetchedSong = await api.GetCurrentSong();
    if (currentSong?.track_id != fetchedSong.track_id) {
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
      songCheckIntervalRoutine = setInterval(() => {
        onRefresh();
      }, checkInterval);
    }
  });

  onDestroy(() => {
    clearInterval(checkInterval);
    clearTimeout(nextSongChecker);
  });
</script>

<div class="forced-simplified flex w-full min-h-full justify-end">
  <div
    class="bg-black w-full min-h-full flex justify-center items-center forced-simplified"
    style="font-size: {fontsize};"
  >
    test
  </div>
  <div class="p-2 flex flex-col gap-2">
    <a href="/login" class="btn btn-square"><PencilLine /></a>
    <button on:click={onRefresh} class="btn btn-square"><RefreshCcw /></button>
  </div>
</div>
