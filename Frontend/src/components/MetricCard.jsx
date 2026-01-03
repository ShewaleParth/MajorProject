import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';

const MetricCard = ({ title, value, trend, trendValue, icon: Icon, categories }) => {
  const isPositive = trend === 'up';

  return (
    <div className="metric-card">
      <div className="card-header">
        <div className="card-title-group">
          <div className="card-icon">
            <Icon size={18} />
          </div>
          <h3>{title}</h3>
        </div>
        <select className="card-select">
          <option>Weekly</option>
          <option>Monthly</option>
        </select>
      </div>

      <div className="card-body">
        <div className="value-row">
          <h2 className="card-value">{value}</h2>
          <div className={`trend-indicator ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
            <span>{trendValue} Last Week</span>
          </div>
        </div>

        <div className="category-bars">
          <div className="bar-track">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="bar-segment"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color
                }}
              ></div>
            ))}
          </div>
        </div>

        <div className="category-legend">
          {categories.map((cat, i) => (
            <div key={i} className="legend-item">
              <span className="dot" style={{ backgroundColor: cat.color }}></span>
              <span className="label">{cat.label}</span>
              <span className="val">{cat.value}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MetricCard;
