import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay, addMonths, addYears, startOfMonth, endOfMonth } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import './calendar-agenda.css';
import { useData } from '../context/DataContext';
import { 
  Plus, 
  X, 
  Clock, 
  Calendar as CalendarIcon, 
  Users, 
  Edit3, 
  Check, 
  Repeat, 
  Sparkles, 
  Trash2,
  CalendarDays,
  CheckCircle2,
  Layers,
  Sliders
} from 'lucide-react';

const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Calendar visible time range: 4 AM to 11 PM
const minTime = new Date(1970, 0, 1, 3, 30, 0);
const maxTime = new Date(1970, 0, 1, 23, 0, 0);
const scrollToTime = new Date(1970, 0, 1, 4, 0, 0);

const WEEKDAYS = [
  { key: 'Mon', label: 'Mon', full: 'Monday' },
  { key: 'Tue', label: 'Tue', full: 'Tuesday' },
  { key: 'Wed', label: 'Wed', full: 'Wednesday' },
  { key: 'Thu', label: 'Thu', full: 'Thursday' },
  { key: 'Fri', label: 'Fri', full: 'Friday' },
  { key: 'Sat', label: 'Sat', full: 'Saturday' },
  { key: 'Sun', label: 'Sun', full: 'Sunday' },
];

const formatTimeToAmPm = (timeStr) => {
  if (!timeStr) return '';
  if (/am|pm/i.test(timeStr)) return timeStr;
  const parts = timeStr.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const minutes = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes} ${ampm}`;
  }
  return timeStr;
};

// Custom toolbar for calendar
function CustomToolbar({ label, onNavigate, onView, view }) {
  const views = ['month', 'week', 'day', 'agenda'];
  const viewLabels = { month: 'Month', week: 'Week', day: 'Day', agenda: 'Classes' };
  return (
    <div className="rbc-toolbar">
      <div className="rbc-btn-group">
        <button type="button" onClick={() => onNavigate('TODAY')}>Today</button>
        <button type="button" onClick={() => onNavigate('PREV')}>Back</button>
        <button type="button" onClick={() => onNavigate('NEXT')}>Next</button>
      </div>
      <span className="rbc-toolbar-label relative inline-flex items-center justify-center overflow-hidden sm:cursor-default cursor-pointer">
        {label}
        <input 
          type="date"
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
          onChange={(e) => {
            if (e.target.value) {
              const selectedDate = new Date(e.target.value);
              selectedDate.setHours(12, 0, 0, 0); 
              if (!isNaN(selectedDate.getTime())) {
                onNavigate('DATE', selectedDate);
              }
            }
          }}
        />
      </span>
      {/* Desktop View Buttons */}
      <div className="rbc-btn-group !hidden sm:!flex">
        {views.map(v => (
          <button
            key={v}
            type="button"
            className={view === v ? 'rbc-active' : ''}
            onClick={() => onView(v)}
          >
            {viewLabels[v]}
          </button>
        ))}
      </div>

      {/* Mobile Selectable Dropdown */}
      <div className="sm:hidden w-full" style={{ order: 3 }}>
        <select 
          value={view} 
          onChange={(e) => onView(e.target.value)}
          className="w-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 rounded-lg px-3 py-2 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-red-500 shadow-sm appearance-none"
        >
          {views.map(v => (
            <option key={v} value={v}>{viewLabels[v]} View</option>
          ))}
        </select>
      </div>
    </div>
  );
}

function ClassListView({ scheduleClasses, batches, deleteClass, onEditClass }) {
  const [filterDate, setFilterDate] = useState('');
  const [quickFilter, setQuickFilter] = useState('all'); // 'all' | 'today' | 'upcoming'
  const todayStr = new Date().toISOString().split('T')[0];

  const filteredClasses = (scheduleClasses || [])
    .filter(cls => {
      if (!cls.date || !cls.subject) return false;
      const classDateStr = new Date(cls.date).toISOString().split('T')[0];
      if (filterDate && classDateStr !== filterDate) return false;
      if (quickFilter === 'today' && classDateStr !== todayStr) return false;
      if (quickFilter === 'upcoming' && classDateStr < todayStr) return false;
      return true;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-zinc-900 p-3 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 shadow-sm">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          <button
            type="button"
            onClick={() => { setQuickFilter('all'); setFilterDate(''); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              quickFilter === 'all' && !filterDate
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            All Classes ({scheduleClasses?.length || 0})
          </button>
          <button
            type="button"
            onClick={() => { setQuickFilter('today'); setFilterDate(''); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              quickFilter === 'today'
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            Today's Classes
          </button>
          <button
            type="button"
            onClick={() => { setQuickFilter('upcoming'); setFilterDate(''); }}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              quickFilter === 'upcoming'
                ? 'bg-red-500 text-white shadow-sm'
                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200'
            }`}
          >
            Upcoming
          </button>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400 whitespace-nowrap">Filter Date:</span>
          <input
            type="date"
            value={filterDate}
            onChange={(e) => {
              setFilterDate(e.target.value);
              setQuickFilter('');
            }}
            className="w-full sm:w-auto bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl px-3 py-1 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-red-500"
          />
          {filterDate && (
            <button
              onClick={() => setFilterDate('')}
              className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              title="Clear Filter"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Classes Grid */}
      <div className="space-y-3 pt-1">
        {filteredClasses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center bg-white dark:bg-zinc-900/60 rounded-3xl border border-dashed border-zinc-200 dark:border-zinc-800">
            <div className="w-14 h-14 bg-red-50 dark:bg-red-500/10 rounded-2xl flex items-center justify-center mb-3 text-red-500">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-1">No classes found</h3>
            <p className="text-zinc-500 dark:text-zinc-400 text-xs sm:text-sm max-w-sm">
              {filterDate 
                ? "No classes scheduled for the selected date." 
                : quickFilter === 'today' 
                ? "No classes scheduled for today." 
                : "Your class schedule is clear."}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {filteredClasses.map(cls => {
              const batchIdStr = typeof cls.batchId === 'object' && cls.batchId !== null ? (cls.batchId._id || cls.batchId.id) : cls.batchId;
              const batch = batches.find(b => b._id === batchIdStr || b.id === batchIdStr);
              const batchName = (typeof cls.batchId === 'object' && cls.batchId?.name) ? cls.batchId.name : (batch ? batch.name : 'Unknown Batch');
              const classGrade = batch?.class || '';

              const classDate = new Date(cls.date);
              const isToday = classDate.toISOString().split('T')[0] === todayStr;

              return (
                <div 
                  key={cls._id || cls.id} 
                  className="group relative overflow-hidden bg-white dark:bg-zinc-900 p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 border-l-4 border-l-red-500 shadow-sm hover:shadow-md hover:border-red-500/30 transition-all duration-200 flex flex-col justify-between"
                >
                  <div>
                    {/* Top Row: Subject, Edit & Delete */}
                    <div className="flex justify-between items-start gap-2 mb-3">
                      <div className="min-w-0 flex items-center gap-2 flex-wrap">
                        <h3 className="text-lg font-bold font-heading text-zinc-900 dark:text-white tracking-tight truncate">
                          {cls.subject}
                        </h3>
                        {isToday && (
                          <span className="px-2 py-0.5 rounded-md bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-[10px] font-extrabold uppercase tracking-wider animate-pulse">
                            Today
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 -mr-1 -mt-1">
                        <button
                          onClick={() => onEditClass(cls)}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-colors"
                          title="Edit Class Time / Details"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                             if (window.confirm(`Are you sure you want to delete the class "${cls.subject}" on ${classDate.toLocaleDateString()}?`)) {
                               deleteClass(cls._id || cls.id).catch(() => alert("Failed to delete class"));
                             }
                          }}
                          className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                          title="Delete Class"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    
                    {/* Date and Time Chips */}
                    <div className="flex flex-wrap items-center gap-2 mb-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/40">
                        <CalendarIcon className="w-3.5 h-3.5 text-red-500" />
                        <span>{classDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      </div>
                      
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/40">
                        <Clock className="w-3.5 h-3.5 text-red-500" />
                        <span>{cls.time}</span>
                      </div>
                    </div>
                  </div>

                  {/* Batch Identity Box */}
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/60 border border-zinc-100 dark:border-zinc-800">
                    <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 flex items-center justify-center flex-shrink-0">
                      <Users className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">Batch</span>
                      <span className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white truncate">
                        {batchName} {classGrade ? `(${classGrade})` : ''}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default function Schedule() {
  const { scheduleClasses, batches, addScheduleClass, addBulkScheduleClasses, updateScheduleClass, deleteClass } = useData();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedEventModal, setSelectedEventModal] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [displayMode, setDisplayMode] = useState(() => {
    return searchParams.get('tab') === 'list' || searchParams.get('view') === 'list' ? 'list' : 'calendar';
  });

  useEffect(() => {
    const tab = searchParams.get('tab') || searchParams.get('view');
    if (tab === 'list') {
      setDisplayMode('list');
    } else if (tab === 'calendar') {
      setDisplayMode('calendar');
    }
  }, [searchParams]);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(window.innerWidth < 640 ? 'day' : 'week');

  // Scheduling Form State
  const [scheduleMode, setScheduleMode] = useState('single'); // 'single' | 'month' | 'year'
  const [formState, setFormState] = useState({
    batchId: '',
    subject: '',
    defaultTime: '17:00', // 5:00 PM
    singleDate: new Date().toISOString().split('T')[0],
    singleTime: '17:00',
    selectedMonth: format(new Date(), 'yyyy-MM'),
    rangePreset: '3months', // '3months' | '6months' | '1year' | 'custom'
    startDate: new Date().toISOString().split('T')[0],
    endDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
    selectedDays: ['Mon', 'Wed', 'Fri'],
    dayTimes: {
      Mon: '17:00',
      Tue: '17:00',
      Wed: '17:00',
      Thu: '17:00',
      Fri: '17:00',
      Sat: '10:00',
      Sun: '15:00'
    }
  });

  // Editing Form State for single class
  const [editingClass, setEditingClass] = useState(null);

  // Auto populate subject and schedule days when batch changes
  const handleBatchSelect = (batchId) => {
    const batch = batches.find(b => (b.id || b._id) === batchId);
    let updatedDays = formState.selectedDays;
    let updatedSubject = formState.subject;
    let updatedDefaultTime = formState.defaultTime;
    let updatedDayTimes = { ...formState.dayTimes };

    if (batch) {
      if (batch.subject && !formState.subject) {
        updatedSubject = batch.subject;
      }
      if (batch.time) {
        const timeMatch = batch.time.match(/(\d+):(\d+)/);
        if (timeMatch) {
          let h = parseInt(timeMatch[1], 10);
          const m = timeMatch[2];
          if (/pm/i.test(batch.time) && h < 12) h += 12;
          if (/am/i.test(batch.time) && h === 12) h = 0;
          const parsed = `${String(h).padStart(2, '0')}:${m}`;
          updatedDefaultTime = parsed;
          // Apply to day times
          Object.keys(updatedDayTimes).forEach(k => {
            updatedDayTimes[k] = parsed;
          });
        }
      }
      if (batch.schedule) {
        const matchingDays = WEEKDAYS.filter(w => 
          batch.schedule.toLowerCase().includes(w.key.toLowerCase()) || 
          batch.schedule.toLowerCase().includes(w.full.toLowerCase())
        ).map(w => w.key);
        if (matchingDays.length > 0) {
          updatedDays = matchingDays;
        }
      }
    }

    setFormState(prev => ({
      ...prev,
      batchId,
      subject: updatedSubject,
      defaultTime: updatedDefaultTime,
      singleTime: updatedDefaultTime,
      dayTimes: updatedDayTimes,
      selectedDays: updatedDays
    }));
  };

  // Toggle Day Chip
  const toggleDay = (dayKey) => {
    setFormState(prev => {
      const exists = prev.selectedDays.includes(dayKey);
      const newDays = exists 
        ? prev.selectedDays.filter(d => d !== dayKey)
        : [...prev.selectedDays, dayKey];
      return { ...prev, selectedDays: newDays };
    });
  };

  // Update specific day's time
  const handleDayTimeChange = (dayKey, newTime) => {
    setFormState(prev => ({
      ...prev,
      dayTimes: {
        ...prev.dayTimes,
        [dayKey]: newTime
      }
    }));
  };

  // Quick Apply One Day's Time to All Selected Days
  const handleApplyTimeToAll = (sourceDayKey) => {
    const timeToApply = formState.dayTimes[sourceDayKey] || formState.defaultTime;
    setFormState(prev => {
      const updated = { ...prev.dayTimes };
      prev.selectedDays.forEach(d => {
        updated[d] = timeToApply;
      });
      return {
        ...prev,
        defaultTime: timeToApply,
        dayTimes: updated
      };
    });
  };

  // Quick Preset Selection for Range
  const handleRangePreset = (preset) => {
    const start = new Date(formState.startDate || new Date());
    let end;
    if (preset === '3months') {
      end = addMonths(start, 3);
    } else if (preset === '6months') {
      end = addMonths(start, 6);
    } else if (preset === '1year') {
      end = addYears(start, 1);
    }
    setFormState(prev => ({
      ...prev,
      rangePreset: preset,
      endDate: end ? format(end, 'yyyy-MM-dd') : prev.endDate
    }));
  };

  // Calculate matching dates and times for preview & submission
  const calculatedClasses = useMemo(() => {
    if (scheduleMode === 'single') {
      if (!formState.singleDate) return [];
      const d = new Date(formState.singleDate + 'T12:00:00');
      return [{
        date: d,
        dayKey: WEEKDAYS[d.getDay() === 0 ? 6 : d.getDay() - 1]?.key || 'Mon',
        time: formState.singleTime || formState.defaultTime || '17:00'
      }];
    }

    let start, end;
    if (scheduleMode === 'month') {
      if (!formState.selectedMonth) return [];
      const [year, month] = formState.selectedMonth.split('-').map(Number);
      start = new Date(year, month - 1, 1, 12, 0, 0);
      end = endOfMonth(start);
      end.setHours(23, 59, 59, 0);
    } else {
      // Year / Multi-Month Range
      if (!formState.startDate || !formState.endDate) return [];
      start = new Date(formState.startDate + 'T00:00:00');
      end = new Date(formState.endDate + 'T23:59:59');
    }

    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) return [];
    if (!formState.selectedDays || formState.selectedDays.length === 0) return [];

    const dayKeys = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const list = [];
    const current = new Date(start);
    let safetyCounter = 0;

    while (current <= end && safetyCounter < 400) {
      const dayKey = dayKeys[current.getDay()];
      if (formState.selectedDays.includes(dayKey)) {
        const classTime = formState.dayTimes[dayKey] || formState.defaultTime || '17:00';
        list.push({
          date: new Date(current.getFullYear(), current.getMonth(), current.getDate(), 12, 0, 0),
          dayKey,
          time: classTime
        });
      }
      current.setDate(current.getDate() + 1);
      safetyCounter++;
    }

    return list;
  }, [scheduleMode, formState]);

  // Submit Classes
  const handleSaveClasses = async (e) => {
    e.preventDefault();
    if (!formState.batchId) {
      alert("Please select a batch.");
      return;
    }
    if (!formState.subject) {
      alert("Please specify a subject.");
      return;
    }
    if (calculatedClasses.length === 0) {
      alert("No class dates match the selected schedule criteria.");
      return;
    }

    setIsSubmitting(true);

    try {
      if (scheduleMode === 'single') {
        const item = calculatedClasses[0];
        await addScheduleClass({
          batchId: formState.batchId,
          subject: formState.subject,
          time: formatTimeToAmPm(item.time),
          date: item.date.toISOString(),
          status: 'Upcoming'
        });
        setCurrentDate(item.date);
      } else {
        const classesToInsert = calculatedClasses.map(item => ({
          batchId: formState.batchId,
          subject: formState.subject,
          time: formatTimeToAmPm(item.time),
          date: item.date.toISOString(),
          status: 'Upcoming'
        }));
        await addBulkScheduleClasses(classesToInsert);
        if (calculatedClasses.length > 0) {
          setCurrentDate(calculatedClasses[0].date);
        }
      }

      setIsModalOpen(false);
      // Reset form
      setFormState({
        batchId: '',
        subject: '',
        defaultTime: '17:00',
        singleDate: new Date().toISOString().split('T')[0],
        singleTime: '17:00',
        selectedMonth: format(new Date(), 'yyyy-MM'),
        rangePreset: '3months',
        startDate: new Date().toISOString().split('T')[0],
        endDate: format(addMonths(new Date(), 3), 'yyyy-MM-dd'),
        selectedDays: ['Mon', 'Wed', 'Fri'],
        dayTimes: {
          Mon: '17:00',
          Tue: '17:00',
          Wed: '17:00',
          Thu: '17:00',
          Fri: '17:00',
          Sat: '10:00',
          Sun: '15:00'
        }
      });
    } catch (err) {
      console.error(err);
      alert("Failed to schedule classes. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Open Edit Modal for a single class
  const handleOpenEdit = (cls) => {
    setEditingClass({
      id: cls._id || cls.id,
      subject: cls.subject || '',
      date: cls.date ? new Date(cls.date).toISOString().split('T')[0] : '',
      time: cls.time || '',
      batchId: typeof cls.batchId === 'object' && cls.batchId !== null ? (cls.batchId._id || cls.batchId.id) : cls.batchId,
      status: cls.status || 'Upcoming'
    });
    setIsEditModalOpen(true);
    setSelectedEventModal(null);
  };

  // Save Single Class Edit
  const handleSaveEditClass = async (e) => {
    e.preventDefault();
    if (!editingClass) return;
    try {
      setIsSubmitting(true);
      await updateScheduleClass(editingClass.id, {
        subject: editingClass.subject,
        time: formatTimeToAmPm(editingClass.time),
        date: new Date(editingClass.date).toISOString(),
        status: editingClass.status
      });
      setIsEditModalOpen(false);
      setEditingClass(null);
    } catch (err) {
      console.error(err);
      alert("Failed to update class.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Event Selection on Calendar
  const handleSelectEvent = (event) => {
    if (event.resource) {
      setSelectedEventModal(event.resource);
    }
  };

  // Calendar Events
  const events = (scheduleClasses || [])
    .filter(cls => cls && cls.subject && cls.date)
    .map(cls => {
      const baseDate = new Date(cls.date);
      if (isNaN(baseDate.getTime())) return null;
      const startDate = new Date(baseDate);

      let hours = 0;
      let minutes = 0;

      if (cls.time) {
        const timeParts = cls.time.match(/(\d+):(\d+)\s*(AM|PM)?/i);
        if (timeParts) {
          hours = parseInt(timeParts[1], 10);
          minutes = parseInt(timeParts[2], 10);
          const ampm = timeParts[3]?.toUpperCase();
          if (ampm === 'PM' && hours < 12) hours += 12;
          if (ampm === 'AM' && hours === 12) hours = 0;
        }
      }

      startDate.setHours(hours, minutes, 0, 0);
      const endDate = new Date(startDate);
      endDate.setHours(hours + 1, minutes, 0, 0);

      const batchIdStr = typeof cls.batchId === 'object' && cls.batchId !== null ? (cls.batchId._id || cls.batchId.id) : cls.batchId;
      const batch = batches.find(b => b._id === batchIdStr || b.id === batchIdStr);
      const batchName = (typeof cls.batchId === 'object' && cls.batchId?.name) ? cls.batchId.name : (batch ? batch.name : 'Unknown Batch');

      return {
        title: `${cls.subject} (${batchName})`,
        start: startDate,
        end: endDate,
        resource: cls
      };
    })
    .filter(Boolean);

  return (
    <div className="relative pb-20 sm:pb-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-6 justify-between pt-1 sm:pt-0">
        <div className="flex-auto hidden sm:block">
          <h1 className="text-2xl sm:text-3xl font-bold leading-6 text-zinc-900 dark:text-zinc-100">Schedule & Timetable</h1>
          <p className="mt-1 sm:mt-2 text-sm text-zinc-500 dark:text-zinc-400">
            Schedule single classes or recurring sessions for a month or full academic year with individual day timings.
          </p>
        </div>
        
        <div className="flex items-center justify-between sm:justify-end gap-3 w-full sm:w-auto">
          <div className="flex bg-zinc-100 dark:bg-zinc-800 p-1 rounded-xl w-full sm:w-auto border border-zinc-200 dark:border-zinc-700/60 shadow-sm">
            <button
              onClick={() => setDisplayMode('calendar')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${displayMode === 'calendar' ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Calendar View
            </button>
            <button
              onClick={() => setDisplayMode('list')}
              className={`flex-1 sm:flex-none px-4 py-1.5 text-sm font-semibold rounded-lg transition-all ${displayMode === 'list' ? 'bg-white dark:bg-zinc-700 shadow text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
            >
              Classes List ({scheduleClasses?.length || 0})
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5" />
            Schedule Class
          </button>
        </div>
      </div>

      {/* Mobile Floating Action Pill Button */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        style={{
          bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
          right: '1.25rem'
        }}
        className="sm:hidden fixed z-40 flex items-center space-x-2 px-5 py-3.5 rounded-full bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-xl shadow-red-950/40 font-bold text-sm active:scale-95 transition-all cursor-pointer"
      >
        <Plus className="h-5 w-5 stroke-[2.5]" />
        <span>Schedule Class</span>
      </button>

      {/* Main View: Calendar or List */}
      {displayMode === 'calendar' ? (
        <>
          {/* Mobile Calendar */}
          <div className="sm:hidden -mx-4 h-[calc(100vh-120px)] bg-white dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 overflow-hidden border-t border-zinc-200/60 dark:border-zinc-800/60">
            <div className="h-full p-2">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={['month', 'week', 'day', 'agenda']}
                view={currentView}
                onView={setCurrentView}
                date={currentDate}
                onNavigate={setCurrentDate}
                min={minTime}
                max={maxTime}
                scrollToTime={scrollToTime}
                step={60}
                timeslots={1}
                popup
                onSelectEvent={handleSelectEvent}
              />
            </div>
          </div>

          {/* Desktop Calendar */}
          <div className="hidden sm:block bg-white/50 dark:bg-zinc-900/50 backdrop-blur-sm border border-zinc-200/50 dark:border-zinc-800/50 p-6 rounded-2xl shadow-xl h-[700px] text-zinc-700 dark:text-zinc-300 overflow-x-auto overflow-y-hidden">
            <div className="h-full">
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                views={['month', 'week', 'day', 'agenda']}
                view={currentView}
                onView={setCurrentView}
                date={currentDate}
                onNavigate={setCurrentDate}
                components={{ toolbar: CustomToolbar }}
                min={minTime}
                max={maxTime}
                scrollToTime={scrollToTime}
                step={60}
                timeslots={1}
                popup
                onSelectEvent={handleSelectEvent}
              />
            </div>
          </div>
        </>
      ) : (
        <ClassListView 
          scheduleClasses={scheduleClasses} 
          batches={batches} 
          deleteClass={deleteClass} 
          onEditClass={handleOpenEdit} 
        />
      )}

      {/* ========================================================================= */}
      {/* 1. SCHEDULE CLASS MODAL (WITH INDIVIDUAL DAY TIMINGS) */}
      {/* ========================================================================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-lg p-5 sm:p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[92vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-4 sm:hidden" />
            
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                <CalendarDays className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Schedule Classes</h2>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-5">
              Set single sessions or schedule recurring classes with custom time per day.
            </p>

            {/* Schedule Mode Switcher */}
            <div className="grid grid-cols-3 gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1.5 rounded-2xl mb-5 border border-zinc-200 dark:border-zinc-700/60">
              <button
                type="button"
                onClick={() => setScheduleMode('single')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  scheduleMode === 'single'
                    ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <span>Single Day</span>
              </button>
              
              <button
                type="button"
                onClick={() => setScheduleMode('month')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  scheduleMode === 'month'
                    ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Repeat className="w-3.5 h-3.5" />
                <span>Per Month</span>
              </button>

              <button
                type="button"
                onClick={() => setScheduleMode('year')}
                className={`py-2 px-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                  scheduleMode === 'year'
                    ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Per Year / Range</span>
              </button>
            </div>

            <form onSubmit={handleSaveClasses} className="space-y-4">
              
              {/* Batch Selector */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Select Batch *
                </label>
                <select
                  required
                  value={formState.batchId}
                  onChange={e => handleBatchSelect(e.target.value)}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                >
                  <option value="">Select a batch...</option>
                  {batches.map(b => (
                    <option key={b.id || b._id} value={b.id || b._id}>
                      {b.name} {b.class ? `(${b.class})` : ''} {b.schedule ? `— ${b.schedule}` : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Subject *
                </label>
                <input
                  type="text"
                  required
                  value={formState.subject}
                  onChange={e => setFormState({...formState, subject: e.target.value})}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500"
                  placeholder="e.g. Mathematics"
                />
              </div>

              {/* Mode 1: Single Day */}
              {scheduleMode === 'single' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Class Date *
                    </label>
                    <input
                      type="date"
                      required
                      value={formState.singleDate}
                      onChange={e => setFormState({...formState, singleDate: e.target.value})}
                      className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Class Time *
                    </label>
                    <div className="relative">
                      <input
                        type="time"
                        required
                        value={formState.singleTime}
                        onChange={e => setFormState({...formState, singleTime: e.target.value})}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Mode 2: Per Month */}
              {scheduleMode === 'month' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Target Month *
                  </label>
                  <input
                    type="month"
                    required
                    value={formState.selectedMonth}
                    onChange={e => setFormState({...formState, selectedMonth: e.target.value})}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>
              )}

              {/* Mode 3: Per Year / Custom Range */}
              {scheduleMode === 'year' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                      Schedule Duration Preset
                    </label>
                    <div className="grid grid-cols-4 gap-1.5">
                      {[
                        { id: '3months', label: '3 Mo' },
                        { id: '6months', label: '6 Mo' },
                        { id: '1year', label: '1 Year' },
                        { id: 'custom', label: 'Custom' }
                      ].map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => handleRangePreset(p.id)}
                          className={`py-1.5 px-1 rounded-xl text-xs font-bold border transition-all ${
                            formState.rangePreset === p.id
                              ? 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border-red-300 dark:border-red-800'
                              : 'border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                          }`}
                        >
                          {p.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                        Start Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formState.startDate}
                        onChange={e => setFormState({...formState, startDate: e.target.value})}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                        End Date *
                      </label>
                      <input
                        type="date"
                        required
                        value={formState.endDate}
                        onChange={e => setFormState({...formState, endDate: e.target.value, rangePreset: 'custom'})}
                        className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Recurring Weekday Selection & Per-Day Time Config (For Month & Year Modes) */}
              {(scheduleMode === 'month' || scheduleMode === 'year') && (
                <div className="space-y-3 pt-1">
                  
                  {/* Day Chips */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400">
                        1. Select Recurring Days *
                      </label>
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setFormState(prev => ({ ...prev, selectedDays: ['Mon', 'Wed', 'Fri'] }))}
                          className="text-[11px] text-red-600 dark:text-red-400 hover:underline font-semibold"
                        >
                          Mon/Wed/Fri
                        </button>
                        <span className="text-zinc-300 dark:text-zinc-700">|</span>
                        <button
                          type="button"
                          onClick={() => setFormState(prev => ({ ...prev, selectedDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] }))}
                          className="text-[11px] text-red-600 dark:text-red-400 hover:underline font-semibold"
                        >
                          Mon-Fri
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-7 gap-1 sm:gap-1.5">
                      {WEEKDAYS.map(w => {
                        const isSelected = formState.selectedDays.includes(w.key);
                        return (
                          <button
                            key={w.key}
                            type="button"
                            onClick={() => toggleDay(w.key)}
                            className={`py-2 rounded-xl text-xs font-bold transition-all ${
                              isSelected
                                ? 'bg-red-600 text-white shadow-sm ring-2 ring-red-500/20'
                                : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                            }`}
                          >
                            {w.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* 2. Individual Day Timings Card */}
                  {formState.selectedDays.length > 0 && (
                    <div className="bg-zinc-50 dark:bg-zinc-800/40 p-3.5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800 space-y-2.5">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                          <Clock className="w-3.5 h-3.5 text-red-500" />
                          <span>2. Set Timings For Each Day</span>
                        </div>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                          (e.g. Mon 5 PM, Sun 3 PM)
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                        {formState.selectedDays.map(dayKey => {
                          const weekdayObj = WEEKDAYS.find(w => w.key === dayKey);
                          const currentDayTime = formState.dayTimes[dayKey] || formState.defaultTime || '17:00';

                          return (
                            <div 
                              key={dayKey} 
                              className="flex items-center justify-between gap-2 p-2 bg-white dark:bg-zinc-900 rounded-xl border border-zinc-200/70 dark:border-zinc-800 shadow-2xs"
                            >
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 text-xs font-bold flex items-center justify-center flex-shrink-0">
                                  {dayKey[0]}
                                </span>
                                <span className="text-xs font-bold text-zinc-800 dark:text-zinc-200 truncate">
                                  {weekdayObj?.full || dayKey}
                                </span>
                              </div>

                              <div className="flex items-center gap-1">
                                <input
                                  type="time"
                                  value={currentDayTime}
                                  onChange={(e) => handleDayTimeChange(dayKey, e.target.value)}
                                  className="bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg px-2 py-1 text-xs font-bold text-zinc-900 dark:text-white focus:outline-none focus:ring-1 focus:ring-red-500"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleApplyTimeToAll(dayKey)}
                                  title="Apply this time to all selected days"
                                  className="p-1 rounded text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-[10px] font-semibold"
                                >
                                  All
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                </div>
              )}

              {/* Live Preview Summary Card */}
              <div className="bg-gradient-to-br from-red-50/70 to-rose-50/40 dark:from-red-950/20 dark:to-rose-950/10 border border-red-200/80 dark:border-red-900/40 rounded-2xl p-3.5 space-y-1.5">
                <div className="flex items-center gap-2 text-xs font-bold text-red-600 dark:text-red-400 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Schedule Preview</span>
                </div>
                <p className="text-sm font-semibold text-zinc-900 dark:text-white">
                  {calculatedClasses.length === 0 ? (
                    <span className="text-zinc-400 font-normal">Select days and date range to calculate classes.</span>
                  ) : (
                    <span>
                      📅 <strong className="text-red-600 dark:text-red-400 font-extrabold">{calculatedClasses.length} classes</strong> will be scheduled.
                    </span>
                  )}
                </p>
                {calculatedClasses.length > 0 && (
                  <div className="text-xs text-zinc-600 dark:text-zinc-400 space-y-0.5">
                    <p>
                      <strong>Duration:</strong> {format(calculatedClasses[0].date, 'dd MMM yyyy')} to {format(calculatedClasses[calculatedClasses.length - 1].date, 'dd MMM yyyy')}
                    </p>
                    {scheduleMode !== 'single' && (
                      <p className="text-zinc-500 dark:text-zinc-400 text-[11px]">
                        <strong>Timings:</strong> {formState.selectedDays.map(d => `${d} @ ${formatTimeToAmPm(formState.dayTimes[d] || formState.defaultTime)}`).join(' | ')}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting || calculatedClasses.length === 0}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <span>Scheduling...</span>
                  ) : (
                    <>
                      <Check className="w-4 h-4 stroke-[3]" />
                      <span>{calculatedClasses.length > 1 ? `Schedule ${calculatedClasses.length} Classes` : 'Save Class'}</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. EDIT SINGLE CLASS MODAL */}
      {/* ========================================================================= */}
      {isEditModalOpen && editingClass && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            
            <button 
              onClick={() => setIsEditModalOpen(false)}
              className="absolute top-5 right-5 p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400">
                <Edit3 className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Edit Scheduled Class</h2>
            </div>

            <form onSubmit={handleSaveEditClass} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Subject
                </label>
                <input
                  type="text"
                  required
                  value={editingClass.subject}
                  onChange={e => setEditingClass({...editingClass, subject: e.target.value})}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Class Date
                  </label>
                  <input
                    type="date"
                    required
                    value={editingClass.date}
                    onChange={e => setEditingClass({...editingClass, date: e.target.value})}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                    Class Time
                  </label>
                  <input
                    type="text"
                    required
                    value={editingClass.time}
                    onChange={e => setEditingClass({...editingClass, time: e.target.value})}
                    className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                    placeholder="e.g. 06:00 PM"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-600 dark:text-zinc-400 mb-1.5">
                  Class Status
                </label>
                <select
                  value={editingClass.status}
                  onChange={e => setEditingClass({...editingClass, status: e.target.value})}
                  className="w-full bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3.5 py-2.5 text-sm text-zinc-900 dark:text-white focus:outline-none focus:border-red-500"
                >
                  <option value="Upcoming">Upcoming</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled (Holiday/Rescheduled)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-2.5 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-red-500 transition-all disabled:opacity-50"
                >
                  {isSubmitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. CALENDAR EVENT DETAILS MODAL */}
      {/* ========================================================================= */}
      {selectedEventModal && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-5 sm:p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
            
            <button 
              onClick={() => setSelectedEventModal(null)}
              className="absolute top-5 right-5 p-1 rounded-lg text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
                <CalendarIcon className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-zinc-900 dark:text-white">{selectedEventModal.subject}</h2>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">Class Session Details</p>
              </div>
            </div>

            <div className="space-y-2.5 my-4 text-sm bg-zinc-50 dark:bg-zinc-800/60 p-4 rounded-2xl border border-zinc-200/60 dark:border-zinc-800">
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Date</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {new Date(selectedEventModal.date).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Time</span>
                <span className="font-bold text-red-600 dark:text-red-400">{selectedEventModal.time}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Batch</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {(typeof selectedEventModal.batchId === 'object' && selectedEventModal.batchId?.name) 
                    ? selectedEventModal.batchId.name 
                    : (batches.find(b => (b.id || b._id) === (selectedEventModal.batchId?._id || selectedEventModal.batchId))?.name || 'Assigned Batch')}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-zinc-500 dark:text-zinc-400">Status</span>
                <span className="font-semibold text-zinc-900 dark:text-white">
                  {selectedEventModal.status || 'Upcoming'}
                </span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleOpenEdit(selectedEventModal)}
                className="flex-1 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-blue-600 dark:text-blue-400 hover:bg-blue-100 flex items-center justify-center gap-1.5"
              >
                <Edit3 className="w-4 h-4" />
                <span>Edit Time</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  if (window.confirm(`Delete the class "${selectedEventModal.subject}" on ${new Date(selectedEventModal.date).toLocaleDateString()}?`)) {
                    deleteClass(selectedEventModal._id || selectedEventModal.id).catch(() => alert("Failed to delete class"));
                    setSelectedEventModal(null);
                  }
                }}
                className="flex-1 rounded-xl border border-red-200 dark:border-red-900/60 bg-red-50 dark:bg-red-950/30 px-3.5 py-2.5 text-xs sm:text-sm font-bold text-red-600 dark:text-red-400 hover:bg-red-100 flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
