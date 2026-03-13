import { useState } from "react";
import { useWindFarm, TURBINES } from "../context/WindFarmContext";
import type { CommandLog } from "../types";
import { TurbineStatusBadge } from "./TurbineStatusBadge";
import { Send, CheckCircle, Clock, XCircle, Terminal } from "lucide-react";

type CommandType = "Stop Turbine" | "Start Turbine" | "Set Blade Pitch" | "Set Reporting Interval";

const COMMANDS: CommandType[] = [
  "Stop Turbine",
  "Start Turbine",
  "Set Blade Pitch",
  "Set Reporting Interval",
];

function statusIcon(status: CommandLog["status"]) {
  if (status === "acknowledged") return <CheckCircle size={12} color="#4ade80" />;
  if (status === "failed") return <XCircle size={12} color="#f87171" />;
  return <Clock size={12} color="#fbbf24" />;
}

export function CommandPanel() {
  const { sendCommand, commandLog, telemetry } = useWindFarm();
  const [selectedTurbine, setSelectedTurbine] = useState(TURBINES[0].id);
  const [selectedCommand, setSelectedCommand] = useState<CommandType>("Stop Turbine");
  const [bladePitch, setBladePitch] = useState("10");
  const [reportInterval, setReportInterval] = useState("5");
  const [sent, setSent] = useState(false);

  const turbineStatus = telemetry[selectedTurbine]?.status ?? "stopped";

  const handleSend = () => {
    let payload: Record<string, unknown> = {};
    if (selectedCommand === "Stop Turbine") {
      payload = { action: "stop" };
    } else if (selectedCommand === "Start Turbine") {
      payload = { action: "start" };
    } else if (selectedCommand === "Set Blade Pitch") {
      payload = { action: "setPitch", angle: parseFloat(bladePitch) };
    } else if (selectedCommand === "Set Reporting Interval") {
      payload = { action: "setInterval", interval: parseInt(reportInterval) };
    }
    sendCommand(selectedTurbine, selectedCommand, payload);
    setSent(true);
    setTimeout(() => setSent(false), 1500);
  };

  // Payload preview JSON
  const getPayloadPreview = () => {
    if (selectedCommand === "Stop Turbine") return `{\n  "action": "stop"\n}`;
    if (selectedCommand === "Start Turbine") return `{\n  "action": "start"\n}`;
    if (selectedCommand === "Set Blade Pitch")
      return `{\n  "action": "setPitch",\n  "angle": ${bladePitch || 0}\n}`;
    if (selectedCommand === "Set Reporting Interval")
      return `{\n  "action": "setInterval",\n  "interval": ${reportInterval || 5}\n}`;
    return "{}";
  };

  return (
    <div className="flex flex-col gap-0 h-full">
      {/* Header */}
      <div
        className="px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <span
          style={{ color: "#7dd3fc", fontFamily: "monospace", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          // SEND COMMAND
        </span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="p-4 flex flex-col gap-4">
          {/* Turbine selector */}
          <div>
            <label
              style={{ color: "#6b7280", fontFamily: "monospace", fontSize: "0.65rem", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              Target Turbine
            </label>
            <div className="grid grid-cols-2 gap-2">
              {TURBINES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setSelectedTurbine(t.id)}
                  style={{
                    background: selectedTurbine === t.id ? "rgba(56,189,248,0.12)" : "rgba(255,255,255,0.03)",
                    border: `1px solid ${selectedTurbine === t.id ? "rgba(56,189,248,0.4)" : "rgba(255,255,255,0.08)"}`,
                    borderRadius: "6px",
                    padding: "8px 10px",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ color: "#e2e8f0", fontFamily: "monospace", fontSize: "0.78rem" }}>
                    {t.name}
                  </div>
                  <div style={{ color: "#f97316", fontFamily: "monospace", fontSize: "0.6rem" }}>
                    {t.id}
                  </div>
                </button>
              ))}
            </div>
            {/* Current status of selected turbine */}
            <div className="mt-2 flex items-center gap-2">
              <span style={{ color: "#4b5563", fontFamily: "monospace", fontSize: "0.65rem" }}>Current:</span>
              <TurbineStatusBadge status={turbineStatus} small />
            </div>
          </div>

          {/* Command selector */}
          <div>
            <label
              style={{ color: "#6b7280", fontFamily: "monospace", fontSize: "0.65rem", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              Command
            </label>
            <div className="flex flex-col gap-1.5">
              {COMMANDS.map((cmd) => (
                <button
                  key={cmd}
                  onClick={() => setSelectedCommand(cmd)}
                  style={{
                    background: selectedCommand === cmd ? "rgba(56,189,248,0.1)" : "rgba(255,255,255,0.02)",
                    border: `1px solid ${selectedCommand === cmd ? "rgba(56,189,248,0.35)" : "rgba(255,255,255,0.07)"}`,
                    borderRadius: "5px",
                    padding: "7px 10px",
                    cursor: "pointer",
                    textAlign: "left",
                    color: selectedCommand === cmd ? "#7dd3fc" : "#9ca3af",
                    fontFamily: "monospace",
                    fontSize: "0.75rem",
                    transition: "all 0.15s",
                  }}
                >
                  {cmd}
                </button>
              ))}
            </div>
          </div>

          {/* Command-specific inputs */}
          {selectedCommand === "Set Blade Pitch" && (
            <div>
              <label style={{ color: "#6b7280", fontFamily: "monospace", fontSize: "0.65rem", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Blade Pitch Angle (0–30°)
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="0"
                  max="30"
                  step="0.5"
                  value={bladePitch}
                  onChange={(e) => setBladePitch(e.target.value)}
                  style={{ flex: 1, accentColor: "#38bdf8" }}
                />
                <span
                  style={{
                    color: "#7dd3fc",
                    fontFamily: "monospace",
                    fontSize: "0.85rem",
                    minWidth: "40px",
                    textAlign: "right",
                  }}
                >
                  {bladePitch}°
                </span>
              </div>
            </div>
          )}

          {selectedCommand === "Set Reporting Interval" && (
            <div>
              <label style={{ color: "#6b7280", fontFamily: "monospace", fontSize: "0.65rem", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Interval (seconds)
              </label>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 30, 60].map((v) => (
                  <button
                    key={v}
                    onClick={() => setReportInterval(String(v))}
                    style={{
                      background: reportInterval === String(v) ? "rgba(56,189,248,0.15)" : "rgba(255,255,255,0.03)",
                      border: `1px solid ${reportInterval === String(v) ? "rgba(56,189,248,0.35)" : "rgba(255,255,255,0.08)"}`,
                      borderRadius: "4px",
                      padding: "5px 8px",
                      cursor: "pointer",
                      color: reportInterval === String(v) ? "#7dd3fc" : "#6b7280",
                      fontFamily: "monospace",
                      fontSize: "0.72rem",
                    }}
                  >
                    {v}s
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Payload preview */}
          <div>
            <label
              style={{ color: "#6b7280", fontFamily: "monospace", fontSize: "0.65rem", display: "block", marginBottom: "6px", textTransform: "uppercase", letterSpacing: "0.08em" }}
            >
              Payload Preview
            </label>
            <pre
              style={{
                background: "rgba(0,0,0,0.35)",
                border: "1px solid rgba(255,255,255,0.07)",
                borderRadius: "5px",
                padding: "10px 12px",
                color: "#4ade80",
                fontFamily: "monospace",
                fontSize: "0.72rem",
                margin: 0,
                whiteSpace: "pre-wrap",
              }}
            >
              {getPayloadPreview()}
            </pre>
          </div>

          {/* Send button */}
          <button
            onClick={handleSend}
            style={{
              background: sent ? "rgba(74,222,128,0.15)" : "rgba(56,189,248,0.15)",
              border: `1px solid ${sent ? "rgba(74,222,128,0.4)" : "rgba(56,189,248,0.35)"}`,
              borderRadius: "6px",
              color: sent ? "#4ade80" : "#7dd3fc",
              fontFamily: "monospace",
              fontSize: "0.8rem",
              letterSpacing: "0.05em",
              padding: "10px",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              transition: "all 0.2s",
            }}
          >
            {sent ? <CheckCircle size={15} /> : <Send size={15} />}
            {sent ? "COMMAND SENT" : "SEND COMMAND"}
          </button>
        </div>

        {/* Command log */}
        {commandLog.length > 0 && (
          <div
            style={{ borderTop: "1px solid rgba(255,255,255,0.07)", paddingTop: "0" }}
          >
            <div
              className="flex items-center gap-2 px-4 py-2"
              style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}
            >
              <Terminal size={12} color="#6b7280" />
              <span style={{ color: "#6b7280", fontFamily: "monospace", fontSize: "0.65rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Command Log
              </span>
            </div>
            <div className="flex flex-col">
              {commandLog.slice(0, 8).map((entry) => (
                <div
                  key={entry.id}
                  className="flex items-start gap-2 px-4 py-2"
                  style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                >
                  <div style={{ marginTop: "2px" }}>{statusIcon(entry.status)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span style={{ color: "#f97316", fontFamily: "monospace", fontSize: "0.65rem" }}>
                        {TURBINES.find((t) => t.id === entry.turbineId)?.name}
                      </span>
                      <span style={{ color: "#9ca3af", fontFamily: "monospace", fontSize: "0.65rem" }}>
                        {entry.command}
                      </span>
                    </div>
                    <div style={{ color: "#374151", fontFamily: "monospace", fontSize: "0.6rem" }}>
                      {new Date(entry.timestamp).toLocaleTimeString()}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: "monospace",
                      fontSize: "0.6rem",
                      color: entry.status === "acknowledged" ? "#4ade80" : entry.status === "failed" ? "#f87171" : "#fbbf24",
                    }}
                  >
                    {entry.status?.toUpperCase() || "UNKNOWN"}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
