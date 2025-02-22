"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Lock } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual authentication
    router.push("/countdown");
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 space-y-6 bg-white/5 backdrop-blur-lg border-white/10">
        <div className="text-center space-y-2">
          <Lock className="w-12 h-12 mx-auto text-red-500" />
          <h1 className="text-3xl font-bold text-white">TEDx Event</h1>
          <p className="text-gray-400">Sign in to reveal what's coming</p>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              placeholder="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-gray-400"
              required
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
            />
          </div>
          <Button 
            type="submit" 
            className="w-full bg-red-500 hover:bg-red-600 text-white"
          >
            Sign In
          </Button>
        </form>
      </Card>
    </div>
  );
}