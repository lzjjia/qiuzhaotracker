import React, { useCallback, useEffect, useState } from 'react';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import SearchBar from './components/SearchBar.jsx';
import ApplicationTable from './components/ApplicationTable.jsx';
import ApplicationForm from './components/ApplicationForm.jsx';
import {
  listApplications,
  createApplication,
  updateApplication,
  deleteApplication,
  getStatusOptions,
  getStats,
  getToken,
  clearToken,
  setUnauthorizedHandler,
} from './api';

const EMPTY_FILTERS = { company: '', position: '', status: '' };

export default function App() {
  const [authed, setAuthed] = useState(!!getToken());
  const [rows, setRows] = useState([]);
  const [stats, setStats] = useState(null);
  const [statusOptions, setStatusOptions] = useState([]);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState('');

  const loadStats = useCallback(async () => {
    try {
      setStats(await getStats());
    } catch (err) {
      setError(err.message);
    }
  }, []);

  const loadRows = useCallback(async (f) => {
    try {
      setRows(await listApplications(f));
    } catch (err) {
      setError(err.message);
    }
  }, []);

  // 初始化：状态枚举 + 数据 + 统计（登录后才加载）
  useEffect(() => {
    setUnauthorizedHandler(() => setAuthed(false));
  }, []);

  useEffect(() => {
    if (!authed) return;
    getStatusOptions().then(setStatusOptions).catch((e) => setError(e.message));
    loadStats();
  }, [authed, loadStats]);

  // 过滤变化时防抖加载列表
  useEffect(() => {
    if (!authed) return;
    const t = setTimeout(() => loadRows(filters), 250);
    return () => clearTimeout(t);
  }, [authed, filters, loadRows]);

  async function refresh() {
    await Promise.all([loadRows(filters), loadStats()]);
  }

  async function handleSubmit(data) {
    try {
      if (editing) {
        await updateApplication(editing.id, data);
      } else {
        await createApplication(data);
      }
      setShowForm(false);
      setEditing(null);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  async function handleDelete(row) {
    if (!window.confirm(`确定删除「${row.company_name}」这条投递记录吗？`)) return;
    try {
      await deleteApplication(row.id);
      await refresh();
    } catch (err) {
      setError(err.message);
    }
  }

  function openNew() {
    setEditing(null);
    setShowForm(true);
  }

  function openEdit(row) {
    setEditing(row);
    setShowForm(true);
  }

  function handleLogout() {
    clearToken();
    setAuthed(false);
  }

  if (!authed) {
    return <Login onSuccess={() => setAuthed(true)} />;
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1>🎯 秋招投递助手</h1>
        <div className="header-actions">
          <button className="btn-primary" onClick={openNew}>
            + 新增投递
          </button>
          <button className="btn-secondary" onClick={handleLogout}>
            退出登录
          </button>
        </div>
      </header>

      {error && (
        <div className="error-banner" onClick={() => setError('')}>
          {error}（点击关闭）
        </div>
      )}

      <Dashboard stats={stats} />

      <SearchBar
        filters={filters}
        statusOptions={statusOptions}
        onChange={setFilters}
        onReset={() => setFilters(EMPTY_FILTERS)}
      />

      <ApplicationTable rows={rows} onEdit={openEdit} onDelete={handleDelete} />

      {showForm && (
        <ApplicationForm
          initial={editing}
          statusOptions={statusOptions}
          onSubmit={handleSubmit}
          onCancel={() => {
            setShowForm(false);
            setEditing(null);
          }}
        />
      )}
    </div>
  );
}
