"use client";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Nav from "@/components/Nav"; // Import matches the new name

export default function DashboardLayout({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    if (!savedUser) {
      router.push("/login");
    } else {
      setUser(JSON.parse(savedUser));
      setLoading(false);
    }
  }, [router]);

  if (loading) return null;

  return (
    <div className="min-h-screen bg-black">
      <Nav user={user} />
      {/* Content starts below the Nav height */}
      <main className="pt-24 px-6">
        {children}
      </main>
    </div>
  );
}