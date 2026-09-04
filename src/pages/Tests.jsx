import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Plus, Award, FileText, Calendar } from 'lucide-react';

const tests = [
  { id: 1, subject: 'Mathematics', title: 'Chapter 3: Quadratic Equations', batch: 'Batch A', students: 28, average: 84, highest: 96, date: 'Aug 10' },
  { id: 2, subject: 'Mathematics', title: 'Chapter 3: Quadratic Equations', batch: 'Batch C', students: 31, average: 81, highest: 94, date: 'Aug 10' },
  { id: 3, subject: 'Mathematics', title: 'Weekly Test 12', batch: 'Batch B', students: 24, average: 88, highest: 98, date: 'Aug 08' },
  { id: 4, subject: 'Mathematics', title: 'Mid-term Mock', batch: 'Batch D', students: 25, average: 92, highest: 100, date: 'Aug 05' },
];

export default function Tests() {
  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-zinc-900 dark:text-white tracking-tight">Tests & Results</h1>
          <p className="mt-1 text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">Manage student assessments and scores.</p>
        </div>
        <div className="mt-4 sm:mt-0">
          <Button className="flex items-center">
            <Plus className="w-4 h-4 mr-2" />
            Create Test
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="overflow-hidden w-full">
              <p className="text-[10px] sm:text-sm font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 truncate">Tests (This Month)</p>
              <p className="mt-1 sm:mt-1 text-lg sm:text-2xl font-heading font-semibold text-zinc-900 dark:text-white tracking-tight">6</p>
            </div>
            <FileText className="w-5 h-5 sm:w-8 sm:h-8 text-red-300 mt-2 sm:mt-0" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="overflow-hidden w-full">
              <p className="text-[10px] sm:text-sm font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 truncate">Average Score</p>
              <p className="mt-1 sm:mt-1 text-lg sm:text-2xl font-heading font-semibold text-zinc-900 dark:text-white tracking-tight">82%</p>
            </div>
            <Award className="w-5 h-5 sm:w-8 sm:h-8 text-red-300 mt-2 sm:mt-0" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-3 sm:p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between">
            <div className="overflow-hidden w-full">
              <p className="text-[10px] sm:text-sm font-medium text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 truncate">Highest Score</p>
              <p className="mt-1 sm:mt-1 text-lg sm:text-2xl font-heading font-semibold text-zinc-900 dark:text-white tracking-tight">96%</p>
            </div>
            <Award className="w-5 h-5 sm:w-8 sm:h-8 text-amber-500 fill-amber-500 mt-2 sm:mt-0" />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {tests.map(test => (
          <Card key={test.id} className="hover:border-red-800 transition-colors cursor-pointer">
            <CardContent className="p-6">
              <div className="flex justify-between items-start mb-4">
                <Badge variant="primary">{test.subject}</Badge>
                <div className="flex items-center text-xs text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">
                  <Calendar className="w-3 h-3 mr-1" />
                  {test.date}
                </div>
              </div>
              <h3 className="text-lg font-heading font-bold text-zinc-900 dark:text-white tracking-tight line-clamp-1">{test.title}</h3>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 dark:text-zinc-400 mt-1">{test.batch} • {test.students} Students</p>
              
              <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/5 flex justify-between items-center">
                <div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">Average</p>
                  <p className="text-lg font-heading font-semibold text-zinc-900 dark:text-white tracking-tight text-zinc-900 dark:text-zinc-100">{test.average}%</p>
                </div>
                <div>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 dark:text-zinc-400">Highest</p>
                  <p className="text-lg font-heading font-semibold text-zinc-900 dark:text-white tracking-tight text-green-600">{test.highest}%</p>
                </div>
                <Button variant="outline" size="sm">Results</Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
