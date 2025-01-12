import { Search, Bell } from "lucide-react"
import { Input } from "../ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar"
import { Button } from "../ui/button"
import { NavLink, Outlet } from "react-router-dom"
import { cn } from "../../lib/utils"
import { useNotifications } from "../../hooks/useNotifications"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu"
import { useRef, useCallback } from 'react';
import { formatDistanceToNow } from 'date-fns';


const navItems = {
  Dashboards: [
    { name: "Overview", href: "/admin/overview" }
  ],
  Management: [
    { name: "Employees", href: "/admin/employees" },
    { name: "Products", href: "/admin/products" },
    { name: "Sections", href: "/admin/sections" },
    { name: "Plans", href: "/admin/plans" },
    { name: "Orders", href: "/admin/orders" },
    { name: "Design", href: "/admin/design" },
    { name: "Departments", href: "/admin/departments" },
    { name: "Services", href: "/admin/services" },
    { name: "Complaints", href: "/admin/complaints" },
  ],
  Configuration: [
    { name: "Settings", href: "/admin/settings" }
  ]
}

export default function AdminLayout() {
  const { 
    notifications, 
    notificationCount, 
    isLoading, 
    fetchNotifications,
    loadMore,
    hasMore 
  } = useNotifications();
  
  const observerTarget = useRef<HTMLDivElement>(null);

  const intersectionObserver = useCallback((node: HTMLDivElement) => {
    if (isLoading) return;
    
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      },
      { threshold: 1.0 }
    );

    if (node) observer.observe(node);
    
    return () => {
      if (node) observer.unobserve(node);
    };
  }, [isLoading, hasMore, loadMore]);

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
            {/* <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search..."
              className="pl-8"
            /> */}
          </div>
          <DropdownMenu onOpenChange={(open:any) => {
            if (open) {
              fetchNotifications();
            }
          }}>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                    {notificationCount}
                  </span>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-96">
              <div className="max-h-[80vh] overflow-y-auto">
                <div className="sticky top-0 p-3 bg-background border-b flex items-center justify-between">
                  <h3 className="font-semibold">Notifications</h3>
                  {notificationCount > 0 && (
                    <span className="text-xs px-2 py-1 bg-red-100 text-red-600 rounded-full">
                      {notificationCount} unread
                    </span>
                  )}
                </div>

                {notifications.length === 0 && !isLoading ? (
                  <div className="p-8 text-center text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No notifications yet</p>
                  </div>
                ) : (
                  <div className="divide-y">
                    {notifications.map((notification:any) => (
                      <div
                        key={notification.id}
                        className={`p-4 hover:bg-accent transition-colors ${
                          !notification.is_read ? 'bg-accent/20' : ''
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-2 h-2 mt-2 rounded-full ${
                            notification.is_read ? 'bg-muted' : 'bg-blue-500'
                          }`} />
                          <div className="flex-1">
                            <p className="text-sm leading-relaxed">{notification.message}</p>
                            <span className="text-xs text-muted-foreground">
                              {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Intersection Observer Target */}
                    <div 
                      ref={(node) => {
                        if (node) {
                          intersectionObserver(node);
                        }
                        
                      }}
                      className="h-4"
                    />
                    
                    {/* Loading indicator */}
                    {isLoading && (
                      <div className="p-4 text-center text-sm text-muted-foreground">
                        Loading more notifications...
                      </div>
                    )}
                  </div>
                )}
              </div>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
