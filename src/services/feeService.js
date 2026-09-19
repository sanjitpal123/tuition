import api from "../lib/api";

export const feeService = {
  getAll: async () => {
    const res = await api.get("/fees");
    return res.data || [];
  },

  recordPayment: async (paymentData) => {
    const res = await api.post("/fees", paymentData);
    return res.data;
  },

  deletePayment: async (studentId, month) => {
    await api.delete(`/fees/${studentId}/${month}`);
  },

  deletePaymentById: async (feeId) => {
    await api.delete(`/fees/item/${feeId}`);
  },

  updatePayment: async (studentId, month, amount) => {
    const res = await api.put(`/fees/${studentId}/${month}`, { amount });
    return res.data;
  },
  getStudentPayment: async () => {
    const res = await api.get('/fees/due-students');
    console.log('get students from overduue', res)
    return res.data;
  }
};
