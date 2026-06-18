export type RoleType = 'Admin' | 'Employee' | 'Manager';
export type EmployeeStatus = 'Active' | 'On Leave' | 'Terminated';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';
export type LeaveType = 'Vacation' | 'Sick Leave' | 'Personal' | 'Maternity' | 'Other';
export type AttendanceStatus = 'Present' | 'Absent' | 'Late' | 'Half Day';

export interface Employee {
  id: string; // e.g. "EMP-0142"
  fullName: string;
  email: string;
  department: string;
  role: RoleType;
  status: EmployeeStatus;
  salary: number; // annual
  joinDate: string;
  profilePhoto?: string; // photo data url or stock unsplash url
  phone?: string;
  address?: string;
  reportingManager?: string;
}

export interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string; // YYYY-MM-DD
  status: AttendanceStatus;
  checkIn: string | null; // e.g. "08:52 AM"
  checkOut: string | null; // e.g. "05:30 PM"
}

export interface LeaveRequest {
  id: string;
  employeeId: string;
  employeeName: string;
  department: string;
  type: LeaveType;
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  duration: number; // in days
  reason: string;
  status: LeaveStatus;
  dateApplied: string; // YYYY-MM-DD
  feedback?: string;
}

export interface PaymentDetails {
  id: string;
  employeeId: string;
  paymentDate: string; // YYYY-MM-DD
  referenceId: string; // e.g. "#PAY-0294-X"
  type: 'Monthly Salary' | 'Performance Bonus' | 'Allowance' | 'Commission';
  baseSalary: number; // monthly
  taxFederal: number;
  taxState: number;
  benefits: number;
  netPay: number;
  status: 'Released' | 'Pending';
  payPeriod: string; // e.g. "October 2023"
}

export interface UserSession {
  email: string;
  fullName: string;
  role: 'Admin' | 'Employee';
  employeeId?: string; // links to corresponding Employee if role is 'Employee'
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  time?: string;
  icon: 'celebration' | 'work' | 'event';
  description: string;
}

export interface ActivityLog {
  id: string;
  type: 'attendance' | 'leave' | 'join' | 'payroll';
  employeeName: string;
  details: string;
  timestamp: string; // e.g. "2 minutes ago" or "Oct 24, 10:15 AM"
  status: 'success' | 'warning' | 'info' | 'error';
}
