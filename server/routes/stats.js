const express = require('express');
const { db, STATUS_OPTIONS, OFFER_STATUSES } = require('../db');

const router = express.Router();

// 统计：总数、各状态计数、offer 率、近期面试
router.get('/', (req, res) => {
  const total = db.prepare('SELECT COUNT(*) AS c FROM applications').get().c;

  // 各状态计数（保证所有枚举都出现，缺省为 0）
  const rawCounts = db
    .prepare('SELECT status, COUNT(*) AS c FROM applications GROUP BY status')
    .all();
  const countMap = {};
  rawCounts.forEach((r) => (countMap[r.status] = r.c));

  const byStatus = STATUS_OPTIONS.map((s) => ({ status: s, count: countMap[s] || 0 }));

  // offer 率 = 拿到 offer 的公司数 / 总投递数
  const offerCount = OFFER_STATUSES.reduce((sum, s) => sum + (countMap[s] || 0), 0);
  const offerRate = total > 0 ? Math.round((offerCount / total) * 1000) / 10 : 0;

  // 近期 14 天内的面试提醒
  const upcoming = db
    .prepare(
      `SELECT id, company_name, position, interview_date, status
       FROM applications
       WHERE interview_date IS NOT NULL AND interview_date != ''
         AND date(interview_date) >= date('now', 'localtime')
         AND date(interview_date) <= date('now', 'localtime', '+14 days')
       ORDER BY date(interview_date) ASC`
    )
    .all();

  res.json({ total, offerCount, offerRate, byStatus, upcoming });
});

module.exports = router;
