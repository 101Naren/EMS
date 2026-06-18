import { Employee, AttendanceRecord, LeaveRequest, PaymentDetails, Milestone, ActivityLog } from './types';

export const INITIAL_EMPLOYEES: Employee[] = [];

export const INITIAL_ATTENDANCE: AttendanceRecord[] = [];

export const INITIAL_LEAVES: LeaveRequest[] = [];

export const INITIAL_PAYMENTS: PaymentDetails[] = [];

export const INITIAL_MILESTONES: Milestone[] = [
  {
    id: "ms-1",
    title: "Company Anniversary Party",
    date: "Tomorrow",
    time: "4:00 PM",
    icon: "celebration",
    description: "Annual corporate milestone celebration."
  },
  {
    id: "ms-2",
    title: "Performance Review Cycle",
    date: "Starts in 3 days",
    icon: "work",
    description: "Bi-annual review submissions and feedback syncs."
  }
];

export const INITIAL_ACTIVITIES: ActivityLog[] = [];

// LocalStorage Helper functions
export function getSavedData<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(`hr_nexus_${key}`);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.error(`Error loading state ${key}`, e);
    return defaultValue;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(`hr_nexus_${key}`, JSON.stringify(value));
  } catch (e) {
    console.error(`Error saving state ${key}`, e);
  }
}