import { FC, ReactNode } from "react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import {
  ShoppingCart,
  Bell,
  User,
  Home,
  Package,
  Settings,
  Search,
  LogOut,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useCart } from "../../context/CartContext";

const MainLayout: FC= () => {
  const { cartCount } = useCart();

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          {/* Logo */}
          <Link to="/home" className="mr-6 flex items-center space-x-2">
            <img src={require("../../assets/images/logo.png")} alt="logo" className="w-28" />
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-1 items-center space-x-6">
            <NavLink 
              to="/home" 
              end
              className={({ isActive }) => `flex items-center space-x-2 ${isActive ? 'text-primary' : ''}`}
            >
              <Home className="h-4 w-4" />
              <span>Home</span>
            </NavLink>
            <NavLink 
              to="/home/sections" 
              className={({ isActive }) => `flex items-center space-x-2 ${isActive ? 'text-primary' : ''}`}
            >
              <Package className="h-4 w-4" />
              <span>Sections</span>
            </NavLink>
            <NavLink 
              to="/home/services" 
              className={({ isActive }) => `flex items-center space-x-2 ${isActive ? 'text-primary' : ''}`}
            >
              <Settings className="h-4 w-4" />
              <span>Services</span>
            </NavLink>
          </nav>

          {/* Search Bar */}
          <div className="flex items-center max-w-sm flex-1 mr-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-full pl-8"
              />
            </div>
          </div>

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Link to="/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </Link>
            <Link to="/home/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground w-5 h-5 rounded-full text-xs flex items-center justify-center text-white">
                    {cartCount}
                  </span>
                )}
              </Button>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => {
              localStorage.clear();
              window.location.href = '/';
            }}>
              <LogOut className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container py-6">
        <Outlet />
          </main>

      {/* Footer */}
      <footer className="border-t">
        <div className="container py-6">
          <p className="text-center text-sm text-muted-foreground">
            © 2024 SERINE KAMAL. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
