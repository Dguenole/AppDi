import React, { useState } from 'react';
import { Task } from '../types/project';
import { Plus, X, Calendar, Clock, Users, Flag, ArrowRight, Save } from 'lucide-react';

interface ProjectCreatorProps {
  onProjectCreate: (projectData: { name: string; description: string; tasks: Task[] }) => void;
  onCancel: () => void;
}

export default function ProjectCreator({ onProjectCreate, onCancel }: ProjectCreatorProps) {
  const [projectName, setProjectName] = useState('');
  const [projectDescription, setProjectDescription] = useState('');
  const [tasks, setTasks] = useState<Omit<Task, 'id' | 'endDate'>[]>([]);
  const [currentTask, setCurrentTask] = useState({
    name: '',
    duration: 1,
    startDate: new Date().toISOString().split('T')[0],
    dependencies: [] as string[],
    progress: 0,
    assignee: '',
    priority: 'moyenne' as const,
    description: ''
  });

  const addTask = () => {
    if (currentTask.name.trim()) {
      const newTask = {
        ...currentTask,
        startDate: new Date(currentTask.startDate),
        id: Date.now().toString()
      };
      setTasks([...tasks, newTask]);
      setCurrentTask({
        name: '',
        duration: 1,
        startDate: new Date().toISOString().split('T')[0],
        dependencies: [],
        progress: 0,
        assignee: '',
        priority: 'moyenne',
        description: ''
      });
    }
  };

  const removeTask = (index: number) => {
    const newTasks = tasks.filter((_, i) => i !== index);
    setTasks(newTasks);
  };

  const handleDependencyChange = (taskIndex: number, dependencies: string[]) => {
    const newTasks = [...tasks];
    newTasks[taskIndex] = { ...newTasks[taskIndex], dependencies };
    setTasks(newTasks);
  };

  const calculateTaskDates = (tasksData: Omit<Task, 'id' | 'endDate'>[]) => {
    const taskMap = new Map();
    const calculatedTasks: Task[] = [];

    // Première passe : créer les tâches avec dates de base
    tasksData.forEach((task, index) => {
      const taskWithId: Task = {
        ...task,
        id: (index + 1).toString(),
        endDate: new Date(task.startDate.getTime() + task.duration * 24 * 60 * 60 * 1000)
      };
      taskMap.set(taskWithId.id, taskWithId);
      calculatedTasks.push(taskWithId);
    });

    // Deuxième passe : ajuster les dates selon les dépendances
    const adjustDates = (taskId: string, visited = new Set()): Date => {
      if (visited.has(taskId)) return new Date(); // Éviter les cycles
      visited.add(taskId);

      const task = taskMap.get(taskId);
      if (!task) return new Date();

      let latestEndDate = new Date(task.startDate);

      // Vérifier toutes les dépendances
      for (const depId of task.dependencies) {
        const depIndex = parseInt(depId) - 1;
        if (depIndex >= 0 && depIndex < calculatedTasks.length) {
          const depTask = calculatedTasks[depIndex];
          const depEndDate = adjustDates(depTask.id, visited);
          if (depEndDate > latestEndDate) {
            latestEndDate = depEndDate;
          }
        }
      }

      // Ajuster la date de début si nécessaire
      if (latestEndDate > task.startDate) {
        task.startDate = new Date(latestEndDate);
      }

      // Recalculer la date de fin
      task.endDate = new Date(task.startDate.getTime() + task.duration * 24 * 60 * 60 * 1000);
      
      return task.endDate;
    };

    // Ajuster toutes les tâches
    calculatedTasks.forEach(task => adjustDates(task.id));

    return calculatedTasks;
  };

  const handleCreateProject = () => {
    if (projectName.trim() && tasks.length > 0) {
      const calculatedTasks = calculateTaskDates(tasks);
      onProjectCreate({
        name: projectName,
        description: projectDescription,
        tasks: calculatedTasks
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critique': return 'text-red-600 bg-red-50 border-red-200';
      case 'élevée': return 'text-orange-600 bg-orange-50 border-orange-200';
      case 'moyenne': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'faible': return 'text-green-600 bg-green-50 border-green-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-800">Créer un nouveau projet</h1>
            <button
              onClick={onCancel}
              className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Informations du projet */}
          <div className="mb-8 p-6 bg-blue-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Informations du projet</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du projet *
                </label>
                <input
                  type="text"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Saisir le nom du projet"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Description du projet"
                />
              </div>
            </div>
          </div>

          {/* Ajout de tâche */}
          <div className="mb-8 p-6 bg-green-50 rounded-lg">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Ajouter une tâche</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom de la tâche *
                </label>
                <input
                  type="text"
                  value={currentTask.name}
                  onChange={(e) => setCurrentTask({ ...currentTask, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom de la tâche"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Durée (jours) *
                </label>
                <input
                  type="number"
                  value={currentTask.duration}
                  onChange={(e) => setCurrentTask({ ...currentTask, duration: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de début
                </label>
                <input
                  type="date"
                  value={currentTask.startDate}
                  onChange={(e) => setCurrentTask({ ...currentTask, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priorité
                </label>
                <select
                  value={currentTask.priority}
                  onChange={(e) => setCurrentTask({ ...currentTask, priority: e.target.value as any })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="faible">Faible</option>
                  <option value="moyenne">Moyenne</option>
                  <option value="élevée">Élevée</option>
                  <option value="critique">Critique</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assigné à
                </label>
                <input
                  type="text"
                  value={currentTask.assignee}
                  onChange={(e) => setCurrentTask({ ...currentTask, assignee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Nom de la personne"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Progression (%)
                </label>
                <input
                  type="number"
                  value={currentTask.progress}
                  onChange={(e) => setCurrentTask({ ...currentTask, progress: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  min="0"
                  max="100"
                />
              </div>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Dépendances (tâches qui doivent être terminées avant)
              </label>
              <div className="flex flex-wrap gap-2">
                {tasks.map((task, index) => (
                  <label key={index} className="flex items-center space-x-2 bg-white px-3 py-2 rounded-lg border">
                    <input
                      type="checkbox"
                      checked={currentTask.dependencies.includes((index + 1).toString())}
                      onChange={(e) => {
                        const taskId = (index + 1).toString();
                        if (e.target.checked) {
                          setCurrentTask({
                            ...currentTask,
                            dependencies: [...currentTask.dependencies, taskId]
                          });
                        } else {
                          setCurrentTask({
                            ...currentTask,
                            dependencies: currentTask.dependencies.filter(id => id !== taskId)
                          });
                        }
                      }}
                      className="rounded text-blue-600"
                    />
                    <span className="text-sm">{task.name}</span>
                  </label>
                ))}
              </div>
              {tasks.length === 0 && (
                <p className="text-sm text-gray-500 italic">Aucune tâche disponible pour les dépendances</p>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                value={currentTask.description}
                onChange={(e) => setCurrentTask({ ...currentTask, description: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={2}
                placeholder="Description de la tâche"
              />
            </div>

            <button
              onClick={addTask}
              disabled={!currentTask.name.trim()}
              className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter la tâche</span>
            </button>
          </div>

          {/* Liste des tâches ajoutées */}
          {tasks.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">
                Tâches du projet ({tasks.length})
              </h2>
              <div className="space-y-3">
                {tasks.map((task, index) => (
                  <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3 mb-2">
                          <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded">
                            Tâche {index + 1}
                          </span>
                          <h3 className="font-medium text-gray-800">{task.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                            {task.priority}
                          </span>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600 mb-2">
                          <div className="flex items-center space-x-1">
                            <Clock className="w-4 h-4" />
                            <span>{task.duration} jours</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Calendar className="w-4 h-4" />
                            <span>{new Date(task.startDate).toLocaleDateString('fr-FR')}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Users className="w-4 h-4" />
                            <span>{task.assignee || 'Non assigné'}</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Flag className="w-4 h-4" />
                            <span>{task.progress}%</span>
                          </div>
                        </div>

                        {task.dependencies.length > 0 && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <ArrowRight className="w-4 h-4" />
                            <span>Dépend de : </span>
                            <div className="flex space-x-1">
                              {task.dependencies.map(depId => {
                                const depIndex = parseInt(depId) - 1;
                                const depTask = tasks[depIndex];
                                return (
                                  <span key={depId} className="bg-gray-100 px-2 py-1 rounded text-xs">
                                    {depTask ? depTask.name : `Tâche ${depId}`}
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {task.description && (
                          <p className="text-sm text-gray-600 mt-2">{task.description}</p>
                        )}
                      </div>

                      <button
                        onClick={() => removeTask(index)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-6 border-t border-gray-200">
            <div className="text-sm text-gray-600">
              {tasks.length === 0 ? (
                "Ajoutez au moins une tâche pour créer le projet"
              ) : (
                `${tasks.length} tâche${tasks.length > 1 ? 's' : ''} ajoutée${tasks.length > 1 ? 's' : ''}`
              )}
            </div>
            <div className="flex space-x-4">
              <button
                onClick={onCancel}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateProject}
                disabled={!projectName.trim() || tasks.length === 0}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
              >
                <Save className="w-4 h-4" />
                <span>Créer le projet</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}