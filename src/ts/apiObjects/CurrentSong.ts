type Progress = {
  ms: number;
  seconds: number;
  mmss: string;
};

type Duration = {
  ms: number;
  seconds: number;
  mmss: string;
};

export class CurrentSong {
  track_id: string;
  track_uri: string;
  song: string;
  name: string;
  artists: string[];
  progress: Progress;
  duration: Duration;
  is_playing: boolean;

  constructor(data: {
    track_id: string;
    track_uri: string;
    song: string;
    name: string;
    artists: string[];
    progress: Progress;
    duration: Duration;
    is_playing: boolean;
  }) {
    this.track_id = data.track_id;
    this.track_uri = data.track_uri;
    this.song = data.song;
    this.name = data.name;
    this.artists = data.artists;
    this.progress = data.progress;
    this.duration = data.duration;
    this.is_playing = data.is_playing;
  }
}
