const fs = require('fs');

const file = 'src/pages/Fees.jsx';
let c = fs.readFileSync(file, 'utf8');

const mobileOld =           {/* Month Selector Box */}
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
            </div>.replace(/\r\n/g, '\n');

const mobileNew =             {/* Selectors Row */}
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
            </div>.replace(/\n/g, '\r\n');

c = c.replace(mobileOld.replace(/\n/g, '\r\n'), mobileNew);
c = c.replace(mobileOld, mobileNew);


const desktopOld =               <div className="flex items-center space-x-3">
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
              </div>.replace(/\r\n/g, '\n');

const desktopNew =               <div className="flex items-center space-x-3">
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
              </div>.replace(/\n/g, '\r\n');

c = c.replace(desktopOld.replace(/\n/g, '\r\n'), desktopNew);
c = c.replace(desktopOld, desktopNew);

fs.writeFileSync(file, c);
