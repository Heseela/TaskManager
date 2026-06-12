export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'supervisor' | 'employee';
  department?: string;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  date: string;
  tasks: string[];
  hoursWorked: number;
  challenges: string;
  tomorrowPlan: string[];
  status: 'pending' | 'submitted' | 'reviewed';
  submittedAt: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  assignedBy: string; 
  assignedTo: string; 
  assignedToName: string;
  assignedByName: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: 'supervisor' | 'employee';
  department?: string;
}

export interface DailyReport extends Report {}

export interface AuthResponse {
  user: SafeUser | null;
  error?: string;
}

export const DEPARTMENTS = [
  'Engineering',
  'Design',
  'Product',
  'Marketing',
  'Sales',
  'HR',
  'Finance',
  'Operations'
] as const;

export type Department = typeof DEPARTMENTS[number];