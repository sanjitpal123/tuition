import React from "react";
import { NavLink, Outlet, useNavigate, useSearchParams, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  LayoutGrid,
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
  ChevronRight,
  MoreHorizontal,
  GraduationCap,
  Sparkles,
  Building,
  ArrowLeft,
  X,
  Sun,
  Moon
} from "lucide-react";
import { Avatar } from "../ui/Avatar";
import { useTheme } from "../../context/ThemeContext";
import { requestForToken, onMessageListener } from "../../firebase";
import { studentApi } from "../../lib/api";
import { useData } from "../../context/DataContext";

const navigation = [
  { name: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard },
  { name: "Attendance", href: "/student/attendance", icon: CheckSquare },
  { name: "Homework", href: "/student/homework", icon: BookOpen },
  { name: "Fees", href: "/student/fees", icon: CreditCard },
  { name: "Announcements", href: "/student/announcements", icon: Megaphone },
];

export function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
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
    { id: '1', name: currentUser.tuitionName || 'Setupclass', subject: 'All Subjects', role: 'Student' }
  ];
  
  const currentTuitionId = searchParams.get('tuitionId');
  const selectedTuition = multipleTuitions.find(t => (t.id === currentTuitionId || t._id === currentTuitionId)) || multipleTuitions[0];

  const { realNotifications, setRealNotifications } = useData();
  const unreadCount = realNotifications?.filter(n => !n.isRead)?.length || 0;

  React.useEffect(() => {
    const initFCM = async () => {
      const token = await requestForToken();
      if (token) {
        try {
          await studentApi.post('/notifications/token', { token, role: 'student' });
        } catch (error) {
          console.error('Failed to send token to backend', error);
        }
      }
    };
    initFCM();

    onMessageListener().then(payload => {
      alert(`New Notification: ${payload.notification.title} - ${payload.notification.body}`);
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
    navigate("/login", { replace: true });
  };

  const handleSwitchTuition = (tuitionId) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('tuitionId', tuitionId);
    setSearchParams(newParams);
    setTuitionDropdownOpen(false);
    setMobileTuitionDropdownOpen(false);
  };

  return (
    <>
      <div className="fixed inset-0 bg-gray-50/80 dark:bg-[#030303]/80 backdrop-blur-2xl -z-10 pointer-events-none" />
      <div className="min-h-screen flex">
        
        {/* ========================================================================= */}
        {/* DESKTOP SIDEBAR */}
        {/* ========================================================================= */}
        <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 bg-white/60 dark:bg-[#0c0f17]/90 backdrop-blur-2xl border-r border-zinc-200/80 dark:border-zinc-800/80">
          <div className="flex-1 flex flex-col min-h-0">
            
            {/* Desktop Brand / Tuition Selector */}
            <div className="p-4 border-b border-zinc-200/80 dark:border-zinc-800/80 relative">
              <div className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1.5 px-1">
                Active Tuition Hub
              </div>
              <button 
                onClick={() => setTuitionDropdownOpen(!tuitionDropdownOpen)}
                onBlur={() => setTimeout(() => setTuitionDropdownOpen(false), 200)}
                className="flex items-center justify-between w-full p-2.5 bg-zinc-100/80 dark:bg-zinc-800/60 hover:bg-zinc-200/70 dark:hover:bg-zinc-800 border border-zinc-200/80 dark:border-zinc-700/80 rounded-2xl transition-all active:scale-[0.98]"
              >
                <div className="flex items-center space-x-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white font-extrabold text-xs shadow-sm flex-shrink-0">
                    {(selectedTuition.name || 'T').charAt(0).toUpperCase()}
                  </div>
                  <span
                    className="font-bold text-sm text-zinc-900 dark:text-white tracking-tight truncate"
                    title={selectedTuition.name}
                  >
                    {selectedTuition.name}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400 flex-shrink-0 ml-1" />
              </button>
              
              {tuitionDropdownOpen && (
                <div className="absolute top-full left-4 right-4 mt-1.5 bg-white dark:bg-[#101420] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
                  <div className="px-3.5 py-2 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-950/60 border-b border-zinc-100 dark:border-zinc-800">
                    Enrolled Tuitions ({multipleTuitions.length})
                  </div>
                  <div className="max-h-56 overflow-y-auto py-1">
                    {multipleTuitions.map(t => (
                      <button
                        key={t.id || t._id}
                        onMouseDown={(e) => {
                          e.preventDefault();
                          handleSwitchTuition(t.id || t._id);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold flex items-center justify-between transition-colors ${
                          (selectedTuition.id === (t.id || t._id) || selectedTuition._id === (t.id || t._id))
                            ? 'text-red-500 bg-red-500/10' 
                            : 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                        }`}
                      >
                        <span className="truncate">{t.name}</span>
                        {(selectedTuition.id === (t.id || t._id) || selectedTuition._id === (t.id || t._id)) && (
                          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Desktop Navigation Links */}
            <div className="flex-1 flex flex-col overflow-y-auto pt-4 pb-4 px-3">
              <div className="px-3 pb-2 text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Student Menu
              </div>
              <nav className="space-y-1">
                {navigation.map((item) => (
                  <NavLink
                    key={item.name}
                    to={{ pathname: item.href, search: searchParams.toString() }}
                    replace
                    className={({ isActive }) =>
                      `group flex items-center justify-between px-3 py-2.5 text-sm font-semibold rounded-2xl transition-all active:scale-[0.98] ${
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

            {/* Desktop Bottom Action Group */}
            <div className="flex-shrink-0 flex flex-col border-t border-zinc-200/80 dark:border-zinc-800/80 p-3.5 space-y-2">
              <NavLink
                to={{ pathname: "/student/notifications", search: searchParams.toString() }}
                replace
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-xl transition-all ${isActive ? "bg-red-500/10 text-red-500 font-bold" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"}`
                }
              >
                <div className="flex items-center">
                  <Bell className="w-4 h-4 mr-3 text-zinc-400 group-hover:text-red-500" />
                  <span>Notifications</span>
                </div>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 text-[10px] font-extrabold text-white bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </NavLink>

              <NavLink
                to={{ pathname: "/student/settings", search: searchParams.toString() }}
                replace
                className={({ isActive }) =>
                  `group flex items-center justify-between px-3 py-2 text-sm font-semibold rounded-xl transition-all ${isActive ? "bg-red-500/10 text-red-500 font-bold" : "text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60"}`
                }
              >
                <div className="flex items-center">
                  <Settings className="w-4 h-4 mr-3 text-zinc-400 group-hover:text-red-500" />
                  <span>Profile & Settings</span>
                </div>
              </NavLink>

              {/* User Profile Mini Bar */}
              <div className="mt-2 pt-2.5 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between px-1">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Avatar fallback={currentUser.name} size="sm" />
                  <div className="min-w-0 truncate">
                    <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">
                      {currentUser.name}
                    </p>
                    <p className="text-[10px] text-zinc-400 truncate">Student</p>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-500/10 transition-colors"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>

        {/* ========================================================================= */}
        {/* MAIN CONTENT AREA */}
        {/* ========================================================================= */}
        <div className="flex flex-col flex-1 md:pl-64 min-w-0 w-full overflow-hidden">
          
          {/* Top Desktop Navbar */}
          <div 
            className="hidden md:flex sticky top-0 z-20 flex-shrink-0 bg-white/80 dark:bg-[#030303]/90 backdrop-blur-2xl border-b border-zinc-200/80 dark:border-zinc-800/80 lg:px-8 px-4 justify-between items-center"
            style={{ 
              height: 'calc(4rem + env(safe-area-inset-top, 0px))', 
              paddingTop: 'env(safe-area-inset-top, 0px)' 
            }}
          >
            <div className="flex items-center space-x-3">
              <span className="text-base font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight">
                Student Portal
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-extrabold uppercase tracking-wider">
                {selectedTuition.name}
              </span>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={toggleTheme}
                className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 active:scale-95 transition-all"
                title="Toggle Theme"
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
              </button>

              <button 
                onClick={() => navigate({ pathname: '/student/notifications', search: searchParams.toString() })}
                className="relative w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center text-zinc-600 dark:text-zinc-300 hover:text-zinc-900 active:scale-95 transition-all"
                title="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center min-w-[16px] h-[16px] px-0.5 text-[9px] font-extrabold text-white bg-red-600 rounded-full">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Main Subview Outlet */}
          <main className="flex-1 pb-28 md:pb-12">
            <div className="pt-2 md:pt-6">
              <Outlet />
            </div>
          </main>
        </div>

        {/* ========================================================================= */}
        {/* MOBILE SLIDING DRAWER */}
        {/* ========================================================================= */}
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
                {/* Drawer Header */}
                <div className="px-5 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between flex-shrink-0">
                  <div className="flex items-center space-x-3 min-w-0">
                    <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-red-600 to-rose-700 flex items-center justify-center text-white shadow-md shadow-red-950/30 flex-shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <h2 className="text-base font-heading font-extrabold text-zinc-900 dark:text-white tracking-tight truncate leading-tight">
                        Student Portal
                      </h2>
                      <span className="inline-flex items-center text-[10px] font-bold text-red-500 uppercase tracking-wider mt-0.5">
                        {multipleTuitions.length} Enrolled {multipleTuitions.length === 1 ? 'Tuition' : 'Tuitions'}
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

                {/* Tuitions Switcher in Drawer */}
                <div className="px-4 py-3 border-b border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/30">
                  <div className="text-[10px] font-extrabold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-2">
                    Switch Active Tuition
                  </div>
                  <div className="space-y-1.5 max-h-36 overflow-y-auto">
                    {multipleTuitions.map(t => {
                      const isSelected = selectedTuition.id === (t.id || t._id) || selectedTuition._id === (t.id || t._id);
                      return (
                        <button
                          key={t.id || t._id}
                          onClick={() => {
                            handleSwitchTuition(t.id || t._id);
                            setMobileMenuOpen(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-all ${
                            isSelected
                              ? 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/20'
                              : 'bg-white dark:bg-zinc-800/60 text-zinc-700 dark:text-zinc-300 border border-zinc-200/60 dark:border-zinc-700/60'
                          }`}
                        >
                          <span className="truncate">{t.name}</span>
                          {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Drawer Links */}
                <div className="flex-1 overflow-y-auto px-3.5 py-4 space-y-4">
                  <div className="px-2.5 text-[10px] font-extrabold text-zinc-400 uppercase tracking-wider">
                    Navigation
                  </div>
                  <nav className="space-y-1">
                    {navigation.map((item) => (
                      <NavLink
                        key={item.name}
                        to={{ pathname: item.href, search: searchParams.toString() }}
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

                {/* Drawer Profile Card */}
                <div className="p-3.5 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex-shrink-0">
                  <div className="bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl p-3 flex items-center justify-between shadow-sm">
                    <div 
                      className="flex items-center space-x-2.5 min-w-0 cursor-pointer flex-1"
                      onClick={() => { setMobileMenuOpen(false); navigate({ pathname: '/student/settings', search: searchParams.toString() }, { replace: true }); }}
                    >
                      <Avatar fallback={currentUser.name} size="sm" />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate leading-tight">
                          {currentUser.name}
                        </p>
                        <span className="text-[10px] font-semibold text-zinc-400 block leading-tight mt-0.5">
                          Student Account
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

        {/* ========================================================================= */}
        {/* MOBILE BOTTOM NAVIGATION BAR */}
        {/* ========================================================================= */}
        <div 
          className="md:hidden fixed bottom-0 left-0 right-0 z-50 w-full bg-white/95 dark:bg-[#0c0f17]/95 backdrop-blur-2xl border-t border-zinc-200/80 dark:border-zinc-800/80 shadow-[0_-4px_25px_rgba(0,0,0,0.06)] dark:shadow-[0_-4px_25px_rgba(0,0,0,0.5)]"
          style={{
            height: 'calc(3.75rem + env(safe-area-inset-bottom, 0px))',
            paddingBottom: 'env(safe-area-inset-bottom, 0px)'
          }}
        >
          <div className="grid h-full w-full grid-cols-5 max-w-md mx-auto relative">
            {/* 1. Dashboard */}
            <NavLink
              to={{ pathname: "/student/dashboard", search: searchParams.toString() }}
              replace
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full py-1 space-y-0.5 transition-all outline-none active:scale-95 ${
                  isActive
                    ? "text-red-500 font-bold"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-red-500 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 w-6 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                  <LayoutGrid className={`w-4 h-4 ${isActive ? "text-red-500 stroke-[2.4]" : "stroke-[1.8]"}`} />
                  <span className="text-[9.5px] leading-tight tracking-tight">Dashboard</span>
                </>
              )}
            </NavLink>

            {/* 2. Attendance */}
            <NavLink
              to={{ pathname: "/student/attendance", search: searchParams.toString() }}
              replace
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full py-1 space-y-0.5 transition-all outline-none active:scale-95 ${
                  isActive
                    ? "text-red-500 font-bold"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-red-500 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 w-6 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                  <CheckSquare className={`w-4 h-4 ${isActive ? "text-red-500 stroke-[2.4]" : "stroke-[1.8]"}`} />
                  <span className="text-[9.5px] leading-tight tracking-tight">Attendance</span>
                </>
              )}
            </NavLink>

            {/* 3. Homework */}
            <NavLink
              to={{ pathname: "/student/homework", search: searchParams.toString() }}
              replace
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full py-1 space-y-0.5 transition-all outline-none active:scale-95 ${
                  isActive
                    ? "text-red-500 font-bold"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-red-500 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 w-6 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                  <BookOpen className={`w-4 h-4 ${isActive ? "text-red-500 stroke-[2.4]" : "stroke-[1.8]"}`} />
                  <span className="text-[9.5px] leading-tight tracking-tight">Homework</span>
                </>
              )}
            </NavLink>

            {/* 4. Fees */}
            <NavLink
              to={{ pathname: "/student/fees", search: searchParams.toString() }}
              replace
              className={({ isActive }) =>
                `relative flex flex-col items-center justify-center w-full h-full py-1 space-y-0.5 transition-all outline-none active:scale-95 ${
                  isActive
                    ? "text-red-500 font-bold"
                    : "text-zinc-400 dark:text-zinc-500 hover:text-red-500 font-medium"
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {isActive && (
                    <span className="absolute top-0 w-6 h-0.5 bg-red-500 rounded-full shadow-[0_0_8px_rgba(239,68,68,0.8)]" />
                  )}
                  <CreditCard className={`w-4 h-4 ${isActive ? "text-red-500 stroke-[2.4]" : "stroke-[1.8]"}`} />
                  <span className="text-[9.5px] leading-tight tracking-tight">Fees</span>
                </>
              )}
            </NavLink>

            {/* 5. More Menu */}
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="relative flex flex-col items-center justify-center w-full h-full py-1 space-y-0.5 text-zinc-400 dark:text-zinc-500 hover:text-red-500 transition-all outline-none active:scale-95 cursor-pointer font-medium"
            >
              <MoreHorizontal className="w-4 h-4 stroke-[1.8]" />
              <span className="text-[9.5px] leading-tight tracking-tight">More</span>
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
