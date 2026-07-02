export interface User {
  id: number;
  email: string;
  name: string;
  password: string;
  role: 'supervisor' | 'employee';
  department: DepartmentType;
  subUnit?: SubUnitType;
}

export interface Report {
  id: number;
  userId: number;
  userName: string;
  date: string;
  tasks: string[];
  taskDescription: string;
  hoursWorked: number;
  challenges: string;
  tomorrowPlan: string[];
  status: 'pending' | 'submitted' | 'reviewed';
  submittedAt: string;
  subUnit?: string; 
  department?: string; // for supervisor view
  userSubUnit?: string; // for supervisor view
}

export interface Task {
  id: number;
  title: string;
  description: string;
  assignedBy: number;
  assignedTo: number;
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
  id: number;
  name: string;
  email: string;
  role: 'supervisor' | 'employee';
  department: DepartmentType;
  subUnit?: SubUnitType;
}

export type DepartmentType = 'IT';

export interface Department {
  ID: number;
  DepName: string;
  DepCode: string;
}

export interface SubUnit {
  ID: number;
  DepID: number;
  SubUnit: SubUnitType;
}

export type SubUnitType = 
  | 'Developer' 
  | 'Network' 
  | 'Support' 
  | 'Infra' 
  | 'CBS'
  | 'CTO';


export interface TaskCategoryDB {
  ID: number;
  SubUnitID: number;
  CategoryName: TaskCategory;
  CreatedAt: string;
}

export interface SubUnitWithCategories {
  ID: number;
  SubUnit: SubUnitType;
  Categories: TaskCategory[];
}

export type TaskCategory = 
  | 'PRTG Scan' 
  | 'Network Policy' 
  | 'Internet Allow' 
  | 'Server Network Configuration'
  | 'Application Development' 
  | 'Database' 
  | 'Query' 
  | 'App/Db Server Monitor' 
  | 'Email Job for Report'
  | 'Printer Setup' 
  | 'User Access' 
  | 'PC Setup' 
  | 'Email Setup' 
  | 'Camera Monitoring' 
  | 'Domain Setup'
  | 'Server Setup' 
  | 'VMware Monitoring' 
  | 'Server Hardening' 
  | 'DCIM Monitoring'
  | 'Pumori' 
  | 'CBS Configuration' 
  | 'CBS Monitoring'
  | 'Tech Support'
  | 'Hardware Setup'
  | 'Data Reconciliation'
  | 'Report Generation';

export const DEPARTMENTS = ['IT'] as const;

export const SUB_UNITS_BY_DEPARTMENT: Record<DepartmentType, SubUnitType[]> = {
  IT: ['Developer', 'Network', 'Support', 'Infra', 'CBS']
};

export const TASK_CATEGORIES_BY_SUB_UNIT: Record<SubUnitType, TaskCategory[]> = {
  'Network': ['PRTG Scan', 'Network Policy', 'Internet Allow', 'Server Network Configuration'],
  'Developer': ['Application Development', 'Database', 'Query', 'App/Db Server Monitor', 'Email Job for Report'],
  'Support': ['Printer Setup', 'User Access', 'PC Setup', 'Email Setup', 'Camera Monitoring', 'Domain Setup'],
  'Infra': ['Server Setup', 'VMware Monitoring', 'Server Hardening', 'DCIM Monitoring'],
  'CBS': ['Pumori', 'CBS Configuration', 'CBS Monitoring'],
  'CTO': []
};

export interface DailyReport extends Report {}
export interface AuthResponse {
  user: SafeUser | null;
  error?: string;
}

export interface SystemStats {
  totalUsers: number;
  totalTasks: number;
  totalReports: number;
  totalDepartments: number;
  totalSubUnits: number;
  activeUsers: number;
  tasksByStatus: {
    pending: number;
    'in-progress': number;
    completed: number;
  };
  reportsByStatus: {
    pending: number;
    submitted: number;
    reviewed: number;
  };
}