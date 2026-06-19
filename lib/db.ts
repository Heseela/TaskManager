import { User, Report, Task, DepartmentType, SubUnitType } from '@/types';

const users: User[] = [
  {
    id: '1',
    email: 'supervisor@company.com',
    name: 'Supervisor User',
    password: 'demo123',
    role: 'supervisor',
    department: 'IT',
    subUnit: 'Developer'
  },
  {
    id: '2',
    email: 'employee@company.com',
    name: 'Employee1',
    password: 'demo123',
    role: 'employee',
    department: 'IT',
    subUnit: 'Network'
  },
  {
    id: '3',
    email: 'employee2@company.com',
    name: 'Employee2',
    password: 'demo123',
    role: 'employee',
    department: 'IT',
    subUnit: 'Developer'
  },
  {
    id: '4',
    email: 'employee3@company.com',
    name: 'Employee3',
    password: 'demo123',
    role: 'employee',
    department: 'IT',
    subUnit: 'Support'
  },
  {
    id: '5',
    email: 'employee4@company.com',
    name: 'Employee4',
    password: 'demo123',
    role: 'employee',
    department: 'IT',
    subUnit: 'Infra'
  }
];

const reports: Report[] = [];
const tasks: Task[] = [];

export const db = {
  getUser: async (email: string) => {
    return users.find(u => u.email === email);
  },
  
  getUserById: async (id: string) => {
    return users.find(u => u.id === id);
  },
  
  createUser: async (userData: Omit<User, 'id'> & { id: string }) => {
    const newUser = { ...userData };
    users.push(newUser);
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword;
  },
  
  getAllEmployees: async () => {
    return users
      .filter(u => u.role === 'employee')
      .map(({ password, ...user }) => user);
  },
  
  getEmployeesByDepartment: async (department: DepartmentType) => {
    return users
      .filter(u => u.role === 'employee' && u.department === department)
      .map(({ password, ...user }) => user);
  },
  
  getReportById: async (id: string) => {
    return reports.find(r => r.id === id);
  },
  
  getReportsByUser: async (userId: string) => {
    return reports.filter(r => r.userId === userId);
  },
  
  getAllReports: async () => {
    return reports;
  },
  
  createReport: async (reportData: Omit<Report, 'id'>) => {
    const newReport = {
      ...reportData,
      id: Date.now().toString(),
    };
    reports.unshift(newReport);
    return newReport;
  },
  
  updateReport: async (id: string, updates: Partial<Report>) => {
    const index = reports.findIndex(r => r.id === id);
    if (index !== -1) {
      reports[index] = { ...reports[index], ...updates };
      return reports[index];
    }
    return null;
  },

  getAllTasks: async () => {
    return tasks;
  },

  getTasksByEmployee: async (employeeId: string) => {
    return tasks.filter(t => t.assignedTo === employeeId);
  },

  getTasksBySupervisor: async (supervisorId: string) => {
    return tasks.filter(t => t.assignedBy === supervisorId);
  },
  
  getTasksByDepartment: async (department: DepartmentType) => {
    const departmentEmployees = users
      .filter(u => u.role === 'employee' && u.department === department)
      .map(u => u.id);
    return tasks.filter(t => departmentEmployees.includes(t.assignedTo));
  },

  createTask: async (taskData: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newTask = {
      ...taskData,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    tasks.unshift(newTask);
    return newTask;
  },

  updateTask: async (id: string, updates: Partial<Task>) => {
    const index = tasks.findIndex(t => t.id === id);
    if (index !== -1) {
      tasks[index] = { 
        ...tasks[index], 
        ...updates, 
        updatedAt: new Date().toISOString() 
      };
      return tasks[index];
    }
    return null;
  },

  getTaskById: async (id: string) => {
    return tasks.find(t => t.id === id);
  },
  
  // New: Get tasks by category
  getTasksByCategory: async (category: Task['category']) => {
    return tasks.filter(t => t.category === category);
  }
};