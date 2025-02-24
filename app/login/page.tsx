"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { CircleAlert, Lock } from "lucide-react";
import { ProgressBar } from "react-loader-spinner";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Login failed');
      }

      localStorage.setItem('userEmail', data.email);
      localStorage.setItem('authToken', data.token);
      router.push("/countdown");
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white/5 backdrop-blur-lg border-white/10">
        <div className="text-center space-y-2">
          <Lock className="w-12 h-12 mx-auto text-red-500" />
          <h1 className="text-3xl font-bold text-white justify-center flex"><img src="https://tedxajce.in/images/logo/logo.png"/></h1>
          <p className="text-gray-400">Sign in to reveal what's coming</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-red-500 text-sm text-center">{error}</p>
          )}
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              placeholder="Temporary password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
              disabled={isLoading}
            />
          </div>
            <Button 
            type="submit" 
            className="w-full bg-red-500 hover:bg-red-600 text-white flex justify-center items-center gap-2"
            disabled={isLoading}
            >
            {isLoading ? (
              <ProgressBar
              height="24"
              width="80"
              ariaLabel="progress-bar-loading"
              borderColor="#ffffff"
              barColor="#000000" // Tailwind's red-500
              />
            ) : (
              "Sign In"
            )}
            </Button>
            <div className="text-gray-400 text-sm text-center mt-4 flex items-center justify-center gap-2">
            <CircleAlert className="w-8 h-8 text-gray-400" />
        
            <span>Remember your email and password used for signing in!</span>
            </div>
        </form>
      </Card>
    </div>
  );
}