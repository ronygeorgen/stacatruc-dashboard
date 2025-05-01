import { axiosInstance } from "../../services/api";

// API methods for contacts feature
export const contactsAPI = {
    getContacts: (searchQuery = "") => axiosInstance.get(`/contacts/?search=${searchQuery}`),
    getContactsById: (id) => axiosInstance.get(`/contacts/${id}`)
  };