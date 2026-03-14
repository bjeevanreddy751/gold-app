"use client";

import { useState, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, ShieldAlert, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isSignupSuccess = searchParams.get('signup') === 'success';

  // 'user_login' | 'admin_login'
  const [view, setView] = useState("user_login");
  
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleUserLogin = (e: any) => {
    e.preventDefault();
    if (!username || !password) {
      setError("Please fill in all fields.");
      return;
    }

    // Special case: allow admin to login from main tab too
    if (username === "admin" && password === "admin") {
      localStorage.setItem('current_user', 'admin');
      router.push("/");
      return;
    }

    // Simulate getting user from DB
    const savedUsers = JSON.parse(localStorage.getItem('registered_users') || '[]');
    const user = savedUsers.find((u: any) => u.username === username && u.password === password);
    
    if (user) {
      localStorage.setItem('current_user', username);
      router.push("/");
    } else {
      setError("Invalid username or password. If you are new, please Sign Up first!");
    }
  };

  const handleAdminLogin = (e: any) => {
    e.preventDefault();
    if (username === "admin" && password === "admin") {
      localStorage.setItem('current_user', 'admin');
      router.push("/admin");
    } else {
      setError("Invalid admin credentials.");
    }
  };

  const switchView = (newView: string) => {
    setView(newView);
    setError("");
    setUsername("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground p-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card border rounded-3xl shadow-xl max-w-md w-full relative overflow-hidden flex flex-col">
        {/* Top Header Bar */}
        <div className={cn("absolute top-0 left-0 w-full h-2 transition-colors duration-500", 
          view === 'admin_login' ? "bg-red-500" : "bg-gradient-to-r from-yellow-400 via-yellow-600 to-gray-400")} 
        />
        
        {/* Tabs */}
        <div className="flex border-b bg-secondary/30">
          <button 
            onClick={() => switchView('user_login')} 
            className={cn("flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors", view === 'user_login' ? "text-primary border-b-2 border-primary bg-background" : "text-muted-foreground hover:bg-secondary/50")}
          >
            User Login
          </button>
          <button 
            onClick={() => switchView('admin_login')} 
            className={cn("flex-1 py-4 text-sm font-bold uppercase tracking-wider transition-colors", view === 'admin_login' ? "text-red-500 border-b-2 border-red-500 bg-background" : "text-muted-foreground hover:bg-secondary/50")}
          >
            Admin Access
          </button>
        </div>

        <div className="p-8">
          <div className="text-center mb-8">
            <div className={cn("inline-flex items-center justify-center p-4 rounded-full mb-4 transition-colors", 
                view === 'admin_login' ? "bg-red-500/10 text-red-500" : "bg-primary/10 text-primary")}>
              {view === 'user_login' && <Lock className="w-8 h-8" />}
              {view === 'admin_login' && <ShieldAlert className="w-8 h-8" />}
            </div>
            <h1 className="text-3xl font-black tracking-tighter">
              {view === 'user_login' && "Welcome Back"}
              {view === 'admin_login' && "System Admin"}
            </h1>
            <p className="text-muted-foreground mt-2">
              {view === 'admin_login' ? "Enter your security credentials" : "Login to your dashboard"}
            </p>
          </div>
          
          {isSignupSuccess && view === 'user_login' && !error && (
            <div className="mb-6 p-3 bg-green-500/10 border border-green-500/20 text-green-600 rounded-lg text-sm text-center font-medium flex items-center justify-center gap-2">
              <CheckCircle2 className="w-4 h-4" /> Account created! Please log in.
            </div>
          )}

          {error && <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 text-red-500 rounded-lg text-sm text-center font-medium">{error}</div>}

          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
              {view === 'user_login' && (
                <form onSubmit={handleUserLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Username</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-4 rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Your username" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Password</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-xl border bg-background focus:ring-2 focus:ring-primary outline-none transition-all" placeholder="Your password" />
                  </div>
                  <button type="submit" className="w-full mt-2 py-4 bg-primary text-primary-foreground rounded-xl font-bold uppercase tracking-widest hover:opacity-90 transition-all shadow-lg hover:shadow-primary/20">
                    Login to Dashboard
                  </button>
                  <p className="text-center mt-6 text-sm text-muted-foreground">
                    Don't have an account? <Link href="/signup" className="text-primary font-bold hover:underline">Sign Up</Link>
                  </p>
                </form>
              )}

              {view === 'admin_login' && (
                <form onSubmit={handleAdminLogin} className="space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Admin ID</label>
                    <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} className="w-full p-4 rounded-xl border bg-background focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="Enter Admin ID" />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">Security Key</label>
                    <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full p-4 rounded-xl border bg-background focus:ring-2 focus:ring-red-500 outline-none transition-all" placeholder="Enter Security Key" />
                  </div>
                  <button type="submit" className="w-full mt-2 py-4 bg-red-500 text-white rounded-xl font-bold uppercase tracking-widest hover:bg-red-600 transition-all shadow-lg hover:shadow-red-500/20">
                    Authenticate
                  </button>
                </form>
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LoginContent />
    </Suspense>
  )
}
