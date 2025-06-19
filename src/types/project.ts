export interface Task {
  id: string;
  name: string;
  duration: number; // en jours
  startDate: Date;
  endDate: Date;
  dependencies: string[];
  progress: number; // 0-100
  assignee: string;
  priority: 'faible' | 'moyenne' | 'élevée' | 'critique';
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  tasks: Task[];
}

export interface PertNode {
  id: string;
  taskId: string;
  x: number;
  y: number;
  earliestStart: number;
  latestStart: number;
  earliestFinish: number;
  latestFinish: number;
  slack: number;
  isCritical: boolean;
}

export interface PertEdge {
  from: string;
  to: string;
  isCritical: boolean;
}