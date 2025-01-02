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

export default function OTPVerification() {
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(60);
  const [isResendDisabled, setIsResendDisabled] = useState(true);
  const location = useLocation();
  const email = location.state?.email;
  const navigate = useNavigate();
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
      const res = await fetch('http://45.9.191.191/api/v1/resend-otp/', {
        method: "POST",
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email })
      });
      
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Failed to resend OTP');
      }
      
      toast.success('OTP resent successfully!');
      setTimer(60);
      setIsResendDisabled(true);
    } catch (error) {
      toast.error('Failed to resend OTP. Please try again.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
        const res = await fetch('http://45.9.191.191/api/v1/verification/', {
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
        navigate('/');
        const data = await res.json();
        toast.success('Email verified successfully!');
        
      } catch (error) {
        toast.error('Email verification failed. Please try again.');
        
      }
  };
  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Verification Required</CardTitle>
          <CardDescription>
            Please enter the 6-digit code sent to your device
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
                type="button"
              >
                Clear
              </Button>
              <Button type="submit" className="text-white bg-primary">
                Verify
              </Button>
            </div>
            <div className="flex w-full justify-center">
              <Button
                variant="ghost"
                onClick={handleResendOTP}
                disabled={isResendDisabled}
                type="button"
              >
                Resend OTP {timer > 0 && `(${timer}s)`}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
