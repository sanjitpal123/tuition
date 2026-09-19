import api from "../lib/api";

export const activityService = {
  getAll: async () => {
    const res = await api.get("/activities");
    return res.data || [];
  },
};
