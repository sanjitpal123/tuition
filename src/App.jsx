import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { StudentLayout } from './components/layout/StudentLayout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Batches from './pages/Batches';
import Schedule from './pages/Schedule';
import Attendance from './pages/Attendance';
import Fees from './pages/Fees';
import Tests from './pages/Tests';
import Notifications from './pages/Notifications';
import Settings from './pages/Settings';
import Profile from './pages/Profile';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Announcements from './pages/Announcements';
import Homework from './pages/Homework';
import StudentView from './pages/StudentView';
import StudentDashboard from './pages/StudentDashboard';

import StudentFees from './pages/StudentFees';
import StudentAttendance from './pages/StudentAttendance';
import StudentHomework from './pages/StudentHomework';
import StudentAnnouncements from './pages/StudentAnnouncements';
import StudentProfile from './pages/StudentProfile';
import StudentSettings from './pages/StudentSettings';
import StudentNotifications from './pages/StudentNotifications';

function ProtectedRoute({ isStudent = false }) {
  const token = localStorage.getItem(isStudent ? 'studentToken' : 'tutorToken');
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return <Outlet />;
}

function RootRedirect() {
  if (localStorage.getItem('tutorToken')) {
    return <Navigate to="/dashboard" replace />;
  }
  if (localStorage.getItem('studentToken')) {
    return <Navigate to="/student/dashboard" replace />;
  }
  return <Navigate to="/login" replace />;
}

function App() {
  return (
    <ThemeProvider>
      <DataProvider>
        <Router>
          <Routes>
          <Route path="/" element={<RootRedirect />} />
          <Route path="/login" element={<Login />} />
          <Route path="/onboarding" element={<Onboarding />} />
          
          <Route element={<ProtectedRoute isStudent={true} />}>
            <Route element={<StudentLayout />}>
              <Route path="/student/dashboard" element={<StudentDashboard />} />
              <Route path="/student/fees" element={<StudentFees />} />
              <Route path="/student/attendance" element={<StudentAttendance />} />
              <Route path="/student/homework" element={<StudentHomework />} />
              <Route path="/student/announcements" element={<StudentAnnouncements />} />
              <Route path="/student/profile" element={<StudentProfile />} />
              <Route path="/student/settings" element={<StudentSettings />} />
              <Route path="/student/notifications" element={<StudentNotifications />} />
            </Route>
          </Route>
          
          <Route element={<ProtectedRoute isStudent={false} />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/students" element={<Students />} />
              <Route path="/students/:id" element={<StudentView />} />
              <Route path="/batches" element={<Batches />} />
              <Route path="/schedule" element={<Schedule />} />
              <Route path="/attendance" element={<Attendance />} />
              <Route path="/fees" element={<Fees />} />
              <Route path="/tests" element={<Tests />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/announcements" element={<Announcements />} />
              <Route path="/homework" element={<Homework />} />
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
          </Route>
        </Routes>
        </Router>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
