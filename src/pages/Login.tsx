import { useState } from 'react';
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Card, CardHeader, CardContent, CardFooter } from "../components/ui/card";
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthenticatedFetch } from '../hooks/useAuthenticatedFetch';
import { useLanguage } from '../context/LanguageContext';
export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate()
  const { authFetch } = useAuthenticatedFetch();
  const {t} = useLanguage()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await authFetch('login/', {
        method: "POST",
        body: JSON.stringify({ email, password })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        toast.error(errorData.en || 'Registration failed. Please try again.');
        setIsLoading(false);
        return;
      }
      
      const data = await res.json();
      localStorage.setItem('access', data.access);
      localStorage.setItem('refresh', data.refresh);
      localStorage.setItem('role', data.role);
      console.log(data.role)
      
      if(data.role === 'DEVELOPER') {
        console.log('developer');
        return navigate('/admin/overview');
      } else {
        console.log('user');
        return navigate('/home');
      }

    } catch (error) {
      toast.error(t('auth.loginFailed'));
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    localStorage.setItem('role', 'GUEST');
    navigate('/home');
  };

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-[400px]">
        <CardHeader className="text-2xl font-bold text-center text-[#27445C]">
          {t('auth.welcomeBack')}
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">{t('auth.email')}</Label>
              <Input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">{t('auth.password')}</Label>
              <Input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <div className="text-right">
                <Link to="/email" className="text-sm text-[#27445C] hover:underline">
                  {t('auth.forgotPassword')}
                </Link>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button 
              type="submit" 
              className="w-full text-white"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⭗</span>
                  {t('auth.signingIn')}
                </>
              ) : (
                t('auth.signIn')
              )}
            </Button>
            <Button 
              type="button"
              variant="outline"
              className="w-full border-primary text-primary hover:bg-primary/10"
              onClick={handleGuestAccess}
              disabled={isLoading}
            >
              {t('auth.continueAsGuest')}
            </Button>
            <div className="w-full text-center">
              {t('auth.needAccount')} {' '}
              <Link to="/signup" className="text-[#27445C] hover:underline">
                {t('auth.signUp')}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
} 
