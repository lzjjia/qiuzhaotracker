import React from 'react';

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

export default function ApplicationTable({ rows, onEdit, onDelete }) {
  if (!rows.length) {
    return <div className="empty">暂无投递记录，点击「新增投递」开始记录吧。</div>;
  }

  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>公司名</th>
            <th>规模</th>
            <th>行业</th>
            <th>base地</th>
            <th>岗位</th>
            <th>状态</th>
            <th>投递时间</th>
            <th>面试时间</th>
            <th>简历</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td>{r.company_name}</td>
              <td>{r.company_size || '-'}</td>
              <td>{r.industry || '-'}</td>
              <td>{r.base_location || '-'}</td>
              <td>{r.position || '-'}</td>
              <td>
                <span
                  className="status-tag"
                  style={{ background: STATUS_COLORS[r.status] || '#94a3b8' }}
                >
                  {r.status}
                </span>
              </td>
              <td>{r.applied_date || '-'}</td>
              <td>{r.interview_date || '-'}</td>
              <td>
                {r.resume_file ? (
                  <a href={r.resume_file} target="_blank" rel="noreferrer">
                    查看
                  </a>
                ) : (
                  '-'
                )}
              </td>
              <td className="actions">
                <button className="btn-link" onClick={() => onEdit(r)}>
                  编辑
                </button>
                <button className="btn-link danger" onClick={() => onDelete(r)}>
                  删除
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
