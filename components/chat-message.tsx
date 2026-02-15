import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import clsx from "clsx";
import type { ChatRole } from "@/types/chat";
import Markdown from "./markdown";

export function ChatMessage({
  role,
  content,
}: {
  role: ChatRole;
  content: string;
}) {
  const isUser = role === "user";
  const isAssistant = role === "assistant";

  return (
    <div
      className={clsx(
        "flex w-full gap-3",
        isUser ? "justify-end" : "justify-start",
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
        <div className="max-w-[85%] sm:max-w-[75%] bg-primary text-primary-foreground rounded-2xl p-3 text-sm whitespace-pre-wrap break-words h-auto shadow-sm">
          {content}
        </div>
      )}
    </div>
  );
}
