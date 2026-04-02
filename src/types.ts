export interface Track {
  spotifyUrl: string | undefined;
  genre: string;
  allGenres: string[];
  genreSource: string;
  title: string;
  artist: string;
  album: string;
  releaseDate: string;
  duration: string;
  popularity: number;
  explicit: boolean;
}