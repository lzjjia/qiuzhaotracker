import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const STATUS_COLORS = {
  已投递: '#94a3b8',
  笔试: '#38bdf8',
  一面: '#818cf8',
  二面: '#a78bfa',
  三面: '#c084fc',
  HR面: '#f472b6',
  已offer: '#34d399',
  已拒: '#f87171',
  已接受: '#10b981',
};

export default function Dashboard({ stats }) {
  if (!stats) return null;

  const pieData = stats.byStatus.filter((s) => s.count > 0);

  return (
    <div className="dashboard">
      <div className="cards">
        <div className="card">
          <div className="card-value">{stats.total}</div>
          <div className="card-label">总投递数</div>
        </div>
        <div className="card">
          <div className="card-value">{stats.offerCount}</div>
          <div className="card-label">Offer 数</div>
        </div>
        <div className="card">
          <div className="card-value">{stats.offerRate}%</div>
          <div className="card-label">Offer 率</div>
        </div>
        <div className="card">
          <div className="card-value">{stats.upcoming.length}</div>
          <div className="card-label">近 14 天面试</div>
        </div>
      </div>

      <div className="charts">
        <div className="chart-box">
          <h3>状态分布</h3>
          {pieData.length ? (
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="count"
                  nameKey="status"
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  label={(d) => `${d.status} ${d.count}`}
                >
                  {pieData.map((d) => (
                    <Cell key={d.status} fill={STATUS_COLORS[d.status] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty">暂无数据</div>
          )}
        </div>

        <div className="chart-box">
          <h3>各状态数量</h3>
          <ResponsiveContainer width="100%" height={240}>
            <BarChart data={stats.byStatus}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="status" fontSize={12} />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="count">
                {stats.byStatus.map((d) => (
                  <Cell key={d.status} fill={STATUS_COLORS[d.status] || '#94a3b8'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {stats.upcoming.length > 0 && (
        <div className="reminder-box">
          <h3>📅 近期面试提醒</h3>
          <ul>
            {stats.upcoming.map((u) => (
              <li key={u.id}>
                <strong>{u.interview_date}</strong> — {u.company_name}
                {u.position ? ` · ${u.position}` : ''}（{u.status}）
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
