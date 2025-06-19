import React from 'react';
import { Task } from '../types/project';
import { getProjectProgress, getTasksByPriority } from '../utils/projectCalculations';
import { BarChart, Clock, Users, AlertTriangle, CheckCircle, TrendingUp } from 'lucide-react';

interface ProjectDashboardProps {
  tasks: Task[];
}

export default function ProjectDashboard({ tasks }: ProjectDashboardProps) {
  const projectProgress = getProjectProgress(tasks);
  const tasksByPriority = getTasksByPriority(tasks);
  
  const completedTasks = tasks.filter(t => t.progress === 100).length;
  const inProgressTasks = tasks.filter(t => t.progress > 0 && t.progress < 100).length;
  const notStartedTasks = tasks.filter(t => t.progress === 0).length;

  const upcomingDeadlines = tasks
    .filter(t => {
      const daysUntilDeadline = Math.ceil((t.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
      return daysUntilDeadline >= 0 && daysUntilDeadline <= 7 && t.progress < 100;
    })
    .sort((a, b) => a.endDate.getTime() - b.endDate.getTime());

  const overdueTasks = tasks.filter(t => {
    const isOverdue = t.endDate < new Date() && t.progress < 100;
    return isOverdue;
  });

  return (
    <div className="space-y-6">
      {/* Métriques clés */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avancement du projet</p>
              <p className="text-3xl font-bold text-gray-900">{Math.round(projectProgress)}%</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-full">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${projectProgress}%` }}
              />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total des tâches</p>
              <p className="text-3xl font-bold text-gray-900">{tasks.length}</p>
            </div>
            <div className="bg-emerald-100 p-3 rounded-full">
              <BarChart className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            {completedTasks} terminées, {inProgressTasks} en cours
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Tâches critiques</p>
              <p className="text-3xl font-bold text-gray-900">{tasksByPriority.critique}</p>
            </div>
            <div className="bg-red-100 p-3 rounded-full">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Nécessitent une attention immédiate
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Membres de l'équipe</p>
              <p className="text-3xl font-bold text-gray-900">
                {new Set(tasks.map(t => t.assignee).filter(Boolean)).size}
              </p>
            </div>
            <div className="bg-purple-100 p-3 rounded-full">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="mt-2 text-sm text-gray-500">
            Contributeurs actifs
          </div>
        </div>
      </div>

      {/* Répartition du statut des tâches */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
            Statut des tâches
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Terminées</span>
              </div>
              <span className="font-semibold text-gray-900">{completedTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">En cours</span>
              </div>
              <span className="font-semibold text-gray-900">{inProgressTasks}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                <span className="text-gray-700">Non commencées</span>
              </div>
              <span className="font-semibold text-gray-900">{notStartedTasks}</span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
            <AlertTriangle className="w-5 h-5 text-amber-600 mr-2" />
            Répartition par priorité
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                <span className="text-gray-700">Critique</span>
              </div>
              <span className="font-semibold text-gray-900">{tasksByPriority.critique}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
                <span className="text-gray-700">Élevée</span>
              </div>
              <span className="font-semibold text-gray-900">{tasksByPriority.élevée}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                <span className="text-gray-700">Moyenne</span>
              </div>
              <span className="font-semibold text-gray-900">{tasksByPriority.moyenne}</span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                <span className="text-gray-700">Faible</span>
              </div>
              <span className="font-semibold text-gray-900">{tasksByPriority.faible}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Échéances à venir et tâches en retard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {upcomingDeadlines.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <Clock className="w-5 h-5 text-amber-600 mr-2" />
              Échéances à venir
            </h3>
            <div className="space-y-3">
              {upcomingDeadlines.slice(0, 5).map(task => {
                const daysUntilDeadline = Math.ceil((task.endDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-amber-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{task.name}</div>
                      <div className="text-sm text-gray-600">{task.assignee}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-amber-700">
                        {daysUntilDeadline === 0 ? 'Aujourd\'hui' : `${daysUntilDeadline} jour${daysUntilDeadline > 1 ? 's' : ''}`}
                      </div>
                      <div className="text-xs text-gray-500">{task.endDate.toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {overdueTasks.length > 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
              Tâches en retard
            </h3>
            <div className="space-y-3">
              {overdueTasks.slice(0, 5).map(task => {
                const daysOverdue = Math.ceil((new Date().getTime() - task.endDate.getTime()) / (1000 * 60 * 60 * 24));
                return (
                  <div key={task.id} className="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                    <div>
                      <div className="font-medium text-gray-800">{task.name}</div>
                      <div className="text-sm text-gray-600">{task.assignee}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-red-700">
                        {daysOverdue} jour{daysOverdue > 1 ? 's' : ''} de retard
                      </div>
                      <div className="text-xs text-gray-500">{task.endDate.toLocaleDateString('fr-FR')}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {upcomingDeadlines.length === 0 && overdueTasks.length === 0 && (
          <div className="bg-white rounded-xl shadow-lg p-6 lg:col-span-2">
            <div className="text-center py-8">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-800 mb-2">Toutes les tâches sont sur la bonne voie</h3>
              <p className="text-gray-600">Aucune échéance proche ou tâche en retard à signaler !</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}