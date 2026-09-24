module.exports = {
  apps: [
    {
      name: "cofina-queue-server",
      script: "./server/dist/server.js",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      max_memory_restart: "500M",
      env: {
        NODE_ENV: "production",
        PORT: 4000
      }
    },
    {
      name: "cofina-queue-frontend",
      script: "npm",
      args: "run preview",
      cwd: "./",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
