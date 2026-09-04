import React from "react";
import { NavLink, Outlet, useNavigate, useSearchParams } from "react-router-dom";
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
  ChevronDown,
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";
import { useTheme } from "../../context/ThemeContext";
import { Sun, Moon } from "lucide-react";
import { requestForToken, onMessageListener } from "../../firebase";
import { studentApi } from "../../lib/api"; // Added studentApi
import { useData } from "../../context/DataContext";

const navigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "Fees", href: "/student/fees", icon: CreditCard },
  { name: "Attendance", href: "/student/attendance", icon: CheckSquare },
  { name: "Homework", href: "/student/homework", icon: BookOpen },
  { name: "Announcements", href: "/student/announcements", icon: Megaphone },
];

export function StudentLayout() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = React.useState(false);
  const [tuitionDropdownOpen, setTuitionDropdownOpen] = React.useState(false);
  const [mobileTuitionDropdownOpen, setMobileTuitionDropdownOpen] = React.useState(false);
  const currentUser = JSON.parse(
    localStorage.getItem("studentProfile") || '{"name":"Student"}'
  );
  
  // Multiple tuitions from login or fallback
  const multipleTuitions = currentUser.tuitions || [
    { id: '1', name: currentUser.tuitionName || 'Setupclass' }
  ];
  
  const currentTuitionId = searchParams.get('tuitionId');
  const selectedTuition = multipleTuitions.find(t => t.id === currentTuitionId) || multipleTuitions[0];

  const { realNotifications, setRealNotifications } = useData();

  React.useEffect(() => {
    const initFCM = async () => {
      const token = await requestForToken();
      if (token) {
        // Send token to backend
        try {
          await studentApi.post('/notifications/token', { token, role: 'student' });
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
    localStorage.removeItem("studentToken");
    localStorage.removeItem("studentProfile");
    navigate("/login");
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-50/80 dark:bg-[#030303]/80 backdrop-blur-2xl -z-10 pointer-events-none" />
      <div className="min-h-screen flex">
        {/* Sidebar - Desktop */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border-r border-black/5 dark:border-white/5">
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center h-16 flex-shrink-0 px-4 border-b border-black/5 dark:border-white/5 relative">
              <button 
                onClick={() => setTuitionDropdownOpen(!tuitionDropdownOpen)}
                onBlur={() => setTimeout(() => setTuitionDropdownOpen(false), 200)}
                className="flex items-center justify-between w-full p-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg transition-colors focus:outline-none"
              >
                <span
                  className="text-2xl font-bold text-red-500 tracking-tight truncate"
                  title={selectedTuition.name}
                >
                  {selectedTuition.name}
                </span>
                <ChevronDown className="w-5 h-5 text-zinc-400" />
              </button>
              
              {tuitionDropdownOpen && (
                <div className="absolute top-14 left-4 right-4 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
                  <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-950/50">
                    Your Tuitions
                  </div>
                  {multipleTuitions.map(t => (
                    <button
                      key={t.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        setSearchParams({ tuitionId: t.id });
                        setTuitionDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 ${
                        selectedTuition.id === t.id ? 'text-red-500 bg-red-50/50 dark:bg-red-500/5' : 'text-zinc-700 dark:text-zinc-300'
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="flex-1 flex flex-col overflow-y-auto pt-5 pb-4">
              <nav className="mt-2 flex-1 px-3 space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={{ pathname: item.href, search: searchParams.toString() }}
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
                to="/student/notifications"
                className={({ isActive }) =>
                  `group flex items-center px-3 py-2.5 text-sm font-medium rounded-lg transition-all ${isActive ? "bg-gradient-to-r from-red-500/10 to-transparent text-red-400 shadow-[inset_2px_0_0_0_rgba(239,68,68,1)]" : "text-zinc-700 dark:text-zinc-300 hover:text-red-500 hover:bg-white/5"}`
                }
              >
                <Bell className="flex-shrink-0 mr-3 h-5 w-5 text-zinc-400 dark:text-zinc-500 group-hover:text-red-500" />{" "}
                Notifications
              </NavLink>
              <NavLink
                to="/student/settings"
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
                    Student
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col flex-1 md:pl-64 min-w-0 w-full overflow-hidden">
          <div 
            className="sticky top-0 z-10 flex-shrink-0 flex bg-gray-50/95 dark:bg-[#030303]/95 backdrop-blur-2xl border-b border-black/5 dark:border-white/5 lg:px-8 px-4 justify-between items-center"
            style={{ 
              height: 'calc(4rem + env(safe-area-inset-top, 0px))', 
              paddingTop: 'env(safe-area-inset-top, 0px)' 
            }}
          >
            <div className="flex items-center md:hidden w-1/2">
              <span className="text-xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight text-red-500 truncate w-full">
                {selectedTuition.name}
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
                  onClick={() => navigate('/student/notifications')}
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
                          {currentUser.email || "student@setupclass.com"}
                        </p>
                      </div>
                      <div className="p-1.5">
                        <button
                          onMouseDown={(e) => { e.preventDefault(); navigate("/student/profile"); }}
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

          <main className="flex-1 pb-24 md:pb-8">
            <div className="mt-8">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
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
                className="relative mr-16 flex w-full max-w-xs flex-1 flex-col bg-gray-50 dark:bg-[#030303] border-r border-black/5 dark:border-white/5 pb-4"
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
                <div className="flex items-center px-4 h-16 flex-shrink-0 relative">
                  <button 
                    onClick={() => setMobileTuitionDropdownOpen(!mobileTuitionDropdownOpen)}
                    onBlur={() => setTimeout(() => setMobileTuitionDropdownOpen(false), 200)}
                    className="flex items-center justify-between w-full p-2 hover:bg-zinc-100 dark:hover:bg-[#111] rounded-lg transition-colors focus:outline-none"
                  >
                    <span
                      className="text-2xl font-bold text-red-500 tracking-tight truncate"
                      title={selectedTuition.name}
                    >
                      {selectedTuition.name}
                    </span>
                    <ChevronDown className="w-5 h-5 text-zinc-400" />
                  </button>
                  
                  {mobileTuitionDropdownOpen && (
                    <div className="absolute top-14 left-4 right-4 mt-1 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 overflow-hidden">
                      <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-950/50">
                        Your Tuitions
                      </div>
                      {multipleTuitions.map(t => (
                        <button
                          key={t.id}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            setSearchParams({ tuitionId: t.id });
                            setMobileTuitionDropdownOpen(false);
                            // Optional: reload the page or update context here
                          }}
                          className={`w-full text-left px-4 py-3 text-sm font-medium transition-colors hover:bg-red-50 dark:hover:bg-red-500/10 ${
                            selectedTuition.id === t.id ? 'text-red-500 bg-red-50/50 dark:bg-red-500/5' : 'text-zinc-700 dark:text-zinc-300'
                          }`}
                        >
                          {t.name}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-5 h-0 flex-1 overflow-y-auto">
                  <nav className="px-3 space-y-1">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={{ pathname: item.href, search: searchParams.toString() }}
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
                              className={`flex-shrink-0 mr-4 h-6 w-6 ${
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
                
                <div className="flex-shrink-0 flex flex-col border-t border-black/5 dark:border-white/5 p-4 space-y-2 mt-auto">
                  <NavLink
                    to="/student/notifications"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-all ${isActive ? "bg-gradient-to-r from-red-500/10 to-transparent text-red-400 shadow-[inset_2px_0_0_0_rgba(239,68,68,1)]" : "text-zinc-700 dark:text-zinc-300 hover:text-red-500 hover:bg-white/5"}`
                    }
                  >
                    <Bell className="flex-shrink-0 mr-4 h-6 w-6 text-zinc-400 dark:text-zinc-500 group-hover:text-red-500" />
                    Notifications
                  </NavLink>
                  <NavLink
                    to="/student/settings"
                    onClick={() => setMobileMenuOpen(false)}
                    className={({ isActive }) =>
                      `group flex items-center px-3 py-2.5 text-base font-medium rounded-lg transition-all ${isActive ? "bg-gradient-to-r from-red-500/10 to-transparent text-red-400 shadow-[inset_2px_0_0_0_rgba(239,68,68,1)]" : "text-zinc-700 dark:text-zinc-300 hover:text-red-500 hover:bg-white/5"}`
                    }
                  >
                    <Settings className="flex-shrink-0 mr-4 h-6 w-6 text-zinc-400 dark:text-zinc-500 group-hover:text-red-500" />
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
                        Student
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mobile Bottom Navigation */}
        <div 
          className="md:hidden fixed bottom-0 left-0 z-40 w-full bg-gray-50/95 dark:bg-[#030303]/95 backdrop-blur-2xl border-t border-black/5 dark:border-white/5"
          style={{
            height: 'calc(4rem + env(safe-area-inset-bottom, 0px))',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <div className="grid h-full w-full grid-cols-5">
            {navigation.slice(0, 4).map((item) => (
              <NavLink
                key={item.name}
                to={{ pathname: item.href, search: searchParams.toString() }}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center w-full h-full space-y-1 transition-all outline-none active:scale-95 ${
                    isActive
                      ? "text-red-500"
                      : "text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300"
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <item.icon
                      className={`w-5 h-5 ${isActive ? "text-red-500" : ""}`}
                      aria-hidden="true"
                    />
                    <span className="text-[10px] font-medium leading-none truncate w-full text-center px-1">
                      {item.name}
                    </span>
                  </>
                )}
              </NavLink>
            ))}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="flex flex-col items-center justify-center w-full h-full space-y-1 text-zinc-500 dark:text-zinc-500 hover:text-zinc-700 dark:text-zinc-300 transition-all outline-none active:scale-95"
            >
              <Menu className="w-5 h-5" aria-hidden="true" />
              <span className="text-[10px] font-medium leading-none">Menu</span>
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
