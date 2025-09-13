import api from "./apiManager";

const FilesService = {
  upload: (file) => {
    const formData = new FormData();
    formData.append("file", file);
    return api.post("/Upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
  getFile: (filename) => api.get(`/Files/${filename}`),
};

export default FilesService;


