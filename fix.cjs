const fs = require('fs');
const path = require('path');

function processFile(filePath) {
    if (!filePath.endsWith('.jsx') && !filePath.endsWith('.css') && !filePath.endsWith('.html')) return;
    
    let lines = fs.readFileSync(filePath, 'utf8').split('\n');
    let changed = false;
    
    lines = lines.map(line => {
        let newLine = line;
        
        newLine = newLine.replace(/\bbg-\[\#030303\](\/[0-9]+)?/g, 'bg-gray-50$1 dark:bg-[#030303]$1');
        newLine = newLine.replace(/\bbg-zinc-950(\/[0-9]+)?/g, 'bg-white$1 dark:bg-zinc-950$1');
        newLine = newLine.replace(/\bbg-zinc-900(\/[0-9]+)?/g, 'bg-white$1 dark:bg-zinc-900$1');
        newLine = newLine.replace(/\bbg-zinc-800(\/[0-9]+)?/g, 'bg-gray-100$1 dark:bg-zinc-800$1');
        newLine = newLine.replace(/\bbg-zinc-700(\/[0-9]+)?/g, 'bg-gray-200$1 dark:bg-zinc-700$1');
        
        newLine = newLine.replace(/\bborder-zinc-800(\/[0-9]+)?/g, 'border-zinc-200$1 dark:border-zinc-800$1');
        newLine = newLine.replace(/\bborder-zinc-700(\/[0-9]+)?/g, 'border-zinc-300$1 dark:border-zinc-700$1');
        
        newLine = newLine.replace(/\btext-zinc-100(\/[0-9]+)?/g, 'text-zinc-900$1 dark:text-zinc-100$1');
        newLine = newLine.replace(/\btext-zinc-300(\/[0-9]+)?/g, 'text-zinc-700$1 dark:text-zinc-300$1');
        newLine = newLine.replace(/\btext-zinc-400(\/[0-9]+)?/g, 'text-zinc-500$1 dark:text-zinc-400$1');
        newLine = newLine.replace(/\btext-zinc-500(\/[0-9]+)?/g, 'text-zinc-400$1 dark:text-zinc-500$1');
        
        if (!/(bg-red|bg-indigo|bg-blue|bg-green|bg-amber|bg-orange|bg-violet|bg-purple|bg-cyan|bg-emerald)/.test(line)) {
            newLine = newLine.replace(/\btext-white(\/[0-9]+)?/g, 'text-zinc-900$1 dark:text-white$1');
        }

        if (newLine !== line) {
            changed = true;
        }
        return newLine;
    });
    
    if (changed) {
        fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
    }
}

function walk(dir) {
    fs.readdirSync(dir).forEach(f => {
        let p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            walk(p);
        } else {
            processFile(p);
        }
    });
}

walk('src');
console.log("Migration complete.");
