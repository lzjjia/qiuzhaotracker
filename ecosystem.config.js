module.exports = {
  apps: [
    {
      name: 'qiuzhao-tracker',
      cwd: './server',
      script: 'index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
        // 登录密码：请改成你自己的强密码
        AUTH_PASSWORD: 'change-me-please',
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '200M',
    },
  ],
};
