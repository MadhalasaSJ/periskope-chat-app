"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mounted, setMounted] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) alert(error.message);
    else router.push("/chats");
  };

  if (!mounted) return null;

  return (
    <div className="flex items-center justify-center h-screen bg-black">
      <form onSubmit={handleLogin} className="bg-white p-6 rounded shadow-md w-full max-w-sm">
        <h1 className="text-2xl font-bold mb-4 text-center">Login</h1>
        <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full border p-2 mb-3" />
        <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" className="w-full border p-2 mb-4" />
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded">Sign In</button>
      </form>
    </div>
  );
}
