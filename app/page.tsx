// app/page.tsx
"use client";
import { useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export default function Page() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [usingModel, setUsingModel] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const send = async () => {
    if (!input.trim() || loading) return;
    const next: Msg[] = [...messages, { role: "user", content: input }];
    setMessages(next);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/chat", {
      method: "POST",
      headers: {"Content-Type": "application/json"},
      body: JSON.stringify({ messages: next })
    });

    setLoading(false);

    if (!res.ok) {
      const err = await res.text();
      setMessages([...next, { role: "assistant", content: `（エラー）${err}` }]);
      return;
    }

    const data = await res.json();
    setUsingModel(data.model ?? null);
    setMessages([...next, { role: "assistant", content: data.content }]);
  };

  return (
    <main className="p-6 max-w-2xl mx-auto">
      <h1 className="text-xl font-bold mb-2">AI Chat</h1>
      {usingModel && (
        <p className="text-sm text-gray-500 mb-2">
          使用モデル: <code>{usingModel}</code>
        </p>
      )}
      <div className="border rounded p-4 h-[60vh] overflow-y-auto space-y-3 bg-white">
        {messages.map((m, i) => (
          <div key={i}><b>{m.role === "user" ? "あなた" : "AI"}：</b> {m.content}</div>
        ))}
        {loading && <div className="text-gray-500">生成中…</div>}
      </div>
      <div className="flex gap-2 mt-4">
        <input
          className="flex-1 border rounded p-2"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="メッセージを入力"
          onKeyDown={(e) => e.key === "Enter" && send()}
        />
        <button className="px-4 py-2 bg-black text-white rounded" onClick={send}>
          送信
        </button>
      </div>
    </main>
  );
}