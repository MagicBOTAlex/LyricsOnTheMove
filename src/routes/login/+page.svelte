<!-- Form.svelte -->
<script lang="ts">
  import { goto } from "$app/navigation";
  import { onMount } from "svelte";
  import { flip } from "svelte/animate";

  type FieldName = "username" | "password" | "lyricsUrl" | "nowPlayingUrl";

  let username: string = "";
  let password: string = "";
  let lyricsUrl: string = "https://lyrics.deprived.dev";
  let nowPlayingUrl: string = "https://spotify.playing.deprived.dev";
  let fontsize: string = "";
  let flipX = false;
  let flipY = false;

  let saving: boolean = false;
  let notice: string = "";
  let errors: Partial<Record<FieldName, string>> = {};

  function validate(): boolean {
    const next: Partial<Record<FieldName, string>> = {};

    if (!username.trim()) next.username = "Username is required.";
    if (!password) next.password = "Password is required.";

    const checkUrl = (key: FieldName, val: string, label: string) => {
      if (!val) {
        next[key] = `${label} is required.`;
        return;
      }
      try {
        // Will throw if invalid
        new URL(val);
      } catch {
        next[key] = `${label} must be a valid URL.`;
      }
    };

    checkUrl("lyricsUrl", lyricsUrl, "Spotify Lyrics API URL");
    checkUrl("nowPlayingUrl", nowPlayingUrl, "Spotify Now Playing URL");

    errors = next;
    return Object.keys(next).length === 0;
  }

  async function onSubmit(e: SubmitEvent) {
    e.preventDefault();
    notice = "";

    if (!validate()) return;

    saving = true;
    try {
      // Saving
      localStorage.setItem("username", username);
      localStorage.setItem("password", password);
      localStorage.setItem("lyricsUrl", lyricsUrl);
      localStorage.setItem("nowPlayingUrl", nowPlayingUrl);
      localStorage.setItem("font-size", fontsize ?? "4rem");
      localStorage.setItem("flipX", flipX.toString());
      localStorage.setItem("flipY", flipY.toString());
      notice = "Saved settings.";

      setTimeout(() => {
        goto("/");
      }, 1000);
    } catch {
      notice = "Something went wrong.";
    } finally {
      saving = false;
    }
  }

  onMount(() => {
    username = localStorage.getItem("username") ?? "";
    password = localStorage.getItem("password") ?? "";
    lyricsUrl = localStorage.getItem("lyricsUrl") ?? lyricsUrl;
    nowPlayingUrl = localStorage.getItem("nowPlayingUrl") ?? nowPlayingUrl;
    fontsize = localStorage.getItem("font-size") ?? "";
  });
</script>

<div class="flex min-h-full w-full flex-col items-center justify-center">
  <form class="max-w-xl mx-auto p-6" on:submit={onSubmit}>
    <div class="card bg-base-100 shadow-md">
      <div class="card-body">
        <h2 class="card-title">Spotify widget settings</h2>

        <!-- Username -->
        <div class="form-control">
          <label class="label" for="username">
            <span class="label-text">Username</span>
          </label>
          <input
            id="username"
            name="username"
            type="text"
            class="input input-bordered w-full"
            bind:value={username}
            autocomplete="username"
            placeholder="yourname"
            aria-invalid={errors.username ? "true" : "false"}
            aria-describedby="username-error"
            required
          />
          {#if errors.username}
            <label id="username-error" class="label">
              <span class="label-text-alt text-error">{errors.username}</span>
            </label>
          {/if}
        </div>

        <!-- Password -->
        <div class="form-control">
          <label class="label" for="password">
            <span class="label-text">Password</span>
          </label>
          <input
            id="password"
            name="password"
            type="password"
            class="input input-bordered w-full"
            bind:value={password}
            autocomplete="current-password"
            placeholder="••••••••"
            aria-invalid={errors.password ? "true" : "false"}
            aria-describedby="password-error"
            required
          />
          {#if errors.password}
            <label id="password-error" class="label">
              <span class="label-text-alt text-error">{errors.password}</span>
            </label>
          {/if}
        </div>

        <!-- Spotify Lyrics API URL -->
        <div class="form-control">
          <label class="label" for="lyricsUrl">
            <span class="label-text">Spotify Lyrics API URL</span>
          </label>
          <input
            id="lyricsUrl"
            name="lyricsUrl"
            type="url"
            class="input input-bordered w-full"
            bind:value={lyricsUrl}
            placeholder="https://your-service.example.com/lyrics"
            aria-invalid={errors.lyricsUrl ? "true" : "false"}
            aria-describedby="lyricsUrl-error"
            required
          />
          {#if errors.lyricsUrl}
            <label id="lyricsUrl-error" class="label">
              <span class="label-text-alt text-error">{errors.lyricsUrl}</span>
            </label>
          {/if}
        </div>

        <!-- Spotify Now Playing URL -->
        <div class="form-control">
          <label class="label" for="nowPlayingUrl">
            <span class="label-text">Spotify Now Playing URL</span>
          </label>
          <input
            id="nowPlayingUrl"
            name="nowPlayingUrl"
            type="url"
            class="input input-bordered w-full"
            bind:value={nowPlayingUrl}
            placeholder="https://your-service.example.com/now-playing"
            aria-invalid={errors.nowPlayingUrl ? "true" : "false"}
            aria-describedby="nowPlayingUrl-error"
            required
          />
          {#if errors.nowPlayingUrl}
            <label id="nowPlayingUrl-error" class="label">
              <span class="label-text-alt text-error"
                >{errors.nowPlayingUrl}</span
              >
            </label>
          {/if}
        </div>

        <!-- Font size -->
        <div class="form-control">
          <label class="label" for="nowPlayingUrl">
            <span class="label-text">Font size</span>
          </label>
          <input
            id="fontsize"
            name="fontsize"
            class="input input-bordered w-full"
            bind:value={fontsize}
            placeholder="4rem"
          />
        </div>

        <div class="flex flex-col gap-1 w-full">
          <div class=" flex w-full">
            <span class="pr-2">Flip X</span>
            <input
              name="Flip"
              type="checkbox"
              class="checkbox rounded"
              bind:checked={flipX}
            />
          </div>
          <div class=" flex w-full">
            <span class="pr-2">Flip Y</span>
            <input
              name="Flip"
              type="checkbox"
              class="checkbox rounded"
              bind:checked={flipY}
            />
          </div>
        </div>

        <!-- Actions -->
        <div class="card-actions justify-end mt-4">
          <button class="btn btn-secondary" type="submit" disabled={saving}>
            {#if saving}
              <span class="loading loading-spinner" aria-hidden="true"></span>
              Saving…
            {:else}
              Save
            {/if}
          </button>
        </div>

        {#if notice}
          <div
            class="alert mt-4"
            class:alert-success={notice === "Saved settings."}
            class:alert-error={notice !== "Saved settings."}
          >
            <span>{notice}</span>
          </div>
        {/if}
      </div>
    </div>
  </form>
</div>
