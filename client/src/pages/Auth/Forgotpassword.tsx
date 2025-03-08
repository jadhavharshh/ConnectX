import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"

export function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [otp, setOtp] = useState("")
  const [step, setStep] = useState<"enterEmail" | "enterOtp">("enterEmail")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const navigate = useNavigate()

  // Handler to send OTP to email
  const handleSendOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setMessage("")
    try {
      const response = await fetch("http://localhost:5000/api/send-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "Failed to send OTP.")
      } else {
        setMessage("OTP sent! Please check your email.")
        setStep("enterOtp")
      }
    } catch (err) {
      setError("An error occurred while sending OTP.")
    }
  }

  // Handler to verify OTP
  const handleVerifyOtp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError("")
    setMessage("")
    try {
      const response = await fetch("/api/verify-otp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp })
      })
      const data = await response.json()
      if (!response.ok) {
        setError(data.error || "OTP verification failed.")
      } else {
        setMessage("OTP verified! You can now reset your password.")
        // Redirect to password reset page or show reset password form
        navigate("/reset-password", { state: { email } })
      }
    } catch (err) {
      setError("An error occurred while verifying OTP.")
    }
  }

  return (
    <div className="max-w-md mx-auto p-4">
      {step === "enterEmail" && (
        <form onSubmit={handleSendOtp}>
          <h2 className="text-2xl font-bold mb-4">Forgot Password</h2>
          <div className="mb-4">
            <Label htmlFor="forgotEmail">Enter your registered email</Label>
            <Input
              id="forgotEmail"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          {message && <p className="text-green-600 mb-2">{message}</p>}
          <Button type="submit" className="w-full">
            Send OTP
          </Button>
        </form>
      )}
      
      {step === "enterOtp" && (
        <form onSubmit={handleVerifyOtp}>
          <h2 className="text-2xl font-bold mb-4">OTP Verification</h2>
          <p className="mb-4">
            An OTP has been sent to {email}. Please enter it below.
          </p>
          <div className="mb-4">
            <Label htmlFor="otp">OTP</Label>
            <Input
              id="otp"
              type="text"
              placeholder="Enter OTP"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              required
            />
          </div>
          {error && <p className="text-red-600 mb-2">{error}</p>}
          {message && <p className="text-green-600 mb-2">{message}</p>}
          <Button type="submit" className="w-full">
            Verify OTP
          </Button>
        </form>
      )}
    </div>
  )
}