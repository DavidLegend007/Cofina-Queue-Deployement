module.exports = {
  apps: [
    {
      name: "cofina-queue-server",
      script: "./server/dist/server.js",
      cwd: "./",
      instances: 1,
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
      script: "node_modules/vite/bin/vite.js",
      args: "preview --host --port 3000",
      cwd: "./",
      instances: 1,
      autorestart: true,
      env: {
        NODE_ENV: "production"
      }
    }
  ]
};
