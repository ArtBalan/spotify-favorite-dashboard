export interface Track {
  genre: string;
  allGenres: string[];
  genreSource: string;
  title: string;
  artist: string;
  artistURL: string;   
  album: string;
  albumURL: string;
  releaseDate: string;
  duration: string;
  popularity: number;
  explicit: boolean;
  trackNbr: number;
  ISRC: string;
  addedAt: string;
  spotifyURL: string;
  previewURL: string;
}