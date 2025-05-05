"use client"

import { useState, useCallback } from "react"
import { Copy, Download, WrapText, AlignJustify } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"

interface JsonRenderMessageProps {
  data: any
  className?: string
  initialWrapped?: boolean
}

export function JsonRenderMessage({ data, className, initialWrapped = true }: JsonRenderMessageProps) {
  const [isWrapped, setIsWrapped] = useState(initialWrapped)
  const [copied, setCopied] = useState(false)

  // Convert data to string if it's not already
  const jsonString = typeof data === "string" ? data : JSON.stringify(data, null, 2)

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(jsonString)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }, [jsonString])

  const handleDownload = useCallback(() => {
    const blob = new Blob([jsonString], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "data.json"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }, [jsonString])

  const toggleWrap = useCallback(() => {
    setIsWrapped((prev) => !prev)
  }, [])

  return (
    <div className={cn("not-prose flex flex-col", className)}>
      <div className="flex items-center justify-between mb-2 px-2">
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={toggleWrap}
                  className="h-8 w-8"
                  aria-label={isWrapped ? "Disable text wrapping" : "Enable text wrapping"}
                >
                  {isWrapped ? <WrapText className="h-4 w-4" /> : <AlignJustify className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{isWrapped ? "Disable text wrapping" : "Enable text wrapping"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" onClick={handleCopy} className="h-8 w-8" aria-label="Copy JSON">
                  <Copy className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{copied ? "Copied!" : "Copy JSON"}</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={handleDownload}
                  className="h-8 w-8"
                  aria-label="Download JSON"
                >
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download JSON</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>

      <div
        className={cn(
          "w-full overflow-auto dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl h-64",
        )}
      >
        <SyntaxHighlighter
          language="json"
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: "0.75rem",
            height: "100%",
          }}
          wrapLines={isWrapped}
          wrapLongLines={isWrapped}
        >
          {jsonString}
        </SyntaxHighlighter>
      </div>

      {copied && (
        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs">Copied!</div>
      )}
    </div>
  )
}
