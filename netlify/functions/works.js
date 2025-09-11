// netlify/functions/works.js
import fetch from "node-fetch";

export async function handler(event) {
  const cloud = process.env.CLOUDINARY_CLOUD_NAME;
  const key = process.env.CLOUDINARY_API_KEY;
  const secret = process.env.CLOUDINARY_API_SECRET;

  const params = new URLSearchParams(event.queryStringParameters || {});
  const tag = params.get("tag") || "works-collage";
  const page = parseInt(params.get("page") || "1", 10);
  const perPage = parseInt(params.get("perPage") || "24", 10);
  const nextCursor = params.get("next") || null;

  // Cloudinary Search API（需要 Basic Auth）
  const body = {
    expression: `tags=${tag}`,
    sort_by: [{ uploaded_at: "desc" }],
    max_results: perPage,
  };
  if (nextCursor) body.next_cursor = nextCursor;

  const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/resources/search`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Basic " + Buffer.from(`${key}:${secret}`).toString("base64"),
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const txt = await res.text();
    return { statusCode: 500, body: JSON.stringify({ error: txt }) };
  }

  const data = await res.json();
  // 將結果轉為前端好用的最小欄位
  const items = (data.resources || []).map(r => ({
    id: r.public_id,
    w: r.width,
    h: r.height,
    // 縮圖：w_480，自動格式與品質
    thumb: `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_480/${r.public_id}.${r.format}`,
    // 大圖：w_1600
    full: `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_1600/${r.public_id}.${r.format}`,
    tags: r.tags || [],
    uploaded_at: r.created_at,
  }));

  return {
    statusCode: 200,
    headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
    body: JSON.stringify({ items, next: data.next_cursor || null }),
  };
}
