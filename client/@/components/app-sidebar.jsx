"use client"

import * as React from "react"
import {
  ArrowUpCircleIcon,
  BarChartIcon,
  ClipboardListIcon,
  DatabaseIcon,
  HelpCircleIcon,
  LayoutDashboardIcon,
  SearchIcon,
  SettingsIcon,
  Palette,
  Sparkles,
  Heart,
  ShoppingCart,
  Package
} from "lucide-react"

import { NavDocuments } from "./nav-documents"
import { NavMain } from "./nav-main"
import { NavSecondary } from "./nav-secondary"
import { NavUser } from "./nav-user"
import UserMenu from "../../src/components/UserMenu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "./ui/sidebar"
import { useSelector } from 'react-redux'

const data = {
  navMain: [
    {
      title: "Dashboard",
      url: "#",
      icon: LayoutDashboardIcon,
    },
    {
      title: "Products",
      url: "#",
      icon: Palette,
    },
    {
      title: "Orders",
      url: "#",
      icon: ShoppingCart,
    },
    {
      title: "Customers",
      url: "#",
      icon: Heart,
    },
    {
      title: "Analytics",
      url: "#",
      icon: BarChartIcon,
    },
  ],
  navSecondary: [
    {
      title: "Settings",
      url: "#",
      icon: SettingsIcon,
    },
    {
      title: "Help & Support",
      url: "#",
      icon: HelpCircleIcon,
    },
    {
      title: "Search",
      url: "#",
      icon: SearchIcon,
    },
  ],
  documents: [
    {
      name: "Product Catalog",
      url: "#",
      icon: Palette,
    },
    {
      name: "Inventory",
      url: "#",
      icon: Package,
    },
    {
      name: "Sales Reports",
      url: "#",
      icon: ClipboardListIcon,
    },
    {
      name: "Customer Data",
      url: "#",
      icon: DatabaseIcon,
    },
  ],
}

export function AppSidebar({
  ...props
}) {
  const user = useSelector(state => state.user)

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <a href="#" className="flex items-center gap-2">
                <div className="bg-gradient-to-r from-pink-500 to-purple-600 p-1.5 rounded-lg">
                  <Sparkles className="h-5 w-5 text-white" />
                </div>
                <span className="text-base font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
                  Beauty Store
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <div className="px-2 py-4">
          <UserMenu />
        </div>
        <NavSecondary items={data.navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{
          name: user?.name || "Beauty Admin",
          email: user?.email || "admin@beautystore.com",
          avatar: user?.avatar || "/avatars/admin.jpg",
        }} />
      </SidebarFooter>
    </Sidebar>
  );
}