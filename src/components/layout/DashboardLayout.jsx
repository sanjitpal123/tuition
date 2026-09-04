import React from "react";
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
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
  // { name: 'Tests & Results', href: '/tests', icon: Award },
  { name: "Announcements", href: "/announcements", icon: Megaphone },
];

function getPageTitle(pathname) {
  if (pathname.startsWith('/students/')) return 'Student Management';
  if (pathname === '/students') return 'Students List';
  if (pathname === '/batches') return 'Batches';
  if (pathname === '/schedule') return 'Class Schedule';
  if (pathname === '/attendance') return 'Attendance';
  if (pathname === '/fees') return 'Fee Records';
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

          {/* Mobile Top Header Bar for Sub-pages */}
          {!isDashboard && (
            <div 
              className="md:hidden sticky top-0 z-30 flex-shrink-0 bg-gradient-to-r from-red-600 via-red-600 to-rose-700 dark:from-[#140404] dark:via-[#110303] dark:to-[#080202] border-b border-red-500/20 dark:border-red-500/20 text-white shadow-md shadow-red-950/20 backdrop-blur-xl"
              style={{ 
                paddingTop: 'env(safe-area-inset-top, 0px)' 
              }}
            >
              <div className="h-14 px-4 flex items-center justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  <button
                    onClick={() => navigate(-1)}
                    className="w-9 h-9 rounded-xl bg-white/15 hover:bg-white/25 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 active:scale-90 flex items-center justify-center text-white transition-all flex-shrink-0 border border-white/20 dark:border-zinc-700"
                    title="Back"
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

          <main className="flex-1 pb-24 md:pb-8">
            <div className={isDashboard ? "mt-0 md:mt-8" : "mt-3 md:mt-8"}>
              <div className={`max-w-7xl mx-auto ${isDashboard ? 'px-0 md:px-8' : 'px-4 sm:px-6 lg:px-8'}`}>
                <Outlet />
              </div>
            </div>
          </main>
        </div>

        {/* Mobile menu overlay */}
        {mobileMenuOpen && (
          <div className="relative z-50 md:hidden">
            <div
              className="fixed inset-0 bg-black/80 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            <div className="fixed inset-0 flex">
              <div 
                className="relative mr-16 flex w-full max-w-xs flex-1 flex-col bg-gray-50 dark:bg-[#030303] border-r border-black/5 dark:border-white/5 pb-4 shadow-2xl"
                style={{ paddingTop: 'calc(1.25rem + env(safe-area-inset-top, 0px))' }}
              >
                <div 
                  className="absolute top-0 right-0 -mr-12"
                  style={{ paddingTop: 'calc(0.5rem + env(safe-area-inset-top, 0px))' }}
                >
                  <button
                    type="button"
                    className="ml-1 flex h-10 w-10 items-center justify-center rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <span className="sr-only">Close sidebar</span>
                    <div className="text-zinc-900 dark:text-white bg-white/10 p-2 rounded-full">
                      <svg
                        className="h-6 w-6"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="1.5"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                  </button>
                </div>
                <div className="flex items-center px-6 h-16 flex-shrink-0 border-b border-black/5 dark:border-white/5">
                  <span
                    className="text-2xl font-bold text-red-500 tracking-tight truncate w-full"
                    title={currentUser.tuitionName || "Setupclass"}
                  >
                    {currentUser.tuitionName || "Setupclass"}
                  </span>
                </div>
                <div className="mt-4 h-0 flex-1 overflow-y-auto">
                  <div className="px-4 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    Tools & Navigation
                  </div>
                  <nav className="px-3 space-y-1">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={item.href}
                        onClick={() => setMobileMenuOpen(false)}
                        className={({ isActive }) =>
                          `group flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-all ${
                            isActive
                              ? "bg-gradient-to-r from-red-500/10 to-transparent text-red-400 shadow-[inset_2px_0_0_0_rgba(239,68,68,1)]"
                              : "text-zinc-700 dark:text-zinc-300 hover:text-red-500 hover:bg-white/5"
                          }`
                        }
                      >
                        {({ isActive }) => (
                          <>
                            <item.icon
                              className={`flex-shrink-0 mr-4 h-5 w-5 ${
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
                
                {/* Mobile sidebar footer with Settings and Profile */}
                <div className="flex-shrink-0 flex flex-col border-t border-black/5 dark:border-white/5 p-4 space-y-2 mt-auto">
                  <NavLink
                    to="/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-all ${isActive ? "bg-gradient-to-r from-red-500/10 to-transparent text-red-400 shadow-[inset_2px_0_0_0_rgba(239,68,68,1)]" : "text-zinc-700 dark:text-zinc-300 hover:text-red-500 hover:bg-white/5"}`
                    }
                  >
                    <Bell className="flex-shrink-0 mr-4 h-5 w-5 text-zinc-400 dark:text-zinc-500 group-hover:text-red-500" />
                    Notifications
                  </NavLink>
                  <NavLink
                    to="/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-all ${isActive ? "bg-gradient-to-r from-red-500/10 to-transparent text-red-400 shadow-[inset_2px_0_0_0_rgba(239,68,68,1)]" : "text-zinc-700 dark:text-zinc-300 hover:text-red-500 hover:bg-white/5"}`
                    }
                  >
                    <Settings className="flex-shrink-0 mr-4 h-5 w-5 text-zinc-400 dark:text-zinc-500 group-hover:text-red-500" />
                    Settings
                  </NavLink>
                  <div className="mt-2 pt-2 border-t border-black/5 dark:border-white/5 flex items-center px-3">
                    <div className="flex-shrink-0">
                      <Avatar fallback={currentUser.name} size="sm" />
                    </div>
                    <div className="ml-3 truncate w-full">
                      <p className="text-sm font-medium text-zinc-700 dark:text-zinc-300 truncate">
                        {currentUser.name}
                      </p>
                      <p className="text-xs font-medium text-zinc-400 dark:text-zinc-500">
                        Tutor
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation Bar (Matched to screenshot with Dashboard, Tools, Profile) */}
        <div 
          className="md:hidden fixed bottom-0 left-0 z-40 w-full bg-white/90 dark:bg-[#030303]/90 backdrop-blur-2xl border-t border-black/5 dark:border-white/5 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] dark:shadow-[0_-4px_20px_rgba(0,0,0,0.4)]"
          style={{
            height: 'calc(3.8rem + env(safe-area-inset-bottom, 0px))',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <div className="grid h-full w-full grid-cols-3 max-w-md mx-auto">
            {/* Dashboard Tab */}
            <NavLink
              to="/dashboard"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all outline-none active:scale-95 ${
                  isActive
                    ? "text-red-500 font-semibold"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <LayoutDashboard
                    className={`w-5 h-5 ${isActive ? "text-red-500 stroke-[2.5]" : "stroke-[1.8]"}`}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] leading-none">
                    Dashboard
                  </span>
                </>
              )}
            </NavLink>

            {/* Tools / Actions Drawer Tab */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400 transition-all outline-none active:scale-95"
            >
              <svg 
                className="w-5 h-5 stroke-[1.8]" 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <span className="text-[11px] leading-none">Tools</span>
            </button>

            {/* Profile / Settings Tab */}
            <NavLink
              to="/settings"
              className={({ isActive }) =>
                `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all outline-none active:scale-95 ${
                  isActive
                    ? "text-red-500 font-semibold"
                    : "text-zinc-500 dark:text-zinc-400 hover:text-red-500 dark:hover:text-red-400"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <User
                    className={`w-5 h-5 ${isActive ? "text-red-500 stroke-[2.5]" : "stroke-[1.8]"}`}
                    aria-hidden="true"
                  />
                  <span className="text-[11px] leading-none">
                    Profile
                  </span>
                </>
              )}
            </NavLink>
          </div>
        </div>
      </div>
    </>
  );
}
