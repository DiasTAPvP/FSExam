import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useWindFarm, FARM_ID } from "../context/WindFarmContext";
import { FarmOverview } from "../components/FarmOverview";
import { TurbineCard } from "../components/TurbineCard";
import { TurbineHistoryChart } from "../components/TurbineHistoryChart";
import { AlertsPanel } from "../components/AlertsPanel";
import { CommandPanel } from "../components/CommandPanel";
import { TelemetryTable } from "../components/TelemetryTable";
import {
  Wind,
  LayoutDashboard,
  Activity,
  Bell,
  Terminal,
  LogOut,
  ChevronRight,
  Copy,
} from "lucide-react";

type Tab = "overview" | "telemetry" | "alerts" | "commands";

const NAV_ITEMS: { id: Tab; label: string; Icon: typeof Wind }[] = [
  { id: "overview", label: "Overview", Icon: LayoutDashboard },
  { id: "telemetry", label: "Telemetry", Icon: Activity },
  { id: "alerts", label: "Alerts", Icon: Bell },
  { id: "commands", label: "Commands", Icon: Terminal },
];

const BG = "#0c1d2f";
const SIDEBAR_BG = "#091929";
const PANEL_BG = "#0f2035";
const BORDER = "rgba(255,255,255,0.07)";

export function DashboardPage() {
  const { username, logout } = useAuth();
  const { telemetry, alerts } = useWindFarm();
  const [activeTab, setActiveTab] = useState<Tab>("overview");
  const [selectedTurbine, setSelectedTurbine] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [farmIdCopied, setFarmIdCopied] = useState(false);

  const unreadAlerts = alerts.filter((a) => a.severity !== "info").length;

  const handleCopyFarmId = () => {
    navigator.clipboard.writeText(FARM_ID).catch(() => {});
    setFarmIdCopied(true);
    setTimeout(() => setFarmIdCopied(false), 1500);
  };

  const handleSelectTurbine = (id: string) => {
    setSelectedTurbine((prev) => (prev === id ? null : id));
  };

  return (
    <div
      className="flex h-screen w-full overflow-hidden"
      style={{ background: BG, fontFamily: "monospace" }}
    >
      {/* ── Sidebar ── */}
      <aside
        className="flex flex-col shrink-0 z-20"
        style={{
          width: "200px",
          background: SIDEBAR_BG,
          borderRight: `1px solid ${BORDER}`,
          transform: sidebarOpen ? "translateX(0)" : undefined,
        }}
      >
        {/* Logo */}
        <div
          className="flex items-center gap-2 px-4 py-4"
          style={{ borderBottom: `1px solid ${BORDER}` }}
        >
          <Wind size={18} color="#38bdf8" />
          <div>
            <div style={{ color: "#e2e8f0", fontSize: "0.75rem", letterSpacing: "0.05em" }}>
              WIND FARM
            </div>
            <div style={{ color: "#374151", fontSize: "0.55rem" }}>CONTROL SYSTEM</div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex flex-col gap-0.5 p-2 flex-1">
          {NAV_ITEMS.map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                onClick={() => {
                  setActiveTab(id);
                  setSidebarOpen(false);
                }}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  padding: "9px 12px",
                  borderRadius: "5px",
                  background: active ? "rgba(56,189,248,0.1)" : "transparent",
                  border: `1px solid ${active ? "rgba(56,189,248,0.25)" : "transparent"}`,
                  color: active ? "#7dd3fc" : "#6b7280",
                  cursor: "pointer",
                  textAlign: "left",
                  width: "100%",
                  fontSize: "0.75rem",
                  transition: "all 0.15s",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  if (!active) (e.currentTarget.style.color = "#9ca3af");
                }}
                onMouseLeave={(e) => {
                  if (!active) (e.currentTarget.style.color = "#6b7280");
                }}
              >
                <Icon size={14} />
                {label}
                {id === "alerts" && unreadAlerts > 0 && (
                  <span
                    style={{
                      marginLeft: "auto",
                      background: "#ef4444",
                      borderRadius: "9px",
                      color: "#fff",
                      fontSize: "0.55rem",
                      padding: "1px 5px",
                      minWidth: "18px",
                      textAlign: "center",
                    }}
                  >
                    {unreadAlerts}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* User */}
        <div
          className="px-4 py-3 flex flex-col gap-2"
          style={{ borderTop: `1px solid ${BORDER}` }}
        >
          <div style={{ color: "#374151", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
            Operator
          </div>
          <div style={{ color: "#9ca3af", fontSize: "0.72rem" }}>{username}</div>
          <button
            onClick={logout}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              background: "none",
              border: "none",
              color: "#4b5563",
              cursor: "pointer",
              fontSize: "0.68rem",
              padding: "0",
              marginTop: "2px",
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = "#f87171")}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#4b5563")}
          >
            <LogOut size={12} />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Top bar */}
        <header
          className="flex items-center justify-between px-4 py-2 shrink-0"
          style={{ borderBottom: `1px solid ${BORDER}`, background: PANEL_BG, minHeight: "44px" }}
        >
          <div className="flex items-center gap-2">
            <span style={{ color: "#7dd3fc", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
              {"// "}
              {NAV_ITEMS.find((n) => n.id === activeTab)?.label.toUpperCase()}
            </span>
            {selectedTurbine && (
              <>
                <ChevronRight size={12} color="#374151" />
                <span style={{ color: "#f97316", fontSize: "0.7rem" }}>{selectedTurbine}</span>
              </>
            )}
          </div>

          <div className="flex items-center gap-3">
            <div
              className="hidden sm:flex items-center gap-2 rounded px-2 py-1"
              style={{ background: "rgba(0,0,0,0.3)", border: `1px solid ${BORDER}` }}
            >
              <span style={{ color: "#4b5563", fontSize: "0.6rem" }}>Farm ID:</span>
              <span style={{ color: "#f97316", fontSize: "0.6rem" }}>
                {FARM_ID.substring(0, 20)}…
              </span>
              <button
                onClick={handleCopyFarmId}
                style={{ background: "none", border: "none", cursor: "pointer", color: farmIdCopied ? "#4ade80" : "#6b7280", padding: "0", display: "flex" }}
                title="Copy Farm ID"
              >
                <Copy size={11} />
              </button>
            </div>

            {/* Live indicator */}
            <div className="flex items-center gap-1.5">
              <span
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: "#4ade80",
                  boxShadow: "0 0 7px #4ade80",
                  display: "inline-block",
                  animation: "pulse-dot 2s infinite",
                }}
              />
              <span style={{ color: "#e2e8f0", fontSize: "0.68rem" }}>Live</span>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto p-4" style={{ background: BG }}>
          {/* ── Overview Tab ── */}
          {activeTab === "overview" && (
            <div className="flex flex-col gap-4">
              {/* Farm visual */}
              <FarmOverview
                telemetry={telemetry}
                selectedTurbine={selectedTurbine}
                onSelectTurbine={handleSelectTurbine}
              />

              {/* Chart for selected turbine */}
              {selectedTurbine && (
                <div 
                  className="rounded-lg overflow-hidden"
                  style={{ background: PANEL_BG, border: `1px solid ${BORDER}` }}
                >
                  <div className="px-4 py-2 flex justify-between items-center" style={{ borderBottom: `1px solid ${BORDER}` }}>
                     <span style={{ color: "#7dd3fc", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                        // PERFORMANCE ANALYSIS — {selectedTurbine}
                     </span>
                     <button 
                       onClick={() => setSelectedTurbine(null)}
                       style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563", fontSize: "0.6rem", fontFamily: "monospace" }}
                       onMouseEnter={(e) => (e.currentTarget.style.color = "#9ca3af")}
                       onMouseLeave={(e) => (e.currentTarget.style.color = "#4b5563")}
                     >
                       [CLOSE]
                     </button>
                  </div>
                  <div className="p-4">
                    <TurbineHistoryChart 
                       turbineId={selectedTurbine} 
                       turbineName={selectedTurbine} 
                    />
                  </div>
                </div>
              )}

              {/* Device list info */}
              <div
                className="rounded-lg overflow-hidden"
                style={{ background: PANEL_BG, border: `1px solid ${BORDER}` }}
              >
                <div
                  className="px-4 py-2"
                  style={{ borderBottom: `1px solid ${BORDER}` }}
                >
                  <span style={{ color: "#7dd3fc", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    // DEVICES
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        {["ID", "Name", "Location", "Status", "Power Output"].map((h) => (
                          <th
                            key={h}
                            style={{
                              padding: "8px 14px",
                              textAlign: "left",
                              color: "#4b5563",
                              fontSize: "0.65rem",
                              textTransform: "uppercase",
                              letterSpacing: "0.08em",
                              borderBottom: `1px solid ${BORDER}`,
                              whiteSpace: "nowrap",
                            }}
                          >
                            {h}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {[
                        { id: "turbine-alpha", name: "Alpha", location: "North Platform" },
                        { id: "turbine-beta", name: "Beta", location: "North Platform" },
                        { id: "turbine-gamma", name: "Gamma", location: "South Platform" },
                        { id: "turbine-delta", name: "Delta", location: "East Platform" },
                      ].map((t, i) => {
                        const data = telemetry[t.id];
                        return (
                          <tr
                            key={t.id}
                            onClick={() => handleSelectTurbine(t.id)}
                            style={{
                              cursor: "pointer",
                              background: selectedTurbine === t.id ? "rgba(56,189,248,0.05)" : i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
                              borderLeft: selectedTurbine === t.id ? "3px solid rgba(56,189,248,0.4)" : "3px solid transparent",
                            }}
                          >
                            <td style={{ padding: "8px 14px", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                              <span
                                style={{
                                  background: "rgba(249,115,22,0.1)",
                                  border: "1px solid rgba(249,115,22,0.3)",
                                  borderRadius: "3px",
                                  color: "#f97316",
                                  fontSize: "0.65rem",
                                  padding: "1px 6px",
                                }}
                              >
                                {t.id}
                              </span>
                            </td>
                            <td style={{ padding: "8px 14px", color: "#e2e8f0", fontSize: "0.75rem", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                              {t.name}
                            </td>
                            <td style={{ padding: "8px 14px", color: "#6b7280", fontSize: "0.72rem", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                              {t.location}
                            </td>
                            <td style={{ padding: "8px 14px", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                              {data && (
                                <span
                                  style={{
                                    display: "inline-flex",
                                    alignItems: "center",
                                    gap: "5px",
                                    background: data.status === "running" ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
                                    border: `1px solid ${data.status === "running" ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
                                    borderRadius: "4px",
                                    padding: "1px 6px",
                                    fontSize: "0.65rem",
                                    color: data.status === "running" ? "#4ade80" : "#f87171",
                                  }}
                                >
                                  <span style={{ width: 5, height: 5, borderRadius: "50%", background: data.status === "running" ? "#4ade80" : "#f87171", flexShrink: 0, display: "inline-block" }} />
                                  {data.status}
                                </span>
                              )}
                            </td>
                            <td style={{ padding: "8px 14px", color: data?.status === "stopped" ? "#4b5563" : "#4ade80", fontSize: "0.75rem", borderBottom: `1px solid rgba(255,255,255,0.04)` }}>
                              {data ? `${Math.round(data.powerOutput).toLocaleString()} kW` : "—"}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Turbine cards grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
                {[
                  { id: "turbine-alpha", name: "Alpha" },
                  { id: "turbine-beta", name: "Beta" },
                  { id: "turbine-gamma", name: "Gamma" },
                  { id: "turbine-delta", name: "Delta" },
                ].map((t) => {
                  const data = telemetry[t.id];
                  if (!data) return null;
                  return (
                    <TurbineCard
                      key={t.id}
                      data={data}
                      selected={selectedTurbine === t.id}
                      onClick={() => handleSelectTurbine(t.id)}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* ── Telemetry Tab ── */}
          {activeTab === "telemetry" && (
            <div className="flex flex-col gap-4">
              <div
                className="rounded-lg overflow-hidden"
                style={{ background: PANEL_BG, border: `1px solid ${BORDER}` }}
              >
                <div
                  className="px-4 py-3 flex items-center justify-between"
                  style={{ borderBottom: `1px solid ${BORDER}` }}
                >
                  <span style={{ color: "#7dd3fc", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    // DEVICE TELEMETRY (LIVE — 5s interval)
                  </span>
                  <span style={{ color: "#374151", fontSize: "0.65rem" }}>
                    Click column header to filter
                  </span>
                </div>
                <TelemetryTable
                  telemetry={telemetry}
                  selectedTurbine={selectedTurbine}
                  onSelectTurbine={(id) => handleSelectTurbine(id)}
                />
              </div>

              {/* JSON payload preview for selected turbine */}
              {selectedTurbine && telemetry[selectedTurbine] && (
                <div
                  className="rounded-lg overflow-hidden"
                  style={{ background: PANEL_BG, border: `1px solid ${BORDER}` }}
                >
                  <div
                    className="px-4 py-2"
                    style={{ borderBottom: `1px solid ${BORDER}` }}
                  >
                    <span style={{ color: "#7dd3fc", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                      // RAW TELEMETRY PAYLOAD — {selectedTurbine}
                    </span>
                  </div>
                  <pre
                    style={{
                      padding: "14px 18px",
                      color: "#4ade80",
                      fontSize: "0.72rem",
                      margin: 0,
                      overflowX: "auto",
                      lineHeight: 1.7,
                    }}
                  >
                    {JSON.stringify(telemetry[selectedTurbine], null, 2)}
                  </pre>
                </div>
              )}
            </div>
          )}

          {/* ── Alerts Tab ── */}
          {activeTab === "alerts" && (
            <div
              className="rounded-lg overflow-hidden"
              style={{ background: PANEL_BG, border: `1px solid ${BORDER}`, minHeight: "400px" }}
            >
              <AlertsPanel alerts={alerts} filter={selectedTurbine ?? undefined} />
            </div>
          )}

          {/* ── Commands Tab ── */}
          {activeTab === "commands" && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              <div
                className="rounded-lg overflow-hidden"
                style={{ background: PANEL_BG, border: `1px solid ${BORDER}` }}
              >
                <CommandPanel />
              </div>

              {/* MQTT topic hint */}
              <div
                className="rounded-lg overflow-hidden self-start"
                style={{ background: PANEL_BG, border: `1px solid ${BORDER}` }}
              >
                <div
                  className="px-4 py-3"
                  style={{ borderBottom: `1px solid ${BORDER}` }}
                >
                  <span style={{ color: "#7dd3fc", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}>
                    // COMMAND REFERENCE
                  </span>
                </div>
                <div className="p-4 flex flex-col gap-4">
                  {[
                    {
                      name: "Stop Turbine",
                      payload: `{\n  "action": "stop"\n}`,
                      fields: [{ key: "action", type: 'string – must be "stop"' }],
                    },
                    {
                      name: "Start Turbine",
                      payload: `{\n  "action": "start"\n}`,
                      fields: [{ key: "action", type: 'string – must be "start"' }],
                    },
                    {
                      name: "Set Blade Pitch",
                      payload: `{\n  "action": "setPitch",\n  "angle": 15.5\n}`,
                      fields: [
                        { key: "action", type: 'string – must be "setPitch"' },
                        { key: "angle", type: "number – pitch angle in degrees (0–30)" },
                      ],
                    },
                    {
                      name: "Set Reporting Interval",
                      payload: `{\n  "action": "setInterval",\n  "interval": 5\n}`,
                      fields: [
                        { key: "action", type: 'string – must be "setInterval"' },
                        { key: "interval", type: "number – seconds between reports" },
                      ],
                    },
                  ].map((cmd) => (
                    <div key={cmd.name}>
                      <div style={{ color: "#e2e8f0", fontSize: "0.78rem", marginBottom: "6px" }}>
                        {cmd.name}
                      </div>
                      <pre
                        style={{
                          background: "rgba(0,0,0,0.3)",
                          border: `1px solid ${BORDER}`,
                          borderRadius: "4px",
                          padding: "8px 12px",
                          color: "#4ade80",
                          fontSize: "0.68rem",
                          margin: "0 0 6px",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {cmd.payload}
                      </pre>
                      <div className="flex flex-col gap-1">
                        {cmd.fields.map((f) => (
                          <div key={f.key} className="flex items-start gap-2">
                            <span
                              style={{
                                background: "rgba(249,115,22,0.1)",
                                border: "1px solid rgba(249,115,22,0.25)",
                                borderRadius: "3px",
                                color: "#f97316",
                                fontSize: "0.6rem",
                                padding: "1px 5px",
                                flexShrink: 0,
                              }}
                            >
                              {f.key}
                            </span>
                            <span style={{ color: "#6b7280", fontSize: "0.65rem" }}>{f.type}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Pulse animation style */}
      <style>{`
        @keyframes pulse-dot {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.4; }
        }
        @keyframes spin-turbine {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
