import api from "../lib/api";

export const classService = {
  getAll: async () => {
    const res = await api.get("/classes");
    return (res.data || []).map((c) => ({
      ...c,
      id: c._id,
    }));
  },

  create: async (classData) => {
    const res = await api.post("/classes", classData);
    return {
      ...res.data,
      id: res.data._id,
    };
  },

  createBulk: async (classesArray) => {
    const res = await api.post("/classes/bulk", { classes: classesArray });
    return res.data;
  },

  update: async (id, updatedData) => {
    const res = await api.put(`/classes/${id}`, updatedData);
    return {
      ...res.data,
      id: res.data._id,
    };
  },

  delete: async (id) => {
    await api.delete(`/classes/${id}`);
  },
};
