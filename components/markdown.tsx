"use client"

import React from "react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import rehypeHighlight from "rehype-highlight"
import type { Components } from "react-markdown"

import clsx from "clsx"
import { Button } from "@/components/ui/button"
import { Check, Copy } from "lucide-react"

import "highlight.js/styles/github-dark.css"

type MarkdownProps = {
  children: string
  className?: string
}

function useCopyToClipboard() {
  const [copied, setCopied] = React.useState(false)

  const copy = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    } catch {
      const el = document.createElement("textarea")
      el.value = text
      document.body.appendChild(el)
      el.select()
      document.execCommand("copy")
      document.body.removeChild(el)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    }
  }

  return { copied, copy }
}

const components: Components = {
  a({ children, ...props }) {
    return (
      <a
        {...props}
        target="_blank"
        rel="noreferrer"
        className="text-blue-600 dark:text-blue-400 underline underline-offset-4"
      >
        {children}
      </a>
    )
  },

  table({ children }) {
    return (
      <div className="my-3 w-full overflow-x-auto">
        <table className="w-full border-collapse">{children}</table>
      </div>
    )
  },

  th({ children }) {
    return <th className="border px-2 py-1 text-left bg-muted/50">{children}</th>
  },

  td({ children }) {
    return <td className="border px-2 py-1 align-top">{children}</td>
  },

  blockquote({ children }) {
    return (
      <blockquote className="border-l-4 border-muted-foreground/30 pl-4 text-muted-foreground">
        {children}
      </blockquote>
    )
  },

  code(props) {
    const { inline, className, children, ...rest } =
      props as unknown as {
        inline?: boolean
        className?: string
        children?: React.ReactNode
      }

    if (inline) {
      return (
        <code
          {...(rest as any)}
          className={clsx(
            "rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]",
            className
          )}
        >
          {children}
        </code>
      )
    }

    const match = /language-(\w+)/.exec(className || "")
    const lang = match?.[1] ?? ""

    const copyText = String(children ?? "").replace(/\n$/, "")

    return (
      <CodeBlock lang={lang} copyText={copyText} className={className}>
        {children}
      </CodeBlock>
    )
  },
}

export default function Markdown({ children, className }: MarkdownProps) {
  return (
    <div
      className={clsx(
        "prose prose-sm max-w-none dark:prose-invert",
        "prose-p:leading-relaxed prose-pre:leading-relaxed",
        "prose-code:before:content-[''] prose-code:after:content-['']",
        "prose-headings:scroll-mt-24",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight]}
        components={components}
      >
        {children}
      </ReactMarkdown>
    </div>
  )
}

function CodeBlock({
  lang,
  copyText,
  className,
  children,
}: {
  lang?: string
  copyText: string
  className?: string
  children: React.ReactNode
}) {
  const { copied, copy } = useCopyToClipboard()

  return (
    <div className="group relative my-3 overflow-hidden rounded-lg border bg-zinc-950 text-zinc-50">
      <div className="flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2">
        <div className="text-xs text-zinc-300">{lang || "code"}</div>

        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="h-7 px-2 text-zinc-200 hover:text-white hover:bg-white/10"
          onClick={() => copy(copyText)}
        >
          {copied ? (
            <>
              <Check className="mr-1 h-4 w-4" />
              Copied
            </>
          ) : (
            <>
              <Copy className="mr-1 h-4 w-4" />
              Copy
            </>
          )}
        </Button>
      </div>

      <pre className="m-0 overflow-x-auto p-3 text-sm">
        <code className={clsx(className, "whitespace-pre")}>{children}</code>
      </pre>
    </div>
  )
}