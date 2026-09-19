import React, { createContext, useContext, useState, useEffect } from "react";
import { studentService } from "../services/studentService";
import { batchService } from "../services/batchService";
import { classService } from "../services/classService";
import { feeService } from "../services/feeService";
import { activityService } from "../services/activityService";
import { announcementService } from "../services/announcementService";
import { notificationService } from "../services/notificationService";

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
  const [unpaidStudents, setunpaidStudents] = useState([]);

  const fetchCoreData = async () => {
    // Only fetch if logged in
    if (!localStorage.getItem("tutorToken")) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      const [
        studentsData,
        batchesData,
        classesData,
        activitiesData,
        announcementsData,
        feesData,
        notificationsData,
      ] = await Promise.all([
        studentService.getAll(),
        batchService.getAll(),
        classService.getAll().catch(() => []),
        activityService.getAll().catch(() => []),
        announcementService.getAll().catch(() => []),
        feeService.getAll().catch(() => []),
        notificationService.getAll().catch(() => []),
      ]);

      setStudents(studentsData);
      setBatches(batchesData);
      setScheduleClasses(classesData);
      setActivities(activitiesData);
      setAnnouncements(announcementsData);
      setFeePayments(feesData);
      setRealNotifications(notificationsData);
    } catch (err) {
      setError("Failed to fetch data from server");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchUnpaidStudents = async () => {
    try {
      const data = await studentService.getUnpaid();
      setunpaidStudents(data);
    } catch (err) {
      console.error("Failed to fetch unpaid students", err);
    }
  };

  useEffect(() => {
    fetchCoreData();
  }, []); // Run once on mount

  // We can expose fetchCoreData so Login component can call it after setting token
  const refreshData = () => fetchCoreData();

  const addStudent = async (studentData) => {
    const newStudent = await studentService.create(studentData);
    setStudents((prev) => [newStudent, ...prev]);
  };

  const updateStudent = async (id, updatedData) => {
    const updated = await studentService.update(id, updatedData);
    setStudents((prev) =>
      prev.map((s) => {
        if (s._id === id) {
          return {
            ...s,
            ...updated,
            batchName:
              updated.batchName ||
              updatedData.batchName ||
              s.batchName ||
              "Unknown Batch",
            monthlyFee:
              updated.monthlyFee !== undefined
                ? updated.monthlyFee
                : s.monthlyFee,
          };
        }
        return s;
      }),
    );
  };

  const deleteStudent = async (id) => {
    await studentService.delete(id);
    setStudents((prev) => prev.filter((s) => s._id !== id));
  };

  // Batches CRUD
  const addBatch = async (batchData) => {
    const newBatch = await batchService.create(batchData);
    setBatches((prev) => [newBatch, ...prev]);
  };

  const updateBatch = async (id, updatedData) => {
    const updated = await batchService.update(id, updatedData);
    setBatches((prev) =>
      prev.map((b) => {
        if (b._id === id) {
          return {
            ...b,
            ...updated,
            studentsCount: b.studentsCount,
            attendanceAvg: b.attendanceAvg,
            presentCount: b.presentCount,
            absentCount: b.absentCount,
          };
        }
        return b;
      }),
    );
  };

  const deleteBatch = async (id) => {
    await batchService.delete(id);
    setBatches((prev) => prev.filter((b) => b._id !== id));
  };

  // Schedule Classes CRUD
  const addScheduleClass = async (classData) => {
    const created = await classService.create(classData);
    setScheduleClasses((prev) => [...prev, created]);
    return created;
  };

  const addBulkScheduleClasses = async (classesArray) => {
    const res = await classService.createBulk(classesArray);
    if (res?.classes) {
      const formatted = res.classes.map((c) => ({ ...c, id: c._id }));
      setScheduleClasses((prev) => [...prev, ...formatted]);
    }
    return res;
  };

  const deleteClass = async (id) => {
    await classService.delete(id);
    setScheduleClasses((prev) =>
      prev.filter((c) => c.id !== id && c._id !== id),
    );
  };

  const updateScheduleClass = async (id, updatedData) => {
    const updated = await classService.update(id, updatedData);
    setScheduleClasses((prev) =>
      prev.map((c) => (c._id === id || c.id === id ? updated : c)),
    );
  };

  // Fees
  const recordFeePayment = async (paymentData) => {
    const res = await feeService.recordPayment(paymentData);
    await refreshData();
    return res;
  };

  const deleteFeePayment = async (studentId, month) => {
    await feeService.deletePayment(studentId, month);
    await refreshData();
  };

  const deleteFeePaymentById = async (feeId) => {
    await feeService.deletePaymentById(feeId);
    await refreshData();
  };

  const updateFeePayment = async (studentId, month, amount) => {
    const res = await feeService.updatePayment(studentId, month, amount);
    await refreshData();
    return res;
  };

  const getOverdueStudents = async () => {
    try {
      const res = await feeService.getStudentPayment();
      if (Array.isArray(res)) {
        setunpaidStudents(res);
      }
    } catch (error) {
      console.error("Failed to fetch overdue students:", error);
    }
  };

  useEffect(() => {
    getOverdueStudents();
  }, []);
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
    addBulkScheduleClasses,
    updateScheduleClass,
    deleteClass,
    feePayments,
    recordFeePayment,
    deleteFeePayment,
    deleteFeePaymentById,
    updateFeePayment,
    refreshData,
    isLoading,
    error,
    recentActivity: activities,
    notifications: announcements,
    realNotifications,
    setRealNotifications,
    unpaidStudents,
    fetchUnpaidStudents,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}
