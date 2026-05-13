import { Separator } from "./ui/separator"
import { SidebarTrigger } from "./ui/sidebar"
import { Sparkles } from "lucide-react"

export function SiteHeader() {
  return (
    <header className="group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear bg-gradient-to-r from-pink-50 to-purple-50 dark:from-gray-900 dark:to-gray-800 border-pink-200 dark:border-gray-700">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1 hover:bg-pink-100 dark:hover:bg-gray-700" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4 bg-pink-200 dark:bg-gray-600" />
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-pink-500" />
          <h1 className="text-base font-medium bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">
            Beauty Dashboard
          </h1>
        </div>
      </div>
    </header>
  );
}