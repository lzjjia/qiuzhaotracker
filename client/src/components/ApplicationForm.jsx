import React, { useEffect, useState } from 'react';
import { uploadResume } from '../api';

const EMPTY = {
  company_name: '',
  company_size: '',
  industry: '',
  base_location: '',
  position: '',
  status: '已投递',
  resume_file: '',
  applied_date: '',
  interview_date: '',
  notes: '',
};

const SIZE_OPTIONS = ['初创公司', '中小型', '大型', '大厂', '国企', '外企', '事业单位'];

export default function ApplicationForm({ initial, statusOptions, onSubmit, onCancel }) {
  const [form, setForm] = useState(EMPTY);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initial) {
      // 只取需要的字段，避免把 created_at 等带进去
      const next = { ...EMPTY };
      Object.keys(EMPTY).forEach((k) => {
        if (initial[k] != null) next[k] = initial[k];
      });
      setForm(next);
    } else {
      setForm(EMPTY);
    }
  }, [initial]);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function handleFile(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const result = await uploadResume(file);
      setForm((f) => ({ ...f, resume_file: result.url }));
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!form.company_name.trim()) {
      setError('公司名不能为空');
      return;
    }
    onSubmit(form);
  }

  return (
    <div className="modal-overlay" onClick={onCancel}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <h2>{initial ? '编辑投递' : '新增投递'}</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-grid">
            <label>
              公司名 *
              <input value={form.company_name} onChange={set('company_name')} required />
            </label>
            <label>
              公司规模
              <input
                list="size-options"
                value={form.company_size}
                onChange={set('company_size')}
                placeholder="如 大厂 / 国企"
              />
              <datalist id="size-options">
                {SIZE_OPTIONS.map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
            <label>
              所属行业
              <input value={form.industry} onChange={set('industry')} placeholder="如 互联网 / 金融" />
            </label>
            <label>
              base地
              <input value={form.base_location} onChange={set('base_location')} placeholder="如 北京 / 上海" />
            </label>
            <label>
              投递岗位
              <input value={form.position} onChange={set('position')} placeholder="如 后端开发" />
            </label>
            <label>
              投递状态
              <select value={form.status} onChange={set('status')}>
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>
            <label>
              投递时间
              <input type="date" value={form.applied_date} onChange={set('applied_date')} />
            </label>
            <label>
              面试时间
              <input type="date" value={form.interview_date} onChange={set('interview_date')} />
            </label>
            <label className="full">
              简历文件
              <input type="file" accept=".pdf,.doc,.docx" onChange={handleFile} />
              {uploading && <span className="hint">上传中…</span>}
              {form.resume_file && (
                <a href={form.resume_file} target="_blank" rel="noreferrer" className="hint">
                  已上传，点击查看
                </a>
              )}
            </label>
            <label className="full">
              备注
              <textarea value={form.notes} onChange={set('notes')} rows={2} />
            </label>
          </div>

          {error && <p className="error">{error}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onCancel}>
              取消
            </button>
            <button type="submit" className="btn-primary" disabled={uploading}>
              保存
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
