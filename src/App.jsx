import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { DataProvider } from './context/DataContext';
import { ThemeProvider } from './context/ThemeContext';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { StudentLayout } from './components/layout/StudentLayout';

// Tutor Pages (Lazy Loaded)
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Students = lazy(() => import('./pages/Students'));
const StudentView = lazy(() => import('./pages/StudentView'));
const Batches = lazy(() => import('./pages/Batches'));
const Schedule = lazy(() => import('./pages/Schedule'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Fees = lazy(() => import('./pages/Fees'));
const Tests = lazy(() => import('./pages/Tests'));
const Notifications = lazy(() => import('./pages/Notifications'));
const Announcements = lazy(() => import('./pages/Announcements'));
const Homework = lazy(() => import('./pages/Homework'));
const Settings = lazy(() => import('./pages/Settings'));
const Profile = lazy(() => import('./pages/Profile'));
const Onboarding = lazy(() => import('./pages/Onboarding'));
const Login = lazy(() => import('./pages/Login'));

// Student Portal Pages (Lazy Loaded)
const StudentDashboard = lazy(() => import('./pages/StudentDashboard'));
const StudentFees = lazy(() => import('./pages/StudentFees'));
const StudentAttendance = lazy(() => import('./pages/StudentAttendance'));
const StudentHomework = lazy(() => import('./pages/StudentHomework'));
const StudentAnnouncements = lazy(() => import('./pages/StudentAnnouncements'));
const StudentProfile = lazy(() => import('./pages/StudentProfile'));
const StudentSettings = lazy(() => import('./pages/StudentSettings'));
const StudentNotifications = lazy(() => import('./pages/StudentNotifications'));

import { PageLoadingFallback } from './components/common/PageLoadingFallback';

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
          <Suspense fallback={<PageLoadingFallback />}>
            <Routes>
              <Route path="/" element={<RootRedirect />} />
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<Onboarding />} />

              {/* Student Portal Routes */}
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

              {/* Tutor Dashboard Routes */}
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
          </Suspense>
        </Router>
      </DataProvider>
    </ThemeProvider>
  );
}

export default App;
