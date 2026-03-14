"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldAlert, Users, Database, LayoutDashboard, ArrowLeft, LogOut, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

export default function AdminDashboard() {
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [usersPortfolios, setUsersPortfolios] = useState<any[]>([]);
  const [usersAlerts, setUsersAlerts] = useState<any[]>([]);
  const [registeredUsers, setRegisteredUsers] = useState<any[]>([]);

  useEffect(() => {
    setMounted(true);
    
    // Auth Check: Only 'admin' can view this page
    const user = localStorage.getItem('current_user');
    if (user !== 'admin') {
      router.push('/login');
      return;
    }

    const loadData = () => {
      const savedPortfolio = localStorage.getItem('gold_portfolio');
      if (savedPortfolio) setUsersPortfolios(JSON.parse(savedPortfolio));
      
      const savedAlerts = localStorage.getItem('gold_alerts');
      if (savedAlerts) setUsersAlerts(JSON.parse(savedAlerts));

      const savedUsers = localStorage.getItem('registered_users');
      if (savedUsers) setRegisteredUsers(JSON.parse(savedUsers));
    };

    loadData();
  }, []);

  const deleteUser = (username: string) => {
    if (confirm(`Are you sure you want to delete user "${username}"?`)) {
      const updatedUsers = registeredUsers.filter(u => u.username !== username);
      setRegisteredUsers(updatedUsers);
      localStorage.setItem('registered_users', JSON.stringify(updatedUsers));
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('current_user');
    router.push('/login');
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col md:flex-row">
      {/* Sidebar */}
      <div className="w-full md:w-64 border-r bg-card p-6 flex flex-col">
        <div className="flex items-center gap-3 mb-10 text-primary">
          <ShieldAlert className="w-8 h-8" />
          <h1 className="font-black text-xl tracking-tighter uppercase">Admin Panel</h1>
        </div>
        <nav className="space-y-2 flex-1">
          <Link href="/admin" className="flex items-center gap-3 p-3 rounded-xl bg-primary text-primary-foreground font-semibold shadow-lg shadow-primary/20"><LayoutDashboard className="w-5 h-5" /> Overview</Link>
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary text-muted-foreground"><Users className="w-5 h-5" /> Users ({registeredUsers.length})</div>
          <div className="flex items-center gap-3 p-3 rounded-xl hover:bg-secondary text-muted-foreground cursor-not-allowed opacity-50"><Database className="w-5 h-5" /> Database (Locked)</div>
        </nav>
        
        <div className="pt-6 border-t mt-6 flex flex-col gap-2">
          <Link href="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground p-3 transition"><ArrowLeft className="w-4 h-4" /> Back to App</Link>
          <button onClick={handleLogout} className="flex items-center gap-2 text-red-500 hover:bg-red-500/10 p-3 rounded-xl transition"><LogOut className="w-4 h-4" /> Logout</button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 p-6 md:p-10 overflow-y-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black">System Overview</h2>
          <div className="px-4 py-2 bg-green-500/10 text-green-600 rounded-full text-xs font-bold flex items-center gap-2 border border-green-500/20">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> SERVER LIVE
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Total Users</p>
            <p className="text-4xl font-black text-primary">{registeredUsers.length}</p>
          </div>
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Global Assets</p>
            <p className="text-4xl font-black text-primary">{usersPortfolios.length}</p>
          </div>
          <div className="bg-card border rounded-2xl p-6 shadow-sm">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">Active Alerts</p>
            <p className="text-4xl font-black text-blue-500">{usersAlerts.length}</p>
          </div>
          <div className="bg-card border rounded-2xl p-6 shadow-sm bg-primary/5 border-primary/20">
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-2">System Load</p>
            <p className="text-4xl font-black text-primary">0.02ms</p>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 mb-8">
          {/* Registered Users */}
          <div className="xl:col-span-1 bg-card border rounded-3xl overflow-hidden shadow-sm flex flex-col h-[400px]">
            <div className="p-6 border-b bg-secondary/30 flex justify-between items-center">
              <h3 className="font-bold">Registered Users</h3>
              <span className="text-[10px] bg-primary text-primary-foreground px-2 py-0.5 rounded-full font-black">LATEST</span>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-card text-[10px] uppercase text-muted-foreground border-b z-10">
                  <tr><th className="p-4">User</th><th className="p-4">Email</th><th className="p-4">Action</th></tr>
                </thead>
                <tbody>
                  {registeredUsers.length === 0 ? (
                    <tr><td colSpan={3} className="p-8 text-center text-muted-foreground">No users registered yet.</td></tr>
                  ) : registeredUsers.map((u, i) => (
                    <tr key={i} className="border-b last:border-0 hover:bg-secondary/20 group">
                      <td className="p-4 font-bold text-primary">{u.username}</td>
                      <td className="p-4 text-xs text-muted-foreground truncate max-w-[120px]">{u.email}</td>
                      <td className="p-4">
                        <button 
                          onClick={() => deleteUser(u.username)}
                          className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-500/10 rounded-lg transition opacity-0 group-hover:opacity-100"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Portfolio Data */}
          <div className="xl:col-span-2 bg-card border rounded-3xl overflow-hidden shadow-sm flex flex-col h-[400px]">
            <div className="p-6 border-b bg-secondary/30">
              <h3 className="font-bold">Live Portfolio Feed</h3>
            </div>
            <div className="flex-1 overflow-y-auto">
              <table className="w-full text-left">
                <thead className="sticky top-0 bg-card text-[10px] uppercase text-muted-foreground border-b z-10">
                  <tr><th className="p-4">Asset</th><th className="p-4">Weight</th><th className="p-4">Invested</th><th className="p-4">Value</th></tr>
                </thead>
                <tbody>
                  {usersPortfolios.length === 0 ? (
                    <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No global portfolio data.</td></tr>
                  ) : usersPortfolios.map(p => (
                    <tr key={p.id} className="border-b last:border-0 hover:bg-secondary/20">
                      <td className="p-4 font-semibold capitalize text-primary">{p.asset.replace('_', ' ')}</td>
                      <td className="p-4">{p.weight}g</td>
                      <td className="p-4 font-mono text-sm text-muted-foreground">₹{p.buyPrice.toLocaleString()}</td>
                      <td className="p-4 font-mono font-bold">₹{p.buyPrice.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Alerts Data */}
        <div className="bg-card border rounded-3xl overflow-hidden shadow-sm flex flex-col h-[300px]">
          <div className="p-6 border-b bg-secondary/30">
            <h3 className="font-bold">Active Webhook Alerts</h3>
          </div>
          <div className="flex-1 overflow-y-auto">
            <table className="w-full text-left">
              <thead className="sticky top-0 bg-card text-[10px] uppercase text-muted-foreground border-b z-10">
                <tr><th className="p-4">Asset</th><th className="p-4">Condition</th><th className="p-4">Target Price</th><th className="p-4">Status</th></tr>
              </thead>
              <tbody>
                {usersAlerts.length === 0 ? (
                  <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">No active alerts found.</td></tr>
                ) : usersAlerts.map(a => (
                  <tr key={a.id} className="border-b last:border-0 hover:bg-secondary/20">
                    <td className="p-4 font-semibold capitalize text-blue-500">{a.asset.replace('_', ' ')}</td>
                    <td className="p-4 uppercase text-xs font-bold text-muted-foreground">{a.condition}</td>
                    <td className="p-4 font-mono font-black">₹{a.price.toLocaleString()}</td>
                    <td className="p-4"><span className="px-2 py-1 bg-green-500/10 text-green-600 rounded-full text-[10px] font-black border border-green-500/20">MONITORING</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
