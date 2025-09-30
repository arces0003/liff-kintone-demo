// Vercel Serverless Function (Node.js 18+)
// リクエスト: { userId: string, sourceType: "utou" | "group" | "room" }
// レスポンス: kintone の API レスポンスをそのまま返却

export default async function handler(req, res) {
  // CORS
  const allowOrigin = process.env.ALLOW_ORIGIN || '*';
  res.setHeader('Access-Control-Allow-Origin', allowOrigin);
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // --- ★ ここで明示的に読み取る ---
    const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    const { userId, sourceType } = body || {};

    if (!userId || !sourceType) {
      return res.status(400).json({ message: 'userId and sourceType are required' });
    }

    const sub = process.env.KINTONE_SUBDOMAIN;
    const appId = Number(process.env.KINTONE_APP_ID);
    const token = process.env.KINTONE_API_TOKEN;
    if (!sub || !appId || !token) {
      return res.status(500).json({ message: 'Server env vars missing' });
    }

    const url = `https://${sub}.cybozu.com/k/v1/record.json`;
    const payload = {
      app: appId,
      record: {
        userId:     { value: userId },
        sourceType: { value: sourceType }
      }
    };

    const kintoneResp = await fetch(url, {
      method: 'POST',
      headers: {
        'X-Cybozu-API-Token': token,
        'Content-Type': 'application/json',
        'X-Requested-With': 'XMLHttpRequest'
      },
      body: JSON.stringify(payload)
    });

    const text = await kintoneResp.text();
    // kintone の結果をそのまま返す（JSON/文字列どちらでもOKに）
    try {
      return res.status(kintoneResp.status).json(JSON.parse(text));
    } catch {
      return res.status(kintoneResp.status).send(text);
    }
  } catch (e) {
    return res.status(500).json({ message: 'Proxy error', detail: String(e) });
  }
}
