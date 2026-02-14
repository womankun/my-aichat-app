import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import clsx from "clsx"
import type { ChatRole } from "@/types/chat"
import Markdown from "./markdown"

export function ChatMessage({
  role,
  content,
}: {
  role: ChatRole
  content: string
}) {
  const isUser = role === "user"
  const isAssistant = role === "assistant"

  return (
    <div
      className={clsx(
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start"
      )}
    >
      {!isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>{isAssistant ? "AI" : "SYS"}</AvatarFallback>
        </Avatar>
      )}

      {isAssistant ? (
        <div className="max-w-[85%] sm:max-w-[75%] text-sm">
          <Markdown className="prose-p:my-3">{content}</Markdown>
        </div>
      ) : (
        <Card className="max-w-[85%] sm:max-w-[75%] bg-primary text-primary-foreground">
          <CardContent className="p-3 text-sm prose-invert">
            {content}
          </CardContent>
        </Card>
      )}

      {isUser && (
        <Avatar className="h-8 w-8">
          <AvatarFallback>YOU</AvatarFallback>
        </Avatar>
      )}
    </div>
  )
}
