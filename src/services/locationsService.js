import api from "./apiManager";

const LocationsService = {
  save: (payload) => api.post("/Locations/Save", payload),
  getAll: () => api.get("/Locations/GetAll"),
  getById: (locationId) => api.get(`/Locations/Get-By-Id/${locationId}`),
  update: (locationId, payload) => api.post(`/Locations/Update/${locationId}`, payload),
  delete: (locationId, payload) => api.post(`/Locations/Delete/${locationId}`, payload),
  getTree: () => api.get(`/Locations/GetTree`),
};

export default LocationsService;


