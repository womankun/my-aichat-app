"use client";

import { useEffect, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Send, Square } from "lucide-react";
import { ChatMessage as Bubble } from "./chat-message";
import { useChat } from "@/hooks/use-chat";

export function ChatWindow() {
  const { messages, input, setInput, handleSubmit, isLoading, stop } = useChat({
    api: "/api/chat",
  });

  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messages.length === 0) return;

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "end",
    });
  }, [messages, isLoading]);

  return (
    <div className="flex h-screen w-full flex-col bg-background overflow-hidden">
      <div
        ref={scrollContainerRef}
        className="flex-1 overflow-y-auto w-full custom-scrollbar"
      >
        <div className="max-w-3xl mx-auto flex flex-col gap-4 px-4 pt-8 pb-10">
          {messages.map((m) => (
            <Bubble key={m.id} role={m.role} content={m.content} />
          ))}

          {isLoading && (
            <div className="text-xs text-muted-foreground animate-pulse ml-2">
              AIが入力中…
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      <div className="w-full bg-background border-t relative">
        <div className="pointer-events-none absolute -top-12 left-0 right-0 h-12 bg-gradient-to-t from-background to-transparent" />

        <div className="max-w-3xl mx-auto px-4 py-6">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 p-3 rounded-3xl border bg-card shadow-sm focus-within:shadow-md transition-shadow"
          >
            <Textarea
              placeholder="メッセージを入力…"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="border-0 focus-visible:ring-0 resize-none min-h-[60px] max-h-40 bg-transparent text-base"
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmit(e as any);
                }
              }}
            />
            <div className="flex items-center justify-end gap-2">
              {isLoading ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={stop}
                  className="rounded-full"
                >
                  <Square className="h-5 w-5" />
                </Button>
              ) : (
                <Button
                  type="submit"
                  size="icon"
                  disabled={!input.trim()}
                  className="rounded-full w-10 h-10 shadow-sm"
                >
                  <Send className="h-5 w-5" />
                </Button>
              )}
            </div>
          </form>
          <p className="mt-3 text-[11px] text-muted-foreground text-center">
            AI は誤った情報を表示する可能性があります。
          </p>
        </div>
      </div>
    </div>
  );
}
