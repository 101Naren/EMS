import React, { useState, useEffect } from 'react';
import { 
  Clock, 
  Send, 
  Calendar, 
  FileText, 
  CheckCircle2, 
  HelpCircle,
  TrendingUp,
  AlertCircle,
  XCircle,
  UserCheck,
  Building
} from 'lucide-react';
import { Employee, AttendanceRecord, LeaveRequest, LeaveType } from '../types';

interface EmployeeDashboardProps {
  userEmployee: Employee;
  todayAttendance: AttendanceRecord | undefined;
  leaves: LeaveRequest[];
  onClockIn: () => void;
  onClockOut: () => void;
  onApplyLeave: (request: Omit<LeaveRequest, 'id' | 'employeeName' | 'department' | 'dateApplied'>) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
}

export default function EmployeeDashboard({
  userEmployee,
  todayAttendance,
  leaves,
  onClockIn,
  onClockOut,
  onApplyLeave,
  onShowToast
}: EmployeeDashboardProps) {
  // Live Clock State
  const [timeStr, setTimeStr] = useState('');

  useEffect(() => {
    const updateTime = () => {
      setTimeStr(new Date().toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Leave Form Fields
  const [leaveType, setLeaveType] = useState<LeaveType>('Vacation');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reason, setReason] = useState('');

  // Submit leave form
  const handleLeaveSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!startDate || !endDate || !reason) {
      onShowToast('Please fill out all fields of the leave formulation.', true);
      return;
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      onShowToast('Return date must be after the start date.', true);
      return;
    }

    const duration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    onApplyLeave({
      employeeId: userEmployee.id,
      type: leaveType,
      startDate,
      endDate,
      duration,
      reason,
      status: 'Pending'
    });

    onShowToast('Leave Request submitted to HR administrator inbox.');
    // Reset Form
    setStartDate('');
    setEndDate('');
    setReason('');
  };

  // Find users personal leave list
  const personalLeaves = leaves.filter(l => l.employeeId === userEmployee.id);

  // Status variables
  const isClockedIn = todayAttendance && (todayAttendance.status === 'Present' || todayAttendance.status === 'Late');
  const checkInTime = todayAttendance ? todayAttendance.checkIn : null;
  const isClockedOut = todayAttendance && todayAttendance.checkOut;

  return (
    <div id="employee-dashboard-panel" className="space-y-6 animate-fade-in">
      
      {/* Welcome Banner */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 md:p-8 flex flex-col md:flex-row justify-between items-center gap-6 shadow-sm">
        <div className="flex items-center gap-5 text-center md:text-left flex-col md:flex-row">
          <img 
            src={userEmployee.profilePhoto} 
            alt={userEmployee.fullName} 
            className="w-16 h-16 rounded-full object-cover border-2 border-[#2170e4]"
          />
          <div>
            <h3 className="text-2xl font-bold text-primary font-headline tracking-tight">Welcome back, {userEmployee.fullName}</h3>
            <p className="text-xs text-slate-500 font-sans font-medium flex items-center justify-center md:justify-start gap-1.5 mt-1">
              <Building className="w-3.5 h-3.5 text-slate-400" />
              <span>{userEmployee.department} Department • ID: {userEmployee.id}</span>
            </p>
          </div>
        </div>

        {/* Dynamic Live Clock */}
        <div className="text-center md:text-right font-sans">
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Active System Time</p>
          <p className="text-lg font-bold text-slate-700 mt-1 font-mono">{timeStr || '12:00:00 PM'}</p>
        </div>
      </div>

      {/* Grid compartments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Clock In / Clock Out Controls */}
        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-100">
              <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans">Shift attendance registration</h4>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>
            
            <div className="text-center py-6">
              {isClockedIn ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto border border-emerald-200">
                    <UserCheck className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-emerald-700">Clocked In</p>
                  <p className="text-[11px] text-slate-450 font-sans">Received check-in signal at {checkInTime || '08:45 AM'}</p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto border border-rose-200">
                    <Clock className="w-6 h-6" />
                  </div>
                  <p className="text-xs font-bold text-rose-700">Not Clocked In</p>
                  <p className="text-[11px] text-slate-450 font-sans">Attendance sign-in required for {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                </div>
              )}
            </div>
          </div>

          <div className="mt-6">
            {!isClockedIn ? (
              <button 
                id="emp-clock-in-btn"
                onClick={onClockIn}
                className="w-full py-3 bg-[#0058be] hover:bg-[#004395] text-white font-bold rounded-xl text-xs tracking-wider transition-all shadow-md active:scale-95 cursor-pointer"
              >
                CLOCK IN ON-SITE
              </button>
            ) : !isClockedOut ? (
              <button 
                id="emp-clock-out-btn"
                onClick={onClockOut}
                className="w-full py-3 bg-slate-850 hover:bg-slate-900 border border-slate-350 text-slate-700 font-bold rounded-xl text-xs tracking-wider hover:bg-slate-50 transition-all cursor-pointer"
              >
                CLOCK OUT & COMPLETE SHIFT
              </button>
            ) : (
              <div className="bg-emerald-50 text-emerald-800 p-3 rounded-xl border border-emerald-200 text-xs text-center font-bold">
                Shift completed for today! Check-out submitted.
              </div>
            )}
          </div>
        </div>

        {/* Middle/Right 2 Columns - Leave formulation request */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest font-sans mb-4 pb-3 border-b border-slate-100">
            Submit Paid Leave or Vacation Formulation
          </h4>

          <form onSubmit={handleLeaveSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">CATEGORY</label>
                <select
                  value={leaveType}
                  onChange={(e) => setLeaveType(e.target.value as LeaveType)}
                  className="px-3 py-2 bg-slate-50 border border-slate-205 border-slate-200 rounded-lg text-xs text-slate-700 outline-none"
                >
                  <option value="Vacation">Annual Vacation</option>
                  <option value="Sick Leave">Medical / Sick Leave</option>
                  <option value="Personal">Personal / Bereavement</option>
                  <option value="Maternity">Maternity/Paternity</option>
                  <option value="Other">Other leave cases</option>
                </select>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">START DATE</label>
                <input 
                  type="date"
                  required
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none"
                />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[10px] font-bold text-slate-500">END DATE</label>
                <input 
                  type="date"
                  required
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none"
                />
              </div>

            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-500">REASON & SUPPORTING DESCRIPTION</label>
              <textarea 
                required
                rows={2}
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Briefly state context (e.g., Seasonal family holiday event...)"
                className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-700 outline-none w-full"
              />
            </div>

            <div className="flex justify-end">
              <button
                id="leave-submit-btn"
                type="submit"
                className="px-6 py-2 bg-[#091426] hover:bg-slate-850 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm whitespace-nowrap cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit Formulation</span>
              </button>
            </div>
          </form>
        </div>

      </div>

      {/* Leave request tracking logs list */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-[#091426] font-headline">My Time Off Requests</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse text-xs">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3 font-bold text-slate-450 text-[#8590a6]">Type</th>
                <th className="px-6 py-3 font-bold text-slate-450 text-[#8590a6]">Duration</th>
                <th className="px-6 py-3 font-bold text-slate-450 text-[#8590a6]">Apply Date</th>
                <th className="px-6 py-3 font-bold text-slate-450 text-[#8590a6]">Purpose Reason</th>
                <th className="px-6 py-3 font-bold text-slate-450 text-[#8590a6]">Status Resolution</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {personalLeaves.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-400">
                    No historic leave request submissions found. Use the form above to apply.
                  </td>
                </tr>
              ) : (
                personalLeaves.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-3.5 font-bold text-slate-700">{req.type}</td>
                    <td className="px-6 py-3.5 text-slate-600 font-medium">
                      {req.startDate} to {req.endDate} ({req.duration} days)
                    </td>
                    <td className="px-6 py-3.5 text-slate-500 font-sans">{req.dateApplied}</td>
                    <td className="px-6 py-3.5 italic text-slate-600">"{req.reason}"</td>
                    <td className="px-6 py-3.5 font-sans">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        req.status === 'Approved' 
                          ? 'bg-emerald-50 text-emerald-800' 
                          : req.status === 'Pending' 
                          ? 'bg-amber-50 text-amber-800' 
                          : 'bg-rose-50 text-rose-800'
                      }`}>
                        {req.status}
                      </span>
                      {req.feedback && (
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5">Note: "{req.feedback}"</p>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
