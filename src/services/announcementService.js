import api from "../lib/api";

export const announcementService = {
  getAll: async () => {
    const res = await api.get("/announcements");
    return res.data || [];
  },
};
