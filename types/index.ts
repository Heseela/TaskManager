export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: 'supervisor' | 'employee';
  department: DepartmentType;
  subUnit?: SubUnitType;
}

export interface Report {
  id: string;
  userId: string;
  userName: string;
  date: string;
  tasks: string[];
  taskDescription: string;
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
  category?: TaskCategory;
}

export interface SafeUser {
  id: string;
  name: string;
  email: string;
  role: 'supervisor' | 'employee';
  department: DepartmentType;
  subUnit?: SubUnitType;
}

export type DepartmentType = 'IT';

export type SubUnitType = 
  | 'Developer' 
  | 'Network' 
  | 'Support' 
  | 'Infra' 
  | 'CBS';

export type TaskCategory = 
  // Network
  | 'PRTG Scan' 
  | 'Network Policy' 
  | 'Internet Allow' 
  | 'Server Network Configuration'

  // Developer
  | 'Application Development' 
  | 'Database' 
  | 'Query' 
  | 'App/Db Server Monitor' 
  | 'Email Job for Report'

  // Support
  | 'Printer Setup' 
  | 'User Access' 
  | 'PC Setup' 
  | 'Email Setup' 
  | 'Camera Monitoring' 
  | 'Domain Setup'

  // Infra
  | 'Server Setup' 
  | 'VMware Monitoring' 
  | 'Server Hardening' 
  | 'DCIM Monitoring'
  
  // CBS
  | 'Pumori' 
  | 'CBS Configuration' 
  | 'CBS Monitoring';

export const DEPARTMENTS = ['IT'] as const;

export const SUB_UNITS_BY_DEPARTMENT: Record<DepartmentType, SubUnitType[]> = {
  IT: ['Developer', 'Network', 'Support', 'Infra', 'CBS']
};

export const TASK_CATEGORIES_BY_SUB_UNIT: Record<SubUnitType, TaskCategory[]> = {
  'Network': ['PRTG Scan', 'Network Policy', 'Internet Allow', 'Server Network Configuration'],
  'Developer': ['Application Development', 'Database', 'Query', 'App/Db Server Monitor', 'Email Job for Report'],
  'Support': ['Printer Setup', 'User Access', 'PC Setup', 'Email Setup', 'Camera Monitoring', 'Domain Setup'],
  'Infra': ['Server Setup', 'VMware Monitoring', 'Server Hardening', 'DCIM Monitoring'],
  'CBS': ['Pumori', 'CBS Configuration', 'CBS Monitoring']
};

export interface DailyReport extends Report {}
export interface AuthResponse {
  user: SafeUser | null;
  error?: string;
}