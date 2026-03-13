export interface TelemetryData {
  turbineId: string;
  turbineName: string;
  farmId: string;
  timestamp: string;
  windSpeed: number;
  windDirection: number;
  ambientTemperature: number;
  rotorSpeed: number;
  powerOutput: number;
  nacelleDirection: number;
  bladePitch: number;
  generatorTemp: number;
  gearboxTemp: number;
  vibration: number;
  status: "running" | "stopped";
}

export interface Alert {
  id: string;
  turbineId: string;
  farmId: string;
  timestamp: string;
  severity: "info" | "warning" | "critical";
  message: string;
}

export interface CommandLog {
  id: string;
  turbineId: string;
  command: string;
  payload: string;
  timestamp: string;
  status: "sent" | "acknowledged" | "failed";
}

export interface TurbineInfo {
  id: string;
  name: string;
  location: string;
}
