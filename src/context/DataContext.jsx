import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../lib/api';
// No mock data used

const DataContext = createContext();

export function useData() {
  return useContext(DataContext);
}

export function DataProvider({ children }) {
  const [students, setStudents] = useState([]);
  const [batches, setBatches] = useState([]);
  const [scheduleClasses, setScheduleClasses] = useState([]);
  const [activities, setActivities] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [feePayments, setFeePayments] = useState([]);
  
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const [realNotifications, setRealNotifications] = useState([]);
  const fetchCoreData = async () => {
    // Only fetch if logged in
    if (!localStorage.getItem('tutorToken')) {
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    try {
      const [studentsRes, batchesRes, classesRes, activitiesRes, announcementsRes, feesRes, notificationsRes] = await Promise.all([
        api.get('/students'),
        api.get('/batches'),
        api.get('/classes').catch(() => ({ data: [] })),
        api.get('/activities').catch(() => ({ data: [] })),
        api.get('/announcements').catch(() => ({ data: [] })),
        api.get('/fees').catch(() => ({ data: [] })),
        api.get('/notifications').catch(() => ({ data: [] }))
      ]);
      
      const mappedStudents = studentsRes.data.map(s => ({
        ...s,
        id: s._id,
        batchName: s.batchId?.name || 'Unknown Batch',
        className: 'N/A', // Update later
        monthlyFee: s.fees ? Number(s.fees) : 0 // Use real fees field
      }));

      const mappedBatches = batchesRes.data.map(b => ({
        ...b,
        id: b._id
      }));

      const mappedClasses = classesRes.data.map(c => ({
        ...c,
        id: c._id
      }));

      setStudents(mappedStudents);
      setBatches(mappedBatches);
      setScheduleClasses(mappedClasses);
      setActivities(activitiesRes.data || []);
      setAnnouncements(announcementsRes.data || []);
      setFeePayments(feesRes.data || []);
      setRealNotifications(notificationsRes.data || []);
    } catch (err) {
      setError('Failed to fetch data from server');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCoreData();
  }, []); // Run once on mount

  // We can expose fetchCoreData so Login component can call it after setting token
  const refreshData = () => fetchCoreData();

  const addStudent = async (studentData) => {
    const res = await api.post('/students', studentData);
    const newStudent = {
      ...res.data,
      id: res.data._id,
      batchName: res.data.batchId?.name || studentData.batchName || 'Unknown Batch',
      monthlyFee: res.data.fees ? Number(res.data.fees) : 0
    };
    setStudents(prev => [newStudent, ...prev]);
  };

  const updateStudent = async (id, updatedData) => {
    const res = await api.put(`/students/${id}`, updatedData);
    setStudents(prev => prev.map(s => {
      if (s._id === id) {
        return {
          ...s,
          ...res.data,
          id: res.data._id,
          batchName: res.data.batchId?.name || updatedData.batchName || s.batchName || 'Unknown Batch',
          monthlyFee: res.data.fees ? Number(res.data.fees) : s.monthlyFee
        };
      }
      return s;
    }));
  };

  const deleteStudent = async (id) => {
    await api.delete(`/students/${id}`);
    setStudents(prev => prev.filter(s => s._id !== id));
  };

  // Batches CRUD
  const addBatch = async (batchData) => {
    const res = await api.post('/batches', batchData);
    const newBatch = { ...res.data, id: res.data._id };
    setBatches(prev => [newBatch, ...prev]);
  };

  const updateBatch = async (id, updatedData) => {
    const res = await api.put(`/batches/${id}`, updatedData);
    setBatches(prev => prev.map(b => {
      if (b._id === id) {
        return {
          ...b,
          ...res.data,
          id: res.data._id,
          studentsCount: b.studentsCount,
          attendanceAvg: b.attendanceAvg
        };
      }
      return b;
    }));
  };

  const deleteBatch = async (id) => {
    await api.delete(`/batches/${id}`);
    setBatches(prev => prev.filter(b => b._id !== id));
  };

  // Schedule Classes CRUD
  const addScheduleClass = async (classData) => {
    const res = await api.post('/classes', classData);
    setScheduleClasses(prev => [...prev, { ...res.data, id: res.data._id }]);
  };

  const deleteClass = async (id) => {
    await api.delete(`/classes/${id}`);
    setScheduleClasses(prev => prev.filter(c => c.id !== id && c._id !== id));
  };

  const updateScheduleClass = async (id, updatedData) => {
    const res = await api.put(`/classes/${id}`, updatedData);
    setScheduleClasses(prev => prev.map(c => c._id === id ? res.data : c));
  };

  // Fees 
  const recordFeePayment = async (paymentData) => {
    const res = await api.post('/fees', paymentData);
    // Also auto-update the student status locally
    setStudents(prev => prev.map(s => s._id === paymentData.studentId || s.id === paymentData.studentId ? { ...s, feeStatus: 'Paid' } : s));
    setFeePayments(prev => [res.data, ...prev]);
    return res.data;
  };

  const deleteFeePayment = async (studentId, month) => {
    await api.delete(`/fees/${studentId}/${month}`);
    setFeePayments(prev => prev.filter(f => !(f.studentId?._id === studentId && f.month === month) && !(f.studentId === studentId && f.month === month)));
    const currentMonth = new Date().toISOString().slice(0, 7);
    if (month === currentMonth) {
      setStudents(prev => prev.map(s => s._id === studentId || s.id === studentId ? { ...s, feeStatus: 'Pending' } : s));
    }
  };

  const value = {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    batches,
    addBatch,
    updateBatch,
    deleteBatch,
    scheduleClasses,
    addScheduleClass,
    updateScheduleClass,
    deleteClass,
    feePayments,
    recordFeePayment,
    deleteFeePayment,
    refreshData,
    isLoading,
    error,
    recentActivity: activities,
    notifications: announcements,
    realNotifications,
    setRealNotifications
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}
