"use client";

import { useRef, useState } from "react";
import dynamic from "next/dynamic";
import { Eye } from "lucide-react";

import { cn } from "~/lib/utils";
import { Toggle } from "~/components/ui/toggle";
import { Textarea } from "~/components/ui/textarea";
import { Avatar, AvatarImage, AvatarFallback } from "~/components/ui/avatar";
import { searchMentionUsers } from "~/server/actions/users/actions";

const MarkdownPreview = dynamic(() => import("./markdown-preview"), { ssr: false });

type MentionUser = { handle: string; name: string; avatarUrl: string | null };

function detectMentionToken(
  text: string,
  caret: number
): { prefix: string; start: number } | null {
  let i = caret - 1;
  while (i >= 0 && /[a-z0-9_]/i.test(text[i]!)) {
    i--;
  }
  if (i >= 0 && text[i] === "@" && (i === 0 || /[ \t\n]/.test(text[i - 1]!))) {
    const prefix = text.slice(i + 1, caret);
    if (prefix.length <= 19) return { prefix, start: i };
  }
  return null;
}

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

  const [suggestions, setSuggestions] = useState<MentionUser[]>([]);
  const [activeToken, setActiveToken] = useState<{ prefix: string; start: number } | null>(null);
  const [highlightIdx, setHighlightIdx] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const staleQueryRef = useRef<string>("");
  const textareaElRef = useRef<HTMLTextAreaElement | null>(null);

  const closeSuggestions = () => {
    setActiveToken(null);
    setSuggestions([]);
  };

  const insertSuggestion = (handle: string) => {
    if (!activeToken) return;
    const before = value.slice(0, activeToken.start);
    const after = value.slice(activeToken.start + 1 + activeToken.prefix.length);
    const inserted = `@${handle} `;
    const newValue = before + inserted + after;
    const newCaret = before.length + inserted.length;
    onChange(newValue);
    closeSuggestions();
    requestAnimationFrame(() => {
      const el = textareaElRef.current;
      if (!el) return;
      el.setSelectionRange(newCaret, newCaret);
      el.focus();
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    textareaElRef.current = e.target;
    const newValue = e.target.value;
    const caret = e.target.selectionStart ?? newValue.length;
    onChange(newValue);
    const token = detectMentionToken(newValue, caret);
    if (token) {
      setActiveToken(token);
      setHighlightIdx(0);
      const query = token.prefix.toLowerCase();
      staleQueryRef.current = query;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        if (staleQueryRef.current !== query) return;
        void searchMentionUsers(query).then((results) => {
          if (staleQueryRef.current !== query) return;
          setSuggestions(results);
        });
      }, 300);
    } else {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      staleQueryRef.current = "";
      closeSuggestions();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.nativeEvent.isComposing) return;
    if (!activeToken) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeSuggestions();
      return;
    }
    if (suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIdx((i) => Math.min(i + 1, suggestions.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIdx((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" || e.key === "Tab") {
      const s = suggestions[highlightIdx];
      if (s) {
        e.preventDefault();
        insertSuggestion(s.handle);
      }
    }
  };

  const handleSelect = (e: React.SyntheticEvent<HTMLTextAreaElement>) => {
    if (!activeToken) return;
    const token = detectMentionToken(value, e.currentTarget.selectionStart);
    if (!token || token.start !== activeToken.start) {
      closeSuggestions();
    }
  };

  const open = !preview && !!activeToken && suggestions.length > 0;

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
        <div className="relative">
          <Textarea
            id={id}
            value={value}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onSelect={handleSelect}
            onBlur={closeSuggestions}
            rows={rows}
            maxLength={maxLength}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className={className}
          />
          {open && (
            <ul className="absolute left-0 top-full z-50 mt-1 w-full max-h-48 overflow-y-auto rounded-base border-2 border-border bg-main text-foreground shadow-shadow">
              {suggestions.map((s, i) => (
                <li
                  key={s.handle}
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => insertSuggestion(s.handle)}
                  className={cn(
                    "flex cursor-pointer items-center gap-2 px-3 py-2 text-sm",
                    i === highlightIdx
                      ? "bg-secondary-background"
                      : "hover:bg-secondary-background/60"
                  )}
                >
                  <Avatar className="size-5 shrink-0">
                    {s.avatarUrl && <AvatarImage src={s.avatarUrl} />}
                    <AvatarFallback className="text-xs">
                      {(s.name[0] ?? s.handle[0] ?? "?").toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <span className="truncate font-medium">{s.name}</span>
                  <span className="truncate text-foreground/50">@{s.handle}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
