const fs = require('fs');

let css = fs.readFileSync('src/pages/calendar.css', 'utf8');

// Update variables for better light mode contrast
css = css.replace('--rbc-text-muted: #71717a;', '--rbc-text-muted: #3f3f46;'); // zinc-700
css = css.replace('--rbc-text-light: #a1a1aa;', '--rbc-text-light: #71717a;'); // zinc-500

// Append Agenda View fixes
const agendaStyles = `
/* Agenda View overrides */
.rbc-agenda-view table.rbc-agenda-table thead > tr > th {
  color: var(--rbc-text-muted) !important;
  font-weight: 600;
}

.rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
  color: var(--rbc-text) !important;
  font-weight: 500;
  border-top: 1px solid var(--rbc-border);
}

.rbc-agenda-view table.rbc-agenda-table tbody > tr:hover {
  background-color: var(--rbc-bg-hover);
}
`;

if (!css.includes('.rbc-agenda-view table.rbc-agenda-table')) {
  css += agendaStyles;
}

fs.writeFileSync('src/pages/calendar.css', css, 'utf8');
console.log('Fixed agenda styles');
