'use client';

import Link from 'next/link';
import { 
  Trophy, 
  Bell, 
  ArrowRight, 
  CalendarPlus, 
  Search, 
  BarChart3, 
  CheckCircle, 
  Home, 
  Calendar, 
  Users, 
  User,
  Activity
} from 'lucide-react';

export default function HomePage() {
  return (
    <div className="relative flex min-h-screen w-full flex-col overflow-x-hidden bg-[#f6f7f8] dark:bg-[#101822] text-[#111418] dark:text-white font-sans">
      
      {/* Header Section */}
      <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#1a2430]/95 backdrop-blur-sm px-5 py-4 flex items-center justify-between border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center gap-3">
          <div className="relative">
            {/* Profile Picture Placeholder */}
            <div className="h-12 w-12 rounded-full bg-gray-200 border-2 border-white dark:border-gray-700 flex items-center justify-center text-xl">
              👤
            </div>
            <div className="absolute -bottom-1 -right-1 bg-green-500 border-2 border-white dark:border-gray-800 w-4 h-4 rounded-full"></div>
          </div>
          <div className="flex flex-col">
            <h1 className="text-sm font-medium text-[#617289] dark:text-[#94a3b8]">Good afternoon,</h1>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold leading-tight">Clement</span>
              <div className="flex items-center gap-1 bg-[#136dec]/10 dark:bg-[#136dec]/20 px-2 py-0.5 rounded-full">
                <Trophy size={14} className="text-[#136dec]" />
                <span className="text-xs font-bold text-[#136dec]">ELO 1250</span>
              </div>
            </div>
          </div>
        </div>
        <button className="relative p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
          <Bell size={24} />
          <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-gray-800"></span>
        </button>
      </header>

      {/* Main Content */}
      <main className="flex-1 px-5 py-6 flex flex-col gap-6 pb-32">
        
        {/* Hero Card: Next Match */}
        <section>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0f2044] to-[#136dec] shadow-lg text-white p-5">
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-[#ff6b00] opacity-10 rounded-full blur-xl -ml-5 -mb-5"></div>
            
            <div className="relative z-10 flex flex-col gap-4">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-sm font-medium text-blue-100 uppercase tracking-wider mb-1">Next Match</h2>
                  <p className="text-2xl font-bold">Semi-Finals</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold">18:00</p>
                  <p className="text-xs text-blue-100">Today • Court 3</p>
                </div>
              </div>

              {/* VS Component */}
              <div className="flex items-center justify-between mt-2 bg-white/10 rounded-xl p-3 backdrop-blur-sm border border-white/10">
                {/* Team 1 */}
                <div className="flex -space-x-3 rtl:space-x-reverse">
                  <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-gray-300 flex items-center justify-center text-xs">A</div>
                  <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-gray-400 flex items-center justify-center text-xs">B</div>
                </div>
                <span className="text-xl font-black italic text-[#ff6b00] px-2">VS</span>
                {/* Team 2 */}
                <div className="flex -space-x-3 rtl:space-x-reverse flex-row-reverse space-x-reverse">
                  <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-gray-300 flex items-center justify-center text-xs">C</div>
                  <div className="w-10 h-10 rounded-full border-2 border-white/20 bg-gray-400 flex items-center justify-center text-xs">D</div>
                </div>
              </div>

              <button className="w-full mt-1 bg-white text-[#136dec] text-sm font-bold py-2.5 rounded-lg shadow-sm hover:bg-gray-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2">
                <span>Check Details</span>
                <ArrowRight size={18} />
              </button>
            </div>
          </div>
        </section>

        {/* Live Court Status */}
        <section className="flex items-center justify-between bg-white dark:bg-[#1a2430] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-bold uppercase text-[#617289] dark:text-[#94a3b8] tracking-wide">Live Courts</span>
              <span className="text-sm font-bold">3/8 Available Now</span>
            </div>
          </div>
          <button className="text-xs font-bold text-[#136dec] hover:text-[#0e52b5] bg-[#136dec]/5 hover:bg-[#136dec]/10 px-3 py-1.5 rounded-lg transition-colors">
            View Map
          </button>
        </section>

        {/* Quick Actions Grid */}
        <section>
          <h3 className="text-lg font-bold mb-4 px-1">Quick Actions</h3>
          <div className="grid grid-cols-2 gap-4">
            <Link href="/book" className="group flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1a2430] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all">
              <div className="w-12 h-12 rounded-full bg-[#136dec]/10 text-[#136dec] flex items-center justify-center">
                <CalendarPlus size={28} />
              </div>
              <span className="font-semibold text-sm">Book Court</span>
            </Link>
            
            <button className="group flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1a2430] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all">
              <div className="w-12 h-12 rounded-full bg-[#ff6b00]/10 text-[#ff6b00] flex items-center justify-center">
                <Search size={28} />
              </div>
              <span className="font-semibold text-sm">Find Match</span>
            </button>
            
            <button className="group flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1a2430] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all">
              <div className="w-12 h-12 rounded-full bg-yellow-500/10 text-yellow-600 flex items-center justify-center">
                <Trophy size={28} />
              </div>
              <span className="font-semibold text-sm">Leaderboard</span>
            </button>
            
            <button className="group flex flex-col items-center justify-center gap-3 bg-white dark:bg-[#1a2430] p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-800 active:scale-[0.98] transition-all">
              <div className="w-12 h-12 rounded-full bg-purple-500/10 text-purple-600 flex items-center justify-center">
                <BarChart3 size={28} />
              </div>
              <span className="font-semibold text-sm">My Stats</span>
            </button>
          </div>
        </section>

        {/* Recent Results List */}
        <section>
          <div className="flex items-center justify-between mb-4 px-1">
            <h3 className="text-lg font-bold">Recent Results</h3>
            <span className="text-sm font-medium text-[#136dec]">View all</span>
          </div>
          <div className="flex flex-col gap-3">
            {/* Result Item 1 */}
            <div className="bg-white dark:bg-[#1a2430] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Alejandro & Marc</span>
                  <CheckCircle size={16} className="text-green-500" />
                </div>
                <div className="text-sm text-[#617289] dark:text-[#94a3b8]">def. Tom & Jerry</div>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-100 dark:bg-gray-700 font-bold px-3 py-1 rounded-md text-sm tracking-wider">6-4, 6-2</span>
              </div>
            </div>

             {/* Result Item 2 */}
             <div className="bg-white dark:bg-[#1a2430] p-4 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <div className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold">Sarah & Emma</span>
                  <CheckCircle size={16} className="text-green-500" />
                </div>
                <div className="text-sm text-[#617289] dark:text-[#94a3b8]">def. You & Clement</div>
              </div>
              <div className="flex items-center">
                <span className="bg-gray-100 dark:bg-gray-700 font-bold px-3 py-1 rounded-md text-sm tracking-wider">7-5, 6-4</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-[#1a2430] border-t border-gray-200 dark:border-gray-800 pb-2 pt-2 px-6 z-40">
        <div className="flex items-center justify-between h-16 max-w-md mx-auto">
          <Link href="/" className="flex flex-col items-center gap-1 text-[#136dec] w-16">
            <Home size={24} fill="currentColor" />
            <span className="text-[10px] font-medium">Home</span>
          </Link>
          <div className="flex flex-col items-center gap-1 text-[#617289] dark:text-[#94a3b8] w-16">
            <Calendar size={24} />
            <span className="text-[10px] font-medium">Bookings</span>
          </div>
          
          {/* Middle Button */}
          <div className="relative -top-6">
            <button className="bg-[#136dec] text-white rounded-full w-14 h-14 flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Activity size={32} />
            </button>
          </div>

          <div className="flex flex-col items-center gap-1 text-[#617289] dark:text-[#94a3b8] w-16">
            <Users size={24} />
            <span className="text-[10px] font-medium">Club</span>
          </div>
          <Link href="/profile" className="flex flex-col items-center gap-1 text-[#617289] dark:text-[#94a3b8] w-16">
            <User size={24} />
            <span className="text-[10px] font-medium">Profile</span>
          </Link>
        </div>
      </nav>
    </div>
  );
}