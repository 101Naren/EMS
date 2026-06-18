import { useState, useEffect } from 'react';
import { 
  getSavedData, 
  saveToStorage, 
  INITIAL_EMPLOYEES, 
  INITIAL_ATTENDANCE, 
  INITIAL_LEAVES, 
  INITIAL_PAYMENTS, 
  INITIAL_MILESTONES, 
  INITIAL_ACTIVITIES 
} from './data';
import { 
  Employee, 
  AttendanceRecord, 
  LeaveRequest, 
  PaymentDetails, 
  Milestone, 
  ActivityLog, 
  UserSession 
} from './types';
import Sidebar from './components/Sidebar';
import LoginForm from './components/LoginForm';
import AdminDashboard from './components/AdminDashboard';
import DirectoryView from './components/DirectoryView';
import AttendanceView from './components/AttendanceView';
import LeaveView from './components/LeaveView';
import PayrollAndProfileView from './components/PayrollAndProfileView';
import EmployeeDashboard from './components/EmployeeDashboard';
import ChangePassword from './components/ChangePassword';
import { ShieldAlert, CheckCircle2 } from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<UserSession | null>(() => {
    return getSavedData<UserSession | null>('session', null);
  });

  const [employees, setEmployees] = useState<Employee[]>(() => {
    return getSavedData<Employee[]>('employees', INITIAL_EMPLOYEES);
  });

  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => {
    return getSavedData<AttendanceRecord[]>('attendance', INITIAL_ATTENDANCE);
  });

  const [leaves, setLeaves] = useState<LeaveRequest[]>(() => {
    return getSavedData<LeaveRequest[]>('leaves', INITIAL_LEAVES);
  });

  const [payments, setPayments] = useState<PaymentDetails[]>(() => {
    return getSavedData<PaymentDetails[]>('payments', INITIAL_PAYMENTS);
  });

  const [activities, setActivities] = useState<ActivityLog[]>(() => {
    return getSavedData<ActivityLog[]>('activities', INITIAL_ACTIVITIES);
  });

  const [milestones, setMilestones] = useState<Milestone[]>(INITIAL_MILESTONES);

  const [currentTab, setCurrentTab] = useState<string>(() => {
    const savedUser = getSavedData<UserSession | null>('session', null);
    if (savedUser) {
      return savedUser.role === 'Admin' ? 'dashboard' : 'emp_dashboard';
    }
    return 'login';
  });

  const [toast, setToast] = useState<{ message: string; isError?: boolean } | null>(null);

  const showToast = (message: string, isError = false) => {
    setToast({ message, isError });
    setTimeout(() => setToast(null), 4000);
  };

  useEffect(() => { saveToStorage('session', user); }, [user]);
  useEffect(() => { saveToStorage('employees', employees); }, [employees]);
  useEffect(() => { saveToStorage('attendance', attendance); }, [attendance]);
  useEffect(() => { saveToStorage('leaves', leaves); }, [leaves]);
  useEffect(() => { saveToStorage('payments', payments); }, [payments]);
  useEffect(() => { saveToStorage('activities', activities); }, [activities]);

  // Handle change-password route — must be after all hooks
  if (window.location.pathname === '/change-password') {
    return <ChangePassword />;
  }

  const handleLogin = async (session: UserSession) => {
  setUser(session);
  showToast(`Signed in successfully as ${session.fullName}!`);

  // If employee, fetch their data from MySQL and add to employees list
  if (session.role === 'Employee') {
    try {
      const token = localStorage.getItem('ems_token');
      const res = await fetch('http://localhost:5000/api/employees', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (Array.isArray(data)) {
        const mapped = data.map((e: any) => ({
          id: e.employee_id || String(e.id),
          fullName: e.name,
          email: e.email,
          department: e.department || 'General',
          role: e.role === 'admin' ? 'Admin' : e.role === 'manager' ? 'Manager' : 'Employee',
          status: e.status === 'active' ? 'Active' : 'Inactive',
          salary: e.salary || 0,
          joinDate: e.join_date || '',
          profilePhoto: '',
          phone: e.phone || '',
          address: e.address || '',
          reportingManager: e.reporting_manager || '',
          password: '',
          forcePasswordChange: false
        }));
        setEmployees(mapped);
      }
    } catch (err) {
      console.error('Failed to fetch employees', err);
    }
  }

  setCurrentTab(session.role === 'Admin' ? 'dashboard' : 'emp_dashboard');
};

  const handleLogout = () => {
    setUser(null);
    setCurrentTab('login');
    showToast('Signed out successfully.');
  };

  const logActivity = (type: 'attendance' | 'leave' | 'join' | 'payroll', employeeName: string, details: string, status: 'success' | 'warning' | 'info' | 'error') => {
    const newLog: ActivityLog = {
      id: `act-${Date.now()}`,
      type,
      employeeName,
      details,
      timestamp: "Just now",
      status
    };
    setActivities(prev => [newLog, ...prev.slice(0, 15)]);
  };

  const handleAddEmployee = (newEmp: Employee) => {
    setEmployees(prev => [newEmp, ...prev]);
    logActivity('join', newEmp.fullName, 'joined the directory', 'info');
  };

  const handleUpdateEmployee = (updatedEmp: Employee) => {
    setEmployees(prev => prev.map(e => e.id === updatedEmp.id ? updatedEmp : e));
    logActivity('join', updatedEmp.fullName, 'updated profile details', 'success');
  };

  const handleDeleteEmployee = (id: string) => {
    const deleted = employees.find(e => e.id === id);
    if (!deleted) return;
    setEmployees(prev => prev.filter(e => e.id !== id));
    logActivity('join', deleted.fullName, 'was removed from directory', 'error');
  };

  const handleUpdateAttendanceList = (updatedRecords: AttendanceRecord[]) => {
    setAttendance(prev => {
      const nextList = [...prev];
      updatedRecords.forEach(rec => {
        const index = nextList.findIndex(r => r.employeeId === rec.employeeId && r.date === rec.date);
        if (index > -1) {
          nextList[index] = rec;
        } else {
          nextList.push(rec);
        }
      });
      return nextList;
    });
    logActivity('attendance', 'System', 'attendance records updated', 'success');
  };

  const handleApproveLeave = (id: string, feedback?: string) => {
    const request = leaves.find(l => l.id === id);
    if (!request) return;
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Approved', feedback } : l));
    setEmployees(prev => prev.map(emp => emp.id === request.employeeId ? { ...emp, status: 'On Leave' } : emp));
    logActivity('leave', request.employeeName, `leave approved for ${request.startDate}`, 'success');
  };

  const handleRejectLeave = (id: string, feedback?: string) => {
    const request = leaves.find(l => l.id === id);
    if (!request) return;
    setLeaves(prev => prev.map(l => l.id === id ? { ...l, status: 'Rejected', feedback } : l));
    logActivity('leave', request.employeeName, `leave rejected for ${request.startDate}`, 'error');
  };

  const handleUpdateEmployeeSalary = (id: string, annualSalary: number) => {
    setEmployees(prev => prev.map(emp => emp.id === id ? { ...emp, salary: annualSalary } : emp));
    const target = employees.find(e => e.id === id);
    if (target) {
      logActivity('payroll', target.fullName, `salary updated to $${annualSalary.toLocaleString()}`, 'info');
    }
  };

  const handleApplyLeave = (requestData: Omit<LeaveRequest, 'id' | 'employeeName' | 'department' | 'dateApplied'>) => {
    const mapped: LeaveRequest = {
      ...requestData,
      id: `lv-${Date.now()}`,
      employeeName: user?.fullName || 'Unknown',
      department: employees.find(e => e.id === requestData.employeeId)?.department || 'General',
      dateApplied: new Date().toISOString().split('T')[0]
    };
    setLeaves(prev => [mapped, ...prev]);
    logActivity('leave', mapped.employeeName, `applied for ${mapped.type}`, 'warning');
  };

  const handleClockIn = () => {
    if (!user || !user.employeeId) return;
    const today = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    const localRecord: AttendanceRecord = {
      id: `att-portal-${Date.now()}`,
      employeeId: user.employeeId,
      date: today,
      status: 'Present',
      checkIn: nowTimeStr,
      checkOut: null
    };
    setAttendance(prev => {
      const filtered = prev.filter(r => !(r.employeeId === user.employeeId && r.date === today));
      return [...filtered, localRecord];
    });
    logActivity('attendance', user.fullName, 'clocked in', 'success');
    showToast(`Clock-in recorded at ${nowTimeStr}!`);
  };

  const handleClockOut = () => {
    if (!user || !user.employeeId) return;
    const today = new Date().toISOString().split('T')[0];
    const nowTimeStr = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    setAttendance(prev => prev.map(rec => {
      if (rec.employeeId === user.employeeId && rec.date === today) {
        return { ...rec, checkOut: nowTimeStr };
      }
      return rec;
    }));
    logActivity('attendance', user.fullName, 'clocked out', 'info');
    showToast(`Clock-out recorded at ${nowTimeStr}!`);
  };

  const today = new Date().toISOString().split('T')[0];
  const userEmployeeObj = user && user.email ? employees.find(e => e.email === user.email) : null;
  const todayAttendanceObj = userEmployeeObj 
  ? attendance.find(r => r.employeeId === userEmployeeObj.id && r.date === today) 
  : undefined;
  const isClockedIn = todayAttendanceObj ? (todayAttendanceObj.status === 'Present' || todayAttendanceObj.status === 'Late') : false;

  return (
    <div id="ems-container" className="min-h-screen bg-[#F7F9FB] flex">
      {toast && (
        <div className={`fixed bottom-8 right-8 z-[200] max-w-sm px-6 py-4 rounded-2xl shadow-2xl border flex items-center gap-3.5 text-white ${
          toast.isError ? 'bg-rose-900/90 border-rose-500' : 'bg-[#091426] border-slate-700'
        }`}>
          {toast.isError ? (
            <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          )}
          <div>
            <p className="text-xs font-bold">{toast.isError ? 'Error' : 'Success'}</p>
            <p className="text-[11px] text-slate-300 mt-0.5">{toast.message}</p>
          </div>
        </div>
      )}

      {currentTab === 'login' || !user ? (
        <div className="w-full">
          <LoginForm employees={employees} onLogin={handleLogin} />
        </div>
      ) : (
        <>
          <Sidebar 
            currentTab={currentTab} 
            onChangeTab={setCurrentTab} 
            user={user} 
            onLogout={handleLogout}
            onQuickAdd={currentTab === 'directory' ? () => {
              const btn = document.getElementById('add-emp-btn');
              if (btn) btn.click();
            } : undefined}
          />

          <div className="flex-1 ml-[260px] min-h-screen flex flex-col">
            <header className="h-16 flex justify-between items-center px-8 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm print:hidden">
              <span className="text-sm font-bold text-[#091426] font-display">
                {user.role === 'Admin' ? 'Enterprise Administration Console' : 'Employee Workspace'}
              </span>
              <div className="flex items-center gap-6 text-slate-500">
                {user.role === 'Employee' && (
                  <button 
                    onClick={isClockedIn ? handleClockOut : handleClockIn}
                    className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                      isClockedIn 
                        ? 'bg-rose-50 border border-rose-200 text-rose-700 hover:bg-rose-100'
                        : 'bg-[#2170e4] hover:bg-[#1a5cbd] text-white shadow-sm'
                    }`}
                  >
                    {isClockedIn ? 'Clock Out' : 'Clock In'}
                  </button>
                )}
                <div className="h-5 w-[1px] bg-slate-200" />
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <p className="text-xs font-bold text-[#091426] leading-none">{user.fullName}</p>
                    <p className="text-[10px] text-[#8590a6] uppercase tracking-wider font-semibold mt-1">{user.role}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-500 text-xs font-bold">
                    {user.fullName.split(' ').map(n => n[0]).join('')}
                  </div>
                </div>
              </div>
            </header>

            <main className="flex-1 p-8 overflow-y-auto max-w-[1440px] mx-auto w-full">
              {currentTab === 'dashboard' && user.role === 'Admin' && (
                <AdminDashboard 
                  employees={employees} 
                  leaves={leaves} 
                  milestones={milestones}
                  activities={activities}
                  onNavigate={setCurrentTab}
                />
              )}
              {currentTab === 'directory' && user.role === 'Admin' && (
                <DirectoryView 
                  employees={employees}
                  onAddEmployee={handleAddEmployee}
                  onUpdateEmployee={handleUpdateEmployee}
                  onDeleteEmployee={handleDeleteEmployee}
                  onShowToast={showToast}
                />
              )}
              {currentTab === 'attendance' && user.role === 'Admin' && (
                <AttendanceView 
                  employees={employees}
                  attendanceRecords={attendance}
                  onUpdateAttendance={handleUpdateAttendanceList}
                  onShowToast={showToast}
                />
              )}
              {currentTab === 'leaves' && user.role === 'Admin' && (
                <LeaveView 
                  leaves={leaves}
                  onApproveLeave={handleApproveLeave}
                  onRejectLeave={handleRejectLeave}
                  onShowToast={showToast}
                />
              )}
              {currentTab === 'payroll' && user.role === 'Admin' && (
                <PayrollAndProfileView 
                  employees={employees}
                  payments={payments}
                  onUpdateEmployeeSalary={handleUpdateEmployeeSalary}
                  onShowToast={showToast}
                />
              )}
              {currentTab === 'emp_dashboard' && user.role === 'Employee' && userEmployeeObj && (
                <EmployeeDashboard 
                  userEmployee={userEmployeeObj}
                  todayAttendance={todayAttendanceObj}
                  leaves={leaves}
                  onClockIn={handleClockIn}
                  onClockOut={handleClockOut}
                  onApplyLeave={handleApplyLeave}
                  onShowToast={showToast}
                />
              )}
              {currentTab === 'emp_attendance' && user.role === 'Employee' && userEmployeeObj && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-2xl font-bold text-[#091426] tracking-tight font-headline">My Attendance</h3>
                    <p className="text-xs text-slate-500">Monitor your clock-in records.</p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Today's Status</h4>
                      {isClockedIn ? (
                        <div className="bg-emerald-50 border border-emerald-100 text-emerald-800 p-4 rounded-xl text-xs space-y-1.5 font-medium">
                          <p className="font-bold text-emerald-700">✓ Clocked In</p>
                          <p>Check-in: {todayAttendanceObj?.checkIn}</p>
                          {todayAttendanceObj?.checkOut && <p>Check-out: {todayAttendanceObj.checkOut}</p>}
                        </div>
                      ) : (
                        <div className="bg-rose-50 border border-rose-100 text-rose-800 p-4 rounded-xl text-xs font-medium">
                          No attendance record for today yet.
                        </div>
                      )}
                    </div>
                    <div className="bg-white p-6 border border-slate-200 rounded-2xl shadow-sm">
                      <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">This Month</h4>
                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between font-medium">
                          <span className="text-slate-500">Scheduled Hours:</span>
                          <span className="font-bold">40 hrs / week</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              {currentTab === 'emp_leaves' && user.role === 'Employee' && userEmployeeObj && (
                <EmployeeDashboard 
                  userEmployee={userEmployeeObj}
                  todayAttendance={todayAttendanceObj}
                  leaves={leaves}
                  onClockIn={handleClockIn}
                  onClockOut={handleClockOut}
                  onApplyLeave={handleApplyLeave}
                  onShowToast={showToast}
                />
              )}
              {currentTab === 'emp_payroll' && user.role === 'Employee' && userEmployeeObj && (
                <PayrollAndProfileView 
                  employees={employees}
                  payments={payments}
                  onUpdateEmployeeSalary={handleUpdateEmployeeSalary}
                  onShowToast={showToast}
                  defaultEmployeeId={userEmployeeObj.id}
                />
              )}
            </main>

            <footer className="py-6 text-center border-t border-slate-200 bg-white/60 text-[10px] text-slate-400 uppercase tracking-wide print:hidden">
              © {new Date().getFullYear()} EMS. All rights reserved.
            </footer>
          </div>
        </>
      )}
    </div>
  );
}