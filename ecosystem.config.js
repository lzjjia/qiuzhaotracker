module.exports = {
  apps: [
    {
      name: 'qiuzhao-tracker',
      cwd: './server',
      script: 'index.js',
      env: {
        NODE_ENV: 'production',
        PORT: 3001,
      },
      instances: 1,
      autorestart: true,
      max_memory_restart: '200M',
    },
  ],
};
