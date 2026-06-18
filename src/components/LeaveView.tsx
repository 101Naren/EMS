import { Calendar, CheckCircle2, XCircle, Clock, Check, X, ArrowRight } from 'lucide-react';
import { LeaveRequest } from '../types';

interface LeaveViewProps {
  leaves: LeaveRequest[];
  onApproveLeave: (id: string, feedback?: string) => void;
  onRejectLeave: (id: string, feedback?: string) => void;
  onShowToast: (msg: string, isError?: boolean) => void;
}

export default function LeaveView({
  leaves,
  onApproveLeave,
  onRejectLeave,
  onShowToast
}: LeaveViewProps) {
  const pendingRequests = leaves.filter(l => l.status === 'Pending');
  const resolvedRequests = leaves.filter(l => l.status !== 'Pending');

  const stats = {
    pendingCount: pendingRequests.length,
    onLeaveCount: leaves.filter(l => l.status === 'Approved').length,
    approvalRate: '94%',
    adherence: 'High'
  };

  const handleApprove = (id: string, name: string) => {
    onApproveLeave(id, "Approved by administrator");
    onShowToast(`Leave Request for ${name} APPROVED.`);
  };

  const handleReject = (id: string, name: string) => {
    const feedback = prompt("Please enter rejection feedback for the employee file:", "Exceeded team resource buffer limit.");
    if (feedback === null) return; // user cancelled prompt
    onRejectLeave(id, feedback || "Rejection under resource guidelines");
    onShowToast(`Leave Request for ${name} REJECTED.`);
  };

  return (
    <div id="leaves-panel" className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div>
        <h2 className="text-3xl font-bold text-[#091426] tracking-tight font-headline">Leave Management</h2>
        <p className="text-sm text-slate-500 font-sans mt-0.5">
          Review, approve, and audit employee paid-time-off and sick-leave records.
        </p>
      </div>

      {/* Stats Cards - Bento */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start text-[#8590a6]">
            <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Pending Requests</span>
            <Clock className="w-4 h-4 text-secondary-container" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-primary font-display">{stats.pendingCount}</span>
            <p className="text-[10px] font-semibold text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded-full mt-1.5 w-fit uppercase font-sans">Action Needed</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start text-[#8590a6]">
            <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Approved History</span>
            <Calendar className="w-4 h-4 text-[#0058be]" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-[#091426] font-display">
              {leaves.filter(l => l.status === 'Approved').length} Approved
            </span>
            <p className="text-[10px] text-slate-400 font-sans mt-1.5">Processed within standard SLA</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start text-[#8590a6]">
            <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Approval Rate</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold text-emerald-600 font-display">{stats.approvalRate}</span>
            <p className="text-[10px] text-emerald-600 font-medium font-sans mt-1.5">Highest industry bracket</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-sm flex flex-col justify-between h-[150px]">
          <div className="flex justify-between items-start text-[#8590a6]">
            <span className="text-[10px] font-bold uppercase tracking-widest font-sans">Policy Compliance</span>
            <XCircle className="w-4 h-4 text-sky-700" />
          </div>
          <div className="mt-4">
            <span className="text-2xl font-bold text-sky-800 font-display">{stats.adherence} (98.2%)</span>
            <p className="text-[10px] text-slate-400 font-sans mt-2">Highly accurate allocation</p>
          </div>
        </div>
      </div>

      {/* Pending approvals section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-bold text-primary font-headline">Pending Approvals</h3>
          {pendingRequests.length > 0 && (
            <span className="px-2.5 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-full font-bold text-[9px] uppercase tracking-wider font-sans">
              Attention Required
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 gap-4">
          {pendingRequests.length === 0 ? (
            <div className="bg-slate-50 border border-dashed border-slate-200 py-12 text-center text-xs text-slate-500 font-sans rounded-xl">
              All leave requests resolved! Outstanding inbox is clear.
            </div>
          ) : (
            pendingRequests.map((req) => (
              <div 
                id={`leave-card-${req.id}`}
                key={req.id} 
                className="bg-white p-5 rounded-2xl border border-slate-200/80 flex flex-wrap items-center gap-6 shadow-sm hover:shadow-md transition-all duration-200"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center font-bold text-sm text-[#091426] border border-slate-200">
                  {req.employeeName.split(' ').map(n=>n[0]).join('')}
                </div>
                
                <div className="flex-1 min-w-[200px]">
                  <h4 className="text-sm font-bold text-primary">{req.employeeName}</h4>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mt-0.5">{req.department}</p>
                </div>

                <div className="w-32">
                  <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100 font-bold text-[9px] uppercase tracking-wider font-sans">
                    {req.type}
                  </span>
                  <p className="text-xs font-bold text-slate-800 font-sans mt-1.5">{req.duration} Days request</p>
                </div>

                <div className="flex-1 max-w-sm">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-medium font-sans">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>{req.startDate} to {req.endDate}</span>
                  </div>
                  <p className="text-xs text-[#091426] mt-1.5 italic font-sans font-medium">"{req.reason}"</p>
                </div>

                {/* Approve / Reject Actions */}
                <div className="flex gap-2 w-full sm:w-auto sm:ml-auto">
                  <button
                    id={`approve-btn-${req.id}`}
                    onClick={() => handleApprove(req.id, req.employeeName)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-colors cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-emerald-600 font-bold" />
                    <span>Approve</span>
                  </button>
                  <button
                    id={`reject-btn-${req.id}`}
                    onClick={() => handleReject(req.id, req.employeeName)}
                    className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 border border-slate-200 text-slate-700 font-bold rounded-xl text-xs hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300 transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4 text-rose-600" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Audit logs of resolved leaves */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-primary font-headline">Leaves & Vacations Audit Log</h3>
        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 border-b border-slate-100">
              <tr>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Employee</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Category</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Span / Days</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">Resolution</th>
                <th className="px-6 py-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-right">App. Period</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {resolvedRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-xs text-slate-400 font-sans">
                    No records processed in this period.
                  </td>
                </tr>
              ) : (
                resolvedRequests.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-xs font-bold text-primary">{req.employeeName}</p>
                        <p className="text-[10px] text-[#8590a6] mt-0.5">{req.department} • {req.employeeId}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-650">
                      {req.type}
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-600 font-medium">
                      {req.startDate} to {req.endDate} ({req.duration} days)
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 font-bold text-[9px] rounded uppercase ${
                        req.status === 'Approved' 
                          ? 'bg-emerald-50 text-emerald-800' 
                          : 'bg-rose-50 text-rose-800'
                      }`}>
                        {req.status === 'Approved' ? 'Approved' : 'Rejected'}
                      </span>
                      {req.feedback && (
                        <p className="text-[10px] text-slate-400 font-sans mt-0.5 font-medium truncate max-w-xs block">
                          Note: "{req.feedback}"
                        </p>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right text-xs text-slate-400 font-sans font-medium">
                      {req.dateApplied}
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
