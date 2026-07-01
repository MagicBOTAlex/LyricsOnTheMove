import { CurrentSong } from "./apiObjects/CurrentSong";
import { SongLyrics } from "./apiObjects/SongLyrics";

function GenerateHeaders(method: string): RequestInit {
  const u = localStorage.getItem("username") || "";
  const p = localStorage.getItem("password") || "";

  // btoa-safe for unicode
  const creds = `${u}:${p}`;
  const ascii = new TextDecoder().decode(new TextEncoder().encode(creds));
  const auth = "Basic " + btoa(ascii);

  return {
    method: method,
    mode: "cors",
    // you don't need cookies; you're sending Authorization explicitly
    credentials: "omit",
    headers: {
      Authorization: auth,
      Accept: "application/json",
      // no Content-Type on GET
    },
    cache: "no-store",
  };
}

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

function extractSpotifyId(uri: string): string {
  const parts = uri.split(":");
  return parts.length === 3 ? parts[2] : "";
}

// Helper: pulls out the real JSON even if PHP notices are printed first
function extractJsonPayload(body: string): string {
  // If <br> tags are present, the third segment is the JSON
  if (body.includes("<br")) {
    const parts = body
      .split(/<br\s*\/?>/i) // handle <br> or <br />
      .map((s) => s.trim())
      .filter(Boolean);

    if (parts.length >= 3) {
      // Strip any leftover tags, just in case
      return parts[2].replace(/<[^>]*>/g, "").trim();
    }
  }

  // Fallback: strip tags and take the first {...} block we can find
  const stripped = body.replace(/<[^>]*>/g, "");
  const start = stripped.indexOf("{");
  const end = stripped.lastIndexOf("}");
  if (start !== -1 && end > start) {
    return stripped.slice(start, end + 1).trim();
  }

  throw new Error("Could not find JSON in the response.");
}

export class api {
  static async GetCurrentSong(): Promise<CurrentSong | undefined> {
    let response;
    try {
      response = await fetch(
        trimTrailingSlash(localStorage.getItem("nowPlayingUrl")!) +
          "/playback/current",
        GenerateHeaders("GET"),
      );
    } catch {}

    if (!response) {
      return;
    }

    if (!response.ok) {
      console.warn(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return new CurrentSong(data);
  }

  static async GetSongLyric(
    song: CurrentSong,
  ): Promise<SongLyrics | undefined> {
    const url =
      `${trimTrailingSlash(localStorage.getItem("lyricsUrl")!)}` +
      `?trackid=${encodeURIComponent(extractSpotifyId(song.track_uri))}`;

    let response;
    try {
      response = await fetch(url, GenerateHeaders("GET"));
    } catch {}
    if (!response) {
      return;
    }
    if (!response.ok) {
      console.warn(`HTTP error! Status: ${response.status}`);
    }

    // Read as text first (do not use response.json())
    const body = await response.text();

    // If it's clean JSON, parse directly; otherwise fix it
    let data: unknown;
    try {
      data = JSON.parse(body);
    } catch {
      const jsonText = extractJsonPayload(body);
      data = JSON.parse(jsonText);
    }

    return new SongLyrics(data as any);
  }
}
