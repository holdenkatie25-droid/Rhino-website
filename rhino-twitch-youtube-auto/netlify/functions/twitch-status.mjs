let cachedToken = null;
let tokenExpiresAt = 0;

async function getAppToken(clientId, clientSecret) {
  if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials"
  });

  const response = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body
  });

  if (!response.ok) throw new Error("Twitch token request failed");
  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiresAt = Date.now() + Math.max(60, data.expires_in - 300) * 1000;
  return cachedToken;
}

export default async () => {
  const clientId = process.env.TWITCH_CLIENT_ID;
  const clientSecret = process.env.TWITCH_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    return Response.json({ error: "Twitch app credentials are not configured." }, { status: 503 });
  }

  try {
    const token = await getAppToken(clientId, clientSecret);
    const response = await fetch(
      "https://api.twitch.tv/helix/streams?user_login=rhino109h",
      { headers: { "Client-Id": clientId, "Authorization": `Bearer ${token}` } }
    );

    if (!response.ok) throw new Error("Twitch stream lookup failed");
    const result = await response.json();
    const stream = result.data?.[0];

    return Response.json({
      isLive: Boolean(stream),
      title: stream?.title ?? null,
      gameName: stream?.game_name ?? null,
      viewerCount: stream?.viewer_count ?? null,
      startedAt: stream?.started_at ?? null
    }, {
      headers: { "Cache-Control": "no-store" }
    });
  } catch (error) {
    return Response.json({ error: "Could not check Twitch status." }, { status: 502 });
  }
};
