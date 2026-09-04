const fs = require('fs');

const css = `:root {
  --rbc-border: #e4e4e7;
  --rbc-text: #18181b;
  --rbc-text-muted: #71717a;
  --rbc-text-light: #a1a1aa;
  --rbc-bg-hover: #f4f4f5;
  --rbc-date-dim: #d4d4d8;
}

.dark {
  --rbc-border: #27272a;
  --rbc-text: #e4e4e7;
  --rbc-text-muted: #a1a1aa;
  --rbc-text-light: #71717a;
  --rbc-bg-hover: rgba(255,255,255,0.03);
  --rbc-date-dim: #3f3f46;
}

/* Custom styles for React Big Calendar */

.rbc-calendar {
  font-family: inherit;
  color: var(--rbc-text);
  width: 100%;
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
}

/* Scrollbar Customization for Webkit */
.rbc-time-content::-webkit-scrollbar,
.rbc-month-view::-webkit-scrollbar,
.rbc-agenda-view::-webkit-scrollbar,
.rbc-time-view::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}
.rbc-time-content::-webkit-scrollbar-track,
.rbc-month-view::-webkit-scrollbar-track,
.rbc-agenda-view::-webkit-scrollbar-track,
.rbc-time-view::-webkit-scrollbar-track {
  background: transparent;
}
.rbc-time-content::-webkit-scrollbar-thumb,
.rbc-month-view::-webkit-scrollbar-thumb,
.rbc-agenda-view::-webkit-scrollbar-thumb,
.rbc-time-view::-webkit-scrollbar-thumb {
  background-color: var(--rbc-date-dim);
  border-radius: 20px;
}

/* Headers */
.rbc-header {
  border-bottom: 1px solid var(--rbc-border) !important;
  border-left: none !important;
  padding: 12px 4px;
  font-weight: 500;
  color: var(--rbc-text-light);
  font-size: 0.875rem;
  background: transparent !important;
}

.rbc-header + .rbc-header {
  border-left: 1px solid var(--rbc-border) !important;
}

/* Ensure no border on the very first header if it ever applies */
.rbc-time-header-content > .rbc-row > .rbc-header:first-child {
  border-left: none !important;
}

/* The entire view wrapper borders */
.rbc-month-view,
.rbc-time-view,
.rbc-agenda-view {
  border: 1px solid var(--rbc-border) !important;
  background: transparent !important;
  border-radius: 8px;
  overflow: hidden;
  width: 100%;
  max-width: 100%;
}

.rbc-time-header {
  border-bottom: 1px solid var(--rbc-border) !important;
  border-right: none !important;
}

.rbc-time-header.rbc-overflowing {
  border-right: none !important;
}

/* Vertical borders in time view */
.rbc-time-header-content {
  border-left: none !important;
}
.rbc-time-content > * + * > *,
.rbc-allday-cell {
  border-left: 1px solid var(--rbc-border) !important;
}

.rbc-time-header-gutter {
  border-right: 1px solid var(--rbc-border) !important;
}

.rbc-allday-cell {
  border-bottom: none !important;
}

/* Horizontal borders in time view */
.rbc-time-content {
  border-top: none !important;
}

.rbc-timeslot-group {
  border-bottom: 1px solid var(--rbc-border) !important;
}

/* Month view borders */
.rbc-month-row {
  border-top: 1px solid var(--rbc-border) !important;
}

.rbc-day-bg + .rbc-day-bg {
  border-left: 1px solid var(--rbc-border) !important;
}

/* Day Backgrounds */
.rbc-off-range-bg {
  background: transparent !important;
}

.rbc-today {
  background: rgba(220, 38, 38, 0.03) !important; /* very subtle red */
}

/* Current time indicator */
.rbc-current-time-indicator {
  background-color: #ef4444 !important; /* red-500 */
  height: 2px !important;
}
.rbc-current-time-indicator::before {
  content: '';
  position: absolute;
  left: -4px;
  top: -4px;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: #ef4444;
}

.rbc-time-gutter {
  background: transparent !important;
  color: var(--rbc-text-light);
  border-right: 1px solid var(--rbc-border) !important;
}

/* Force both gutters to have exact identical widths to fix JS measurement bugs */
.rbc-time-gutter,
.rbc-time-header-gutter {
  width: 60px !important;
  min-width: 60px !important;
  max-width: 60px !important;
  flex: 0 0 60px !important;
  background: transparent !important;
}

.rbc-time-gutter .rbc-timeslot-group {
  border-bottom: none !important;
}

.rbc-timeslot-group {
  min-height: 50px !important;
}

.rbc-time-slot {
  font-size: 0.75rem;
  color: var(--rbc-text-muted);
  border: none !important;
}

.rbc-time-gutter .rbc-time-slot {
  transform: translateY(-8px); /* align text with line */
  text-align: right;
  padding-right: 12px;
}

/* Events */
.rbc-event {
  background-color: rgba(239, 68, 68, 0.85) !important; /* red-500 */
  border-radius: 6px !important;
  padding: 4px 6px !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  font-size: 0.75rem !important;
  font-weight: 500 !important;
  color: white !important;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.3) !important;
  transition: transform 0.2s, background-color 0.2s;
}

.rbc-event:hover {
  background-color: rgba(220, 38, 38, 1) !important; /* red-600 */
  z-index: 10;
}

.rbc-event-content {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.rbc-event.rbc-selected {
  background-color: #b91c1c !important; /* red-700 */
}

/* Toolbar Buttons Segmented Control Style */
.rbc-toolbar {
  margin-bottom: 2rem;
  color: var(--rbc-text);
}

.rbc-toolbar .rbc-btn-group {
  display: inline-flex;
  border-radius: 0.5rem;
  overflow: hidden;
}

.rbc-toolbar button {
  color: var(--rbc-text-light) !important;
  border: 1px solid var(--rbc-border) !important;
  background: transparent !important;
  border-radius: 0 !important;
  padding: 0.5rem 1rem !important;
  font-size: 0.875rem !important;
  font-weight: 500 !important;
  transition: all 0.2s;
  margin-left: -1px !important;
}

.rbc-toolbar .rbc-btn-group button:first-child {
  margin-left: 0 !important;
}

.rbc-toolbar button:hover {
  background: var(--rbc-bg-hover) !important;
  color: var(--rbc-text) !important;
  z-index: 1;
  position: relative;
}

.rbc-toolbar button:active,
.rbc-toolbar button.rbc-active {
  background: rgba(239, 68, 68, 0.1) !important;
  border-color: rgba(239, 68, 68, 0.5) !important;
  color: #ef4444 !important; /* red text for active */
  box-shadow: none !important;
  z-index: 2; /* keep active border on top */
  position: relative;
}

.rbc-toolbar button:focus {
  outline: none;
}

.rbc-toolbar-label {
  font-size: 1.25rem;
  font-weight: 500;
  color: var(--rbc-text);
}

/* Month View Styling */
.rbc-month-view .rbc-header {
  border-bottom: 1px solid var(--rbc-border) !important;
  text-transform: capitalize;
  font-size: 0.8rem;
  color: var(--rbc-text-muted);
  padding: 10px 4px;
}

.rbc-date-cell {
  padding: 8px 10px;
  font-weight: 500;
  font-size: 0.875rem;
}

.rbc-date-cell > a,
.rbc-date-cell > a:active,
.rbc-date-cell > a:visited {
  color: var(--rbc-text-light);
}

/* Dim out-of-month dates */
.rbc-date-cell.rbc-off-range > a {
  color: var(--rbc-date-dim) !important;
}

.rbc-date-cell.rbc-now > a {
  background: #ef4444;
  color: white;
  width: 28px;
  height: 28px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  font-weight: 600;
  box-shadow: 0 2px 8px rgba(239, 68, 68, 0.4);
}

/* Hide annoying active outlines */
.rbc-month-row, .rbc-day-bg, .rbc-time-slot {
  outline: none !important;
}

/* Header Current Day Styling */
.rbc-header.rbc-today {
  color: #ef4444; /* red text for today column header */
  font-weight: 600;
  background: transparent !important;
}

/* Mobile Responsiveness */
@media (max-width: 640px) {
  .rbc-toolbar {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
  .rbc-toolbar .rbc-btn-group {
    width: 100%;
    display: flex;
  }
  .rbc-toolbar button {
    flex: 1;
    padding: 0.375rem 0.5rem !important;
    font-size: 0.75rem !important;
  }
  .rbc-toolbar-label {
    margin: 0 auto;
    font-size: 1.125rem;
    order: -1; /* Put label at top on mobile */
    padding-bottom: 8px;
  }
  
  .rbc-time-slot {
    font-size: 0.65rem;
  }
  
  .rbc-time-gutter .rbc-time-slot {
    padding-right: 4px;
  }
  
  /* Make views nicer on mobile */
  .rbc-time-view {
    border: none !important;
  }
  
  .rbc-time-header {
    border-bottom: 1px solid var(--rbc-border) !important;
  }
}
`;

fs.writeFileSync('src/pages/calendar.css', css, 'utf8');
console.log('Fixed calendar.css');
