import { User, Report, Task } from '@/types';

const users: User[] = [
  {
    id: '1',
    email: 'supervisor@company.com',
    name: 'Supervisor User',
    password: 'demo123',
    role: 'supervisor',
    department: 'Management'
  },
  {
    id: '2',
    email: 'employee@company.com',
    name: 'Employee1',
    password: 'demo123',
    role: 'employee',
    department: 'Engineering'
  },
  {
    id: '3',
    email: 'employee2@company.com',
    name: 'Employee2',
    password: 'demo123',
    role: 'employee',
    department: 'Engineering'
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
  }
};