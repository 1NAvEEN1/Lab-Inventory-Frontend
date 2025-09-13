import api from "./apiManager";

const UsersService = {
  signUp: (payload) => api.post("/Users/SignUp", payload),
  login: (payload) => api.post("/Users/login", payload),
  refreshToken: (refreshToken) => api.post("/Users/refresh-token", { refreshToken }),
  logout: (refreshToken) => api.post("/Users/logout", { refreshToken }),
  logoutAll: (userId) => api.post(`/Users/logout-all/${userId}`),
  getAll: () => api.get("/Users"),
  getById: (userId) => api.get(`/Users/${userId}`),
  update: (userId, payload) => api.put(`/Users/${userId}`, payload),
  disable: (userId) => api.put(`/Users/disableUser/${userId}`),
  updatePassword: (payload) => api.post("/Users/updatePassword", payload),
};

export default UsersService;


