import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL
console.log('in the main api service');

const axiosInstance = axios.create({ 
    baseURL: BASE_URL,
});

console.log('base url',BASE_URL);

axiosInstance.interceptors.request.use(
    (config) => {
      console.log('In the request interceptor');
      
      const accessToken = localStorage.getItem('accessToken');
      if (accessToken) {
        config.headers.Authorization = `Bearer ${accessToken}`;
      }
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;
      
      if (error.response && error.response.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true; // Prevent infinite loop
  
        try {
          // Send refresh token request
          const res = await axios.post(`${BASE_URL}/auth/refresh-token`, {}, { withCredentials: true });
          
          const newAccessToken = res.data.accessToken;
          localStorage.setItem('accessToken', newAccessToken);
  
          // Update Authorization header and retry original request
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          return axiosInstance(originalRequest);
  
        } catch (refreshError) {
          console.error('Refresh token invalid, logging out');
          // Optional: logout user or redirect to login
          return Promise.reject(refreshError);
        }
      }
  
      return Promise.reject(error);
    }
  );
export {BASE_URL, axiosInstance}