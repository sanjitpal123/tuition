import React from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LayoutGrid,
  Wrench,
  Users,
  BookOpen,
  Calendar,
  CheckSquare,
  CreditCard,
  Award,
  Bell,
  Settings,
  LogOut,
  Search,
  Menu,
  Megaphone,
  User,
  ArrowLeft,
  MoreHorizontal,
  ChevronRight,
  X,
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { requestForToken, onMessageListener } from "../../firebase";
import api from "../../lib/api";
import { useData } from "../../context/DataContext";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Students", href: "/students", icon: Users },
  { name: "Batches", href: "/batches", icon: BookOpen },
  { name: "Schedule", href: "/schedule", icon: Calendar },
  { name: "Attendance", href: "/attendance", icon: CheckSquare },
  { name: "Fees", href: "/fees", icon: CreditCard },
  { name: "Homework", href: "/homework", icon: BookOpen },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
];

function getPageTitle(pathname) {
  if (pathname.startsWith('/students/')) return 'Student Management';
  if (pathname === '/students') return 'Students List';
  if (pathname === '/batches') return 'Batches';
  if (pathname === '/schedule') return 'Class Schedule';
  if (pathname === '/attendance') return 'Attendance';
  if (pathname === '/fees') return 'Fee Records';
  if (pathname === '/homework') return 'Homework & Tasks';
  if (pathname === '/announcements') return 'Announcements';
  if (pathname === '/notifications') return 'Notifications';
  if (pathname === '/settings') return 'Profile & Settings';
  return 'Tuition Hub';
}

export function DashboardLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const currentUser = JSON.parse(
    localStorage.getItem("tutorProfile") || '{"name":"Tutor"}',
  );
  const { realNotifications, setRealNotifications } = useData();

  React.useEffect(() => {
    const initFCM = async () => {
      const token = await requestForToken();
      if (token) {
        // Send token to backend
        try {
          await api.post('/notifications/token', { token, role: 'tutor' });
          console.log('Token sent to backend successfully');
        } catch (error) {
          console.error('Failed to send token to backend', error);
        }
      }
    };
    initFCM();

    onMessageListener().then(payload => {
      console.log('Received foreground message:', payload);
      // Create a toast or visual notification here
      alert(`New Notification: ${payload.notification.title} - ${payload.notification.body}`);
      // Add it to our realNotifications context so the UI updates
      if (setRealNotifications) {
        setRealNotifications(prev => [{
          _id: Date.now().toString(),
          title: payload.notification.title,
          body: payload.notification.body,
          createdAt: new Date().toISOString(),
          isRead: false
        }, ...prev]);
      }
    }).catch(err => console.log('failed: ', err));
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("tutorToken");
    localStorage.removeItem("tutorProfile");
    navigate("/login");
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-50/80 dark:bg-[#030303]/80 backdrop-blur-2xl -z-10 pointer-events-none" />
      <div className="min-h-screen flex">
        {/* Sidebar - Desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-r border-black/5 dark:border-white/5">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center h-16 flex-shrink-0 px-6 border-b border-black/5 dark:border-white/5">
              <span
                className="text-2xl font-bold text-red-500 tracking-tight truncate w-full"
                title={currentUser.tuitionName || "Setupclass"}
              >
                {currentUser.tuitionName || "Setupclass"}
              </span>
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
              <nav className="mt-2 flex-1 px-3 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={item.href}
                    replace 
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${
                        isActive
                          ? "bg-gradient-to-r from-red-500/10 to-transparent text-red-400 shadow-[inset_2px_0_0_0_rgba(239,68,68,1)]"
                          : "text-zinc-700 dark:text-zinc-300 hover:text-red-500 hover:bg-white/5"
                      }`
                    }
                  >
                    {({ isActive }) => (
                      <>
                        <item.icon
                          className={`flex-shrink-0 mr-3 h-5 w-5 ${
                            isActive
                              ? "text-red-500"
                              : "text-zinc-400 dark:text-zinc-500 group-hover:text-red-500"
                          }`}
                          aria-hidden="true"
                        />
                        {item.name}
                      </>
                    )}
                  </NavLink>
                ))}
              </nav>
            </div>
            <div className="flex-shrink-0 flex flex-col border-t border-black/5 dark:border-white/5 p-4 space-y-2">
              <NavLink
                to="/notifications"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive ? "bg-gradient-to-r from-red-500/10 to-transparent text-red-400 shadow-[inset_2px_0_0_0_rgba(239,68,68,1)]" : "text-zinc-700 dark:text-zinc-300 hover:text-red-500 hover:bg-white/5"}`
                }
              >
                <Bell className="flex-shrink-0 mr-3 h-5 w-5 text-zinc-400 dark:text-zinc-500 group-hover:text-red-500" />{" "}
                Notifications
              </NavLink>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive ? "bg-gradient-to-r from-red-500/10 to-transparent text-red-400 shadow-[inset_2px_0_0_0_rgba(239,68,68,1)]" : "text-zinc-700 dark:text-zinc-300 hover:text-red-500 hover:bg-white/5"}`
                }
              >
                <Settings className="flex-shrink-0 mr-3 h-5 w-5 text-zinc-400 dark:text-zinc-500 group-hover:text-red-500" />{" "}
                Settings
              </NavLink>
              <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex items-center">
                <div className="flex-shrink-0">
                  <Avatar fallback={currentUser.name} size="sm" />
                </div>
                <div className="ml-3 truncate w-full">
                  <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:text-zinc-100 truncate">
                    {currentUser.name}
                  </p>
                  <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-700 dark:text-zinc-300">
                    Tutor
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        {/* Main content */}
        <div className="flex flex-col flex-1 md:pl-64 min-w-0 w-full overflow-hidden">
          {/* Top Navbar - Desktop Only */}
          <div 
            className="hidden md:flex sticky top-0 z-10 flex-shrink-0 bg-gray-50/95 dark:bg-[#030303]/95 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 lg:px-8 px-4 justify-between items-center"
            style={{ 
              height: 'calc(4rem + env(safe-area-inset-top, 0px))', 
              paddingTop: 'env(safe-area-inset-top, 0px)' 
            }}
          >
            <div className="flex items-center w-1/2">
              <span className="text-xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight text-red-500 truncate w-full">
                {currentUser.tuitionName || "Setupclass"}
              </span>
            </div>

            <div className="flex-1 flex justify-end px-4 md:px-0 max-w-4xl w-full mx-auto md:max-w-none">
              <div className="ml-4 flex items-center md:ml-6 space-x-3">
                <button
                  onClick={toggleTheme}
                  className="bg-zinc-200/50 dark:bg-zinc-900/40 backdrop-blur-xl p-1.5 rounded-full text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 focus:outline-none transition-colors"
                >
                  <span className="sr-only">Toggle theme</span>
                  {theme === "dark" ? (
                    <Sun className="h-5 w-5" aria-hidden="true" />
                  ) : (
                    <Moon
                      className="h-5 w-5 text-zinc-700"
                      aria-hidden="true"
                    />
                  )}
                </button>
                <button 
                  onClick={() => navigate('/notifications')}
                  className="relative bg-zinc-200/50 dark:bg-zinc-900/40 backdrop-blur-xl p-1.5 rounded-full text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300 focus:outline-none transition-colors">
                  <span className="sr-only">View notifications</span>
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  {realNotifications && realNotifications.filter(n => !n.isRead).length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-0.5 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-red-500 rounded-full">
                      {realNotifications.filter(n => !n.isRead).length}
                    </span>
                  )}
                </button>

                <div className="relative">
                  <button
                    onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                    onBlur={() =>
                      setTimeout(() => setIsProfileMenuOpen(false), 200)
                    }
                    className="max-w-xs bg-zinc-200/50 dark:bg-zinc-900/40 backdrop-blur-xl flex items-center justify-center p-0.5 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
                  >
                    <span className="sr-only">Open user menu</span>
                    <Avatar fallback={currentUser.name} size="sm" />
                  </button>
                  {isProfileMenuOpen && (
                    <div className="origin-top-right absolute right-0 mt-3 w-56 rounded-xl shadow-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 overflow-hidden backdrop-blur-xl">
                      <div className="px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50">
                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 truncate">
                          {currentUser.name}
                        </p>
                        <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate mt-0.5">
                          {currentUser.email || "tutor@setupclass.com"}
                        </p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onMouseDown={(e) => { e.preventDefault(); navigate("/settings"); }}
                          className="flex items-center w-full px-3 py-2 text-sm text-zinc-700 dark:text-zinc-300 hover:text-zinc-900 dark:text-white hover:bg-gray-100 dark:bg-zinc-800 rounded-lg transition-colors group"
                        >
                          <User className="w-4 h-4 mr-3 text-zinc-400 dark:text-zinc-500 group-hover:text-zinc-700 dark:text-zinc-300 transition-colors" />
                          Profile Settings
                        </button>
                      </div>
                      <div className="p-1.5 border-t border-zinc-200 dark:border-zinc-800">
                        <button
                          onMouseDown={(e) => { e.preventDefault(); handleLogout(); }}
                          className="flex items-center w-full px-3 py-2 text-sm text-red-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors group"
                        >
                          <LogOut className="w-4 h-4 mr-3 text-red-500/70 group-hover:text-red-400 transition-colors" />
                          Log out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Mobile Top Header Bar for Sub-pages (except pages with custom dedicated mobile headers) */}
          {!isDashboard && location.pathname !== '/batches' && location.pathname !== '/settings' && location.pathname !== '/students' && location.pathname !== '/attendance' && location.pathname !== '/fees' && location.pathname !== '/homework' && (
            <div 
              className="md:hidden sticky top-0 z-30 flex-shrink-0 bg-gradient-to-r from-red-600 via-red-600 to-rose-700 dark:from-[#140404] dark:via-[#110303] dark:to-[#080202] border-b border-red-500/20 dark:border-red-500/20 text-white shadow-md shadow-red-950/20 backdrop-blur-xl"
              style={{ 
                paddingTop: 'env(safe-area-inset-top, 0px)' 
              }}
            >
              <div className="h-14 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <button
                    onClick={() => navigate('/dashboard', { replace: true })}
                    className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 active:scale-90 flex items-center justify-center text-white transition-all flex-shrink-0 border border-white/20 dark:border-zinc-700"
                    title="Back to Dashboard"
                  >
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <h1 className="text-base font-heading font-bold text-white tracking-tight truncate leading-none">
                    {getPageTitle(location.pathname)}
                  </h1>
                </div>

                <div className="flex items-center space-x-2 flex-shrink-0">
                  <button
                    onClick={toggleTheme}
                    className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 active:scale-90 flex items-center justify-center text-white transition-all border border-white/20 dark:border-zinc-700"
                    title="Toggle Theme"
                  >
                    {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400 stroke-[2]" /> : <Moon className="w-4 h-4 text-white stroke-[2]" />}
                  </button>
                  <button
                    onClick={() => navigate('/notifications')}
                    className="relative w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 active:scale-90 flex items-center justify-center text-white transition-all border border-white/20 dark:border-zinc-700"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4 stroke-[2]" />
                    {realNotifications && realNotifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-[16px] px-0.5 text-[9px] font-extrabold text-white bg-red-600 rounded-full border-2 border-white dark:border-zinc-900">
                        {realNotifications.filter(n => !n.isRead).length}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          <main className="flex-1 pb-28 md:pb-8">
            <div 
              className={
                isDashboard || location.pathname === '/batches' || location.pathname === '/settings' || location.pathname === '/students' || location.pathname === '/attendance' || location.pathname === '/fees' || location.pathname === '/homework'
                  ? "mt-0 md:mt-8" 
                  : "mt-3 md:mt-8"
              }
              style={{
                paddingTop: (!isDashboard && (location.pathname === '/batches' || location.pathname === '/settings' || location.pathname === '/students' || location.pathname === '/attendance' || location.pathname === '/fees' || location.pathname === '/homework'))
                  ? 'calc(0.75rem + env(safe-area-inset-top, 0px))' 
                  : '0px'
              }}
            >
              <div className={`max-w-7xl mx-auto ${isDashboard ? 'px-0 md:px-8' : 'px-4 sm:px-6 lg:px-8'}`}>
                <Outlet />
              </div>
            </div>
          </main>
        </div>

        {/* Mobile menu overlay & drawer */}
        {mobileMenuOpen && (
          <div className="relative z-[70] md:hidden animate-in fade-in duration-200">
            <div
              className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[70]"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-0 flex z-[70] pointer-events-none">
              <div 
                className="relative flex w-full max-w-[290px] sm:max-w-xs flex-1 flex-col bg-white dark:bg-[#0c0f17] border-r border-zinc-200/80 dark:border-zinc-800/80 shadow-2xl pointer-events-auto h-full"
                style={{ 
                  paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))',
                  paddingBottom: 'calc(1.25rem + env(safe-area-inset-bottom, 0px))'
                }}
              >
                {/* 1. Header with App/Tuition Brand & Close button */}
                <div className="px-5 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-950/30 flex-shrink-0">
                      <span className="font-extrabold text-base uppercase">
                        {(currentUser.tuitionName || "Setupclass").charAt(0)}
                      </span>
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight truncate leading-tight">
                        {currentUser.tuitionName || "Setupclass"}
                      </h2>
                      <span className="inline-flex items-center text-[10px] font-bold text-red-500 uppercase tracking-wider mt-0.5">
                        Tutor Workspace
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200/80 dark:border-zinc-700/80 flex items-center justify-center text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white active:scale-95 transition-all flex-shrink-0"
                    title="Close menu"
                  >
                    <X className="w-4 h-4 stroke-[2.5]" />
                  </button>
                </div>

                {/* 2. Scrollable Navigation List */}
                <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-5">
                  {/* Main Navigation Group */}
                  <div>
                    <div className="px-2.5 pb-2 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Main Navigation</span>
                    </div>
                    <nav className="space-y-1">
                      {navigation.slice(0, 4).map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          replace
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `group flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] ${
                              isActive
                                ? "bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 shadow-sm"
                                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className="flex items-center min-w-0">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 transition-colors ${
                                  isActive
                                    ? "bg-red-600 text-white shadow-sm shadow-red-950/20"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-red-500/10 group-hover:text-red-500"
                                }`}>
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <span className="truncate">{item.name}</span>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                                isActive ? "text-red-500" : "text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5"
                              }`} />
                            </>
                          )}
                        </NavLink>
                      ))}
                    </nav>
                  </div>

                  {/* Academics & Management Group */}
                  <div>
                    <div className="px-2.5 pb-2 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Academics & Tools</span>
                    </div>
                    <nav className="space-y-1">
                      {navigation.slice(4).map((item) => (
                        <NavLink
                          key={item.name}
                          to={item.href}
                          replace
                          onClick={() => setMobileMenuOpen(false)}
                          className={({ isActive }) =>
                            `group flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] ${
                              isActive
                                ? "bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 shadow-sm"
                                : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                            }`
                          }
                        >
                          {({ isActive }) => (
                            <>
                              <div className="flex items-center min-w-0">
                                <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 transition-colors ${
                                  isActive
                                    ? "bg-red-600 text-white shadow-sm shadow-red-950/20"
                                    : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-red-500/10 group-hover:text-red-500"
                                }`}>
                                  <item.icon className="w-4 h-4" />
                                </div>
                                <span className="truncate">{item.name}</span>
                              </div>
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                                isActive ? "text-red-500" : "text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5"
                              }`} />
                            </>
                          )}
                        </NavLink>
                      ))}
                    </nav>
                  </div>

                  {/* Preferences & Notifications */}
                  <div>
                    <div className="px-2.5 pb-2 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider flex items-center justify-between">
                      <span>Account & Alerts</span>
                    </div>
                    <nav className="space-y-1">
                      <NavLink
                        to="/notifications"
                        replace
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] ${
                            isActive
                              ? "bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 shadow-sm"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center min-w-0">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 transition-colors ${
                                isActive
                                  ? "bg-red-600 text-white shadow-sm shadow-red-950/20"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-red-500/10 group-hover:text-red-500"
                              }`}>
                                <Bell className="w-4 h-4" />
                              </div>
                              <span>Notifications</span>
                            </div>
                            {realNotifications && realNotifications.filter(n => !n.isRead).length > 0 ? (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold text-white bg-red-600 rounded-full shadow-sm">
                                {realNotifications.filter(n => !n.isRead).length}
                              </span>
                            ) : (
                              <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                                isActive ? "text-red-500" : "text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5"
                              }`} />
                            )}
                          </>
                        )}
                      </NavLink>

                      <NavLink
                        to="/settings"
                        replace
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center justify-between px-3 py-2.5 rounded-2xl text-sm font-semibold transition-all active:scale-[0.98] ${
                            isActive
                              ? "bg-red-500/10 dark:bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20 shadow-sm"
                              : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <div className="flex items-center min-w-0">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center mr-3 transition-colors ${
                                isActive
                                  ? "bg-red-600 text-white shadow-sm shadow-red-950/20"
                                  : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-red-500/10 group-hover:text-red-500"
                              }`}>
                                <Settings className="w-4 h-4" />
                              </div>
                              <span>Settings & Profile</span>
                            </div>
                            <ChevronRight className={`w-3.5 h-3.5 transition-transform ${
                              isActive ? "text-red-500" : "text-zinc-300 dark:text-zinc-600 group-hover:translate-x-0.5"
                            }`} />
                          </>
                        )}
                      </NavLink>
                    </nav>
                  </div>
                </div>

                {/* 3. Bottom Teacher Profile & Quick Action Card */}
                <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex-shrink-0">
                  <div className="bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-3 flex items-center justify-between shadow-sm">
                    <div 
                      className="flex items-center space-x-2.5 min-w-0 cursor-pointer flex-1"
                      onClick={() => { setMobileMenuOpen(false); navigate('/settings', { replace: true }); }}
                    >
                      <div className="relative flex-shrink-0">
                        <Avatar fallback={currentUser.name} size="sm" />
                        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white dark:border-[#101420] rounded-full" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate leading-tight">
                          {currentUser.name}
                        </p>
                        <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500 block leading-tight mt-0.5">
                          Tutor Account
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 flex-shrink-0">
                      <button
                        type="button"
                        onClick={toggleTheme}
                        className="w-8 h-8 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 active:scale-95 transition-all"
                        title="Toggle Theme"
                      >
                        {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        type="button"
                        onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                        className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-600 dark:text-rose-400 hover:bg-rose-500 hover:text-white flex items-center justify-center active:scale-95 transition-all"
                        title="Logout"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar (Dashboard, Students, Batches, Fees, Profile, More) */}
        <div 
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-white/95 dark:bg-[#0c0f17]/95 backdrop-blur-2xl border-t border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.5)]"
          style={{
            height: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <div className="grid h-full w-full grid-cols-6 max-w-md mx-auto relative">
            {/* 1. Dashboard Tab */}
            <NavLink
              to="/dashboard"
              replace
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full py-1 space-y-0.5 transition-all outline-none active:scale-95 ${
                  isActive
                    ? "text-red-500 font-bold"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 w-6 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                  <LayoutGrid
                    className={`w-4 h-4 ${isActive ? "text-red-500 stroke-[2.4]" : "stroke-[1.8]"}`}
                    aria-hidden="true"
                  />
                  <span className="text-[9.5px] leading-tight tracking-tight">
                    Dashboard
                  </span>
                </>
              )}
            </NavLink>

            {/* 2. Students Tab */}
            <NavLink
              to="/students"
              replace
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full py-1 space-y-0.5 transition-all outline-none active:scale-95 ${
                  isActive
                    ? "text-red-500 font-bold"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 w-6 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                  <Users
                    className={`w-4 h-4 ${isActive ? "text-red-500 stroke-[2.4]" : "stroke-[1.8]"}`}
                    aria-hidden="true"
                  />
                  <span className="text-[9.5px] leading-tight tracking-tight">
                    Student
                  </span>
                </>
              )}
            </NavLink>

            {/* 3. Batches Tab */}
            <NavLink
              to="/batches"
              replace
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full py-1 space-y-0.5 transition-all outline-none active:scale-95 ${
                  isActive
                    ? "text-red-500 font-bold"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 w-6 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                  <BookOpen
                    className={`w-4 h-4 ${isActive ? "text-red-500 stroke-[2.4]" : "stroke-[1.8]"}`}
                    aria-hidden="true"
                  />
                  <span className="text-[9.5px] leading-tight tracking-tight">
                    Batch
                  </span>
                </>
              )}
            </NavLink>

            {/* 4. Fees Tab */}
            <NavLink
              to="/fees"
              replace
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full py-1 space-y-0.5 transition-all outline-none active:scale-95 ${
                  isActive
                    ? "text-red-500 font-bold"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 w-6 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                  <CreditCard
                    className={`w-4 h-4 ${isActive ? "text-red-500 stroke-[2.4]" : "stroke-[1.8]"}`}
                    aria-hidden="true"
                  />
                  <span className="text-[9.5px] leading-tight tracking-tight">
                    Fees
                  </span>
                </>
              )}
            </NavLink>

            {/* 5. Profile Tab */}
            <NavLink
              to="/settings"
              replace
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full py-1 space-y-0.5 transition-all outline-none active:scale-95 ${
                  isActive
                    ? "text-red-500 font-bold"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 w-6 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                  <User
                    className={`w-4 h-4 ${isActive ? "text-red-500 stroke-[2.4]" : "stroke-[1.8]"}`}
                    aria-hidden="true"
                  />
                  <span className="text-[9.5px] leading-tight tracking-tight">
                    Profile
                  </span>
                </>
              )}
            </NavLink>

            {/* 6. More / Tools Drawer */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="relative flex flex-col items-center justify-center w-full h-full py-1 space-y-0.5 text-zinc-400 dark:text-zinc-500 hover:text-red-500 dark:hover:text-red-400 transition-all outline-none active:scale-95 cursor-pointer font-medium"
            >
              <MoreHorizontal 
                className="w-4 h-4 stroke-[1.8]" 
                aria-hidden="true"
              />
              <span className="text-[9.5px] leading-tight tracking-tight">More</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
