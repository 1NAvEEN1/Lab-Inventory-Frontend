import api from "./apiManager";

const ItemsService = {
  save: (payload) => api.post("/Items/Save", payload),
  getAll: () => api.get("/Items/GetAll"),
  getById: (itemId) => api.get(`/Items/Get-By-Id/${itemId}`),
  update: (itemId, payload) => api.post(`/Items/Update/${itemId}`, payload),
  delete: (itemId) => api.post(`/Items/Delete/${itemId}`),
};

export default ItemsService;


