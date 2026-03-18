'use client';

export default function ProgressBar({ value, showLabel = true, size = 'default' }) {
  const getClass = () => {
    if (value >= 75) return 'high';
    if (value >= 40) return 'medium';
    return 'low';
  };

  return (
    <div className="progress-container">
      {showLabel && (
        <div className="progress-label">
          <span style={{ color: 'var(--text-muted)' }}>Progress</span>
          <span className="progress-percentage">{value}%</span>
        </div>
      )}
      <div className="progress-bar-wrapper" style={{ height: size === 'small' ? '6px' : '8px' }}>
        <div
          className={`progress-bar-fill ${getClass()}`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
}
