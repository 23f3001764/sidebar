import { useState } from "react";
import { Loader2, MessageCircle } from "lucide-react";
import { upsertChatUser, setLocalUser } from "../../lib/chat";
import type { LocalUser } from "../../types/chat";

interface Props {
  onLogin: (user: LocalUser) => void;
}

export default function LoginPrompt({ onLogin }: Props) {
  const [username, setUsername] = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");

  async function handleJoin() {
    if (!username.trim()) { setError("Enter a username first"); return; }
    setLoading(true);
    setError("");
    try {
      // Generate a stable ID from username (simple demo approach)
      const id     = "u_" + username.trim().toLowerCase().replace(/\s+/g, "_");
      const avatar = `https://i.pravatar.cc/150?u=${id}`;
      const user: LocalUser = { id, username: username.trim(), avatar };

      await upsertChatUser(user);
      setLocalUser(user);
      onLogin(user);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center justify-center h-full gap-5 px-6 text-center">
      <div className="w-14 h-14 rounded-full bg-indigo-600/20 border border-indigo-500/30
        flex items-center justify-center">
        <MessageCircle size={24} className="text-indigo-400" />
      </div>

      <div>
        <h3 className="text-white font-bold text-base mb-1">Join Intelligence Chat</h3>
        <p className="text-white/35 text-xs">Pick a username to start chatting</p>
      </div>

      <div className="w-full max-w-[220px] space-y-2">
        <input
          value={username}
          onChange={e => setUsername(e.target.value)}
          onKeyDown={e => e.key === "Enter" && handleJoin()}
          placeholder="Your username"
          maxLength={32}
          className="w-full px-3 py-2 rounded-lg text-xs text-white text-center
            bg-white/[0.08] border border-white/[0.12] placeholder-white/25
            focus:outline-none focus:border-indigo-500/70 transition-colors"
        />
        {error && <p className="text-red-400 text-[10px]">{error}</p>}
        <button
          onClick={handleJoin}
          disabled={loading}
          className="w-full py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500
            text-white text-xs font-semibold disabled:opacity-50
            flex items-center justify-center gap-1.5 transition-colors"
        >
          {loading && <Loader2 size={11} className="animate-spin" />}
          {loading ? "Joining…" : "Join Chat →"}
        </button>
      </div>
    </div>
  );
}