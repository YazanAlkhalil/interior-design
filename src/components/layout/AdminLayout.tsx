import { Search, Bell } from "lucide-react"
import { Input } from "../ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { NavLink, Outlet } from "react-router-dom"
import { cn } from "../../lib/utils"

interface AdminLayoutProps {
  children: React.ReactNode
}

const navItems = {
  Dashboards: [
    { name: "Overview", href: "/admin/overview" }
  ],
  Management: [
    { name: "Clients", href: "/admin/clients" },
    { name: "Employees", href: "/admin/employees" },
    { name: "Products", href: "/admin/products" },
    { name: "Sections", href: "/admin/sections" },
    { name: "Plans", href: "/admin/plans" },
    { name: "Orders", href: "/admin/orders" },
  ]
}

export default function AdminLayout() {
  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-background border-r flex flex-col">
        {/* Admin Profile */}
        <div className="p-4 flex items-center gap-3 border-b">
          <Avatar>
            <AvatarImage src="/admin-avatar.png" alt="Admin" />
            <AvatarFallback>AD</AvatarFallback>
          </Avatar>
          <span className="font-semibold">Admin</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4">
          {Object.entries(navItems).map(([section, items]) => (
            <div key={section} className="mb-6">
              <h2 className="text-sm font-semibold text-muted-foreground mb-2">
                {section}
              </h2>
              <div className="space-y-1">
                {items.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center py-2 px-3 text-sm rounded-md hover:bg-accent hover:text-accent-foreground",
                        "transition-colors",
                        isActive && "bg-accent text-accent-foreground"
                      )
                    }
                  >
                    {item.name}
                  </NavLink>
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Logo */}
        <div className="p-4 border-t flex justify-center items-center">
          <img src={require("../../assets/images/logo.png")} alt="Logo" className="h-20" />
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <header className="h-16 border-b flex items-center justify-between px-6">
          <div className="relative w-96">
            <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
            />
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5" />
          </Button>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
