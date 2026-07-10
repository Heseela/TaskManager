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
  previousTaskDescription: string;
  hoursWorked: number;
  challenges: string;
  tomorrowPlan: string[];
  status: 'pending' | 'submitted' | 'reviewed';
  submittedAt: string;
  subUnit?: string;
  department?: string;
  userSubUnit?: string;
  fileAttachments?: FileAttachment[]
}

export interface FileAttachment {
  id: number;
  reportId: number;
  name: string;
  url: string;
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
  category?: CategoryTable;
}

export type DepartmentType = string;
export type SubUnitType = string;
export type CategoryTable = string;

export interface Department {
  ID: number;
  DepName: string;
  DepCode: string;
}

export interface SubUnit {
  ID: number;
  DepID: string;
  SubUnit: SubUnitType;
}

export interface DailyReport extends Report { }

