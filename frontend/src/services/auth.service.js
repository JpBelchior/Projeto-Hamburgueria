import axios from "axios";

const API_URL = "http://localhost:3001/api";

export const authService = {
  login: async (email, password) => {
    const response = await axios.post(`${API_URL}/auth/login`, {
      email,
      password,
    });
    return response.data; // { token, user }
  },
};