const fs = require('fs');

const file = 'src/pages/Fees.jsx';
let c = fs.readFileSync(file, 'utf8');

c = c.replace(
  'const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));',
  'const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));\n  const [selectedBatch, setSelectedBatch] = useState(\'All\');'
);

c = c.replace(
  '// Compute fee statuses for the selected month\r\n  const studentStatuses = useMemo(() => {\r\n    return students\r\n      .filter(s => {\r\n        // Find if student\'s admission date is after the selected month',
  'const batchOptions = useMemo(() => {\n    const batches = new Set(students.map(s => s.batchName).filter(Boolean));\n    return [\'All\', ...Array.from(batches)].sort();\n  }, [students]);\n\n  // Compute fee statuses for the selected month\n  const studentStatuses = useMemo(() => {\n    return students\n      .filter(s => {\n        if (selectedBatch !== \'All\' && s.batchName !== selectedBatch) return false;\n\n        // Find if student\'s admission date is after the selected month'
);
c = c.replace(
  '// Compute fee statuses for the selected month\n  const studentStatuses = useMemo(() => {\n    return students\n      .filter(s => {\n        // Find if student\'s admission date is after the selected month',
  'const batchOptions = useMemo(() => {\n    const batches = new Set(students.map(s => s.batchName).filter(Boolean));\n    return [\'All\', ...Array.from(batches)].sort();\n  }, [students]);\n\n  // Compute fee statuses for the selected month\n  const studentStatuses = useMemo(() => {\n    return students\n      .filter(s => {\n        if (selectedBatch !== \'All\' && s.batchName !== selectedBatch) return false;\n\n        // Find if student\'s admission date is after the selected month'
);

c = c.replace(
  '}, [students, feePayments, selectedMonth]);',
  '}, [students, feePayments, selectedMonth, selectedBatch]);'
);

c = c.replace('Calendar, ', 'Calendar, Filter, ');

fs.writeFileSync(file, c);
