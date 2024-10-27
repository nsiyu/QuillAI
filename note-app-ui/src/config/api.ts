export const getApiUrl = () => {
  return import.meta.env.VITE_SERVER_URL || 'http://localhost:8000';
};
