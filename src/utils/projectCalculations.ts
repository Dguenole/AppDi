import { Task, PertNode, PertEdge } from '../types/project';

export function calculateCriticalPath(tasks: Task[]): { nodes: PertNode[], edges: PertEdge[] } {
  // Créer une carte des tâches pour une recherche facile
  const taskMap = new Map(tasks.map(task => [task.id, task]));
  
  // Calculer le passage avant (temps de début/fin au plus tôt)
  const nodes: PertNode[] = [];
  const processedTasks = new Set<string>();
  
  function calculateEarliestTimes(taskId: string): { start: number, finish: number } {
    if (processedTasks.has(taskId)) {
      const node = nodes.find(n => n.taskId === taskId);
      return { start: node!.earliestStart, finish: node!.earliestFinish };
    }
    
    const task = taskMap.get(taskId)!;
    let earliestStart = 0;
    
    // Calculer basé sur les dépendances
    for (const depId of task.dependencies) {
      const depTimes = calculateEarliestTimes(depId);
      earliestStart = Math.max(earliestStart, depTimes.finish);
    }
    
    const earliestFinish = earliestStart + task.duration;
    
    nodes.push({
      id: taskId,
      taskId,
      x: 0, // Sera positionné plus tard
      y: 0,
      earliestStart,
      latestStart: 0, // Sera calculé dans le passage arrière
      earliestFinish,
      latestFinish: 0,
      slack: 0,
      isCritical: false
    });
    
    processedTasks.add(taskId);
    return { start: earliestStart, finish: earliestFinish };
  }
  
  // Traiter toutes les tâches
  tasks.forEach(task => calculateEarliestTimes(task.id));
  
  // Trouver le temps de fin du projet
  const projectEnd = Math.max(...nodes.map(n => n.earliestFinish));
  
  // Passage arrière (temps de début/fin au plus tard)
  const backwardProcessed = new Set<string>();
  
  function calculateLatestTimes(taskId: string): { start: number, finish: number } {
    if (backwardProcessed.has(taskId)) {
      const node = nodes.find(n => n.taskId === taskId)!;
      return { start: node.latestStart, finish: node.latestFinish };
    }
    
    const task = taskMap.get(taskId)!;
    const node = nodes.find(n => n.taskId === taskId)!;
    
    // Trouver les tâches qui dépendent de celle-ci
    const dependentTasks = tasks.filter(t => t.dependencies.includes(taskId));
    
    let latestFinish = projectEnd;
    if (dependentTasks.length > 0) {
      latestFinish = Math.min(...dependentTasks.map(t => {
        const depTimes = calculateLatestTimes(t.id);
        return depTimes.start;
      }));
    }
    
    const latestStart = latestFinish - task.duration;
    
    node.latestStart = latestStart;
    node.latestFinish = latestFinish;
    node.slack = latestStart - node.earliestStart;
    node.isCritical = node.slack === 0;
    
    backwardProcessed.add(taskId);
    return { start: latestStart, finish: latestFinish };
  }
  
  // Traiter toutes les tâches en arrière
  tasks.forEach(task => calculateLatestTimes(task.id));
  
  // Créer les arêtes
  const edges: PertEdge[] = [];
  tasks.forEach(task => {
    task.dependencies.forEach(depId => {
      const fromNode = nodes.find(n => n.taskId === depId);
      const toNode = nodes.find(n => n.taskId === task.id);
      if (fromNode && toNode) {
        edges.push({
          from: depId,
          to: task.id,
          isCritical: fromNode.isCritical && toNode.isCritical
        });
      }
    });
  });
  
  // Positionner les nœuds pour la visualisation
  positionNodes(nodes, edges);
  
  return { nodes, edges };
}

function positionNodes(nodes: PertNode[], edges: PertEdge[]) {
  const levels = new Map<string, number>();
  
  // Calculer les niveaux (tri topologique)
  function calculateLevel(nodeId: string): number {
    if (levels.has(nodeId)) {
      return levels.get(nodeId)!;
    }
    
    const incomingEdges = edges.filter(e => e.to === nodeId);
    if (incomingEdges.length === 0) {
      levels.set(nodeId, 0);
      return 0;
    }
    
    const maxParentLevel = Math.max(...incomingEdges.map(e => calculateLevel(e.from)));
    const level = maxParentLevel + 1;
    levels.set(nodeId, level);
    return level;
  }
  
  nodes.forEach(node => calculateLevel(node.id));
  
  // Grouper les nœuds par niveau
  const nodesByLevel = new Map<number, PertNode[]>();
  nodes.forEach(node => {
    const level = levels.get(node.id)!;
    if (!nodesByLevel.has(level)) {
      nodesByLevel.set(level, []);
    }
    nodesByLevel.get(level)!.push(node);
  });
  
  // Positionner les nœuds
  const levelWidth = 200;
  const nodeHeight = 80;
  
  nodesByLevel.forEach((levelNodes, level) => {
    levelNodes.forEach((node, index) => {
      node.x = level * levelWidth + 100;
      node.y = (index - (levelNodes.length - 1) / 2) * nodeHeight + 300;
    });
  });
}

export function getProjectProgress(tasks: Task[]): number {
  if (tasks.length === 0) return 0;
  return tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length;
}

export function getTasksByPriority(tasks: Task[]) {
  return {
    critique: tasks.filter(t => t.priority === 'critique').length,
    élevée: tasks.filter(t => t.priority === 'élevée').length,
    moyenne: tasks.filter(t => t.priority === 'moyenne').length,
    faible: tasks.filter(t => t.priority === 'faible').length,
  };
}