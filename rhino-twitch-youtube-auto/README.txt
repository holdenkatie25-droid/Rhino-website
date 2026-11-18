# Rhino streamer site — automatic Twitch status

This project checks the Twitch channel `rhino109h` using Twitch's official Helix Get Streams API. The page checks once on load and then every 60 seconds.

## 1. Create Twitch app credentials
1. Sign in to the Twitch account that owns the channel.
2. Open https://dev.twitch.tv/console/apps and register an application.
3. For OAuth Redirect URLs, use `http://localhost` (the status checker uses the app-token flow and does not sign users in).
4. Choose a suitable category, then create the app.
5. Copy the Client ID and generate/copy the Client Secret.

Keep the Client Secret private. Do not paste it into `index.html`, a public chat, or a public repository.

## 2. Deploy the whole folder to Netlify
Deploy the project folder (or its ZIP) to Netlify, not just `index.html`, because the serverless function is needed.

## 3. Add two environment variables in Netlify
In your Netlify site, open Project configuration → Environment variables and add:
- `TWITCH_CLIENT_ID` = your Twitch app Client ID
- `TWITCH_CLIENT_SECRET` = your Twitch app Client Secret

Make sure the variables are available to Functions. Then trigger a fresh deploy.

## 4. Test
Open your deployed site. The status should change to LIVE NOW when `rhino109h` is broadcasting, and OFFLINE – BACK SOON when the channel is not live. It refreshes every 60 seconds.

If it says STATUS UNAVAILABLE, check that both environment variables are saved correctly and redeploy.

## Notes
- The Client Secret is only used by the Netlify serverless function, never sent to visitors.
- Twitch's API reports live streams only; it cannot know when you are merely preparing to go live.
- The stream status is checked on page load and every 60 seconds.

## Automatic YouTube live detection

The site can also check whether @Rhino109h is live on YouTube. This uses the YouTube Data API v3 through a Netlify serverless function.

1. Open https://console.cloud.google.com/
2. Create/select a Google Cloud project and enable **YouTube Data API v3**.
3. Create an API key. Restrict the key to YouTube Data API v3. Keep it private and add it only as a Netlify environment variable.
4. In Netlify → Project configuration → Environment variables, add:
   - `YOUTUBE_API_KEY` = your restricted Google API key
5. Redeploy the complete project.

YouTube live status is checked every 30 minutes. This slower interval is intentional because YouTube's `search.list` endpoint has a separate default allowance of 100 calls per day. Twitch continues to be checked every 60 seconds.

The YouTube panel will show LIVE ON YOUTUBE when a public live broadcast is found, and YOUTUBE OFFLINE otherwise. If the API key is missing or the API quota is exhausted, it shows YOUTUBE STATUS UNAVAILABLE.

For a direct live link, the function returns the current YouTube video URL; the page can be enhanced to show an embedded player in a later update.
