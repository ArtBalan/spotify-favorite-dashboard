# Spotify Favorite Dashboard

A small dashboard that visualizes your favorite Spotify tracks, artists, and listening habits.

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
