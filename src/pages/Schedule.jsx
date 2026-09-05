import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import './calendar-agenda.css';
import { useData } from '../context/DataContext';
import { Plus, X, Clock, Calendar as CalendarIcon, Users } from 'lucide-react';

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
// Fixed reference date so these never go stale
const minTime = new Date(1970, 0, 1, 3, 30, 0); // 3:30 AM — gives room so 4 AM label isn't cut off
const maxTime = new Date(1970, 0, 1, 23, 0, 0); // 11:00 PM
const scrollToTime = new Date(1970, 0, 1, 4, 0, 0); // scroll starts at 4:00 AM

// Custom toolbar: renames "Agenda" button to "Classes"
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
              // Ensure timezone doesn't shift the day backwards by resetting hours
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
          style={{ backgroundImage: 'url("data:image/svg+xml,%3csvg xmlns=\'http://www.w3.org/2000/svg\' fill=\'none\' viewBox=\'0 0 20 20\'%3e%3cpath stroke=\'%236b7280\' stroke-linecap=\'round\' stroke-linejoin=\'round\' stroke-width=\'1.5\' d=\'M6 8l4 4 4-4\'/%3e%3c/svg%3e")', backgroundPosition: 'right 0.5rem center', backgroundRepeat: 'no-repeat', backgroundSize: '1.5em 1.5em' }}
        >
          {views.map(v => (
            <option key={v} value={v}>{viewLabels[v]} View</option>
          ))}
        </select>
      </div>
    </div>
  );
}



function ClassListView({ scheduleClasses, batches, deleteClass }) {
  const [filterDate, setFilterDate] = React.useState('');
  const [quickFilter, setQuickFilter] = React.useState('all'); // 'all' | 'today' | 'upcoming'

  const todayStr = new Date().toISOString().split('T')[0];

  const filteredClasses = (scheduleClasses || [])
    .filter(cls => {
      if (!cls.date || !cls.subject) return false;
      
      const d = new Date(cls.date);
      if (isNaN(d.getTime())) return false;
      const clsDateStr = d.toISOString().split('T')[0];

      if (filterDate) {
        return clsDateStr === filterDate;
      }

      if (quickFilter === 'today') {
        return clsDateStr === todayStr;
      }

      if (quickFilter === 'upcoming') {
        return clsDateStr >= todayStr;
      }

      return true;
    })
    .sort((a, b) => new Date(a.date) - new Date(b.date));

  return (
    <div className="space-y-4 pb-28">
      {/* Header and Filter Controls */}
      <div className="space-y-3">
        {/* Desktop Title */}
        <div className="hidden sm:flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold font-heading text-zinc-900 dark:text-white tracking-tight">Class Schedule</h2>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Manage and track all scheduled lecture sessions</p>
          </div>
          <div className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60">
            {filteredClasses.length} Sessions Listed
          </div>
        </div>
        
        {/* Quick Filter Bar & Date Input */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          {/* Quick Filter Pills */}
          <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 p-1 rounded-xl border border-zinc-200 dark:border-zinc-700/60 shadow-sm overflow-x-auto">
            <button
              onClick={() => { setQuickFilter('all'); setFilterDate(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                quickFilter === 'all' && !filterDate
                  ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              All Classes
            </button>
            <button
              onClick={() => { setQuickFilter('today'); setFilterDate(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                quickFilter === 'today' && !filterDate
                  ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Today's
            </button>
            <button
              onClick={() => { setQuickFilter('upcoming'); setFilterDate(''); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                quickFilter === 'upcoming' && !filterDate
                  ? 'bg-white dark:bg-zinc-900 text-red-600 dark:text-red-400 shadow-sm'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              Upcoming
            </button>
          </div>

          {/* Date Picker Filter */}
          <div className="flex items-center justify-between gap-2 bg-white dark:bg-zinc-900 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <div className="flex items-center gap-2 flex-1">
              <CalendarIcon className="w-4 h-4 text-red-500 flex-shrink-0" />
              <input 
                type="date"
                className="bg-transparent border-none text-zinc-900 dark:text-zinc-100 text-xs sm:text-sm font-medium focus:outline-none focus:ring-0 cursor-pointer w-full sm:w-auto"
                value={filterDate}
                onChange={(e) => {
                  setFilterDate(e.target.value);
                  setQuickFilter('');
                }}
              />
            </div>
            {filterDate && (
              <button 
                onClick={() => setFilterDate('')}
                className="p-1 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-md transition-colors"
                title="Clear Filter"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
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
                    {/* Top Row: Subject & Delete */}
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

                      <button
                        onClick={() => {
                           if (window.confirm(`Are you sure you want to delete the class "${cls.subject}"?`)) {
                             deleteClass(cls._id || cls.id).catch(() => alert("Failed to delete class"));
                           }
                        }}
                        className="p-1.5 -mr-1 -mt-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors"
                        title="Delete Class"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {/* Date and Time Chips */}
                    <div className="flex flex-wrap items-center gap-2 mb-3.5">
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl border border-zinc-200/60 dark:border-zinc-700/40">
                        <CalendarIcon className="w-3.5 h-3.5 text-red-500" />
                        <span>{classDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</span>
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
  const { scheduleClasses, batches, addScheduleClass, deleteClass } = useData();
  const [searchParams] = useSearchParams();
  const [isModalOpen, setIsModalOpen] = useState(false);
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
  
  // Explicitly control calendar state to ensure toolbar buttons work
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState(window.innerWidth < 640 ? 'day' : 'week');

  const handleSelectEvent = (event) => {
    if (window.confirm(`Are you sure you want to delete the class "${event.title}"?`)) {
      if (event.resource && (event.resource._id || event.resource.id)) {
        deleteClass(event.resource._id || event.resource.id).catch(err => alert("Failed to delete class"));
      }
    }
  };
  
  const [newClass, setNewClass] = useState({
    subject: '',
    date: '',
    time: '',
    batchId: ''
  });

  const handleAddClass = async (e) => {
    e.preventDefault();
    if (!newClass.subject || !newClass.date || !newClass.time || !newClass.batchId) {
      alert("Please fill in all fields.");
      return;
    }
    
    setIsSubmitting(true);
    // Attempt to add schedule class
    try {
      await addScheduleClass({
        ...newClass,
        // Ensure date is a valid ISO string or standard format expected by backend
        date: new Date(newClass.date).toISOString()
      });
      setIsModalOpen(false);
      setNewClass({ subject: '', date: '', time: '', batchId: '' });
      // Navigate calendar to newly added class date
      setCurrentDate(new Date(newClass.date));
    } catch (err) {
      console.error(err);
      alert("Failed to add class.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Convert API classes to react-big-calendar events
  const events = (scheduleClasses || [])
    .filter(cls => cls && cls.subject && cls.date) // skip invalid entries
    .map(cls => {
      const baseDate = new Date(cls.date);
      if (isNaN(baseDate.getTime())) return null; // skip bad dates
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
    .filter(Boolean); // remove any nulls from bad dates

  return (
    <div className="relative pb-20 sm:pb-0">
      {/* Header - hidden on mobile since calendar takes full screen */}
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center mb-3 sm:mb-6 justify-between pt-1 sm:pt-0">
        <div className="flex-auto hidden sm:block">
          <h1 className="text-2xl sm:text-3xl font-bold leading-6 text-zinc-900 dark:text-zinc-100">Schedule</h1>
          <p className="mt-1 sm:mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Manage your classes and upcoming sessions.
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
              Classes List
            </button>
          </div>
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="hidden sm:flex items-center gap-2 rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-red-500 active:scale-95 transition-all"
          >
            <Plus className="h-5 w-5" />
            Add Class
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
        <span>Add Class</span>
      </button>


      
      {displayMode === 'calendar' ? (
        <>
          {/* Mobile: full-bleed edge-to-edge calendar */}
      <div className="
        sm:hidden
        -mx-4
        h-[calc(100vh-120px)]
        bg-white dark:bg-zinc-900
        text-zinc-700 dark:text-zinc-300
        overflow-hidden
        border-t border-zinc-200/60 dark:border-zinc-800/60
      ">
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
        </>
      ) : (
        <ClassListView scheduleClasses={scheduleClasses} batches={batches} deleteClass={deleteClass} />
      )}

      {/* Desktop: card-style calendar */}
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

      {/* Modal - Adapts to Bottom Sheet on Mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div 
            className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto"
            style={{
              paddingBottom: 'calc(2.5rem + env(safe-area-inset-bottom, 0px))'
            }}
          >
            <div className="w-12 h-1.5 bg-gray-200 dark:bg-zinc-700 rounded-full mx-auto mb-6 sm:hidden" />
            <button 
              onClick={() => setIsModalOpen(false)}
              className="absolute top-6 right-6 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold text-zinc-900 dark:text-white mb-6">Add New Class</h2>
            
            <form onSubmit={handleAddClass} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Subject</label>
                <input
                  type="text"
                  required
                  value={newClass.subject}
                  onChange={e => setNewClass({...newClass, subject: e.target.value})}
                  className="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  placeholder="e.g. Mathematics"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={newClass.date}
                    onChange={e => setNewClass({...newClass, date: e.target.value})}
                    className="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Time</label>
                  <input
                    type="time"
                    required
                    value={newClass.time}
                    onChange={e => setNewClass({...newClass, time: e.target.value})}
                    className="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1">Batch</label>
                <select
                  required
                  value={newClass.batchId}
                  onChange={e => setNewClass({...newClass, batchId: e.target.value})}
                  className="w-full bg-white/50 dark:bg-zinc-950/50 border border-zinc-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-zinc-900 dark:text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-colors appearance-none"
                >
                  <option value="">Select a batch...</option>
                  {batches.map(b => (
                    <option key={b.id || b._id} value={b.id || b._id}>{b.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-6 pb-safe flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-700 px-4 py-3 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:bg-gray-100 dark:bg-zinc-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-xl bg-red-600 px-5 py-3 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-zinc-900 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Saving...' : 'Save Class'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

