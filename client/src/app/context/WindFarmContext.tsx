import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  ReactNode,
} from "react";
import { useAuth } from "./AuthContext";
import type { TelemetryData, Alert, CommandLog, TurbineInfo } from "../types";

export const FARM_ID = "0b57aefe-6e6c-4a36-ad90-880321aa6d7b";
export const API_URL = "/api";

export const TURBINES: TurbineInfo[] = [
  { id: "turbine-alpha", name: "Alpha", location: "North Platform" },
  { id: "turbine-beta", name: "Beta", location: "North Platform" },
  { id: "turbine-gamma", name: "Gamma", location: "South Platform" },
  { id: "turbine-delta", name: "Delta", location: "East Platform" },
];


interface WindFarmContextType {
  telemetry: Record<string, TelemetryData>;
  alerts: Alert[];
  commandLog: CommandLog[];
  sendCommand: (turbineId: string, command: string, payload: Record<string, unknown>) => void;
  clearAlerts: () => void;
  dismissAlert: (id: string) => void;
}

const WindFarmContext = createContext<WindFarmContextType | null>(null);

export function WindFarmProvider({ children }: { children: ReactNode }) {
  const { token, logout } = useAuth();
  const [telemetry, setTelemetry] = useState<Record<string, TelemetryData>>({});
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [commandLog, setCommandLog] = useState<CommandLog[]>([]);

  // SSE for real-time updates
  useEffect(() => {
    if (!token) {
      console.log("[SSE] Waiting for token to connect...");
      return;
    }
    
    // [DEBUG] Passing token via query string for SSE authentication
    const sseUrl = `${API_URL}/sse?token=${token}`;
    console.log(`[SSE] Connecting to: ${sseUrl} at ${new Date().toISOString()}`);
    const sse = new EventSource(sseUrl, { withCredentials: true });

    const handleSSEMessage = (event: MessageEvent) => {
      try {
        const rawData = JSON.parse(event.data);
        console.log("[SSE] Data received:", event.type, rawData);
        
        // Comprehensive normalization: handle both PascalCase (backend) and camelCase (frontend expects)
        const normalize = (obj: any) => {
          const res: any = {};
          for (const key in obj) {
            const lowerKey = key.charAt(0).toLowerCase() + key.slice(1);
            res[lowerKey] = obj[key];
          }
          return res;
        };

        const data = normalize(rawData);
        const turbineId = data.turbineId || rawData.TurbineId;
        const id = String(data.id || rawData.Id || Date.now());

        // Detection based on property existence
        if (data.windSpeed !== undefined || data.powerOutput !== undefined) {
          // Telemetry
          setTelemetry((prev) => ({
            ...prev,
            [turbineId]: { ...data, turbineId }
          }));
        } else if (data.severity !== undefined || data.message !== undefined) {
          // Alert
          setAlerts((prev) => {
            if (prev.find(a => String(a.id) === id)) return prev;
            return [{ ...data, id, severity: data.severity || "info" }, ...prev].slice(0, 100);
          });
        } else if (data.command !== undefined || data.action !== undefined) {
          // Command Log
          const mappedCmd: CommandLog = {
            ...data,
            id,
            command: data.command || data.action,
            status: data.status || "acknowledged"
          };
          setCommandLog((prev) => {
            if (prev.find(c => String(c.id) === id)) return prev;
            return [mappedCmd, ...prev].slice(0, 50);
          });
        }
      } catch (e) {
        console.error("Failed to parse SSE data", e);
      }
    };

    sse.addEventListener("farm-updates", handleSSEMessage as any);
    
    sse.onmessage = handleSSEMessage;
    
    // Fallback listeners for when the backend uses Type Names as event types
    // though the current version uses the generic message event
    sse.addEventListener("Telemetry", handleSSEMessage as any);
    sse.addEventListener("Alert", handleSSEMessage as any);
    sse.addEventListener("CommandLog", handleSSEMessage as any);

    sse.onerror = (e) => {
      console.error("SSE connection error - browser will auto-retry", e);
      // Check for token expiration on error to handle long-lived sessions
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
          if (payload.exp * 1000 < Date.now()) {
            console.warn("[SSE] Token expired during stream, logging out...");
            logout();
          }
        } catch { /* ignore parsing errors */ }
      }
    };

    return () => sse.close();
  }, [token]);

  // Initial Data Fetch
  useEffect(() => {
    if (!token) return;
    const loadData = async () => {
      try {
        const telMap: Record<string, TelemetryData> = {};
        const allAlerts: Alert[] = [];
        const allCommands: CommandLog[] = [];

        for (const t of TURBINES) {
          // Latest Telemetry
          const telRes = await fetch(`${API_URL}/history/telemetry/${t.id}?limit=1`);
          if (telRes.ok) {
            const data = await telRes.json();
            if (data.length > 0) telMap[t.id] = data[0];
          }

          // Recent Alerts
          const alertRes = await fetch(`${API_URL}/history/alerts/${t.id}?limit=20`);
          if (alertRes.ok) {
            const data = await alertRes.json();
            allAlerts.push(...data);
          }

          // Recent Commands
          const cmdRes = await fetch(`${API_URL}/history/commands/${t.id}?limit=20`);
          if (cmdRes.ok) {
            const data = await cmdRes.json();
            const mappedData = data.map((c: any) => ({
              ...c,
              id: String(c.id),
              command: c.command || c.action,
              status: c.status || "acknowledged"            
            }));
            allCommands.push(...mappedData);
          }
        }

        if (Object.keys(telMap).length > 0) setTelemetry((prev) => ({ ...prev, ...telMap }));
        
        setAlerts((prev) => {
          const newAlerts = allAlerts.filter(a => !prev.find(p => p.id === a.id));
          const merged = [...newAlerts, ...prev];
          return merged
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 100);
        });

        setCommandLog((prev) => {
          const newCommands = allCommands.filter(c => !prev.find(p => p.id === c.id));
          const merged = [...newCommands, ...prev];
          return merged
            .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
            .slice(0, 50);
        });
      } catch (e) {
        console.error("Failed to load initial data", e);
      }
    };
    loadData();
  }, [token]);


  const sendCommand = useCallback(
    async (turbineId: string, command: string, payload: Record<string, unknown>) => {
      const entry: CommandLog = {
        id: `cmd-${Date.now()}`,
        turbineId,
        command,
        payload: JSON.stringify(payload),
        timestamp: new Date().toISOString(),
        status: "sent",
      };
      setCommandLog((prev) => [entry, ...prev].slice(0, 50));

      try {
        const actionMap: Record<string, string> = {
          "Stop Turbine": "stop",
          "Start Turbine": "start",
          "Set Blade Pitch": "pitch",
          "Set Reporting Interval": "interval",
        };

        const action = actionMap[command];
        const params = new URLSearchParams();
        if (action === "pitch") params.append("angle", String(payload.angle));
        if (action === "interval") params.append("interval", String(payload.interval));

        const response = await fetch(`${API_URL}/control/${turbineId}/${action}?${params.toString()}`, {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${token}`
          }
        });

        if (response.ok) {
          setCommandLog((prev) =>
            prev.map((c) => (c.id === entry.id ? { ...c, status: "acknowledged" } : c))
          );
        } else {
          setCommandLog((prev) =>
            prev.map((c) => (c.id === entry.id ? { ...c, status: "failed" } : c))
          );
        }
      } catch (error) {
        console.error("Failed to send command:", error);
        setCommandLog((prev) =>
          prev.map((c) => (c.id === entry.id ? { ...c, status: "failed" } : c))
        );
      }
    },
    [token]
  );

  const clearAlerts = useCallback(() => setAlerts([]), []);
  const dismissAlert = useCallback(
    (id: string) => setAlerts((prev) => prev.filter((a) => a.id !== id)),
    []
  );

  return (
    <WindFarmContext.Provider
      value={{ telemetry, alerts, commandLog, sendCommand, clearAlerts, dismissAlert }}
    >
      {children}
    </WindFarmContext.Provider>
  );
}

export function useWindFarm() {
  const ctx = useContext(WindFarmContext);
  if (!ctx) throw new Error("useWindFarm must be used within WindFarmProvider");
  return ctx;
}
