import { useState } from "react"
import { Button } from "../components/ui/button"
import { Input } from "../components/ui/input"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,   
  CardTitle,
} from "../components/ui/card"
import { Label } from "../components/ui/label"
import { toast } from "react-hot-toast"
import { useNavigate, useLocation } from "react-router-dom"

export default function ResetPassword() {
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const navigate = useNavigate();
  const location = useLocation();
  const email = location.state.email;
  const handleSubmit = async (e: React.FormEvent) => {
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    e.preventDefault()
    const res = await fetch(`http://45.9.191.191/api/v1/password-reset/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({new_password: password, email})
    })
    if (!res.ok) {
      toast.error('Password reset failed. Please try again.');
      throw new Error(`HTTP error! status: ${res.status}`);
    }
    toast.success('Password reset successful!');
    navigate('/');
  }

  return (
    <div className="container flex items-center justify-center min-h-screen">
      <Card className="w-[400px]">
        <CardHeader>
          <CardTitle>Reset Password</CardTitle>
          <CardDescription>
            Please enter your new password below.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your new password"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your new password"
              />
            </div>
            <Button type="submit" className="w-full text-white">
              Reset Password
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
