"use client";

import AgentPlan from "@/components/ui/agent-plan";

const demoTasks = [
  {
    id: "1",
    title: "Research Project Requirements",
    description: "Gather all necessary information about project scope and requirements",
    status: "in-progress",
    priority: "high",
    level: 0,
    dependencies: [],
    subtasks: [
      { id: "1.1", title: "Interview stakeholders", description: "Conduct interviews with key stakeholders", status: "completed", priority: "high", tools: ["communication-agent"] },
      { id: "1.2", title: "Review existing documentation", description: "Go through all available documentation", status: "in-progress", priority: "medium", tools: ["file-system", "browser"] },
    ],
  },
  {
    id: "2",
    title: "Design System Architecture",
    description: "Create the overall system architecture based on requirements",
    status: "pending",
    priority: "high",
    level: 0,
    dependencies: ["1"],
    subtasks: [
      { id: "2.1", title: "Define component structure", description: "Map out all required components", status: "pending", priority: "high", tools: ["architecture-planner"] },
    ],
  },
];

export function Demo() {
  return (
    <div className="flex items-center justify-center p-6 bg-slate-50/50 min-h-screen w-full">
      <div className="w-full max-w-4xl">
        <AgentPlan tasks={demoTasks} />
      </div>
    </div>
  );
}
