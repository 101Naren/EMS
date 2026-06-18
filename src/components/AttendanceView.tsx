import { useState } from 'react';
import { 
  CalendarCheck, 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  Info, 
  TrendingUp,
  Save
} from 'lucide-react';
import { Employee, AttendanceRecord, AttendanceStatus } from '../types';

interface AttendanceViewProps {
  employees: Employee[];
  attendanceRecords: AttendanceRecord[];
  onUpdateAttendance: (updated: AttendanceRecord[]) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
}

export default function AttendanceView({
  employees,
  attendanceRecords,
  onUpdateAttendance,
  onShowToast
}: AttendanceViewProps) {
  // Current logs local state so overrides aren't permanently saved until "Submit Records" is clicked!
  const [localRecords, setLocalRecords] = useState<AttendanceRecord[]>(() => {
    // Make sure we have a record for today (2026-06-16) for EVERY employee
    const today = "2026-06-16";
    return employees.map(emp => {
      const existing = attendanceRecords.find(r => r.employeeId === emp.id && r.date === today);
      if (existing) return { ...existing };
      return {
        id: `local-att-${emp.id}`,
        employeeId: emp.id,
        date: today,
        status: 'Absent' as AttendanceStatus,
        checkIn: null,
        checkOut: null
      };
    });
  });

  const [searchTerm, setSearchTerm] = useState('');
  const [deptFilter, setDeptFilter] = useState('All Departments');

  // Trigger change state locally
  const handleToggleStatus = (employeeId: string, status: AttendanceStatus) => {
    const checkInTime = status === 'Present' ? '08:45 AM' : status === 'Late' ? '09:20 AM' : null;
    setLocalRecords(prev => prev.map(rec => {
      if (rec.employeeId === employeeId) {
        return {
          ...rec,
          status,
          checkIn: checkInTime,
          checkOut: status === 'Present' || status === 'Late' ? '05:30 PM' : null
        };
      }
      return rec;
    }));
  };

  // Submit records to parent state
  const handleSubmitRecords = () => {
    onUpdateAttendance(localRecords);
    onShowToast('Workplace Attendance sheets for Tuesday, June 16, 2026 recorded successfully!');
  };

  const handleExportSummary = () => {
    onShowToast('Monthly Attendance analytics sheet exported to PDF!');
  };

  // Filters
  const filteredRecords = localRecords.filter(rec => {
    const emp = employees.find(e => e.id === rec.employeeId);
    if (!emp) return false;

    const matchesSearch = emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          emp.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDept = deptFilter === 'All Departments' ? true : emp.department === deptFilter;

    return matchesSearch && matchesDept;
  });

  // Calculate daily indicators
  const totalChecked = localRecords.length;
  const presentChecked = localRecords.filter(r => r.status === 'Present' || r.status === 'Late').length;
  const dailyRate = totalChecked > 0 ? Math.round((presentChecked / totalChecked) * 100) : 94;

  return (
    <div id="attendance-panel" className="space-y-6 animate-fade-in">
      {/* Header controls */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-[#091426] tracking-tight font-headline">Attendance Tracking</h2>
          <p className="text-sm text-slate-500 font-sans mt-0.5">
            Log, override, and register daily shifts for staff members.
          </p>
        </div>
        <button 
          id="export-summary-btn"
          onClick={handleExportSummary}
          className="flex items-center gap-2 border-2 border-[#0058be] text-[#0058be] hover:bg-slate-50 font-bold px-5 py-2.5 rounded-xl text-xs transition-all pointer-events-auto cursor-pointer shadow-sm"
        >
          <Download className="w-4 h-4" />
          <span>Monthly Summary Export</span>
        </button>
      </div>

      {/* Stats Bento */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Attendance Percentage Indicator */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-[160px]">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
              Daily Attendance Rate
            </p>
            <h3 className="text-3xl font-bold text-[#091426] font-display">{dailyRate}%</h3>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-600 font-semibold text-xs bg-emerald-50 w-fit px-2 py-0.5 rounded-full">
            <TrendingUp className="w-3 h-3" />
            <span>+2.4% from last month</span>
          </div>
        </div>

        {/* Absences count */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-[160px]">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 font-sans">
              Total Absences today
            </p>
            <h3 className="text-3xl font-bold text-slate-700 font-display">
              {localRecords.filter(r => r.status === 'Absent').length} Absences
            </h3>
          </div>
          <div className="flex items-center gap-1.5 text-slate-500 text-xs">
            <Info className="w-4 h-4 text-slate-400" />
            <span>Pending sickness leaves check</span>
          </div>
        </div>

        {/* Dynamic calendar panel placeholder */}
        <div className="bg-white rounded-2xl border border-slate-205 border-slate-200 shadow-sm p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center mb-2">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-sans">Attendance Calendar</span>
            <span className="text-[10px] font-bold text-secondary-container bg-blue-50 px-2 py-0.5 rounded-full uppercase">June 2026</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center text-[9px] font-bold text-slate-400 border-b border-slate-100 pb-1.5">
            <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
          </div>
          <div className="grid grid-cols-7 gap-1 text-center font-sans text-[10px] pt-1">
            <span className="text-slate-350">14</span><span className="text-slate-350">15</span>
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className={`py-1 rounded-md font-semibold ${i === 0 ? 'bg-emerald-500 text-white font-bold' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}>
                {i + 16}
              </span>
            ))}
          </div>
        </div>

      </div>

      {/* Filter and listings */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Table controls */}
        <div className="px-6 py-4 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">
                <Search className="w-4 h-4" />
              </span>
              <input 
                type="text"
                placeholder="Search staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-primary focus:outline-none focus:ring-2 focus:ring-[#2170e4]"
              />
            </div>
            
            <select
              value={deptFilter}
              onChange={(e) => setDeptFilter(e.target.value)}
              className="py-2 px-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 focus:ring-2"
            >
              <option>All Departments</option>
              <option>Engineering</option>
              <option>Marketing</option>
              <option>Human Resources</option>
              <option>Design & Product</option>
              <option>Legal</option>
            </select>
          </div>

          <button 
            id="attendance-submit-db"
            onClick={handleSubmitRecords}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#091426] hover:bg-slate-850 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>Submit Records</span>
          </button>
        </div>

        {/* Daily Attendance Logs */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee Name</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Department</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check-In</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Check-Out</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Status Badging</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">Attendance Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-xs text-slate-400 font-sans">
                    No records found matching criteria.
                  </td>
                </tr>
              ) : (
                filteredRecords.map((rec) => {
                  const emp = employees.find(e => e.id === rec.employeeId);
                  if (!emp) return null;

                  return (
                    <tr key={rec.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <img 
                            src={emp.profilePhoto} 
                            alt={emp.fullName}
                            className="w-10 h-10 rounded-full object-cover border border-slate-100"
                          />
                          <div>
                            <p className="text-xs font-bold text-primary">{emp.fullName}</p>
                            <p className="text-[10px] text-slate-500 font-mono mt-0.5">{emp.id}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-xs font-medium text-slate-600">
                        {emp.department}
                      </td>
                      <td className="px-6 py-4 text-xs font-serif font-sans text-slate-500">
                        {rec.checkIn || '—'}
                      </td>
                      <td className="px-6 py-4 text-xs font-serif font-sans text-slate-500">
                        {rec.checkOut || '—'}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase ${
                          rec.status === 'Present' 
                            ? 'bg-emerald-50 text-emerald-700' 
                            : rec.status === 'Late' 
                            ? 'bg-amber-50 text-amber-700' 
                            : 'bg-rose-50 text-rose-700'
                        }`}>
                          {rec.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1.5">
                          <button
                            id={`mark-present-${emp.id}`}
                            onClick={() => handleToggleStatus(emp.id, 'Present')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:cursor-pointer ${
                              rec.status === 'Present'
                                ? 'bg-emerald-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Mark Present
                          </button>
                          <button
                            id={`mark-late-${emp.id}`}
                            onClick={() => handleToggleStatus(emp.id, 'Late')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:cursor-pointer ${
                              rec.status === 'Late'
                                ? 'bg-amber-500 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Late
                          </button>
                          <button
                            id={`mark-absent-${emp.id}`}
                            onClick={() => handleToggleStatus(emp.id, 'Absent')}
                            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all hover:cursor-pointer ${
                              rec.status === 'Absent'
                                ? 'bg-rose-600 text-white shadow-sm'
                                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                            }`}
                          >
                            Absent
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>

    </div>
  );
}
