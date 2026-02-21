import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
        "animate-in fade-in slide-in-from-bottom-3 duration-500 ease-out fill-mode-forwards",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      {!isUser && (
        <Avatar className="h-6 w-6 shrink-0">
          {isAssistant ? (
            <>
              <AvatarImage
                src="/ai-icon.png"
                alt="AI Icon"
                className="object-cover"
              />
              <AvatarFallback className="bg-gradient-to-br from-blue-400 to-purple-400 text-white">
                AI
              </AvatarFallback>
            </>
          ) : (
            <AvatarFallback>SYS</AvatarFallback>
          )}
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
