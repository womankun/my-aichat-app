// app/api/chat/route.ts
import { NextRequest } from "next/server";

export const runtime = "nodejs";

const BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const API_KEY  = process.env.OPENROUTER_API_KEY!;
const PRIMARY  = process.env.OPENROUTER_MODEL || "z-ai/glm-4.5-air:free";

const FALLBACKS = [
  "deepseek/deepseek-r1-0528:free",
  "upstage/solar-pro-3:free",
];

async function callModel(model: string, messages: any[]) {
  const res = await fetch(`${BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${API_KEY}`,
      "Content-Type": "application/json",
      "HTTP-Referer": "http://localhost:3000",
      "X-Title": "Next Chat Sample",
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.7,
      max_tokens: 2048,
      stream: false
    })
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`OpenRouter error (${res.status}): ${text}`);
  }
  return res.json();
}

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  // 先頭に system を差し込む（日本語指示）
  const withSystem = [
    { role: "system", content: "あなたは日本語で丁寧に答えるアシスタントです。" },
    ...messages
  ];

  const models = [PRIMARY, ...FALLBACKS];

  for (const m of models) {
    try {
      const data = await callModel(m, withSystem);
      const content = data?.choices?.[0]?.message?.content ?? "";
      return Response.json({ content, model: m });
    } catch (e: any) {
      // “No endpoints found …” 等、無料モデルの入れ替え時に起きる
      // 次のモデルへフォールバック
      continue;
    }
  }

  return new Response(
    JSON.stringify({ error: "現在利用できません。少し待って再試行してください。" }),
    { status: 503 }
  );
}