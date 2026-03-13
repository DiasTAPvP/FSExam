import { TURBINES } from "../context/WindFarmContext";
import type { Alert } from "../types";
import { useWindFarm } from "../context/WindFarmContext";
import { AlertTriangle, Info, Zap, X, Trash2 } from "lucide-react";

function severityIcon(severity: Alert["severity"]) {
  if (severity === "critical") return <Zap size={13} color="#f87171" />;
  if (severity === "warning") return <AlertTriangle size={13} color="#fbbf24" />;
  return <Info size={13} color="#60a5fa" />;
}

function severityColor(severity: Alert["severity"]) {
  if (severity === "critical") return { bg: "rgba(239,68,68,0.08)", border: "rgba(239,68,68,0.25)", text: "#f87171", tag: "CRITICAL" };
  if (severity === "warning") return { bg: "rgba(251,191,36,0.08)", border: "rgba(251,191,36,0.25)", text: "#fbbf24", tag: "WARNING" };
  return { bg: "rgba(96,165,250,0.08)", border: "rgba(96,165,250,0.25)", text: "#60a5fa", tag: "INFO" };
}

function turbineName(id: string) {
  return TURBINES.find((t) => t.id === id)?.name ?? id;
}

interface Props {
  alerts: Alert[];
  filter?: string;
}

export function AlertsPanel({ alerts, filter }: Props) {
  const { dismissAlert, clearAlerts } = useWindFarm();

  const displayed = filter ? alerts.filter((a) => a.turbineId === filter) : alerts;
  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount = alerts.filter((a) => a.severity === "warning").length;

  return (
    <div className="flex flex-col h-full">
      {/* Panel header */}
      <div
        className="flex items-center justify-between px-4 py-3"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.07)" }}
      >
        <div className="flex items-center gap-3">
          <span
            style={{ color: "#7dd3fc", fontFamily: "monospace", fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em" }}
          >
            // ALERTS
          </span>
          {criticalCount > 0 && (
            <span
              style={{
                background: "rgba(239,68,68,0.15)",
                border: "1px solid rgba(239,68,68,0.3)",
                borderRadius: "3px",
                color: "#f87171",
                fontFamily: "monospace",
                fontSize: "0.6rem",
                padding: "1px 5px",
              }}
            >
              {criticalCount} CRITICAL
            </span>
          )}
          {warningCount > 0 && (
            <span
              style={{
                background: "rgba(251,191,36,0.1)",
                border: "1px solid rgba(251,191,36,0.25)",
                borderRadius: "3px",
                color: "#fbbf24",
                fontFamily: "monospace",
                fontSize: "0.6rem",
                padding: "1px 5px",
              }}
            >
              {warningCount} WARN
            </span>
          )}
        </div>
        {alerts.length > 0 && (
          <button
            onClick={clearAlerts}
            style={{ background: "none", border: "none", cursor: "pointer", color: "#4b5563", display: "flex", alignItems: "center", gap: "4px", fontFamily: "monospace", fontSize: "0.65rem" }}
            title="Clear all alerts"
          >
            <Trash2 size={12} />
            Clear all
          </button>
        )}
      </div>

      {/* Alert list */}
      <div className="flex-1 overflow-y-auto" style={{ maxHeight: "100%" }}>
        {displayed.length === 0 ? (
          <div
            className="flex flex-col items-center justify-center h-32 gap-2"
            style={{ color: "#374151" }}
          >
            <Info size={20} />
            <span style={{ fontFamily: "monospace", fontSize: "0.75rem" }}>No alerts</span>
          </div>
        ) : (
          <div className="flex flex-col gap-0">
            {displayed.map((alert) => {
              const colors = severityColor(alert.severity);
              return (
                <div
                  key={alert.id}
                  style={{
                    background: colors.bg,
                    borderLeft: `3px solid ${colors.border.replace("0.25", "0.6")}`,
                    padding: "10px 14px",
                    borderBottom: "1px solid rgba(255,255,255,0.04)",
                    display: "flex",
                    gap: "10px",
                    alignItems: "flex-start",
                  }}
                >
                  <div style={{ marginTop: "1px", flexShrink: 0 }}>
                    {severityIcon(alert.severity)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                      <span
                        style={{
                          color: colors.text,
                          fontFamily: "monospace",
                          fontSize: "0.6rem",
                          letterSpacing: "0.05em",
                        }}
                      >
                        {colors.tag}
                      </span>
                      <span
                        style={{
                          color: "#f97316",
                          fontFamily: "monospace",
                          fontSize: "0.65rem",
                        }}
                      >
                        {turbineName(alert.turbineId)}
                      </span>
                      <span style={{ color: "#374151", fontFamily: "monospace", fontSize: "0.6rem" }}>
                        {new Date(alert.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                    <p style={{ color: "#9ca3af", fontFamily: "monospace", fontSize: "0.72rem", margin: 0 }}>
                      {alert.message}
                    </p>
                  </div>
                  <button
                    onClick={() => dismissAlert(alert.id)}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#374151", padding: "0", flexShrink: 0, marginTop: "1px" }}
                  >
                    <X size={12} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
