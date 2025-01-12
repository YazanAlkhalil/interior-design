import { FC, useState, useEffect, useRef } from "react";
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
  ClipboardList,
  MessageSquare,
} from "lucide-react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { useCart } from "../../context/CartContext";
import { useLanguage} from "../../context/LanguageContext";
import Lottie from "lottie-react";
import animationData from "../../assets/SK.json";
import { motion, AnimatePresence } from "framer-motion";
import logoImage from "../../assets/images/logo.png";
const backgroundAudio = require('../../assets/AUD-20241204-WA0021 (1).mp3');

const MainLayout: FC = () => {
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const { cartCount } = useCart();
  const { t, language, setLanguage } = useLanguage();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Create audio element
    audioRef.current = new Audio(backgroundAudio);
    audioRef.current.loop = true; // Make the audio loop
    audioRef.current.volume = 0.3; // Adjust volume (0.0 to 1.0)

    // Play audio when component mounts
    const playAudio = async () => {
      try {
        if (audioRef.current) {
          await audioRef.current.play();
        }
      } catch (error) {
        console.log("Audio autoplay failed:", error);
      }
    };
    playAudio();

    // Cleanup function to stop audio when component unmounts
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    };
  }, []); // Empty dependency array means this runs once on mount

  return (
    <div className="min-h-screen bg-background">
      <AnimatePresence>
        {isInitialLoad ? (
          <motion.div
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center bg-background z-50"
          >
            <motion.div
              exit={{
                scale: 0.3,
                y: -window.innerHeight/2 + 32,
                x: -window.innerWidth/2 + 112,
                transition: { duration: 0.5 }
              }}
            >
              <Lottie
                animationData={animationData}
                className="w-96"
                loop={false}
                autoplay={true}
              />
            </motion.div>
          </motion.div>
        ) : null}
      </AnimatePresence>

      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center">
          <Link to="/home" className="mr-6 flex items-center space-x-2">
            <img 
              src={logoImage} 
              alt="Logo" 
              className="w-28"
            />
          </Link>

          {/* Navigation Links */}
          <nav className="flex flex-1 items-center space-x-6 rtl:space-x-reverse">
            <NavLink 
              to="/home" 
              end
              className={({ isActive }) => `flex items-center gap-2 ${isActive ? 'text-primary' : ''}`}
            >
              <Home className="h-4 w-4" />
              <span>{t('common.home')}</span>
            </NavLink>
            <NavLink 
              to="/home/sections" 
              className={({ isActive }) => `flex items-center gap-2 ${isActive ? 'text-primary' : ''}`}
            >
              <Package className="h-4 w-4" />
              <span>{t('common.sections')}</span>
            </NavLink>
            <NavLink 
              to="/home/services" 
              className={({ isActive }) => `flex items-center gap-2 ${isActive ? 'text-primary' : ''}`}
            >
              <Settings className="h-4 w-4" />
              <span>{t('common.services')}</span>
            </NavLink>
            <NavLink 
              to="/home/orders" 
              className={({ isActive }) => `flex items-center gap-2 ${isActive ? 'text-primary' : ''}`}
            >
              <ClipboardList className="h-4 w-4" />
              <span>{t('common.orders')}</span>
            </NavLink>
            <NavLink 
              to="/home/complaints" 
              className={({ isActive }) => `flex items-center gap-2 ${isActive ? 'text-primary' : ''}`}
            >
              <MessageSquare className="h-4 w-4" />
              <span>{t('common.complaints')}</span>
            </NavLink>
          </nav>

          {/* Search Bar */}
          {/* <div className="flex items-center max-w-sm flex-1 mr-4">
            <div className="relative w-full">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                className="w-full pl-8"
              />
            </div>
          </div> */}

          {/* Right Side Icons */}
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setLanguage(language === 'en' ? 'ar' : 'en')}
              className="flex items-center gap-2"
            >
              {language === 'en' ? 'العربية' : 'English'}
            </Button>

            {/* <Link to="/notifications">
              <Button variant="ghost" size="icon">
                <Bell className="h-5 w-5" />
              </Button>
            </Link> */}
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
            © 2024 SERINE KAMAL. {t('common.allRightsReserved')}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
