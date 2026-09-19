import api from "../lib/api";

export const studentService = {
  getAll: async () => {
    const res = await api.get("/students");
    return (res.data || []).map((s) => ({
      ...s,
      id: s._id,
      batchName: s.batchId?.name || "Unknown Batch",
      className: "N/A",
      monthlyFee: s.fees ? Number(s.fees) : 0,
    }));
  },

  create: async (studentData) => {
    const res = await api.post("/students", studentData);
    return {
      ...res.data,
      id: res.data._id,
      batchName:
        res.data.batchId?.name || studentData.batchName || "Unknown Batch",
      monthlyFee: res.data.fees ? Number(res.data.fees) : 0,
    };
  },

  update: async (id, updatedData) => {
    const res = await api.put(`/students/${id}`, updatedData);
    return {
      ...res.data,
      id: res.data._id,
      batchName: res.data.batchId?.name || updatedData.batchName,
      monthlyFee: res.data.fees ? Number(res.data.fees) : undefined,
    };
  },

  delete: async (id) => {
    await api.delete(`/students/${id}`);
  },

  getUnpaid: async () => {
    const res = await api.get("/students/unpaid");
    return res.data || [];
  },
};
