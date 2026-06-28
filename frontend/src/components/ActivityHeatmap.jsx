import { useState, useEffect } from 'react';

export default function ActivityHeatmap() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCell, setHoveredCell] = useState(null);

  useEffect(() => {
    const loadData = () => {
      fetch('/api/todos/activity?days=35')
        .then(r => r.json())
        .then(json => {
          if (json.success) setData(json.data);
        })
        .catch(() => {
          setData(Array(35).fill({ count: 0, date: '' }));
        })
        .finally(() => setLoading(false));
    };

    loadData();

    window.addEventListener('activity-updated', loadData);
    return () => window.removeEventListener('activity-updated', loadData);
  }, []);

  const getCellClass = (count) => {
    if (count === 0) return 'activity-heatmap__cell--0';
    if (count <= 2) return 'activity-heatmap__cell--1';
    if (count <= 5) return 'activity-heatmap__cell--2';
    if (count <= 8) return 'activity-heatmap__cell--3';
    return 'activity-heatmap__cell--4';
  };

  const cells = data.length === 35 ? data : Array(35).fill({ count: 0, date: '' });

  return (
    <div className="activity-heatmap">
      <div className="activity-heatmap__header">
        <span className="activity-heatmap__title">35-Day Activity</span>
        <span className="activity-heatmap__total">
          {cells.reduce((sum, cell) => sum + cell.count, 0)} actions
        </span>
      </div>
      
      <div className="activity-heatmap__grid" onMouseLeave={() => setHoveredCell(null)}>
        {cells.map((cell, i) => (
          <div
            key={cell.date || i}
            className={`activity-heatmap__cell ${getCellClass(cell.count)}`}
            onMouseEnter={(e) => {
              if (cell.date) {
                const rect = e.target.getBoundingClientRect();
                setHoveredCell({
                  date: new Date(cell.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
                  count: cell.count,
                  x: rect.left + rect.width / 2,
                  y: rect.top - 8
                });
              }
            }}
            style={{ animationDelay: `${i * 8}ms` }}
          />
        ))}
      </div>

      <div className="activity-heatmap__legend">
        <span>Less</span>
        <div className="activity-heatmap__legend-grid">
          <div className="activity-heatmap__cell activity-heatmap__cell--0" />
          <div className="activity-heatmap__cell activity-heatmap__cell--1" />
          <div className="activity-heatmap__cell activity-heatmap__cell--2" />
          <div className="activity-heatmap__cell activity-heatmap__cell--3" />
          <div className="activity-heatmap__cell activity-heatmap__cell--4" />
        </div>
        <span>More</span>
      </div>

      {hoveredCell && (
        <div 
          className="activity-heatmap__tooltip"
          style={{ left: hoveredCell.x, top: hoveredCell.y }}
        >
          <strong>{hoveredCell.count} actions</strong> on {hoveredCell.date}
        </div>
      )}
    </div>
  );
}
