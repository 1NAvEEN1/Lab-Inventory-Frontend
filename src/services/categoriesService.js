import api from "./apiManager";

const CategoriesService = {
  save: (payload) => api.post("/Categories/Save", payload),
  getAll: () => api.get("/Categories/GetAll"),
  getTree: () => api.get("/Categories/GetTree"),
  getById: (categoryId) => api.get(`/Categories/Get-By-Id/${categoryId}`),
  update: (categoryId, payload) => api.post(`/Categories/Update/${categoryId}`, payload),
  delete: (categoryId) => api.post(`/Categories/Delete/${categoryId}`),
};

export default CategoriesService;


