import React, { useState } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import './calendar.css';
import './calendar-agenda.css';
import { useData } from '../context/DataContext';
import { Plus, X } from 'lucide-react';

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


export default function Schedule() {
  const { scheduleClasses, batches, addScheduleClass, deleteClass } = useData();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
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
      <div className="sm:flex sm:items-center mb-0 sm:mb-6 justify-between hidden sm:flex">
        <div className="sm:flex-auto">
          <h1 className="text-2xl sm:text-3xl font-bold leading-6 text-zinc-900 dark:text-zinc-100">Schedule</h1>
          <p className="mt-2 sm:mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Manage your classes and upcoming sessions.
          </p>
        </div>
        <div className="hidden sm:block mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-all"
          >
            <Plus className="h-5 w-5" />
            Add Class
          </button>
        </div>
      </div>

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

      {/* Mobile FAB */}
      <button
        type="button"
        onClick={() => setIsModalOpen(true)}
        className="sm:hidden fixed bottom-20 right-6 z-40 flex h-14 w-14 items-center justify-center rounded-full bg-red-600 text-white shadow-[0_4px_14px_0_rgba(220,38,38,0.39)] hover:bg-red-500 hover:shadow-[0_6px_20px_rgba(220,38,38,0.23)] transition-all active:scale-95"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* Modal - Adapts to Bottom Sheet on Mobile */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
          <div className="bg-white dark:bg-zinc-900 border-t sm:border border-zinc-200 dark:border-zinc-800 rounded-t-3xl sm:rounded-2xl shadow-2xl w-full max-w-md p-6 relative animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 sm:zoom-in-95 duration-200">
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

