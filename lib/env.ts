// app/lib/env.ts
export function validateEnv() {
    const requiredVars = ['MONGODB_URI', 'JWT_SECRET'];
    requiredVars.forEach(varName => {
      if (!process.env[varName]) {
        throw new Error(`${varName} environment variable is required`);
      }
    });
  }