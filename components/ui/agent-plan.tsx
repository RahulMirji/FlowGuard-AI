"use client";

import React, { useState } from "react";
import {
  CheckCircle2,
  Circle,
  CircleAlert,
  CircleDotDashed,
  CircleX,
} from "lucide-react";
import { motion, AnimatePresence, LayoutGroup } from "framer-motion";

interface Subtask {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  tools?: string[];
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  priority: string;
  level: number;
  dependencies: string[];
  subtasks: Subtask[];
}

interface AgentPlanProps {
  tasks: Task[];
}

export default function AgentPlan({ tasks: initialTasks }: AgentPlanProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [expandedTasks, setExpandedTasks] = useState<string[]>([initialTasks[0]?.id || "1"]);
  const [expandedSubtasks, setExpandedSubtasks] = useState<Record<string, boolean>>({});

  const toggleTaskExpansion = (taskId: string) => {
    setExpandedTasks((prev) =>
      prev.includes(taskId) ? prev.filter((id) => id !== taskId) : [...prev, taskId]
    );
  };

  const toggleSubtaskExpansion = (taskId: string, subtaskId: string) => {
    const key = `${taskId}-${subtaskId}`;
    setExpandedSubtasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const toggleSubtaskStatus = (taskId: string, subtaskId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id === taskId) {
          const updatedSubtasks = task.subtasks.map((subtask) => {
            if (subtask.id === subtaskId) {
              return { ...subtask, status: subtask.status === "completed" ? "pending" : "completed" };
            }
            return subtask;
          });
          const allDone = updatedSubtasks.every((s) => s.status === "completed");
          return { ...task, subtasks: updatedSubtasks, status: allDone ? "completed" : task.status };
        }
        return task;
      })
    );
  };

  return (
    <div className="bg-background text-foreground h-full overflow-auto p-2">
      <motion.div
        className="bg-card border-border rounded-lg border shadow overflow-hidden"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] } }}
      >
        <LayoutGroup>
          <div className="p-4 overflow-hidden">
            <ul className="space-y-1 overflow-hidden">
              {tasks.map((task, index) => {
                const isExpanded = expandedTasks.includes(task.id);
                const isCompleted = task.status === "completed";
                return (
                  <motion.li key={task.id} className={index !== 0 ? "mt-1 pt-2" : ""} initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>
                    <motion.div className="group flex items-center px-3 py-1.5 rounded-md" whileHover={{ backgroundColor: "rgba(0,0,0,0.03)" }}>
                      <div className="mr-2 flex-shrink-0">
                        {task.status === "completed" ? <CheckCircle2 className="h-4.5 w-4.5 text-green-500" /> : task.status === "in-progress" ? <CircleDotDashed className="h-4.5 w-4.5 text-blue-500" /> : task.status === "need-help" ? <CircleAlert className="h-4.5 w-4.5 text-yellow-500" /> : task.status === "failed" ? <CircleX className="h-4.5 w-4.5 text-red-500" /> : <Circle className="text-muted-foreground h-4.5 w-4.5" />}
                      </div>
                      <div className="flex min-w-0 flex-grow cursor-pointer items-center justify-between" onClick={() => toggleTaskExpansion(task.id)}>
                        <span className={`truncate ${isCompleted ? "text-muted-foreground line-through" : ""}`}>{task.title}</span>
                        <div className="flex flex-shrink-0 items-center space-x-2 text-xs">
                          {task.dependencies.length > 0 && (
                            <div className="flex gap-1 mr-2">
                              {task.dependencies.map((dep, idx) => (
                                <span key={idx} className="bg-secondary/40 text-secondary-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">{dep}</span>
                              ))}
                            </div>
                          )}
                          <span className={`rounded px-1.5 py-0.5 ${task.status === "completed" ? "bg-green-100 text-green-700" : task.status === "in-progress" ? "bg-blue-100 text-blue-700" : task.status === "need-help" ? "bg-yellow-100 text-yellow-700" : task.status === "failed" ? "bg-red-100 text-red-700" : "bg-muted text-muted-foreground"}`}>{task.status}</span>
                        </div>
                      </div>
                    </motion.div>

                    <AnimatePresence mode="wait">
                      {isExpanded && task.subtasks.length > 0 && (
                        <motion.div className="relative overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1, transition: { duration: 0.25 } }} exit={{ height: 0, opacity: 0, transition: { duration: 0.2 } }}>
                          <div className="absolute top-0 bottom-0 left-[20px] border-l-2 border-dashed border-muted-foreground/30" />
                          <ul className="mt-1 mr-2 mb-1.5 ml-3 space-y-0.5">
                            {task.subtasks.map((subtask) => {
                              const subtaskKey = `${task.id}-${subtask.id}`;
                              const isSubtaskExpanded = expandedSubtasks[subtaskKey];
                              return (
                                <motion.li key={subtask.id} className="group flex flex-col py-0.5 pl-6" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }}>
                                  <div className="flex flex-1 items-center rounded-md p-1 hover:bg-[rgba(0,0,0,0.03)] cursor-pointer" onClick={() => toggleSubtaskExpansion(task.id, subtask.id)}>
                                    <div className="mr-2 flex-shrink-0" onClick={(e) => { e.stopPropagation(); toggleSubtaskStatus(task.id, subtask.id); }}>
                                      {subtask.status === "completed" ? <CheckCircle2 className="h-3.5 w-3.5 text-green-500" /> : subtask.status === "in-progress" ? <CircleDotDashed className="h-3.5 w-3.5 text-blue-500" /> : subtask.status === "need-help" ? <CircleAlert className="h-3.5 w-3.5 text-yellow-500" /> : <Circle className="text-muted-foreground h-3.5 w-3.5" />}
                                    </div>
                                    <span className={`text-sm ${subtask.status === "completed" ? "text-muted-foreground line-through" : ""}`}>{subtask.title}</span>
                                  </div>
                                  <AnimatePresence>
                                    {isSubtaskExpanded && (
                                      <motion.div className="text-muted-foreground border-foreground/20 mt-1 ml-1.5 border-l border-dashed pl-5 text-xs overflow-hidden" initial={{ height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                                        <p className="py-1">{subtask.description}</p>
                                        {subtask.tools && subtask.tools.length > 0 && (
                                          <div className="mt-0.5 mb-1 flex flex-wrap items-center gap-1.5">
                                            <span className="font-medium">Tools:</span>
                                            {subtask.tools.map((tool, idx) => (
                                              <span key={idx} className="bg-secondary/40 text-secondary-foreground rounded px-1.5 py-0.5 text-[10px] font-medium">{tool}</span>
                                            ))}
                                          </div>
                                        )}
                                      </motion.div>
                                    )}
                                  </AnimatePresence>
                                </motion.li>
                              );
                            })}
                          </ul>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        </LayoutGroup>
      </motion.div>
    </div>
  );
}
