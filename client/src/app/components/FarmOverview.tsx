import { TURBINES, FARM_ID } from "../context/WindFarmContext";
import type { TelemetryData } from "../types";

interface Props {
  telemetry: Record<string, TelemetryData>;
  selectedTurbine: string | null;
  onSelectTurbine: (id: string) => void;
}

function TurbineVisual({
  name,
  status,
  selected,
  onClick,
  x,
}: {
  name: string;
  status: "running" | "stopped";
  selected: boolean;
  onClick: () => void;
  x: string;
}) {
  const isRunning = status === "running";

  return (
    <div
      className="absolute flex flex-col items-center cursor-pointer"
      style={{ left: x, transform: "translateX(-50%)", bottom: "calc(35% - 10px)" }}
      onClick={onClick}
    >
      <svg width="44" height="70" viewBox="0 0 44 70" fill="none" xmlns="http://www.w3.org/2000/svg">
        {/* Tower */}
        <rect x="19.5" y="30" width="5" height="38" rx="2" fill={selected ? "#7dd3fc" : "#94a3b8"} opacity="0.8" />
        {/* Base in water */}
        <rect x="17" y="60" width="10" height="10" rx="1" fill={selected ? "#38bdf8" : "#64748b"} opacity="0.5" />
        {/* Hub */}
        <circle cx="22" cy="30" r="4" fill={selected ? "#7dd3fc" : "#cbd5e1"} />
        {/* Blades */}
        <g
          style={{
            transformOrigin: "22px 30px",
            animation: isRunning ? "spin-turbine 3s linear infinite" : "none",
          }}
        >
          <ellipse cx="22" cy="15" rx="3" ry="13" fill={selected ? "#bae6fd" : "#e2e8f0"} opacity="0.95" transform="rotate(0 22 30)" />
          <ellipse cx="22" cy="15" rx="3" ry="13" fill={selected ? "#bae6fd" : "#e2e8f0"} opacity="0.95" transform="rotate(120 22 30)" />
          <ellipse cx="22" cy="15" rx="3" ry="13" fill={selected ? "#bae6fd" : "#e2e8f0"} opacity="0.95" transform="rotate(240 22 30)" />
        </g>
        {/* Status ring */}
        {selected && (
          <circle cx="22" cy="30" r="20" stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.3" strokeDasharray="4 3" />
        )}
      </svg>

      {/* Dot indicators */}
      <div
        style={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          background: isRunning ? "#4ade80" : "#f87171",
          boxShadow: isRunning ? "0 0 8px #4ade80" : "0 0 8px #f87171",
          marginTop: "2px",
        }}
      />
      <span
        style={{
          color: selected ? "#7dd3fc" : "#94a3b8",
          fontFamily: "monospace",
          fontSize: "0.7rem",
          marginTop: "3px",
          letterSpacing: "0.03em",
        }}
      >
        {name}
      </span>
    </div>
  );
}

export function FarmOverview({ telemetry, selectedTurbine, onSelectTurbine }: Props) {
  // Farm avg wind
  const avgWind =
    Object.values(telemetry).reduce((s, t) => s + t.windSpeed, 0) / Math.max(Object.values(telemetry).length, 1);
  const firstT = Object.values(telemetry)[0];
  const avgDir = firstT?.windDirection ?? 0;
  const avgTemp = firstT?.ambientTemperature ?? 0;
  const totalPower = Object.values(telemetry).reduce((s, t) => s + t.powerOutput, 0);

  const turbinePositions: Record<string, string> = {
    "turbine-alpha": "18%",
    "turbine-beta": "36%",
    "turbine-gamma": "58%",
    "turbine-delta": "80%",
  };

  return (
    <div
      className="relative w-full rounded-lg overflow-hidden"
      style={{
        height: "220px",
        background: "linear-gradient(180deg, #0d1f35 0%, #0f2d42 40%, #123346 60%, #0e2e3a 65%, #0b2e38 70%, #0a3040 80%, #082830 100%)",
      }}
    >
      {/* Sky gradient overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at 25% 30%, rgba(56,99,168,0.25) 0%, transparent 60%)",
          pointerEvents: "none",
        }}
      />

      {/* Water surface line */}
      <div
        className="absolute left-0 right-0"
        style={{
          bottom: "35%",
          height: "2px",
          background: "linear-gradient(90deg, transparent, rgba(56,189,248,0.15), rgba(56,189,248,0.3), rgba(56,189,248,0.15), transparent)",
        }}
      />

      {/* Water ripple pattern */}
      {[0, 1, 2, 3, 4].map((i) => (
        <div
          key={i}
          className="absolute left-0 right-0"
          style={{
            bottom: `calc(35% - ${(i + 1) * 14}px)`,
            height: "1px",
            background: `rgba(56,189,248,${0.04 - i * 0.006})`,
          }}
        />
      ))}

      {/* Turbines */}
      {TURBINES.map((t) => (
        <TurbineVisual
          key={t.id}
          name={t.name}
          status={telemetry[t.id]?.status ?? "stopped"}
          selected={selectedTurbine === t.id}
          onClick={() => onSelectTurbine(t.id)}
          x={turbinePositions[t.id]}
        />
      ))}

      {/* Top-left weather strip */}
      <div
        className="absolute top-3 left-3 flex items-center gap-3 rounded px-3 py-1.5"
        style={{
          background: "rgba(0,0,0,0.45)",
          border: "1px solid rgba(255,255,255,0.08)",
          backdropFilter: "blur(4px)",
        }}
      >
        <MetricChip label="Wind" value={`${avgWind.toFixed(1)} m/s`} />
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
        <MetricChip label="Dir" value={`${Math.round(avgDir)}°`} />
        <div style={{ width: 1, height: 14, background: "rgba(255,255,255,0.1)" }} />
        <MetricChip label="Temp" value={`${avgTemp.toFixed(1)}°C`} />
      </div>

      {/* Top-right: Live badge */}
      <div
        className="absolute top-3 right-3 flex items-center gap-1.5 rounded px-2 py-1"
        style={{
          background: "rgba(0,0,0,0.45)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: "#4ade80",
            boxShadow: "0 0 8px #4ade80",
            display: "inline-block",
            animation: "pulse-dot 2s infinite",
          }}
        />
        <span style={{ color: "#e2e8f0", fontFamily: "monospace", fontSize: "0.7rem" }}>Live</span>
      </div>

      {/* Bottom-right: total power */}
      <div
        className="absolute bottom-3 right-3 rounded px-2 py-1"
        style={{
          background: "rgba(0,0,0,0.45)",
          border: "1px solid rgba(255,255,255,0.08)",
        }}
      >
        <span style={{ color: "#4ade80", fontFamily: "monospace", fontSize: "0.7rem" }}>
          ⚡ {Math.round(totalPower).toLocaleString()} kW total
        </span>
      </div>

      {/* Bottom-left: farm ID */}
      <div className="absolute bottom-3 left-3">
        <span style={{ color: "#1e3a4a", fontFamily: "monospace", fontSize: "0.55rem" }}>
          FARM: {FARM_ID.substring(0, 18)}…
        </span>
      </div>
    </div>
  );
}

function MetricChip({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-1.5">
      <span style={{ color: "#6b7280", fontFamily: "monospace", fontSize: "0.68rem" }}>{label}</span>
      <span style={{ color: "#e2e8f0", fontFamily: "monospace", fontSize: "0.75rem" }}>{value}</span>
    </div>
  );
}
