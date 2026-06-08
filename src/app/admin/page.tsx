"use client";

import { useState, useEffect, useCallback } from "react";
import type { SiteConfig } from "@/lib/types";
import AdminLogin from "@/components/admin/AdminLogin";
import AdminDashboard from "@/components/admin/AdminDashboard";

export default function AdminPage() {
  const [token, setToken] = useState<string | null>(null);
  const [config, setConfig] = useState<SiteConfig | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("admin-token");
    if (saved) setToken(saved);
    setLoading(false);
  }, []);

  const loadConfig = useCallback(async () => {
    const res = await fetch("/api/admin/config", {
      headers: { "x-admin-token": token || "" },
    });
    if (res.ok) {
      const data = await res.json();
      setConfig(data);
    }
  }, [token]);

  useEffect(() => {
    if (token) loadConfig();
  }, [token, loadConfig]);

  const handleLogin = (newToken: string) => {
    localStorage.setItem("admin-token", newToken);
    setToken(newToken);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin-token");
    setToken(null);
    setConfig(null);
  };

  const handleSave = async (updated: SiteConfig) => {
    const res = await fetch("/api/admin/config", {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        "x-admin-token": token || "",
      },
      body: JSON.stringify(updated),
    });
    if (res.ok) {
      setConfig(updated);
      return true;
    }
    return false;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Carregando...</p>
      </div>
    );
  }

  if (!token) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  if (!config) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Carregando configurações...</p>
      </div>
    );
  }

  return (
    <AdminDashboard
      config={config}
      token={token}
      onSave={handleSave}
      onLogout={handleLogout}
    />
  );
}
