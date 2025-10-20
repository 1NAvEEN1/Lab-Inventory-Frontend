import api from "./apiManager";

const ItemsService = {
  save: (payload) => api.post("/Items/Save", payload),
  getAll: (params = {}) => {
    const { search = "", categoryId = null, page = 1, pageSize = 20 } = params;
    return api.post("/Items/GetAll", {
      search,
      categoryId,
      page,
      pageSize,
    });
  },
  getById: (itemId) => api.get(`/Items/Get-By-Id/${itemId}`),
  update: (itemId, payload) => api.post(`/Items/Update/${itemId}`, payload),
  delete: (itemId) => api.post(`/Items/Delete/${itemId}`),
};

export default ItemsService;


