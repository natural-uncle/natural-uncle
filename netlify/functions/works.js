// netlify/functions/works.js
// Uses Node 18+ global fetch. No external deps.
export async function handler(event) {
  try {
    const cloud = process.env.CLOUDINARY_CLOUD_NAME;
    const key = process.env.CLOUDINARY_API_KEY;
    const secret = process.env.CLOUDINARY_API_SECRET;

    if (!cloud || !key || !secret) {
      return { statusCode: 500, body: JSON.stringify({ error: "Cloudinary env missing" }) };
    }

    const params = new URLSearchParams(event.queryStringParameters || {});
    const folder = params.get("folder") || "collages"; // e.g., works/collages
    const perPage = parseInt(params.get("perPage") || "3", 10);
    const nextCursor = params.get("next") || null;

    const body = {
      expression: `resource_type:image AND folder=${folder}`,
      sort_by: [{ uploaded_at: "desc" }],
      max_results: perPage
    };
    if (nextCursor) body.next_cursor = nextCursor;

    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloud}/resources/search`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": "Basic " + Buffer.from(`${key}:${secret}`).toString("base64")
      },
      body: JSON.stringify(body)
    });

    if (!res.ok) {
      const txt = await res.text();
      return { statusCode: 500, body: JSON.stringify({ error: txt }) };
    }

    const data = await res.json();
    let items = (data.resources || []).map(r => ({
      id: r.public_id,
      thumb: `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_480/${r.public_id}.${r.format}`,
      full:  `https://res.cloudinary.com/${cloud}/image/upload/f_auto,q_auto,w_1600/${r.public_id}.${r.format}`,
      uploaded_at: r.created_at,
      tags: r.tags || [],
      folder: r.folder || ""
    }));

    
    // Randomize order and limit to perPage on each request
    if (Array.isArray(items)) {
      items = items.sort(() => Math.random() - 0.5).slice(0, perPage);
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json", "Cache-Control": "public, max-age=60" },
      body: JSON.stringify({ items, next: data.next_cursor || null })
    };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
}
