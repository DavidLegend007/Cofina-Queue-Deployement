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
        PORT: 4000,
        JWT_SECRET: "cofina_edge_togo_secret_key_2026",
        ADMIN_PASSWORD: "cofinaAdmin2026!",
        AGENT_PASSWORD: "cofina2026"
      }
    }
  ]
};
