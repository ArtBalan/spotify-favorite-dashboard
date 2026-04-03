# Spotify Favorite Dashboard

A small dashboard that visualizes your favorite Spotify tracks, artists, and listening habits.

- [Spotify Favorite Dashboard](#spotify-favorite-dashboard)
  - [Disclaimer](#disclaimer)
  - [About](#about)
    - [Overview Page](#overview-page)
    - [Artists Page](#artists-page)
    - [Genres Page](#genres-page)
    - [Popularity Page](#popularity-page)
    - [Duration Page](#duration-page)
    - [Years Page](#years-page)
    - [Per Years Page](#per-years-page)
    - [Activity Page](#activity-page)
    - [Discovery Page](#discovery-page)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Create Spotify API Credentials](#create-spotify-api-credentials)
  - [Environment Variables](#environment-variables)
  - [Fetch Your Spotify Data](#fetch-your-spotify-data)
  - [A variable called `FETCH_PLAYLIST` can be set to true if you want the script to fetch all your playlist and not juste the liked one.](#a-variable-called-fetch_playlist-can-be-set-to-true-if-you-want-the-script-to-fetch-all-your-playlist-and-not-juste-the-liked-one)
  - [Run the App](#run-the-app)


## Disclaimer

This project was "vibe coded" as a crash test for Claude AI (and a bit of chatGPT), with only small human intervention.

The goal was to quickly explore how far an AI-assisted workflow could go when building a complete application with minimal manual planning. Some parts of the codebase may be experimental, inconsistent, or not production-ready.

This app exists primarily as a fun experiment and proof of concept.

## About

### Overview Page

The `OverviewPage` displays a quick summary of the music dataset.
The page includes:
* Total number of songs
* Number of unique artists
* Average popularity score
* Count of explicit songs
* Total listening hours

### Artists Page

The `ArtistsPage` shows the most-played artists from the track dataset.

The table can be sorted by:
* Rank
* Artist name
* Number of songs

Clicking an artist selects them and displays their songs in the `SongsTable` component.

The page uses a two-column layout: the artist list on the left and the selected artist’s tracks on the right.

### Genres Page

The `GenresPage` displays statistics for each music genre in the dataset.

The table can be sorted by:
* Genre name
* Number of songs
* Share of total songs
* Average popularity
* Explicit song percentage

Each genre row also includes a progress bar showing its share of the total dataset.

Clicking a genre selects it and displays its songs in the `SongsTable` component.

The page uses a two-column layout with the genre list on the left and the selected genre’s songs on the right.

### Popularity Page

The `PopularityPage` analyzes songs based on their Spotify popularity score.

It loads all tracks and groups them into four popularity categories:
* Hits (80+)
* Popular (60–79)
* Mid (40–59)
* Niche (<40)

These categories are displayed in a bar chart.

The page also highlights:
* The 10 most mainstream songs
* The 10 most niche songs

### Duration Page

The `DurationPage` analyzes the length of songs in the dataset.

The page displays:
* Average song length
* Total listening time
* The shortest song
* The longest song

It also groups songs into duration ranges:
* Under 2 minutes
* 2–3 minutes
* 3–4 minutes
* 4–5 minutes
* 5–10 minutes
* Over 10 minutes

### Years Page

The `YearsPage` analyzes the release years of songs in the dataset.

It loads all tracks, extracts the release year from each song, and counts how many songs were released each year.

The page highlights:
* The oldest song year
* The newest song year
* The most common release year

For the oldest and newest years, the page also shows an example song and artist.

All release years are visualized in a bar chart, showing how many liked songs come from each year.

### Per Years Page

The `PerYearsPage` displays song statistics grouped by release year.

It loads all tracks with, calculates yearly totals, and displays them in a sortable table.

The table can be sorted by:
* Rank
* Release year
* Number of songs
* Share of total songs

Each row also includes a progress bar showing the percentage of songs from that year.

Clicking a year selects it and displays all songs released in that year using the `SongsTable` component.

### Activity Page

The `ActivityPage` tracks when songs were added to the dataset over time.

It loads all tracks and groups them by day, month, or year. Users can switch between these time ranges and filter for a specific date.

The page displays:
* Total number of liked songs
* Peak activity period
* Average songs added per selected time range
* Longest and current day streaks
* Longest and current week streaks

An area chart visualizes song activity over time, along with the top 3 most common genres.

Clicking a point on the chart opens a modal showing all songs added during that period, including their artist, genre, popularity, and Spotify link.

### Discovery Page

The `DiscoveryPage` compares when songs were released to when they were added to your library.

It loads track data and calculates how many years passed between each song’s release date and the date it was added.

The page highlights:
* Average age of songs when added
* Songs added immediately after release
* Songs discovered 5 or more years later

A scatter chart visualizes release year versus added year, with colors showing how long it took to discover each song.

The page also includes a table of the 10 biggest late discoveries, with direct Spotify links for each track.

## Prerequisites

Before starting, make sure you have:

* Node.js 18+ installed
* npm installed
* A Spotify account

You can check your versions with:

```bash
node -v
npm -v
```

---

## Installation

Clone the project and install dependencies:

```bash
npm install
```

---

## Create Spotify API Credentials

The app requires a Spotify Client ID and Client Secret.

1. Open the Spotify Developer Dashboard:
   [https://developer.spotify.com/dashboard](https://developer.spotify.com/dashboard)
2. Sign in with your Spotify account.
3. Click **Create App**.
4. Fill in:

   * App name: anything you want
   * App description: optional
5. Accept the terms and create the app.
6. Open the app you created.
7. In the app settings, copy:

   * **Client ID**
   * **Client Secret**

To reveal the Client Secret, click **View client secret**.

---

## Environment Variables

Create a `.env` file in the root of the project:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

---

## Fetch Your Spotify Data

Before launching the dashboard for the first time, run:

```bash
npx ts-node src/scripts/fetchSpotify.ts
```

This script uses your Spotify credentials to fetch the data required by the dashboard.
A authentification link will be prompted, clic on it to allow the api to work properly.

A variable called `FETCH_PLAYLIST` can be set to true if you want the script to fetch all your playlist and not juste the liked one.
---

## Run the App

Start the development server:

```bash
npm run dev
```

Then open:

```text
http://localhost:5173
```
