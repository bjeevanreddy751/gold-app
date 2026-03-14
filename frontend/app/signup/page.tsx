"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Signup() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");

  const handleUserSignup = (e: any) => {
    e.preventDefault();
    if (!username || !email || !password) {
      setError("Please fill in all fields.");
      return;
    }
    
    // Simulate saving user to DB
    const savedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    if (savedUsers.find((u: any) => u.username === username)) {
      setError("Username already exists.");
      return;
    }
    
    savedUsers.push({ username, email, password });
    localStorage.setItem('registered_users', JSON.stringify(savedUsers));
    
    // Redirect to login after successful signup
    router.push("/login?signup=success");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-3xl p-8 shadow-xl max-w-md w-full relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-green-400 via-green-600 to-green-800"></div>
        
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center p-4 bg-green-500/10 text-green-500 rounded-full mb-4">
            <UserPlus className="w-8 h-8" />
          </div>
          <h1 className="text-3xl font-black tracking-tighter">Create Account</h1>
          <p className="text-muted-foreground mt-2">Join BullionPulse AI Platform</p>
        </div>
        
        {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center font-medium">{error}</div>}

        <form onSubmit={handleUserSignup} className="space-y-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full p-4 rounded-xl border bg-background focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="name@example.com" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Choose Username</label>
            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-4 rounded-xl border bg-background focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="Create a username" />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Create Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-xl border bg-background focus:ring-2 focus:ring-green-500 outline-none transition-all" placeholder="Create a strong password" />
          </div>
          <button type="submit" className="w-full mt-2 py-4 bg-green-600 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg hover:shadow-green-500/20">
            Sign Up Now
          </button>
        </form>
        
        <p className="text-center mt-6 text-sm text-muted-foreground">
          Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
        </p>
      </motion.div>
    </div>
  );
}