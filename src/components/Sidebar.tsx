import { 
  LayoutDashboard, 
  Users, 
  CalendarCheck, 
  CalendarX, 
  FileText, 
  Building2, 
  Settings, 
  HelpCircle, 
  Plus, 
  LogOut, 
  User 
} from 'lucide-react';
import { UserSession } from '../types';

interface SidebarProps {
  currentTab: string;
  onChangeTab: (tab: string) => void;
  user: UserSession;
  onLogout: () => void;
  onQuickAdd?: () => void;
}

export default function Sidebar({ currentTab, onChangeTab, user, onLogout, onQuickAdd }: SidebarProps) {
  const isAdmin = user.role === 'Admin';
  
  const navItems = isAdmin ? [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'directory', label: 'Directory', icon: Users },
    { id: 'attendance', label: 'Attendance', icon: CalendarCheck },
    { id: 'leaves', label: 'Leaves', icon: CalendarX },
    { id: 'payroll', label: 'Payroll', icon: FileText }
  ] : [
    { id: 'emp_dashboard', label: 'My Dashboard', icon: LayoutDashboard },
    { id: 'emp_attendance', label: 'Log Attendance', icon: CalendarCheck },
    { id: 'emp_leaves', label: 'My Time Off', icon: CalendarX },
    { id: 'emp_payroll', label: 'My Payroll', icon: FileText }
  ];

  return (
    <aside id="sidebar" className="fixed left-0 top-0 bottom-0 flex flex-col h-full w-[260px] bg-[#091426] border-r border-slate-800 z-50">
      {/* Brand Header */}
      <div className="px-6 py-8">
        <h1 className="text-2xl font-bold tracking-tight text-white mb-1 font-headline">EMS</h1>
        <p className="text-[10px] font-semibold text-[#8590a6] uppercase tracking-widest">
          {isAdmin ? 'Enterprise Admin' : 'Employee Access'}
        </p>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          
          return (
            <button
              id={`nav-link-${item.id}`}
              key={item.id}
              onClick={() => onChangeTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 cursor-pointer ${
                isActive 
                  ? 'border-l-4 border-[#2170e4] bg-slate-800 text-white font-semibold' 
                  : 'text-[#8590a6] hover:bg-slate-800/50 hover:text-white'
              }`}
            >
              <IconComponent className={`w-5 h-5 ${isActive ? 'text-[#2170e4]' : 'text-slate-400'}`} />
              <span className="font-sans text-xs tracking-wide">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* CTA & Footer */}
      <div className="p-4 border-t border-slate-800/60 space-y-4">
        {isAdmin && onQuickAdd && (
          <button 
            id="quick-add-btn"
            onClick={onQuickAdd}
            className="w-full flex items-center justify-center gap-2 bg-[#2170e4] hover:bg-[#1a5cbd] text-white py-3 px-4 rounded-xl font-bold text-xs tracking-wider transition-all duration-150 active:scale-95 shadow-md hover:cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Quick Add Employee
          </button>
        )}

        <div className="space-y-1">
          <div className="flex items-center gap-3 px-4 py-2 text-xs text-slate-400">
            <User className="w-4 h-4 text-slate-400" />
            <div className="truncate flex-1">
              <p className="text-white font-medium text-[11px] truncate">{user.fullName}</p>
              <p className="text-[9px] text-[#8590a6] truncate">{user.email}</p>
            </div>
          </div>

          <button
            id="logout-btn"
            onClick={onLogout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-xs font-semibold text-slate-400 hover:text-rose-400 hover:bg-rose-900/10 transition-colors hover:cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </aside>
  );
}
