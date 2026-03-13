import { useState } from "react";
import { useNavigate } from "react-router";
import { useAuth } from "../context/AuthContext";
import { Wind, Eye, EyeOff, AlertCircle } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const ok = await login(username, password);
    if (ok) {
      navigate("/");
    } else {
      setError("Invalid credentials. Please try again.");
    }
    setLoading(false);
  };

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center"
      style={{ background: "linear-gradient(160deg, #0d1f35 0%, #0a2a38 50%, #07242e 100%)" }}
    >
      {/* Ocean horizon decorative strip */}
      <div
        className="absolute bottom-0 left-0 right-0 h-40 opacity-30"
        style={{ background: "linear-gradient(to top, #0e3a46, transparent)" }}
      />

      <div className="relative z-10 w-full max-w-sm px-6">
        {/* Logo / Header */}
        <div className="flex flex-col items-center mb-8">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center mb-4"
            style={{ background: "rgba(255,255,255,0.07)", border: "1px solid rgba(255,255,255,0.12)" }}
          >
            <Wind size={28} color="#7dd3fc" />
          </div>
          <h1
            className="text-white tracking-wide"
            style={{ fontFamily: "monospace", fontSize: "1.3rem", fontWeight: 600, letterSpacing: "0.05em" }}
          >
            WIND FARM CONTROL
          </h1>
          <p style={{ color: "#5ba8c4", fontFamily: "monospace", fontSize: "0.75rem", marginTop: "4px" }}>
            Operator Access Portal
          </p>
        </div>

        {/* Card */}
        <div
          className="rounded-lg p-6"
          style={{
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.1)",
            backdropFilter: "blur(8px)",
          }}
        >
          <p
            className="mb-5"
            style={{ color: "#7dd3fc", fontFamily: "monospace", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            // OPERATOR LOGIN
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <label style={{ color: "#9ca3af", fontFamily: "monospace", fontSize: "0.75rem" }}>
                Username
              </label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="operator"
                autoComplete="username"
                required
                style={{
                  background: "rgba(0,0,0,0.3)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "6px",
                  color: "#e2e8f0",
                  fontFamily: "monospace",
                  fontSize: "0.9rem",
                  padding: "10px 12px",
                  outline: "none",
                  width: "100%",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
                onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label style={{ color: "#9ca3af", fontFamily: "monospace", fontSize: "0.75rem" }}>
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  autoComplete="current-password"
                  required
                  style={{
                    background: "rgba(0,0,0,0.3)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    borderRadius: "6px",
                    color: "#e2e8f0",
                    fontFamily: "monospace",
                    fontSize: "0.9rem",
                    padding: "10px 40px 10px 12px",
                    outline: "none",
                    width: "100%",
                    boxSizing: "border-box",
                  }}
                  onFocus={(e) => (e.target.style.borderColor = "#38bdf8")}
                  onBlur={(e) => (e.target.style.borderColor = "rgba(255,255,255,0.12)")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "#6b7280", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div
                className="flex items-center gap-2 rounded px-3 py-2"
                style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}
              >
                <AlertCircle size={14} color="#f87171" />
                <span style={{ color: "#f87171", fontFamily: "monospace", fontSize: "0.75rem" }}>
                  {error}
                </span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? "rgba(56,189,248,0.4)" : "rgba(56,189,248,0.2)",
                border: "1px solid rgba(56,189,248,0.4)",
                borderRadius: "6px",
                color: "#7dd3fc",
                fontFamily: "monospace",
                fontSize: "0.85rem",
                letterSpacing: "0.05em",
                padding: "11px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s",
                marginTop: "4px",
              }}
              onMouseEnter={(e) => {
                if (!loading) (e.currentTarget.style.background = "rgba(56,189,248,0.3)");
              }}
              onMouseLeave={(e) => {
                if (!loading) (e.currentTarget.style.background = "rgba(56,189,248,0.2)");
              }}
            >
              {loading ? "AUTHENTICATING..." : "LOGIN"}
            </button>
          </form>

          <p
            className="text-center mt-5"
            style={{ color: "#374151", fontFamily: "monospace", fontSize: "0.65rem" }}
          >
            Use: operator / hashed_windmill123
          </p>
        </div>

        <p
          className="text-center mt-6"
          style={{ color: "#1e3a4a", fontFamily: "monospace", fontSize: "0.6rem" }}
        >
          FARM ID: {"{"}0b57aefe-6e6c-4a36-ad90-880321aa6d7b{"}"}
        </p>
      </div>
    </div>
  );
}
