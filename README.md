# Spotify Favorite Dashboard

A dashboard that visualizes your favorite Spotify tracks, artists, and listening habits.

- [Spotify Favorite Dashboard](#spotify-favorite-dashboard)
  - [Disclaimer](#disclaimer)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Create Spotify API Credentials](#create-spotify-api-credentials)
  - [Environment Variables](#environment-variables)
  - [Fetch Your Spotify Data](#fetch-your-spotify-data)
  - [Run the App](#run-the-app)
  - [About](#about)
    - [Overview Page](#overview-page)
    - [Library](#library)
      - [Favorites Page](#favorites-page)
      - [Artists Page](#artists-page)
      - [Albums Page](#albums-page)
      - [Genres Page](#genres-page)
    - [Insights](#insights)
      - [Popularity Page](#popularity-page)
      - [Duration Page](#duration-page)
      - [Explicit Page](#explicit-page)
      - [Discovery Page](#discovery-page)
    - [Timeline](#timeline)
      - [Activity Page](#activity-page)
      - [Years Page](#years-page)
      - [Per Years Page](#per-years-page)
      - [Decades Page](#decades-page)

---

## Disclaimer

This project was "vibe coded" as a crash test for Claude AI (and a bit of ChatGPT), with only small human intervention.

The goal was to quickly explore how far an AI-assisted workflow could go when building a complete application with minimal manual planning. Some parts of the codebase may be experimental, inconsistent, or not production-ready.

This app exists primarily as a fun experiment and proof of concept.

---

## Prerequisites

Before starting, make sure you have:

- Node.js 18+ installed
- npm installed
- A Spotify account

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

1. Open the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard)
2. Sign in with your Spotify account
3. Click **Create App** and fill in a name and description
4. Accept the terms and create the app
5. Copy your **Client ID** and **Client Secret** (click *View client secret* to reveal it)

---

## Environment Variables

Create a `.env` file at the root of the project:

```env
SPOTIFY_CLIENT_ID=your_client_id_here
SPOTIFY_CLIENT_SECRET=your_client_secret_here
```

---

## Fetch Your Spotify Data

Run the fetch script before launching the dashboard for the first time:

```bash
npx ts-node src/scripts/fetchSpotify.ts
```

An authentication link will be printed in the terminal — click it to authorize the app.

To also fetch songs from all your playlists (not just liked songs), set the following variable before running the script:

```env
FETCH_PLAYLIST=true
```

---

## Run the App

```bash
npm run dev
```

Then open [http://localhost:5173](http://localhost:5173) in your browser.

---

## About

The navigation bar groups pages into four sections: **Overview**, **Library**, **Insights**, and **Timeline**. Library, Insights, and Timeline are dropdown menus — the active dropdown highlights when one of its child pages is open.

### Overview Page

A quick summary of your entire music dataset:

- Total number of songs
- Number of unique artists
- Average popularity score
- Count of explicit songs
- Total listening hours

---

### Library

#### Favorites Page

A full searchable list of every liked song, sorted by most recently added.

- Search across title, artist, album, and genre
- Paginated (50 songs per page)
- Shows matched count vs. total

#### Artists Page

A ranked list of your most-liked artists.

The table can be sorted by rank, artist name, or song count. Each row includes a **mini sparkline** showing when you added songs from that artist over time — useful for spotting early fans vs. recent discoveries.

Clicking an artist shows:
- The date range over which you added their songs
- An **expanded sparkline** with monthly resolution and year labels
- All their songs in a track table

The list is searchable by artist name.

#### Albums Page

A ranked list of albums you have the most songs from.

The table can be sorted by rank, album name, song count, or release year. Clicking an album shows all its songs in a track table.

#### Genres Page

Statistics for each genre in your library.

The table can be sorted by genre name, song count, share of total songs, average popularity, or explicit percentage. Each row includes a share progress bar.

Clicking a genre shows all its songs in a track table. The list is searchable by genre name.

---

### Insights

#### Popularity Page

Groups your songs into four Spotify popularity tiers:

- **Hits** (80+)
- **Popular** (60–79)
- **Mid** (40–59)
- **Niche** (< 40)

Displayed as a bar chart, with tables for your 10 most mainstream and 10 most niche songs.

#### Duration Page

Analyzes song lengths:

- Average song duration
- Total listening time
- Shortest and longest songs
- Distribution across duration buckets (< 2 min, 2–3 min, 3–4 min, 4–5 min, 5–10 min, 10+ min)

#### Explicit Page

Breaks down explicit vs. clean songs across genres and over time.

#### Discovery Page

Compares when songs were released to when you added them to your library.

Highlights:
- Average age of songs when added
- Songs added immediately after release
- Songs discovered 5+ years later

A scatter chart plots release year vs. added year, color-coded by discovery lag. Also includes a table of your 10 biggest late discoveries.

---

### Timeline

#### Activity Page

Tracks when you added songs over time, grouped by day, month, or year.

Displays:
- Total liked songs
- Peak activity period
- Average songs added per period
- Longest and current day streaks
- Longest and current week streaks

An area chart visualizes activity over time. Clicking a point opens a modal with all songs added during that period.

#### Years Page

Shows how many liked songs were released each year, as a bar chart.

Highlights the oldest year, newest year, and most common release year, each with an example song and artist.

#### Per Years Page

A sortable table of release years with song count and share.

Can be sorted by rank, year, song count, or share. Clicking a year shows all songs from that year in a track table.

#### Decades Page

Like Per Years, but bucketed by decade (1970s, 1980s, etc.).

Each decade row shows song count, share bar, and average popularity. Clicking a decade shows:
- Top 3 artists of that decade (by song count)
- Top 3 songs of that decade (by popularity, with Spotify links)
- Full song table for the decade

---
