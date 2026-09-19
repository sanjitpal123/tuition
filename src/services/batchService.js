import api from "../lib/api";

export const batchService = {
  getAll: async () => {
    const res = await api.get("/batches");
    return (res.data || []).map((b) => ({
      ...b,
      id: b._id,
    }));
  },

  create: async (batchData) => {
    const res = await api.post("/batches", batchData);
    return {
      ...res.data,
      id: res.data._id,
    };
  },

  update: async (id, updatedData) => {
    const res = await api.put(`/batches/${id}`, updatedData);
    return {
      ...res.data,
      id: res.data._id,
    };
  },

  delete: async (id) => {
    await api.delete(`/batches/${id}`);
  },
};
