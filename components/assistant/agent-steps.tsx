"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, Loader2, Sparkles } from "lucide-react";
import { ShiningText } from "@/components/ui/shining-text";

export interface AgentStep {
  id: string;
  tool: string;
  label: string;
  status: "running" | "done";
  detail?: string;
}

export function AgentSteps({ steps, thinking }: { steps: AgentStep[]; thinking?: boolean }) {
  if (steps.length === 0 && !thinking) return null;

  return (
    <div className="a-steps">
      {steps.length === 0 && thinking && (
        <div className="a-step running">
          <span className="a-step-ic"><Sparkles size={13} strokeWidth={2.4} /></span>
          <ShiningText text="FlowGuard is thinking…" />
        </div>
      )}

      <AnimatePresence initial={false}>
        {steps.map((s) => (
          <motion.div
            key={s.id}
            layout
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className={`a-step ${s.status}`}
          >
            <span className="a-step-ic">
              {s.status === "done" ? <Check size={13} strokeWidth={3} /> : <Loader2 size={13} strokeWidth={2.6} className="a-spin" />}
            </span>
            {s.status === "running" ? (
              <ShiningText text={s.label} />
            ) : (
              <span className="a-step-lbl">
                {s.label}
                {s.detail && <em className="a-step-detail"> · {s.detail}</em>}
              </span>
            )}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
