interface Props {
  status: "running" | "stopped";
  small?: boolean;
}

export function TurbineStatusBadge({ status, small }: Props) {
  const isRunning = status === "running";
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "5px",
        background: isRunning ? "rgba(34,197,94,0.12)" : "rgba(239,68,68,0.12)",
        border: `1px solid ${isRunning ? "rgba(34,197,94,0.3)" : "rgba(239,68,68,0.3)"}`,
        borderRadius: "4px",
        padding: small ? "1px 6px" : "2px 8px",
        fontFamily: "monospace",
        fontSize: small ? "0.65rem" : "0.7rem",
        color: isRunning ? "#4ade80" : "#f87171",
        textTransform: "uppercase",
        letterSpacing: "0.05em",
      }}
    >
      <span
        style={{
          width: 5,
          height: 5,
          borderRadius: "50%",
          background: isRunning ? "#4ade80" : "#f87171",
          boxShadow: isRunning ? "0 0 6px #4ade80" : "0 0 6px #f87171",
          animation: isRunning ? "pulse-dot 2s infinite" : "none",
          flexShrink: 0,
        }}
      />
      {isRunning ? "Running" : "Stopped"}
    </span>
  );
}
