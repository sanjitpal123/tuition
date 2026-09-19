import api from "../lib/api";

export const notificationService = {
  getAll: async () => {
    const res = await api.get("/notifications");
    return res.data || [];
  },
};
