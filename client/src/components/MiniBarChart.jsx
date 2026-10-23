export default function MiniBarChart({ data = [], height = 80 }) {
  if (!data.length) return <div className="text-xs text-navy-400">No history</div>;
  const max = Math.max(1, ...data.map((d) => d.units || 0));
  return (
    <svg viewBox={`0 0 ${data.length * 10} ${height}`} className="w-full">
      {data.map((d, i) => {
        const h = ((d.units || 0) / max) * (height - 10);
        return (
          <rect
            key={i}
            x={i * 10 + 1}
            y={height - h}
            width={8}
            height={h}
            rx={1.5}
            className="fill-accent-500"
          />
        );
      })}
    </svg>
  );
}
