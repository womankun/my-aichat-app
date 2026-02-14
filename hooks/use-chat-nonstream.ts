"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import type { ChatMessage } from "@/types/chat"

export function useChatNonStream(options?: { api?: string }) {
  const api = options?.api ?? "/api/chat"
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const abortRef = useRef<AbortController | null>(null)

  const handleSubmit = useCallback(
    async (e?: React.FormEvent<HTMLFormElement>) => {
      e?.preventDefault()
      const text = input.trim()
      if (!text || isLoading) return

      const userMsg: ChatMessage = { id: crypto.randomUUID(), role: "user", content: text }
      const assistantMsg: ChatMessage = { id: crypto.randomUUID(), role: "assistant", content: "" }

      setMessages((prev) => [...prev, userMsg, assistantMsg])
      setInput("")
      setIsLoading(true)

      const controller = new AbortController()
      abortRef.current = controller

      try {
        const res = await fetch(api, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: [
              ...messages.map(({ role, content }) => ({ role, content })),
              { role: "user", content: text },
            ],
          }),
          signal: controller.signal,
        })

        if (!res.ok) {
          const errText = await res.text().catch(() => "")
          throw new Error(errText || `HTTP ${res.status}`)
        }

        const data = await res.json()
        const content = data?.content ?? "（空の応答）"

        setMessages((prev) =>
          prev.map((m) => (m.id === assistantMsg.id ? { ...m, content } : m))
        )
      } catch (e) {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === assistantMsg.id ? { ...m, content: "（エラーが発生しました）" } : m
          )
        )
      } finally {
        setIsLoading(false)
        abortRef.current = null
      }
    },
    [api, input, isLoading, messages]
  )

  const stop = useCallback(() => {
    abortRef.current?.abort()
    abortRef.current = null
    setIsLoading(false)
  }, [])

  return useMemo(
    () => ({ messages, input, setInput, handleSubmit, isLoading, stop }),
    [messages, input, handleSubmit, isLoading, stop]
  )
}