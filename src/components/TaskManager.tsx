import React, { useState } from 'react';
import { Task } from '../types/project';
import { Plus, Edit2, Trash2, Users, Calendar, Clock, Flag, CheckCircle, CircleDot } from 'lucide-react';

interface TaskManagerProps {
  tasks: Task[];
  onAddTask: (task: Omit<Task, 'id'>) => void;
  onUpdateTask: (taskId: string, updates: Partial<Task>) => void;
  onDeleteTask: (taskId: string) => void;
}

export default function TaskManager({ tasks, onAddTask, onUpdateTask, onDeleteTask }: TaskManagerProps) {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTask, setNewTask] = useState({
    name: '',
    duration: 1,
    startDate: new Date().toISOString().split('T')[0],
    dependencies: [] as string[],
    progress: 0,
    assignee: '',
    priority: 'moyenne' as const,
    description: ''
  });

  const handleAddTask = () => {
    if (newTask.name.trim()) {
      const startDate = new Date(newTask.startDate);
      const endDate = new Date(startDate);
      endDate.setDate(startDate.getDate() + newTask.duration);

      onAddTask({
        name: newTask.name,
        duration: newTask.duration,
        startDate,
        endDate,
        dependencies: newTask.dependencies,
        progress: newTask.progress,
        assignee: newTask.assignee,
        priority: newTask.priority,
        description: newTask.description
      });

      setNewTask({
        name: '',
        duration: 1,
        startDate: new Date().toISOString().split('T')[0],
        dependencies: [],
        progress: 0,
        assignee: '',
        priority: 'moyenne',
        description: ''
      });
      setIsAddingTask(false);
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

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'critique': return <Flag className="w-4 h-4 text-red-500" />;
      case 'élevée': return <Flag className="w-4 h-4 text-orange-500" />;
      case 'moyenne': return <Flag className="w-4 h-4 text-blue-500" />;
      case 'faible': return <Flag className="w-4 h-4 text-green-500" />;
      default: return <Flag className="w-4 h-4 text-gray-500" />;
    }
  };

  const getProgressIcon = (progress: number) => {
    if (progress === 100) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (progress > 0) return <CircleDot className="w-5 h-5 text-blue-500" />;
    return <CircleDot className="w-5 h-5 text-gray-400" />;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Users className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Gestion des tâches</h2>
        </div>
        <button
          onClick={() => setIsAddingTask(true)}
          className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Ajouter une tâche</span>
        </button>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        {tasks.map((task) => (
          <div key={task.id} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center space-x-3 mb-2">
                  {getProgressIcon(task.progress)}
                  <h3 className="font-medium text-gray-800">{task.name}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(task.priority)}`}>
                    {task.priority}
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-3">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-4 h-4" />
                    <span>{task.startDate.toLocaleDateString('fr-FR')} - {task.endDate.toLocaleDateString('fr-FR')}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{task.duration} jours</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Users className="w-4 h-4" />
                    <span>{task.assignee || 'Non assigné'}</span>
                  </div>
                </div>

                {task.description && (
                  <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                )}

                {/* Barre de progression */}
                <div className="mb-3">
                  <div className="flex items-center justify-between text-sm mb-1">
                    <span className="text-gray-600">Progression</span>
                    <span className="font-medium text-gray-800">{task.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${task.progress}%` }}
                    />
                  </div>
                </div>

                {/* Dépendances */}
                {task.dependencies.length > 0 && (
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Dépendances : </span>
                    {task.dependencies.map(depId => {
                      const depTask = tasks.find(t => t.id === depId);
                      return depTask ? depTask.name : depId;
                    }).join(', ')}
                  </div>
                )}
              </div>

              <div className="flex items-center space-x-2 ml-4">
                <button
                  onClick={() => setEditingTask(task.id)}
                  className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
                <button
                  onClick={() => onDeleteTask(task.id)}
                  className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        ))}

        {tasks.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Aucune tâche pour le moment. Ajoutez votre première tâche pour commencer !</p>
          </div>
        )}
      </div>

      {/* Modal d'ajout de tâche */}
      {isAddingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Ajouter une nouvelle tâche</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nom de la tâche</label>
                <input
                  type="text"
                  value={newTask.name}
                  onChange={(e) => setNewTask({ ...newTask, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Saisir le nom de la tâche"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Durée (jours)</label>
                  <input
                    type="number"
                    value={newTask.duration}
                    onChange={(e) => setNewTask({ ...newTask, duration: parseInt(e.target.value) || 1 })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date de début</label>
                  <input
                    type="date"
                    value={newTask.startDate}
                    onChange={(e) => setNewTask({ ...newTask, startDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Priorité</label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask({ ...newTask, priority: e.target.value as any })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="faible">Faible</option>
                    <option value="moyenne">Moyenne</option>
                    <option value="élevée">Élevée</option>
                    <option value="critique">Critique</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Progression (%)</label>
                  <input
                    type="number"
                    value={newTask.progress}
                    onChange={(e) => setNewTask({ ...newTask, progress: Math.max(0, Math.min(100, parseInt(e.target.value) || 0)) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    min="0"
                    max="100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assigné à</label>
                <input
                  type="text"
                  value={newTask.assignee}
                  onChange={(e) => setNewTask({ ...newTask, assignee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Saisir le nom de la personne assignée"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={3}
                  placeholder="Saisir la description de la tâche"
                />
              </div>
            </div>

            <div className="flex space-x-3 mt-6">
              <button
                onClick={handleAddTask}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors"
              >
                Ajouter la tâche
              </button>
              <button
                onClick={() => setIsAddingTask(false)}
                className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}