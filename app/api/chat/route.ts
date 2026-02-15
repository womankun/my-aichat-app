import { NextRequest } from "next/server";

export const runtime = "nodejs";

const BASE_URL = process.env.OPENROUTER_BASE_URL || "https://openrouter.ai/api/v1";
const API_KEY  = process.env.OPENROUTER_API_KEY!;
const PRIMARY  = process.env.OPENROUTER_MODEL || "z-ai/glm-4.5-air:free";
const APP_URL = process.env.APP_URL || "http://localhost:3000";

const FALLBACKS = [
  "deepseek/deepseek-r1-0528:free",
  "upstage/solar-pro-3:free",
];

export async function POST(req: NextRequest) {
  const { messages } = await req.json();

  const withSystem = [
    { role: "system", content: "あなたは日本語で丁寧に答えるアシスタントです。" },
    ...messages
  ];

  const models = [PRIMARY, ...FALLBACKS];

  for (const model of models) {
    try {
      const res = await fetch(`${BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": APP_URL,
          "X-Title": "Next Chat Sample",
        },
        body: JSON.stringify({
          model,
          messages: withSystem,
          temperature: 0.7,
          max_tokens: 2048,
          stream: true,
        }),
      });

      if (!res.ok) throw new Error(`OpenRouter Error: ${res.status}`);

      const encoder = new TextEncoder();
      const decoder = new TextDecoder();
      
      const stream = new ReadableStream({
        async start(controller) {
          const reader = res.body?.getReader();
          if (!reader) return;

          try {
            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              const chunk = decoder.decode(value);
              const lines = chunk.split("\n");

              for (const line of lines) {
                if (line.startsWith("data: ") && line !== "data: [DONE]") {
                  try {
                    const json = JSON.parse(line.replace("data: ", ""));
                    const content = json.choices?.[0]?.delta?.content || "";
                    if (content) {
                      controller.enqueue(encoder.encode(content));
                    }
                  } catch (e) {
                    // パースエラーは無視して次へ
                  }
                }
              }
            }
          } finally {
            controller.close();
            reader.releaseLock();
          }
        },
      });

      return new Response(stream);

    } catch (e) {
      console.error(`Model ${model} failed, trying next...`, e);
      continue;
    }
  }

  return new Response(
    JSON.stringify({ error: "利用可能なモデルがありません。" }),
    { status: 503 }
  );
}