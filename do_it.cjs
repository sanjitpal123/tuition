const fs = require('fs');

let c = fs.readFileSync('src/pages/Fees.jsx', 'utf8');

const mobileOld = fs.readFileSync('mobileOld.txt', 'utf8');
const mobileNew = fs.readFileSync('mobileNew.txt', 'utf8');
const desktopOld = fs.readFileSync('desktopOld.txt', 'utf8');
const desktopNew = fs.readFileSync('desktopNew.txt', 'utf8');

c = c.replace(
  'const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));',
  'const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));\n  const [selectedBatch, setSelectedBatch] = useState("All");'
);

const beforeBatchOptions = '// Compute fee statuses for the selected month\r\n  const studentStatuses = useMemo(() => {\r\n    return students\r\n      .filter(s => {\r\n        // Find if student\'s admission date is after the selected month';

const afterBatchOptions = 'const batchOptions = useMemo(() => {\n    const batches = new Set(students.map(s => s.batchName).filter(Boolean));\n    return ["All", ...Array.from(batches)].sort();\n  }, [students]);\n\n  // Compute fee statuses for the selected month\n  const studentStatuses = useMemo(() => {\n    return students\n      .filter(s => {\n        if (selectedBatch !== "All" && s.batchName !== selectedBatch) return false;\n\n        // Find if student\'s admission date is after the selected month';

c = c.replace(beforeBatchOptions, afterBatchOptions);
c = c.replace(beforeBatchOptions.replace(/\r\n/g, '\n'), afterBatchOptions);

c = c.replace(
  '}, [students, feePayments, selectedMonth]);',
  '}, [students, feePayments, selectedMonth, selectedBatch]);'
);

c = c.replace(mobileOld, mobileNew);
c = c.replace(mobileOld.replace(/\r\n/g, '\n'), mobileNew);
c = c.replace(desktopOld, desktopNew);
c = c.replace(desktopOld.replace(/\r\n/g, '\n'), desktopNew);

c = c.replace('Calendar,', 'Calendar, Filter,');

fs.writeFileSync('src/pages/Fees.jsx', c, 'utf8');
