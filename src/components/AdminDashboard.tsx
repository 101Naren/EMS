import { 
  Users, 
  UserCheck, 
  CalendarCheck, 
  Wallet, 
  TrendingUp, 
  ArrowUpRight, 
  CheckCircle, 
  AlertCircle,
  FileText
} from 'lucide-react';
import { Employee, LeaveRequest, Milestone, ActivityLog } from '../types';

interface AdminDashboardProps {
  employees: Employee[];
  leaves: LeaveRequest[];
  milestones: Milestone[];
  activities: ActivityLog[];
  onNavigate: (tab: string) => void;
}

export default function AdminDashboard({ employees, leaves, milestones, activities, onNavigate }: AdminDashboardProps) {
  // Real calculations based on current directory state
  const totalCount = employees.length;
  const activeCount = employees.filter(e => e.status === 'Active').length;
  const leaveCount = employees.filter(e => e.status === 'On Leave').length;
  const pendingLeaves = leaves.filter(l => l.status === 'Pending').length;
  
  // Calculate department distribution counts
  const deptCounts = employees.reduce((acc, emp) => {
    acc[emp.department] = (acc[emp.department] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Find max count to scale visual progress bars
  const maxDeptCount = Math.max(...Object.values(deptCounts), 1);

  // Leave trends mock data for the custom SVG bar chart
  const leaveTrendData = [
    { month: 'JAN', admin: 20, employee: 40 },
    { month: 'FEB', admin: 15, employee: 30 },
    { month: 'MAR', admin: 35, employee: 65 },
    { month: 'APR', admin: 25, employee: 45 },
    { month: 'MAY', admin: 40, employee: 80 },
    { month: 'JUN', admin: 30, employee: 55 }
  ];

  return (
    <div id="admin-dashboard" className="space-y-8 animate-fade-in">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h3 className="text-3xl font-bold text-[#091426] tracking-tight font-headline">Good Morning, Admin</h3>
          <p className="text-sm text-slate-500 font-sans">
            System overview for {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => onNavigate('directory')}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-slate-700 shadow-sm transition-all hover:cursor-pointer"
          >
            <span>View Directory</span>
          </button>
          <button 
            onClick={() => onNavigate('leaves')}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#091426] hover:bg-[#1a2d4c] text-white rounded-xl text-xs font-bold shadow-md transition-all hover:cursor-pointer"
          >
            <span>Review Leaves</span>
          </button>
        </div>
      </div>

      {/* Bento Grid - Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Stat Card 1 */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#d8e2ff] text-[#004395] rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Users className="w-5 h-5" />
            </div>
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-0.5 bg-emerald-50 px-2 py-0.5 rounded-full">
              <TrendingUp className="w-3 h-3" />
              +12%
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-sans">Total Employees</p>
          <h4 className="text-3xl font-bold text-[#091426] font-display">1,248 <span className="text-xs font-medium text-slate-400 font-sans">(State: {totalCount})</span></h4>
          <div className="mt-4 h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
            <div className="h-full bg-[#0058be] rounded-full" style={{ width: '80%' }}></div>
          </div>
        </div>

        {/* Stat Card 2 */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-[#d3e4fe] text-[#0b1c30] rounded-xl group-hover:scale-105 transition-transform duration-200">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-emerald-600 text-xs font-bold flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-full">
              On Track
            </span>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-sans">Present Today</p>
          <h4 className="text-3xl font-bold text-[#091426] font-display">924 <span className="text-xs font-medium text-slate-400 font-sans">(Active: {activeCount})</span></h4>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-[11px] text-[#8590a6] font-semibold">{Math.round((activeCount / totalCount) * 100) || 74}% Workplace Attendance</span>
          </div>
        </div>

        {/* Stat Card 3 */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-red-100 text-red-700 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <CalendarCheck className="w-5 h-5" />
            </div>
            {pendingLeaves > 0 && (
              <span className="text-red-600 text-xs font-bold bg-red-50 px-2 py-0.5 rounded-full animate-pulse">
                {pendingLeaves} Priority
              </span>
            )}
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-sans">Pending Leaves</p>
          <h4 className="text-3xl font-bold text-[#091426] font-display">{pendingLeaves} <span className="text-xs font-medium text-slate-400 font-sans">(In list)</span></h4>
          
          <div className="mt-4 flex -space-x-1.5 overflow-hidden">
            {employees.slice(0,4).map((emp, i) => (
              <img
                key={emp.id}
                src={emp.profilePhoto}
                alt={emp.fullName}
                className="w-6 h-6 rounded-full border-2 border-white object-cover"
              />
            ))}
            {totalCount > 4 && (
              <div className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-600">
                +{totalCount - 4}
              </div>
            )}
          </div>
        </div>

        {/* Stat Card 4 */}
        <div className="bg-white p-6 border border-slate-200/80 rounded-2xl shadow-sm hover:shadow-md transition-shadow group">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-teal-100 text-teal-800 rounded-xl group-hover:scale-105 transition-transform duration-200">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 font-sans">Payroll Cycle</p>
          <h4 className="text-3xl font-bold text-[#091426] font-display">Active</h4>
          <p className="mt-4 text-[11px] text-slate-500 font-medium">Disbursement scheduled on 28th of month</p>
        </div>
      </div>

      {/* Main Data Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Custom Interactive SVG Chart (Left 2/3) */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h5 className="text-lg font-bold text-[#091426] font-headline">Leave Trends Summary</h5>
              <p className="text-xs text-slate-500 font-sans">Year-over-year dynamic comparison</p>
            </div>
            <select className="border border-slate-200 rounded-xl text-xs bg-slate-50 px-4 py-2 text-slate-700 outline-none focus:ring-2 focus:ring-secondary-container">
              <option>Past 6 Months</option>
              <option>Full Year</option>
            </select>
          </div>

          {/* SVG Animated Column Chart */}
          <div className="relative flex-1 min-h-[260px] flex items-end gap-3 md:gap-6 pt-8 pb-2">
            
            {/* Grid Line Marks */}
            <div className="absolute inset-0 flex flex-col justify-between pointer-events-none text-[9px] font-bold text-slate-300">
              <div className="border-t border-dashed border-slate-100 w-full pt-1">100 days</div>
              <div className="border-t border-dashed border-slate-100 w-full pt-1">75 days</div>
              <div className="border-t border-dashed border-slate-100 w-full pt-1">50 days</div>
              <div className="border-t border-dashed border-slate-100 w-full pt-1">25 days</div>
              <div className="border-t border-dashed border-slate-100 w-full"></div>
            </div>

            {/* Render Columns */}
            {leaveTrendData.map((data) => {
              // Standard scale heights relative to max size (90%)
              const employeeBarHeight = `${data.employee}%`;
              const adminBarHeight = `${data.admin}%`;

              return (
                <div key={data.month} className="flex-1 flex flex-col items-center justify-end z-10 group relative">
                  
                  {/* Tooltip Overlay */}
                  <div className="absolute -top-12 bg-primary text-white text-[10px] py-1.5 px-3 rounded-lg opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 flex flex-col gap-0.5 shadow-md items-center z-50 min-w-[100px]">
                    <span className="font-bold border-b border-slate-700 pb-0.5 w-full text-center">{data.month} Leaves</span>
                    <span className="text-slate-300">Employee: {data.employee} d</span>
                    <span className="text-sky-300">Admin/Manager: {data.admin} d</span>
                  </div>

                  {/* Dual Bar Setup */}
                  <div className="w-full flex gap-1.5 justify-center items-end h-[180px]">
                    {/* Admin/Manager Leaves Bar */}
                    <div 
                      className="w-3 bg-secondary-container rounded-t transition-all duration-300 group-hover:brightness-110 shadow-sm"
                      style={{ height: adminBarHeight }}
                    />
                    {/* Employee Leaves Bar */}
                    <div 
                      className="w-3 bg-[#091426] rounded-t transition-all duration-300 group-hover:brightness-125 shadow-sm"
                      style={{ height: employeeBarHeight }}
                    />
                  </div>

                  <span className="mt-4 text-[10px] font-bold text-[#8590a6] uppercase tracking-wider">
                    {data.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex gap-4 justify-center mt-4 border-t border-slate-100 pt-4 text-xs font-semibold text-slate-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-[#091426] rounded-sm"></span>
              <span>Employee Requests</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 bg-secondary-container rounded-sm"></span>
              <span>Manager Approvals</span>
            </div>
          </div>
        </div>

        {/* Dynamic Recent Activity feed (Right 1/3) */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col h-[400px] md:h-auto">
          <div className="flex justify-between items-center mb-6">
            <h5 className="text-md font-bold text-[#091426] font-headline">Recent Activity</h5>
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest bg-slate-100 px-2 py-0.5 rounded">Real-time Feed</span>
          </div>

          {/* Scrolling Container */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-4 custom-scrollbar">
            {activities.length === 0 ? (
              <div className="text-center py-12 text-xs text-slate-400">
                No recent activity logs recorded yet.
              </div>
            ) : (
              activities.map((log) => {
                let badgeColor = 'bg-slate-100 text-slate-700';
                if (log.status === 'success') badgeColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                if (log.status === 'warning') badgeColor = 'bg-amber-50 text-amber-700 border-amber-100';
                if (log.status === 'error') badgeColor = 'bg-rose-50 text-rose-700 border-rose-100';
                if (log.status === 'info') badgeColor = 'bg-blue-50 text-blue-700 border-blue-100';

                return (
                  <div key={log.id} className="flex gap-3.5 items-start p-3 hover:bg-slate-50 transition-colors rounded-xl border border-transparent hover:border-slate-100/80">
                    <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xs font-bold text-slate-700">
                      {log.employeeName.split(' ').map(n=>n[0]).join('')}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-slate-800 leading-snug">
                        <span className="font-bold text-[#091426] hov_link">{log.employeeName}</span> {log.details}
                      </p>
                      <div className="mt-1.5 flex items-center gap-2">
                        <span className="text-[9px] text-[#8590a6] font-medium font-sans">{log.timestamp}</span>
                        <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded-full uppercase border ${badgeColor}`}>
                          {log.type}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Quick Action Bento Grid / Upcoming milestones & Department Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Milestones Card */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h5 className="text-md font-bold text-[#091426] font-headline mb-4">Upcoming Milestones</h5>
          <div className="space-y-3.5">
            {milestones.map((milestone) => (
              <div 
                key={milestone.id}
                className="p-4 bg-slate-50 rounded-xl flex items-center justify-between border border-transparent hover:border-slate-200 transition-all group hover:cursor-pointer"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded bg-white flex items-center justify-center border border-slate-200 shadow-sm text-secondary-container font-headline text-lg font-bold">
                    🎉
                  </div>
                  <div>
                    <p className="text-xs font-bold text-[#091426]">{milestone.title}</p>
                    <p className="text-[10px] text-slate-500 font-sans mt-0.5">{milestone.date} {milestone.time && `• ${milestone.time}`}</p>
                  </div>
                </div>
                <span className="text-xs text-slate-400 font-sans group-hover:translate-x-1 transition-transform">→</span>
              </div>
            ))}
          </div>
        </div>

        {/* Department Overview */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <h5 className="text-md font-bold text-[#091426] font-headline mb-5">Department Distribution</h5>
            <div className="space-y-4">
              {['Engineering', 'Design & Product', 'Marketing', 'Human Resources'].map((dept) => {
                const count = deptCounts[dept] || 0;
                const percentage = Math.round((count / maxDeptCount) * 100) || 5;
                const displayMockText = dept === 'Engineering' ? '342 Employees' : 
                                      dept === 'Marketing' ? '128 Employees' :
                                      dept === 'Design & Product' ? '86 Employees' : `${count} Employees`;

                return (
                  <div key={dept}>
                    <div className="flex justify-between items-center mb-1.5 text-xs font-bold font-sans">
                      <span className="text-[#091426]">{dept}</span>
                      <span className="text-slate-400">{count > 0 ? `${count} Active (${displayMockText})` : `No local employees entered`}</span>
                    </div>
                    <div className="h-2 w-full bg-slate-100 rounded-full">
                      <div 
                        className="h-full bg-secondary-container rounded-full transition-all duration-500" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
