let cachedChannelId = null;

export default async () => {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return Response.json({ error: "YouTube API key is not configured." }, { status: 503 });
  }

  try {
    // Resolve the supplied YouTube handle to a channel ID.
    if (!cachedChannelId) {
      const channelUrl = new URL("https://www.googleapis.com/youtube/v3/channels");
      channelUrl.search = new URLSearchParams({
        part: "id",
        forHandle: "Rhino109h",
        key: apiKey
      });
      const channelResponse = await fetch(channelUrl);
      if (!channelResponse.ok) throw new Error("Could not resolve YouTube channel");
      const channelData = await channelResponse.json();
      cachedChannelId = channelData.items?.[0]?.id;
      if (!cachedChannelId) throw new Error("YouTube channel not found for @Rhino109h");
    }

    // Search for a currently live broadcast from this channel.
    const searchUrl = new URL("https://www.googleapis.com/youtube/v3/search");
    searchUrl.search = new URLSearchParams({
      part: "snippet",
      channelId: cachedChannelId,
      eventType: "live",
      type: "video",
      maxResults: "1",
      key: apiKey
    });

    const response = await fetch(searchUrl);
    if (!response.ok) throw new Error("YouTube live lookup failed");
    const result = await response.json();
    const item = result.items?.[0];

    return Response.json({
      isLive: Boolean(item),
      title: item?.snippet?.title ?? null,
      videoId: item?.id?.videoId ?? null,
      watchUrl: item?.id?.videoId
        ? `https://www.youtube.com/watch?v=${item.id.videoId}`
        : null
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return Response.json({ error: "Could not check YouTube live status." }, { status: 502 });
  }
};
