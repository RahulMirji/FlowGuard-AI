"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
import { ArrowUp, Paperclip, Mic, Globe, BrainCog, Square, StopCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const cn = (...classes: (string | undefined | null | false)[]) => classes.filter(Boolean).join(" ");

interface PromptInputBoxProps {
  onSend?: (message: string, files?: File[]) => void;
  isLoading?: boolean;
  placeholder?: string;
  className?: string;
}

export function PromptInputBox({
  onSend = () => {},
  isLoading = false,
  placeholder = "Type your message here...",
  className,
}: PromptInputBoxProps) {
  const [input, setInput] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<Record<string, string>>({});
  const [isRecording, setIsRecording] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [showThink, setShowThink] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const uploadInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!textareaRef.current) return;
    textareaRef.current.style.height = "auto";
    textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
  }, [input]);

  const handleToggle = (value: "search" | "think") => {
    if (value === "search") { setShowSearch((p) => !p); setShowThink(false); }
    else { setShowThink((p) => !p); setShowSearch(false); }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("image/") || file.size > 10 * 1024 * 1024) return;
    setFiles([file]);
    const reader = new FileReader();
    reader.onload = (e) => setFilePreviews({ [file.name]: e.target?.result as string });
    reader.readAsDataURL(file);
  };

  const handleSubmit = () => {
    if (!input.trim() && files.length === 0) return;
    let prefix = showSearch ? "[Search] " : showThink ? "[Think] " : "";
    onSend(prefix + input, files);
    setInput("");
    setFiles([]);
    setFilePreviews({});
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSubmit(); }
  };

  const handlePaste = useCallback((e: ClipboardEvent) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith("image/")) {
        const file = items[i].getAsFile();
        if (file) { e.preventDefault(); processFile(file); break; }
      }
    }
  }, []);

  useEffect(() => {
    document.addEventListener("paste", handlePaste);
    return () => document.removeEventListener("paste", handlePaste);
  }, [handlePaste]);

  const hasContent = input.trim() !== "" || files.length > 0;

  return (
    <TooltipPrimitive.Provider>
      <div
        className={cn(
          "rounded-2xl border border-white/10 bg-[#1a1a2e]/80 backdrop-blur-xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300",
          isLoading && "border-cyan-500/40",
          className
        )}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => {
          e.preventDefault(); e.stopPropagation();
          const f = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
          if (f[0]) processFile(f[0]);
        }}
      >
        {/* File previews */}
        {files.length > 0 && (
          <div className="flex gap-2 pb-2">
            {files.map((file, i) => filePreviews[file.name] && (
              <div key={i} className="relative w-14 h-14 rounded-lg overflow-hidden">
                <img src={filePreviews[file.name]} alt="" className="w-full h-full object-cover" />
                <button onClick={() => { setFiles([]); setFilePreviews({}); }} className="absolute top-0.5 right-0.5 rounded-full bg-black/70 p-0.5 text-white text-xs">✕</button>
              </div>
            ))}
          </div>
        )}

        {/* Textarea */}
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={showSearch ? "Search the web..." : showThink ? "Think deeply..." : placeholder}
          disabled={isLoading || isRecording}
          rows={1}
          className="w-full bg-transparent text-white/90 placeholder:text-white/30 text-sm resize-none outline-none min-h-[40px] max-h-[200px] scrollbar-thin"
        />

        {/* Actions row */}
        <div className="flex items-center justify-between pt-2">
          <div className="flex items-center gap-1">
            {/* Upload */}
            <button
              onClick={() => uploadInputRef.current?.click()}
              className="h-8 w-8 flex items-center justify-center rounded-full text-white/40 hover:text-white/70 hover:bg-white/5 transition-colors"
            >
              <Paperclip className="h-4 w-4" />
              <input ref={uploadInputRef} type="file" className="hidden" accept="image/*" onChange={(e) => { if (e.target.files?.[0]) processFile(e.target.files[0]); e.target.value = ""; }} />
            </button>

            <div className="w-px h-4 bg-white/10 mx-1" />

            {/* Search toggle */}
            <button
              onClick={() => handleToggle("search")}
              className={cn(
                "rounded-full flex items-center gap-1 px-2 py-1 border h-7 transition-all",
                showSearch ? "bg-cyan-500/15 border-cyan-500/50 text-cyan-400" : "border-transparent text-white/40 hover:text-white/70"
              )}
            >
              <motion.div animate={{ scale: showSearch ? 1.1 : 1 }} transition={{ type: "spring", stiffness: 300 }}>
                <Globe className="w-3.5 h-3.5" />
              </motion.div>
              <AnimatePresence>
                {showSearch && (
                  <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="text-[10px] overflow-hidden whitespace-nowrap">
                    Search
                  </motion.span>
                )}
              </AnimatePresence>
            </button>

            {/* Think toggle */}
            <button
              onClick={() => handleToggle("think")}
              className={cn(
                "rounded-full flex items-center gap-1 px-2 py-1 border h-7 transition-all",
                showThink ? "bg-purple-500/15 border-purple-500/50 text-purple-400" : "border-transparent text-white/40 hover:text-white/70"
              )}
            >
              <motion.div animate={{ scale: showThink ? 1.1 : 1 }} transition={{ type: "spring", stiffness: 300 }}>
                <BrainCog className="w-3.5 h-3.5" />
              </motion.div>
              <AnimatePresence>
                {showThink && (
                  <motion.span initial={{ width: 0, opacity: 0 }} animate={{ width: "auto", opacity: 1 }} exit={{ width: 0, opacity: 0 }} className="text-[10px] overflow-hidden whitespace-nowrap">
                    Think
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          </div>

          {/* Send / Mic */}
          <button
            onClick={() => { if (hasContent) handleSubmit(); }}
            disabled={isLoading && !hasContent}
            className={cn(
              "h-8 w-8 rounded-full flex items-center justify-center transition-all",
              hasContent ? "bg-white text-[#1a1a2e] hover:bg-white/90" : "text-white/40 hover:text-white/60 hover:bg-white/5"
            )}
          >
            {isLoading ? <Square className="h-3.5 w-3.5 animate-pulse" /> : hasContent ? <ArrowUp className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
          </button>
        </div>
      </div>
    </TooltipPrimitive.Provider>
  );
}
