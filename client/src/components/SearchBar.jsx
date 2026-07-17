import React from 'react';

export default function SearchBar({ filters, statusOptions, onChange, onReset }) {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="按公司名搜索"
        value={filters.company}
        onChange={(e) => onChange({ ...filters, company: e.target.value })}
      />
      <input
        type="text"
        placeholder="按岗位搜索"
        value={filters.position}
        onChange={(e) => onChange({ ...filters, position: e.target.value })}
      />
      <select
        value={filters.status}
        onChange={(e) => onChange({ ...filters, status: e.target.value })}
      >
        <option value="">全部状态</option>
        {statusOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button type="button" className="btn-secondary" onClick={onReset}>
        重置
      </button>
    </div>
  );
}
