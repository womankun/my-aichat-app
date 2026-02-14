"use client"

import { useEffect, useRef } from "react"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Send, Square } from "lucide-react"
import { ChatMessage as Bubble } from "./chat-message"
import { useChatNonStream } from "@/hooks/use-chat-nonstream"

export function ChatWindow() {
  const { messages, input, setInput, handleSubmit, isLoading, stop } = useChatNonStream({
    api: "/api/chat",
  })

  const scrollRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    })
  }, [messages.length, isLoading])

  return (
    <div className="flex w-full flex-col">
     <ScrollArea ref={scrollRef} className="pb-60">
        <div className="flex flex-col gap-4">
          {messages.map((m) => (
            <Bubble key={m.id} role={m.role} content={m.content} />
          ))}
          {isLoading && (
            <div className="text-xs text-muted-foreground animate-pulse">
              AIが入力中…
            </div>
          )}
        </div>
      </ScrollArea>
      <div className="fixed bottom-0 left-0 right-0 bg-background">
        <div
          className="
            pointer-events-none
            absolute left-0 right-0 -top-10 h-10
            bg-gradient-to-t from-background/95 to-transparent
          "
        />
        <form
          onSubmit={handleSubmit}
          className="
            flex flex-col gap-2 p-3 mx-auto
            rounded-4xl border
            bg-background bottom-0 mb-5
            min-h-30 min-w-200
            max-h-50 max-w-50
          "
        >
          <Textarea
            placeholder="メッセージを入力…"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={2}
            className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0 resize-none"
          />
          <div className="flex items-center justify-end gap-2">
            <Button type="submit" disabled={!input.trim() || isLoading}>
            <Send className="mr-1 h-4 w-4" />
            送信
            </Button>
            {isLoading && (
            <Button type="button" variant="secondary" onClick={stop}>
                <Square className="mr-1 h-4 w-4" />
                停止
            </Button>
            )}
          </div>
        </form>
        <p className="text-[12px] leading-snug text-muted-foreground text-center mb-5">
          AI で生成されたコンテンツは誤りを含む可能性があります。
        </p>
      </div>
    </div>
  )
}