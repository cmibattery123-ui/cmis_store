try {
  process.loadEnvFile?.(".env");
} catch {
  // Ignore if .env not present
}

export default {
  datasource: {
    url: process.env.DIRECT_URL || process.env.DATABASE_URL,
  },
};
