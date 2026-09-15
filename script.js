const fs = require('fs');
let content = fs.readFileSync('src/pages/Fees.jsx', 'utf8');

// 1. State variables
content = content.replace(
  'const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));',
  'const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));\n  const [selectedBatch, setSelectedBatch] = useState(\'All\');'
);

// 2. Batch options and filtering
content = content.replace(
  '// Compute fee statuses for the selected month\n  const studentStatuses = useMemo(() => {\n    return students\n      .filter(s => {\n        // Find if student\'s admission date is after the selected month',
  'const batchOptions = useMemo(() => {\n    const batches = new Set(students.map(s => s.batchName).filter(Boolean));\n    return [\'All\', ...Array.from(batches)].sort();\n  }, [students]);\n\n  // Compute fee statuses for the selected month\n  const studentStatuses = useMemo(() => {\n    return students\n      .filter(s => {\n        if (selectedBatch !== \'All\' && s.batchName !== selectedBatch) return false;\n\n        // Find if student\'s admission date is after the selected month'
);

// 3. Dependencies
content = content.replace(
  '}, [students, feePayments, selectedMonth]);',
  '}, [students, feePayments, selectedMonth, selectedBatch]);'
);

const mobile_old = \          {/* Month & Search row */}
          <div className="flex flex-col gap-3 sticky top-[60px] z-20 bg-zinc-50/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
            {/* Month Selector Box */}
            <div className="relative cursor-pointer">
              <div className="w-full bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-3.5 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2.5 min-w-0">
                  <Calendar className="w-4 h-4 text-zinc-400" />
                  <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200">
                    {format(new Date(selectedMonth + '-01'), 'MMMM yyyy')}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-zinc-400 pointer-events-none flex-shrink-0" />
              </div>
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              >
                {monthOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>\;

const mobile_new = \          {/* Month & Search row */}
          <div className="flex flex-col gap-3 sticky top-[60px] z-20 bg-zinc-50/95 dark:bg-[#0a0a0a]/95 backdrop-blur-xl py-3 -mx-4 px-4 border-b border-zinc-200/50 dark:border-zinc-800/50">
            {/* Selectors Row */}
            <div className="flex gap-2">
              {/* Month Selector Box */}
              <div className="relative cursor-pointer flex-1">
                <div className="w-full bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-3.5 py-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Calendar className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate">
                      {format(new Date(selectedMonth + '-01'), 'MMM yyyy')}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-400 pointer-events-none flex-shrink-0" />
                </div>
                <select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
                  {monthOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Batch Selector Box */}
              <div className="relative cursor-pointer flex-1">
                <div className="w-full bg-white dark:bg-[#101420] border border-zinc-200/80 dark:border-zinc-800 rounded-2xl px-3.5 py-3 flex items-center justify-between shadow-sm">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <Filter className="w-4 h-4 text-zinc-400" />
                    <span className="text-xs font-bold text-zinc-900 dark:text-zinc-200 truncate">
                      {selectedBatch === 'All' ? 'All Batches' : selectedBatch}
                    </span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-zinc-400 pointer-events-none flex-shrink-0" />
                </div>
                <select
                  value={selectedBatch}
                  onChange={(e) => setSelectedBatch(e.target.value)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                >
                  {batchOptions.map((batch) => (
                    <option key={batch} value={batch}>
                      {batch === 'All' ? 'All Batches' : batch}
                    </option>
                  ))}
                </select>
              </div>
            </div>\;

content = content.replace(mobile_old, mobile_new);

const desktop_old = \              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-semibold text-sm rounded-xl px-4 py-2.5 pr-9 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm cursor-pointer"
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>\;

const desktop_new = \              <div className="flex items-center space-x-3">
                <div className="relative">
                  <select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-semibold text-sm rounded-xl px-4 py-2.5 pr-9 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm cursor-pointer"
                  >
                    {monthOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
                <div className="relative">
                  <select
                    value={selectedBatch}
                    onChange={(e) => setSelectedBatch(e.target.value)}
                    className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-white font-semibold text-sm rounded-xl px-4 py-2.5 pr-9 appearance-none focus:outline-none focus:ring-2 focus:ring-red-500/20 shadow-sm cursor-pointer"
                  >
                    {batchOptions.map((batch) => (
                      <option key={batch} value={batch}>
                        {batch === 'All' ? 'All Batches' : batch}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>\;

content = content.replace(desktop_old, desktop_new);

if (!content.includes('Filter')) {
  content = content.replace('Calendar,', 'Calendar, Filter,');
}

fs.writeFileSync('src/pages/Fees.jsx', content, 'utf8');
