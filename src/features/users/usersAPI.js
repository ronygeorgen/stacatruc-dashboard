import { axiosInstance } from "../../services/api";

// API methods for users feature
export const usersAPI = {
    getUsers: () => axiosInstance.get('/ghlusers/'),
    getUserById: (id) => axiosInstance.get(`/users/${id}`)
  };