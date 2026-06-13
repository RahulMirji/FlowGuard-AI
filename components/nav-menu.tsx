"use client"

import { useState } from "react"
import { Map, Bot, BarChart3 } from "lucide-react"
import { MenuBar } from "@/components/ui/glow-menu"

const menuItems = [
  {
    icon: Map,
    label: "Planner",
    href: "/planner",
    gradient:
      "radial-gradient(circle, rgba(2,132,199,0.15) 0%, rgba(3,105,161,0.06) 50%, rgba(7,89,133,0) 100%)",
    iconColor: "text-blue-500",
  },
  {
    icon: Bot,
    label: "Assistant",
    href: "/assistant",
    gradient:
      "radial-gradient(circle, rgba(249,115,22,0.15) 0%, rgba(234,88,12,0.06) 50%, rgba(194,65,12,0) 100%)",
    iconColor: "text-orange-500",
  },
  {
    icon: BarChart3,
    label: "City Dashboard",
    href: "/dashboard",
    gradient:
      "radial-gradient(circle, rgba(34,197,94,0.15) 0%, rgba(22,163,74,0.06) 50%, rgba(21,128,61,0) 100%)",
    iconColor: "text-green-500",
  },
]

export function NavMenu() {
  const [activeItem, setActiveItem] = useState<string>("Planner")

  return (
    <MenuBar
      items={menuItems}
      activeItem={activeItem}
      onItemClick={setActiveItem}
    />
  )
}
