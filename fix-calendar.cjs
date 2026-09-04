const fs = require('fs');
let c = fs.readFileSync('src/pages/calendar.css', 'utf8');

const prefix = `:root {
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

`;

if (!c.includes(':root {')) {
  c = prefix + c;
}

c = c.replace(/#27272a/g, 'var(--rbc-border)');
c = c.replace(/#e4e4e7/g, 'var(--rbc-text)');
c = c.replace(/#a1a1aa/g, 'var(--rbc-text-muted)');
c = c.replace(/#71717a/g, 'var(--rbc-text-light)');
c = c.replace(/rgba\(255,255,255,0\.03\)/g, 'var(--rbc-bg-hover)');
c = c.replace(/#3f3f46/g, 'var(--rbc-date-dim)');
c = c.replace(/#f4f4f5/g, 'var(--rbc-text)');

fs.writeFileSync('src/pages/calendar.css', c, 'utf8');
console.log('Done replacing calendar.css');
