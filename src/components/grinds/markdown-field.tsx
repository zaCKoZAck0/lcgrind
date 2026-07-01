"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Eye } from "lucide-react";

import { Toggle } from "~/components/ui/toggle";
import { Textarea } from "~/components/ui/textarea";

const MarkdownPreview = dynamic(() => import("./markdown-preview"), { ssr: false });

// Textarea with a Preview toggle. Preview renders through the exact same
// sanitize pipeline (renderMarkdown) that stores the body, so what the author
// sees matches what gets persisted.
export function MarkdownField({
  value,
  onChange,
  previewClassName,
  id,
  rows = 6,
  maxLength,
  placeholder,
  disabled = false,
  autoFocus = false,
  className,
}: {
  value: string;
  onChange: (value: string) => void;
  previewClassName: string;
  id?: string;
  rows?: number;
  maxLength?: number;
  placeholder?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  className?: string;
}) {
  const [preview, setPreview] = useState(false);
  const hasContent = value.trim().length > 0;

  return (
    <div className="relative">
      <Toggle
        size="sm"
        title="Preview"
        pressed={preview}
        onPressedChange={setPreview}
        disabled={disabled}
        className="absolute right-2 top-2 z-10 h-7 px-2 text-xs"
      >
        <Eye className="size-3.5" />
      </Toggle>

      {preview ? (
        <div
          className="rounded-base border-2 border-border bg-secondary-background px-3 py-2"
          style={{ minHeight: `${rows * 1.5}rem` }}
        >
          {hasContent ? (
            <MarkdownPreview value={value} className={previewClassName} />
          ) : (
            <p className="text-sm text-foreground/50">Nothing to preview.</p>
          )}
        </div>
      ) : (
        <Textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={rows}
          maxLength={maxLength}
          placeholder={placeholder}
          disabled={disabled}
          autoFocus={autoFocus}
          className={className}
        />
      )}
    </div>
  );
}
