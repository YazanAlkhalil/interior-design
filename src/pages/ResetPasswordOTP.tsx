import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import {
  InputOTP,
  InputOTPSlot,
  InputOTPGroup,
} from "../components/ui/input-otp";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "../components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useLanguage } from "../context/LanguageContext";



export default function ResetPasswordOTP() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();
  const { t } = useLanguage();
  console.log(email);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (timer > 0 && isResendDisabled) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setIsResendDisabled(false);
    }
    return () => clearInterval(interval);
  }, [timer, isResendDisabled]);

  const handleResendOTP = async () => {
    try {
      const res = await fetch('http://45.9.191.191/api/v1//password-reset-request//', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || t('auth.failedToResendOTP'));
      }
      
      toast.success(t('auth.otpResentSuccessfully'));
      setTimer(60);
      setIsResendDisabled(true);
    } catch (error) {
      toast.error(t('auth.failedToResendOTP'));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch('http://45.9.191.191/api/v1/password-reset-verify/', {
          method: "POST",
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            email,
            otp
          })
        });
        if (!res.ok) {
          const errorData = await res.json();
          toast.error(errorData.message || 'Something went wrong');
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        navigate('/reset-password', {state: {email}});
        const data = await res.json();
        toast.success(t('auth.emailVerifiedSuccessfully'));
        
      } catch (error) {
        toast.error(t('auth.emailVerificationFailed'));
        
      }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>{t('auth.verificationRequired')}</CardTitle>
          <CardDescription>
            {t('auth.enterOTP')}
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="flex gap-2 justify-center">
              <InputOTP
                maxLength={6}
                value={otp}
                onChange={(value) => setOtp(value)}
              >
                <InputOTPGroup>
                  <InputOTPSlot index={0} />
                  <InputOTPSlot index={1} />
                  <InputOTPSlot index={2} />
                  <InputOTPSlot index={3} />
                  <InputOTPSlot index={4} />
                  <InputOTPSlot index={5} />
                </InputOTPGroup>
              </InputOTP>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <div className="flex w-full justify-between">
              <Button
                variant="outline"
                onClick={() => setOtp("")}
              >
                {t('auth.clear')}
              </Button>
              <Button type="submit" className="text-white bg-primary">
                {t('auth.verify')}
              </Button>
            </div>
            <div className="flex w-full justify-center">
              <Button
                variant="ghost"
                onClick={handleResendOTP}
                disabled={isResendDisabled}
                type="button"
              >
                {t('auth.resendOTP')} {timer > 0 && `(${timer}s)`}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
