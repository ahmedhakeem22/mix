// Utility to access environment variables with fallbacks and validation
interface EnvironmentVariables {
  API_BASE_URL: string;
  API_KEY?: string;
  APP_ENV: 'development' | 'production' | 'test';
  DEBUG_MODE: boolean;
}

// Default values for development
const defaultValues: EnvironmentVariables = {
  API_BASE_URL: 'https://haraj-syria.test/api/v1',
  APP_ENV: 'development',
  DEBUG_MODE: true,
};

// Get an environment variable with type safety
export function getEnv<T extends keyof EnvironmentVariables>(
  key: T,
  defaultValue = defaultValues[key]
): EnvironmentVariables[T] {
  const value = import.meta.env[`VITE_${key}`];
  
  if (value === undefined) {
    if (defaultValue === undefined) {
      console.warn(`Environment variable VITE_${key} is required but not provided.`);
    }
    return defaultValue as EnvironmentVariables[T];
  }
  
  // Type conversion based on the type of the default value
  if (typeof defaultValue === 'boolean') {
    return (value === 'true') as any;
  }
  
  if (typeof defaultValue === 'number') {
    return (Number(value) || 0) as any;
  }
  
  return value as EnvironmentVariables[T];
}

// Environment variables
export const env = {
  API_BASE_URL: getEnv('API_BASE_URL'),
  API_KEY: getEnv('API_KEY'),
  APP_ENV: getEnv('APP_ENV'),
  DEBUG_MODE: getEnv('DEBUG_MODE'),
  
  // Additional environment variables
  ENABLE_LOCATION: getEnv('ENABLE_LOCATION') as boolean,
  ANALYTICS_ID: getEnv('ANALYTICS_ID'),
  PUSHER_KEY: getEnv('PUSHER_KEY'),
  PUSHER_CLUSTER: getEnv('PUSHER_CLUSTER'),
  
  // Helper function to check if we're in development mode
  isDevelopment: () => getEnv('APP_ENV') === 'development',
  
  // Helper function to check if we're in production mode
  isProduction: () => getEnv('APP_ENV') === 'production',
  
  // Helper function to check if we're in test mode
  isTest: () => getEnv('APP_ENV') === 'test',
};
