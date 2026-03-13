import { TURBINES } from "../context/WindFarmContext";
import type { TelemetryData } from "../types";
import { TurbineStatusBadge } from "./TurbineStatusBadge";

interface Props {
  telemetry: Record<string, TelemetryData>;
  selectedTurbine: string | null;
  onSelectTurbine: (id: string) => void;
}

type TelemetryField = {
  label: string;
  key: keyof TelemetryData;
  unit?: string;
  format?: (v: unknown) => string;
};

const FIELDS: TelemetryField[] = [
  { label: "Wind Speed", key: "windSpeed", unit: " m/s" },
  { label: "Wind Direction", key: "windDirection", format: (v) => `${v}°` },
  { label: "Ambient Temp", key: "ambientTemperature", unit: "°C" },
  { label: "Rotor Speed", key: "rotorSpeed", unit: " rpm" },
  { label: "Power Output", key: "powerOutput", unit: " kW", format: (v) => Math.round(v as number).toLocaleString() + " kW" },
  { label: "Nacelle Dir", key: "nacelleDirection", format: (v) => `${v}°` },
  { label: "Blade Pitch", key: "bladePitch", format: (v) => `${v}°` },
  { label: "Generator Temp", key: "generatorTemp", unit: "°C" },
  { label: "Gearbox Temp", key: "gearboxTemp", unit: "°C" },
  { label: "Vibration", key: "vibration", unit: " mm/s" },
];

function formatValue(field: TelemetryField, data: TelemetryData): string {
  const raw = data[field.key];
  if (field.format) return field.format(raw);
  if (field.unit) return `${raw}${field.unit}`;
  return String(raw);
}

function getValueColor(field: TelemetryField, data: TelemetryData): string {
  const v = data[field.key] as number;
  if (field.key === "generatorTemp" && v > 65) return "#f87171";
  if (field.key === "generatorTemp" && v > 58) return "#fbbf24";
  if (field.key === "gearboxTemp" && v > 55) return "#fbbf24";
  if (field.key === "vibration" && v > 3.5) return "#fbbf24";
  if (field.key === "vibration" && v > 4.0) return "#f87171";
  if (field.key === "powerOutput" && data.status === "stopped") return "#4b5563";
  if (field.key === "rotorSpeed" && data.status === "stopped") return "#4b5563";
  return "#cbd5e1";
}

export function TelemetryTable({ telemetry, selectedTurbine, onSelectTurbine }: Props) {
  const displayedTurbines = selectedTurbine
    ? TURBINES.filter((t) => t.id === selectedTurbine)
    : TURBINES;

  return (
    <div className="overflow-x-auto w-full">
      <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "monospace" }}>
        <thead>
          <tr>
            <th
              style={{
                textAlign: "left",
                padding: "8px 12px",
                color: "#4b5563",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                position: "sticky",
                left: 0,
                background: "#0f2035",
                zIndex: 1,
                whiteSpace: "nowrap",
              }}
            >
              Metric
            </th>
            {displayedTurbines.map((t) => (
              <th
                key={t.id}
                onClick={() => onSelectTurbine(t.id)}
                style={{
                  padding: "8px 14px",
                  textAlign: "right",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  cursor: "pointer",
                  minWidth: "110px",
                  background: selectedTurbine === t.id ? "rgba(56,189,248,0.06)" : "transparent",
                  borderLeft: selectedTurbine === t.id ? "1px solid rgba(56,189,248,0.2)" : "1px solid transparent",
                }}
              >
                <div style={{ color: "#e2e8f0", fontSize: "0.75rem" }}>{t.name}</div>
                <div style={{ color: "#f97316", fontSize: "0.6rem" }}>{t.id}</div>
              </th>
            ))}
          </tr>
          {/* Status row */}
          <tr>
            <td
              style={{
                padding: "6px 12px",
                color: "#4b5563",
                fontSize: "0.65rem",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                borderBottom: "1px solid rgba(255,255,255,0.07)",
                position: "sticky",
                left: 0,
                background: "#0f2035",
              }}
            >
              Status
            </td>
            {displayedTurbines.map((t) => (
              <td
                key={t.id}
                style={{
                  padding: "6px 14px",
                  textAlign: "right",
                  borderBottom: "1px solid rgba(255,255,255,0.07)",
                  background: selectedTurbine === t.id ? "rgba(56,189,248,0.04)" : "transparent",
                  borderLeft: selectedTurbine === t.id ? "1px solid rgba(56,189,248,0.15)" : "1px solid transparent",
                }}
              >
                <div className="flex justify-end">
                  <TurbineStatusBadge status={telemetry[t.id]?.status ?? "stopped"} small />
                </div>
              </td>
            ))}
          </tr>
        </thead>
        <tbody>
          {FIELDS.map((field, i) => (
            <tr
              key={field.key}
              style={{
                background: i % 2 === 0 ? "rgba(255,255,255,0.01)" : "transparent",
              }}
            >
              <td
                style={{
                  padding: "7px 12px",
                  color: "#6b7280",
                  fontSize: "0.7rem",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  position: "sticky",
                  left: 0,
                  background: i % 2 === 0 ? "#0d1d30" : "#0f2035",
                  whiteSpace: "nowrap",
                }}
              >
                {field.label}
              </td>
              {displayedTurbines.map((t) => {
                const data = telemetry[t.id];
                if (!data) return <td key={t.id} />;
                return (
                  <td
                    key={t.id}
                    style={{
                      padding: "7px 14px",
                      textAlign: "right",
                      fontSize: "0.75rem",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      color: getValueColor(field, data),
                      background: selectedTurbine === t.id ? "rgba(56,189,248,0.03)" : "transparent",
                      borderLeft: selectedTurbine === t.id ? "1px solid rgba(56,189,248,0.1)" : "1px solid transparent",
                    }}
                  >
                    {formatValue(field, data)}
                  </td>
                );
              })}
            </tr>
          ))}
          {/* Timestamp row */}
          <tr>
            <td
              style={{
                padding: "7px 12px",
                color: "#374151",
                fontSize: "0.65rem",
                position: "sticky",
                left: 0,
                background: "#0f2035",
              }}
            >
              Last Update
            </td>
            {displayedTurbines.map((t) => (
              <td
                key={t.id}
                style={{
                  padding: "7px 14px",
                  textAlign: "right",
                  fontSize: "0.6rem",
                  color: "#374151",
                  background: selectedTurbine === t.id ? "rgba(56,189,248,0.03)" : "transparent",
                  borderLeft: selectedTurbine === t.id ? "1px solid rgba(56,189,248,0.1)" : "1px solid transparent",
                }}
              >
                {telemetry[t.id] ? new Date(telemetry[t.id].timestamp).toLocaleTimeString() : "—"}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}