import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#ff9999', '#66b3ff', '#99ff99', '#ffcc99', '#c2c2f0', '#f7b7b7', '#c2f0c2'];

function MediaResultSection({ data }) {
  const { results, total_budget, total_reach } = data;

  const chartData = results.map((r, idx) => ({
    name: `${r.channel} (${(r.budget / total_budget * 100).toFixed(2)}%)`,
    value: r.budget,
    fill: COLORS[idx % COLORS.length]
  }));

  return (
    <div className="results-container">
      <h2 className="results-title">
        <span className="chart-icon">📊</span>
        Media Channel Allocation Summary
      </h2>

      {/* GRID: table (left) | chart (right) */}
      <div className="results-grid">
        {/* LEFT: TABLE CARD */}
        <div className="card table-card">
          <div className="table-wrapper">
            <table className="results-table">
              <colgroup>
                <col style={{ width: '18%' }} />
                <col style={{ width: '18%' }} />
                <col style={{ width: '14%' }} />
                <col style={{ width: '24%' }} />
                <col style={{ width: '13%' }} />
                <col style={{ width: '13%' }} />
              </colgroup>
              <thead>
                <tr>
                  <th>Channel</th>
                  <th>Model</th>
                  <th className="num">Efficiency</th>
                  <th className="num">Budget (LKR)</th>
                  <th className="num">% of Total</th>
                  <th className="num">Reach (%)</th>
                </tr>
              </thead>
              <tbody>
                {results.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.channel}</td>
                    <td>{r.selected_model}</td>
                    <td className="num">{r.target_efficiency.toFixed(2)}%</td>
                    <td className="num">{r.budget.toLocaleString(undefined, { maximumFractionDigits: 2 })}</td>
                    <td className="num">{((r.budget / total_budget) * 100).toFixed(2)}%</td>
                    <td className="num">{r.reach.toFixed(2)}%</td>
                  </tr>
                ))}
                <tr className="total-row">
                  <td><strong>Total</strong></td>
                  <td></td>
                  <td></td>
                  <td className="num"><strong>{total_budget.toLocaleString(undefined, { maximumFractionDigits: 2 })}</strong></td>
                  <td className="num"><strong>100%</strong></td>
                  <td className="num"><strong>{total_reach.toFixed(2)}%</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT: CHART CARD */}
        <div className="card chart-card">
          {/* TOP: total reach text */}
          <div className="chart-header">
            Total reach of 17.6 Mn population <span className="reach-val">{total_reach.toFixed(2)}%</span>
          </div>

          {/* CENTER: pie chart (centered) */}
          <div className="chart-box">
            <ResponsiveContainer width="100%" height={320}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"              // <-- center horizontally
                  cy="50%"
                  labelLine={false}
                  outerRadius={120}     // optional: make the pie a bit larger
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ payload }) => {
                    if (payload && payload.length) {
                      const channelName = payload[0].name.split(" (")[0];
                      const channelData = results.find(r => r.channel === channelName);
                      if (!channelData) return null;
                      return (
                        <div style={{
                          background: "#fff",
                          border: "1px solid #ccc",
                          padding: "8px",
                          borderRadius: "6px",
                          lineHeight: "1.4",
                          color: "#1a202c" // dark gray text
                        }}>
                          <div><strong>{channelName} Reach : {channelData.reach.toFixed(2)}%</strong></div>
                          Budget : LKR {channelData.budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                {/* BOTTOM: legend (centered, horizontal) */}
                <Legend
                  verticalAlign="bottom"
                  align="center"
                  layout="horizontal"
                  wrapperStyle={{ color: '#2d3748' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <style jsx>{`
        .results-container {
          background: #ffffff;
          padding: 2rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
          margin-top: 2rem;
          max-width: 1200px;
          margin-left: auto;
          margin-right: auto;

          /* NEW: keep inner cards visually inside the rounded box */
          overflow: hidden;            /* clips inner shadows/margins at the edge */
        }

        .results-title {
          text-align: center;
          color: #2d3748;
          margin-bottom: 1.25rem;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.75rem;
        }
        .chart-icon { font-size: 1.5rem; }

        .results-grid {
          display: grid;
          grid-template-columns: 2fr 1fr;  /* your current proportions */
          gap: 1rem;
          align-items: start;              /* NEW: prevent child stretch that can cause bleed */
        }

        .card {
          background: #ffffff;
          padding: 1.25rem;
          border-radius: 12px;
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

          /* NEW: let content define height and avoid margin bleed */
          height: auto;                    /* ensure natural height */
          margin: 0;                       /* rely on grid gap, not margins */
        }

        /* --- table --- */
        .table-wrapper { overflow-x: auto; }

        .results-table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        .results-table th, .results-table td {
          border: 1px solid #e2e8f0;
          padding: 0.6rem 0.7rem;
          font-size: 0.95rem;
          color: #2d3748;
          overflow-wrap: anywhere;
        }

        .results-table th {
          background-color: #f7fafc;
          font-weight: 600;
          text-align: left;
        }

        .results-table .num, .results-table th.num {
          text-align: right;
          font-variant-numeric: tabular-nums;
        }

        .total-row {
          background-color: #edf2f7;
          font-weight: 600;
        }

        /* --- chart --- */
        .chart-header {
          text-align: center;
          color: #2d3748;
          font-size: 0.98rem;
          margin-bottom: 0.5rem;
        }
        .reach-val {
          font-weight: 700;
          color: #1a202c;
        }

        .chart-box {
          width: 100%;
          height: 320px;
          position: relative;
        }

        /* Make all Recharts text visible (dark) */
        :global(.recharts-text) { fill: #2d3748 !important; }
        :global(.recharts-legend-item-text) {
          color: #2d3748 !important;
          fill: #2d3748 !important;
        }

        @media (max-width: 1100px) {
          .results-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

export default MediaResultSection;
