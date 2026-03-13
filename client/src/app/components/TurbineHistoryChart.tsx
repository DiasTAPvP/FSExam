import { useState, useEffect } from "react";
import type { TelemetryData } from "../types";
import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  Line,
} from "recharts";

const API_URL = "/api";

export function TurbineHistoryChart({ turbineId }: { turbineId: string; turbineName: string }) {
  const [data, setData] = useState<TelemetryData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const res = await fetch(`${API_URL}/history/telemetry/${turbineId}?limit=30`);
        if (res.ok) {
          const history = await res.json();
          // Backend returns DESC, recharts expects ASC for time series
          setData([...history].reverse());
        }
      } catch (e) {
        console.error("Failed to fetch history", e);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
    // Refresh chart data periodically
    const interval = setInterval(fetchHistory, 15000);
    return () => clearInterval(interval);
  }, [turbineId]);

  if (loading && data.length === 0) {
    return (
      <div className="h-48 flex items-center justify-center text-gray-500 font-mono text-sm" style={{ background: "rgba(0,0,0,0.2)", borderRadius: '8px' }}>
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-sky-500"></div>
          <span>Syncing history...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-64 w-full p-2 rounded-lg" style={{ background: "rgba(0,0,0,0.2)", border: "1px solid rgba(255,255,255,0.05)" }}>
      <div className="flex justify-between items-center mb-3 px-2">
        <h4 className="text-sky-400 text-[0.65rem] font-mono uppercase tracking-[0.2em]">
          Output (kW) & Wind Speed (m/s)
        </h4>
        <div className="flex gap-3 text-[0.6rem] font-mono">
           <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-sky-500"></span>
              <span className="text-gray-400">Power</span>
           </div>
           <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              <span className="text-gray-400">Wind</span>
           </div>
        </div>
      </div>
      <ResponsiveContainer width="100%" height="85%">
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="colorPower" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" vertical={false} />
          <XAxis 
            dataKey="timestamp" 
            tickFormatter={(t) => new Date(t).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            stroke="#4b5563"
            fontSize={9}
            tickLine={false}
            axisLine={false}
            minTickGap={30}
          />
          <YAxis 
            yAxisId="left"
            stroke="#0ea5e9" 
            fontSize={9} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${Math.round(v)}`}
          />
          <YAxis 
            yAxisId="right"
            orientation="right"
            stroke="#f97316" 
            fontSize={9} 
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v.toFixed(1)}`}
          />
          <Tooltip 
            contentStyle={{ background: '#0f172a', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '4px', fontSize: '10px' }}
            itemStyle={{ fontSize: '10px', padding: '2px 0' }}
            labelStyle={{ color: '#94a3b8', marginBottom: '4px', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '2px' }}
            labelFormatter={(t) => new Date(t).toLocaleString()}
          />
          <Area 
            yAxisId="left"
            type="monotone" 
            dataKey="powerOutput" 
            stroke="#0ea5e9" 
            fillOpacity={1} 
            fill="url(#colorPower)" 
            name="Power (kW)"
            isAnimationActive={false}
          />
          <Line 
            yAxisId="right"
            type="monotone" 
            dataKey="windSpeed" 
            stroke="#f97316" 
            dot={false}
            name="Wind (m/s)"
            strokeWidth={1.5}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
