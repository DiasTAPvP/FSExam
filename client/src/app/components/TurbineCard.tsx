import type { TelemetryData } from "../types";
import { TurbineStatusBadge } from "./TurbineStatusBadge";

interface Props {
  data: TelemetryData;
  onClick: () => void;
  selected: boolean;
}

function MetricRow({ label, value, unit }: { label: string; value: string | number; unit?: string }) {
  return (
    <div
      className="flex justify-between items-center py-1"
      style={{ borderBottom: "1px solid rgba(255,255,255,0.04)" }}
    >
      <span style={{ color: "#6b7280", fontFamily: "monospace", fontSize: "0.7rem" }}>{label}</span>
      <span style={{ color: "#cbd5e1", fontFamily: "monospace", fontSize: "0.75rem" }}>
        {value}
        {unit && <span style={{ color: "#4b5563", marginLeft: "2px" }}>{unit}</span>}
      </span>
    </div>
  );
}

// Animated SVG turbine blade
function TurbineIcon({ spinning }: { spinning: boolean }) {
  return (
    <svg width="36" height="48" viewBox="0 0 36 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Tower */}
      <rect x="16" y="22" width="4" height="26" rx="1.5" fill="#64748b" opacity="0.7" />
      {/* Rotor hub */}
      <circle cx="18" cy="22" r="3" fill="#94a3b8" />
      {/* Blades group – rotates when spinning */}
      <g
        transform-origin="18 22"
        style={{
          transformOrigin: "18px 22px",
          animation: spinning ? "spin-turbine 3s linear infinite" : "none",
        }}
      >
        {/* Blade 1 – up */}
        <ellipse cx="18" cy="11" rx="2.5" ry="10" fill="#cbd5e1" opacity="0.9" transform="rotate(0 18 22)" />
        {/* Blade 2 – right */}
        <ellipse cx="18" cy="11" rx="2.5" ry="10" fill="#cbd5e1" opacity="0.9" transform="rotate(120 18 22)" />
        {/* Blade 3 – left */}
        <ellipse cx="18" cy="11" rx="2.5" ry="10" fill="#cbd5e1" opacity="0.9" transform="rotate(240 18 22)" />
      </g>
    </svg>
  );
}

export function TurbineCard({ data, onClick, selected }: Props) {
  const isRunning = data.status === "running";

  return (
    <div
      onClick={onClick}
      style={{
        background: selected ? "rgba(56,189,248,0.07)" : "rgba(255,255,255,0.03)",
        border: `1px solid ${selected ? "rgba(56,189,248,0.35)" : "rgba(255,255,255,0.08)"}`,
        borderRadius: "8px",
        padding: "14px",
        cursor: "pointer",
        transition: "all 0.2s",
      }}
      onMouseEnter={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(56,189,248,0.2)";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.04)";
        }
      }}
      onMouseLeave={(e) => {
        if (!selected) {
          (e.currentTarget as HTMLDivElement).style.borderColor = "rgba(255,255,255,0.08)";
          (e.currentTarget as HTMLDivElement).style.background = "rgba(255,255,255,0.03)";
        }
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <TurbineIcon spinning={isRunning} />
          <div>
            <div style={{ color: "#e2e8f0", fontFamily: "monospace", fontSize: "0.85rem" }}>
              {data.turbineName}
            </div>
            <div style={{ color: "#f97316", fontFamily: "monospace", fontSize: "0.65rem" }}>
              {data.turbineId}
            </div>
          </div>
        </div>
        <TurbineStatusBadge status={data.status} small />
      </div>

      {/* Key metrics */}
      <div>
        <MetricRow label="Wind Speed" value={data.windSpeed} unit=" m/s" />
        <MetricRow label="Wind Dir" value={`${data.windDirection}°`} />
        <MetricRow label="Power Output" value={data.powerOutput} unit=" kW" />
        <MetricRow label="Rotor Speed" value={data.rotorSpeed} unit=" rpm" />
        <MetricRow label="Blade Pitch" value={`${data.bladePitch}°`} />
        <MetricRow label="Gen. Temp" value={data.generatorTemp} unit="°C" />
        <MetricRow label="Gearbox Temp" value={data.gearboxTemp} unit="°C" />
        <MetricRow label="Vibration" value={data.vibration} unit=" mm/s" />
        <MetricRow label="Nacelle Dir" value={`${data.nacelleDirection}°`} />
        <MetricRow label="Ambient Temp" value={data.ambientTemperature} unit="°C" />
      </div>

      <div
        className="mt-3 pt-2 text-right"
        style={{ borderTop: "1px solid rgba(255,255,255,0.05)" }}
      >
        <span style={{ color: "#374151", fontFamily: "monospace", fontSize: "0.6rem" }}>
          {new Date(data.timestamp).toLocaleTimeString()}
        </span>
      </div>
    </div>
  );
}
