"use client";
import React, { useState, useEffect } from "react";
import { Users, UserPlus, ShieldCheck, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";

export default function TeamPage() {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newMember, setNewMember] = useState({ name: "", email: "" });

  const fetchTeam = async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    const res = await fetch(`http://localhost:5000/api/team/${user.id}`);
    const data = await res.json();
    setMembers(data);
    setLoading(false);
  };

  useEffect(() => { fetchTeam(); }, []);

  const handleAddMember = async (e) => {
    e.preventDefault();
    const user = JSON.parse(localStorage.getItem("user"));
    await fetch("http://localhost:5000/api/team/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ownerId: user.id, ...newMember }),
    });
    setNewMember({ name: "", email: "" });
    fetchTeam();
  };

  if (loading) return <div className="min-h-screen bg-[#050505] flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" /></div>;

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8">
      <div className="max-w-5xl mx-auto">
        <Link href="/dashboard" className="flex items-center gap-2 text-zinc-500 hover:text-white mb-8 transition-colors">
          <ArrowLeft size={16} /> Return to Command Center
        </Link>

        <div className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">Team Management</h1>
            <p className="text-blue-500 text-xs font-bold uppercase tracking-[0.3em]">Business Tier Infrastructure</p>
          </div>
          <div className="bg-blue-500/10 border border-blue-500/20 px-4 py-2 rounded-xl flex items-center gap-2">
            <Users size={18} className="text-blue-500" />
            <span className="text-sm font-bold">{members.length} / 10 Seats</span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Add Member Form */}
          <div className="bg-zinc-900/50 border border-zinc-800 p-8 rounded-[2.5rem]">
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2"><UserPlus size={20}/> Provision New Seat</h3>
            <form onSubmit={handleAddMember} className="space-y-4">
              <input 
                type="text" placeholder="Full Name" required 
                className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-blue-500"
                value={newMember.name} onChange={(e) => setNewMember({...newMember, name: e.target.value})}
              />
              <input 
                type="email" placeholder="Email Address" required 
                className="w-full bg-black border border-zinc-800 p-4 rounded-xl outline-none focus:border-blue-500"
                value={newMember.email} onChange={(e) => setNewMember({...newMember, email: e.target.value})}
              />
              <button className="w-full bg-blue-600 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-blue-500 transition-all">
                Add Operator
              </button>
            </form>
          </div>

          {/* Member List */}
          <div className="lg:col-span-2 space-y-4">
            {members.map((member) => (
              <div key={member.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-2xl flex justify-between items-center hover:border-zinc-700 transition-all">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-zinc-800 rounded-full flex items-center justify-center text-blue-500 font-bold">
                    {member.member_name[0]}
                  </div>
                  <div>
                    <h4 className="font-bold">{member.member_name}</h4>
                    <p className="text-xs text-zinc-500">{member.member_email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  <ShieldCheck size={12} /> {member.role}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}