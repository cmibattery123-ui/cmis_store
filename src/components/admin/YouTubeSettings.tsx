"use client";

import { useState, useEffect } from "react";
import { Video, Key, Save, Loader2, CheckCircle2, ShieldAlert } from "lucide-react";
import { toast } from "sonner";

export default function YouTubeSettings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [refreshToken, setRefreshToken] = useState("");
  const [apiKey, setApiKey] = useState("");
  const [privacyStatus, setPrivacyStatus] = useState<"public" | "unlisted" | "private">("public");

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const res = await fetch("/api/admin/settings/youtube");
        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            setClientId(json.data.clientId || "");
            setClientSecret(json.data.clientSecret || "");
            setRefreshToken(json.data.refreshToken || "");
            setApiKey(json.data.apiKey || "");
            setPrivacyStatus(json.data.privacyStatus || "public");
          }
        }
      } catch (err) {
        console.error("Failed to load YouTube settings:", err);
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, []);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const res = await fetch("/api/admin/settings/youtube", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          clientId,
          clientSecret,
          refreshToken,
          apiKey,
          privacyStatus,
        }),
      });

      if (res.ok) {
        toast.success("YouTube integration settings saved successfully!");
      } else {
        const json = await res.json();
        toast.error(json.error || "Failed to save YouTube settings");
      }
    } catch {
      toast.error("Failed to save YouTube settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center gap-2 text-slate-400 font-mono text-xs">
        <Loader2 className="w-5 h-5 animate-spin text-amber-500 dark:text-primary" />
        <span>Loading YouTube Settings…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-lg font-heading font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Video className="w-5 h-5 text-red-600 dark:text-red-500" />
            YouTube Channel Integration
          </h2>
          <p className="text-xs text-slate-500 dark:text-gray-400 mt-1">
            Configure Google YouTube Data API v3 OAuth credentials for automatic video uploads and community posts.
          </p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300">
              OAuth2 Client ID
            </label>
            <input
              type="text"
              value={clientId}
              onChange={(e) => setClientId(e.target.value)}
              placeholder="e.g. 123456789-abc.apps.googleusercontent.com"
              className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300">
              OAuth2 Client Secret
            </label>
            <input
              type="password"
              value={clientSecret}
              onChange={(e) => setClientSecret(e.target.value)}
              placeholder="GOCSPX-••••••••••••••••"
              className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors text-sm font-mono"
            />
          </div>

          <div className="space-y-1.5 md:col-span-2">
            <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300">
              OAuth2 Refresh Token
            </label>
            <input
              type="password"
              value={refreshToken}
              onChange={(e) => setRefreshToken(e.target.value)}
              placeholder="1//04••••••••••••••••••••••••••••••••••••"
              className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors text-sm font-mono"
            />
            <p className="text-[11px] text-slate-500 dark:text-gray-400 mt-1 font-mono">
              The refresh token allows the server to automatically upload videos to your YouTube channel without re-prompting.
            </p>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300">
              Default Video Privacy
            </label>
            <select
              value={privacyStatus}
              onChange={(e) => setPrivacyStatus(e.target.value as any)}
              className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors text-sm"
            >
              <option value="public">Public (Visible to everyone on YouTube)</option>
              <option value="unlisted">Unlisted (Playable via embed link)</option>
              <option value="private">Private (Only channel managers)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-mono font-bold uppercase text-slate-600 dark:text-gray-300">
              YouTube API Key (Optional)
            </label>
            <input
              type="text"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIzaSy••••••••••••••••"
              className="w-full bg-slate-50 dark:bg-[#12131A] border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-gray-500 focus:outline-none focus:border-amber-500 dark:focus:border-primary transition-colors text-sm font-mono"
            />
          </div>
        </div>

        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-bold rounded-xl text-xs uppercase font-mono tracking-wider hover:bg-yellow-300 transition-colors disabled:opacity-50 cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            Save YouTube Credentials
          </button>
        </div>
      </form>
    </div>
  );
}
