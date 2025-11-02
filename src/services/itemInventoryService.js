import api from "./apiManager";

const ItemInventoryService = {
  getAll: (payload) => api.post("/ItemInventory/GetAll", payload),
  getById: (id) => api.get(`/ItemInventory/Get-By-Id/${id}`),
  getByItem: (itemId) => api.get(`/ItemInventory/Get-By-Item/${itemId}`),
  getByLocation: (locationId) => api.get(`/ItemInventory/Get-By-Location/${locationId}`),
  getSummary: () => api.get("/ItemInventory/Summary"),
  save: (payload) => api.post("/ItemInventory/Save", payload),
  update: (id, payload) => api.post(`/ItemInventory/Update/${id}`, payload),
  adjust: (id, payload) => api.post(`/ItemInventory/Adjust/${id}`, payload),
  delete: (id) => api.post(`/ItemInventory/Delete/${id}`),
};

export default ItemInventoryService;
