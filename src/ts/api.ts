import { CurrentSong } from "./apiObjects/CurrentSong";

function GenerateHeaders(): any {
  return {
    method: "GET",
    headers: {
      Authorization:
        "Basic " +
        btoa(
          `${localStorage.getItem("username")}:${localStorage.getItem("password")}`,
        ),
      "Content-Type": "application/json",
    },
  };
}

function trimTrailingSlash(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}

export class api {
  static async GetCurrentSong(): Promise<CurrentSong> {
    const response = await fetch(
      trimTrailingSlash(localStorage.getItem("nowPlayingUrl")!) +
        "/playback/current",
      GenerateHeaders(),
    );

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();
    return new CurrentSong(data);
  }
}
