const fs = require('fs');
let lines = fs.readFileSync('src/pages/Fees.jsx', 'utf8').split('\n');

const newMobile =             {/* Selectors Row */}
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
            </div>.split('\n');

// Replace lines 451 to 474 (inclusive, 0-indexed)
// Month Selector Box starts at line 452 (index 451)
// Search & Filter Bar starts at line 476 (index 475)
// So we want to replace 451 through 474.

lines.splice(451, 24, ...newMobile);

fs.writeFileSync('src/pages/Fees.jsx', lines.join('\n'));
