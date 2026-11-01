import React from 'react';

/**
 * ScoreChart Component
 * Pure SVG responsive mini area chart rendering user practice scores over time.
 * Zero heavy chart libraries required.
 */
export default function ScoreChart({ scores = [] }) {
  if (!scores || scores.length === 0) {
    return (
      <div className="h-40 flex items-center justify-center text-xs text-slate-500 italic">
        No recent test sessions recorded yet. Complete quizzes or pronunciation sessions to track scores!
      </div>
    );
  }

  const data = scores.slice(-15); // Show up to last 15 scores
  const maxScore = 100;
  const minScore = 0;

  const width = 500;
  const height = 140;
  const padding = 20;

  const chartW = width - padding * 2;
  const chartH = height - padding * 2;

  const points = data.map((d, index) => {
    const x = padding + (index / Math.max(1, data.length - 1)) * chartW;
    const y = height - padding - ((d.score - minScore) / (maxScore - minScore)) * chartH;
    return { x, y, score: d.score, label: d.label || `#${index + 1}` };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, '');

  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${height - padding} L ${points[0].x} ${height - padding} Z`
    : '';

  return (
    <div className="w-full overflow-hidden">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full h-40 overflow-visible"
      >
        <defs>
          <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f2fe" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#00f2fe" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[25, 50, 75, 100].map((val) => {
          const y = height - padding - (val / 100) * chartH;
          return (
            <g key={val}>
              <line
                x1={padding}
                y1={y}
                x2={width - padding}
                y2={y}
                stroke="rgba(255, 255, 255, 0.08)"
                strokeDasharray="3 3"
              />
              <text
                x={padding - 4}
                y={y + 3}
                fill="rgba(255, 255, 255, 0.3)"
                fontSize="9"
                textAnchor="end"
              >
                {val}
              </text>
            </g>
          );
        })}

        {/* Area fill */}
        {areaD && <path d={areaD} fill="url(#scoreGradient)" />}

        {/* Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="#00f2fe"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* Dots */}
        {points.map((p, idx) => (
          <g key={idx} className="group cursor-pointer">
            <circle
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#060d1b"
              stroke="#00f2fe"
              strokeWidth="2"
              className="hover:r-6 transition-all"
            />
            <title>{`${p.label}: ${p.score}%`}</title>
          </g>
        ))}
      </svg>
    </div>
  );
}
