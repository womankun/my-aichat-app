"use client";

import React, { useCallback, useRef, useState, useMemo } from "react";
import type { ChatMessage } from "@/types/chat";

export function useChat(options?: { api?: string }) {
  const api = options?.api ?? "/api/chat";
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const messagesRef = useRef(messages);
  messagesRef.current = messages;

  const stop = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    setIsLoading(false);
  }, []);

  const handleSubmit = useCallback(
    async (e: React.SubmitEvent<HTMLFormElement>) => {
      e.preventDefault();
      const text = input.trim();
      if (!text || isLoading) return;

      const userMsg: ChatMessage = {
        id: crypto.randomUUID(),
        role: "user",
        content: text,
      };
      const assistantId = crypto.randomUUID();
      const assistantMsg: ChatMessage = {
        id: assistantId,
        role: "assistant",
        content: "",
      };

      setError(null);
      setInput("");
      setIsLoading(true);
      setMessages((prev) => [...prev, userMsg, assistantMsg]);

      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const res = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messagesRef.current.map(({ role, content }) => ({
                role,
                content,
              })),
              { role: "user", content: text },
            ],
          }),
          signal: controller.signal,
        });

        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        if (!res.body) throw new Error("レスポンスボディが空です");

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let accumulatedContent = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          const chunk = decoder.decode(value, { stream: true });
          accumulatedContent += chunk;

          setMessages((prev) =>
            prev.map((m) =>
              m.id === assistantId ? { ...m, content: accumulatedContent } : m,
            ),
          );
        }
      } catch (err: any) {
        if (err.name === "AbortError") return;
        setError(err);
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantId
              ? {
                  ...m,
                  content: (m.content || "") + "\n[エラーが発生しました]",
                }
              : m,
          ),
        );
      } finally {
        setIsLoading(false);
        abortRef.current = null;
      }
    },
    [api, input, isLoading],
  );

  return useMemo(
    () => ({
      messages,
      input,
      setInput,
      handleSubmit,
      isLoading,
      stop,
      error,
      setMessages,
    }),
    [messages, input, handleSubmit, isLoading, stop, error],
  );
}
