import { useState, useMemo } from 'react';
import Sidebar from '../components/ui/Sidebar';

function monthName(monthIndex) {
  return new Date(2020, monthIndex, 1).toLocaleString('default', { month: 'long' });
}

function buildMonthGrid(year, month) {
  const first = new Date(year, month, 1);
  const startDay = (first.getDay() + 6) % 7; // make Monday=0
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells = [];
  // previous month padding
  for (let i = 0; i < startDay; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  // pad to complete weeks
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function suggestForDate(date) {
  const typesWeekday = ['Single image', 'Carousel', 'Short Reel', 'Tip Post', 'Quote'];
  const typesWeekend = ['Reel', 'Story series', 'Live/AMA', 'Behind the Scenes'];
  if (!date) return null;
  const dow = date.getDay();
  const base = (dow === 0 || dow === 6) ? typesWeekend : typesWeekday;
  const pick = base[date.getDate() % base.length];
  const time = (dow === 2 || dow === 4) ? '08:00' : '18:00';
  const caption = pick === 'Reel' ? 'High-energy hook + trending sound' : pick === 'Carousel' ? 'Multi-tip carousel' : 'Engaging single image with CTA';
  return { title: pick, time, caption };
}

export default function Strategy() {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());

  const grid = useMemo(() => buildMonthGrid(year, month), [year, month]);

  const prev = () => {
    if (month === 0) {
      setMonth(11);
      setYear(y => y - 1);
    } else setMonth(m => m - 1);
  };
  const next = () => {
    if (month === 11) {
      setMonth(0);
      setYear(y => y + 1);
    } else setMonth(m => m + 1);
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-gray-50">
      <Sidebar />
      <main className="flex-1 pt-16 md:pt-0 p-4 md:p-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6 gap-4 md:gap-0">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Posting Strategy</h1>
              <p className="text-sm text-gray-500">Daily posting suggestions to grow your account</p>
              <div className="mt-2 text-xs text-gray-500">Tip: Use this calendar to plan consistent content — quality + consistency beats randomness.</div>
            </div>
            <div className="flex items-center space-x-2 flex-wrap">
              <button onClick={prev} className="px-3 py-2 bg-white border rounded text-sm">Prev</button>
              <div className="px-4 py-2 bg-white border rounded whitespace-nowrap">
                <div className="text-sm font-medium">{monthName(month)} {year}</div>
              </div>
              <button onClick={next} className="px-3 py-2 bg-white border rounded text-sm">Next</button>
            </div>
          </div>

          <div className="mb-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="flex items-center space-x-2 flex-wrap gap-2">
              <div className="px-3 py-2 bg-yellow-50 border border-yellow-200 rounded text-xs md:text-sm text-yellow-800">Auto-scheduler coming soon</div>
              <div className="px-3 py-2 bg-blue-50 border border-blue-100 rounded text-xs md:text-sm text-blue-800">Create Post feature coming soon</div>
            </div>
            <div>
              <button disabled className="w-full md:w-auto px-4 py-2 bg-blue-600 text-white rounded opacity-80 cursor-not-allowed text-sm">Create Post (coming soon)</button>
            </div>
          </div>

          <div className="bg-white p-2 md:p-4 rounded-lg shadow overflow-x-auto">
            <div className="grid grid-cols-7 gap-1 md:gap-2 text-sm min-w-max md:min-w-full">
              <div className="font-medium text-gray-600">Mon</div>
              <div className="font-medium text-gray-600">Tue</div>
              <div className="font-medium text-gray-600">Wed</div>
              <div className="font-medium text-gray-600">Thu</div>
              <div className="font-medium text-gray-600">Fri</div>
              <div className="font-medium text-gray-600">Sat</div>
              <div className="font-medium text-gray-600">Sun</div>

              {grid.map((d, idx) => {
                const suggestion = d ? suggestForDate(d) : null;
                const isToday = d && d.toDateString() === new Date().toDateString();
                return (
                  <div key={idx} className={`min-h-[80px] md:min-h-[110px] p-2 md:p-3 rounded-lg transition-shadow text-xs md:text-sm ${isToday ? 'ring-2 ring-offset-1 ring-primary-300 bg-gradient-to-br from-primary-50 to-white' : 'bg-white hover:shadow-lg'}`}>
                    {d ? (
                      <div className="flex flex-col h-full">
                        <div className="flex items-center justify-between mb-1 md:mb-2">
                          <div className="text-xs md:text-sm font-semibold text-gray-700">{d.getDate()}</div>
                          <div className="text-xs text-gray-400 hidden md:inline">{d.toLocaleString('default', { weekday: 'short' })}</div>
                        </div>
                        <div className="flex-1">
                          <div className="inline-flex items-center space-x-1 md:space-x-2 flex-wrap">
                            <div className="px-2 py-0.5 md:py-1 bg-green-50 text-green-700 rounded text-xs font-medium">{suggestion.title}</div>
                            <div className="text-xs text-gray-500 hidden md:inline">{suggestion.time}</div>
                          </div>
                          <div className="text-xs text-gray-600 mt-1 md:mt-2 line-clamp-2 hidden md:block">{suggestion.caption}</div>
                        </div>
                        <div className="mt-1 md:mt-3 flex items-center justify-between text-xs">
                          <div className="text-xs text-gray-400 hidden md:inline">Tip: schedule these posts for peak engagement.</div>
                          <button disabled className="text-xs px-1 md:px-2 py-0.5 md:py-1 bg-white border rounded opacity-70 cursor-not-allowed">Schedule</button>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full" />
                    )}
                  </div>
                );
              })}
            </div>

            <div className="mt-4 text-sm text-gray-500">
              <strong>Legend:</strong> Reels perform well on weekends; carousels for tips; single images for frequent posting.
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
