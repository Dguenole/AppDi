import React, { useMemo, useState } from 'react';
import { Task } from '../types/project';
import { ChevronLeft, ChevronRight, Calendar, Clock } from 'lucide-react';

interface GanttChartProps {
  tasks: Task[];
  onTaskUpdate: (taskId: string, updates: Partial<Task>) => void;
}

export default function GanttChart({ tasks, onTaskUpdate }: GanttChartProps) {
  const [viewMode, setViewMode] = useState<'jours' | 'semaines' | 'mois'>('jours');
  const [currentDate, setCurrentDate] = useState(new Date());

  const { timelineData, chartDimensions } = useMemo(() => {
    if (tasks.length === 0) {
      return { timelineData: [], chartDimensions: { width: 800, height: 200 } };
    }

    const minDate = new Date(Math.min(...tasks.map(t => t.startDate.getTime())));
    const maxDate = new Date(Math.max(...tasks.map(t => t.endDate.getTime())));
    
    // Ajuster les dates pour afficher un peu de marge
    minDate.setDate(minDate.getDate() - 7);
    maxDate.setDate(maxDate.getDate() + 7);

    const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    const dayWidth = viewMode === 'jours' ? 30 : viewMode === 'semaines' ? 120 : 200;
    const chartWidth = Math.max(800, totalDays * (dayWidth / (viewMode === 'jours' ? 1 : viewMode === 'semaines' ? 7 : 30)));
    const taskHeight = 40;
    const taskSpacing = 10;
    const chartHeight = tasks.length * (taskHeight + taskSpacing) + 100;

    const timelineData = tasks.map((task, index) => {
      const startX = ((task.startDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24)) * (dayWidth / (viewMode === 'jours' ? 1 : viewMode === 'semaines' ? 7 : 30));
      const duration = Math.ceil((task.endDate.getTime() - task.startDate.getTime()) / (1000 * 60 * 60 * 24));
      const width = duration * (dayWidth / (viewMode === 'jours' ? 1 : viewMode === 'semaines' ? 7 : 30));
      const y = 80 + index * (taskHeight + taskSpacing);

      return {
        task,
        x: startX,
        y,
        width,
        height: taskHeight,
      };
    });

    return {
      timelineData,
      chartDimensions: { width: chartWidth, height: chartHeight, minDate, maxDate, dayWidth }
    };
  }, [tasks, viewMode]);

  const generateTimeScale = () => {
    if (!chartDimensions.minDate || !chartDimensions.maxDate) return [];
    
    const timePoints = [];
    const current = new Date(chartDimensions.minDate);
    
    while (current <= chartDimensions.maxDate) {
      const x = ((current.getTime() - chartDimensions.minDate.getTime()) / (1000 * 60 * 60 * 24)) * 
        (chartDimensions.dayWidth / (viewMode === 'jours' ? 1 : viewMode === 'semaines' ? 7 : 30));
      
      timePoints.push({
        date: new Date(current),
        x,
        label: viewMode === 'jours' 
          ? current.getDate().toString()
          : viewMode === 'semaines'
          ? `S${Math.ceil(current.getDate() / 7)}`
          : current.toLocaleDateString('fr-FR', { month: 'short' })
      });

      if (viewMode === 'jours') {
        current.setDate(current.getDate() + 1);
      } else if (viewMode === 'semaines') {
        current.setDate(current.getDate() + 7);
      } else {
        current.setMonth(current.getMonth() + 1);
      }
    }

    return timePoints;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critique': return 'bg-red-500';
      case 'élevée': return 'bg-orange-500';
      case 'moyenne': return 'bg-blue-500';
      case 'faible': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const timeScale = generateTimeScale();

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Calendar className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Diagramme de Gantt</h2>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex bg-gray-100 rounded-lg p-1">
            {(['jours', 'semaines', 'mois'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-all ${
                  viewMode === mode
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                {mode.charAt(0).toUpperCase() + mode.slice(1)}
              </button>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="text-sm font-medium text-gray-600 min-w-[100px] text-center">
              {currentDate.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })}
            </span>
            <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto overflow-y-auto max-h-[600px] border rounded-lg">
        <div style={{ width: chartDimensions.width, height: chartDimensions.height }} className="relative">
          {/* En-tête de l'échelle de temps */}
          <div className="sticky top-0 bg-white z-10 border-b">
            <svg width={chartDimensions.width} height="60">
              {timeScale.map((point, index) => (
                <g key={index}>
                  <line
                    x1={point.x}
                    y1="40"
                    x2={point.x}
                    y2="60"
                    stroke="#e5e7eb"
                    strokeWidth="1"
                  />
                  <text
                    x={point.x}
                    y="25"
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {point.label}
                  </text>
                </g>
              ))}
            </svg>
          </div>

          {/* Lignes des tâches */}
          <div className="relative">
            {/* Lignes de grille */}
            <svg className="absolute inset-0 pointer-events-none" width={chartDimensions.width} height={chartDimensions.height - 60}>
              {timeScale.map((point, index) => (
                <line
                  key={index}
                  x1={point.x}
                  y1="0"
                  x2={point.x}
                  y2={chartDimensions.height - 60}
                  stroke="#f3f4f6"
                  strokeWidth="1"
                />
              ))}
            </svg>

            {/* Tâches */}
            <div className="relative pt-4">
              {timelineData.map((item, index) => (
                <div key={item.task.id} className="relative group">
                  {/* Libellé de la tâche */}
                  <div 
                    className="absolute left-4 flex items-center h-10 z-10"
                    style={{ top: item.y - 80 + 20 }}
                  >
                    <div className="bg-white pr-4">
                      <div className="text-sm font-medium text-gray-800 truncate max-w-[200px]">
                        {item.task.name}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-gray-500">
                        <Clock className="w-3 h-3" />
                        <span>{item.task.duration}j</span>
                        <span className="text-gray-300">•</span>
                        <span>{item.task.assignee}</span>
                      </div>
                    </div>
                  </div>

                  {/* Barre de tâche */}
                  <div
                    className="absolute rounded-lg shadow-sm transition-all duration-200 group-hover:shadow-md cursor-pointer"
                    style={{
                      left: Math.max(220, item.x),
                      top: item.y - 80 + 20,
                      width: item.width,
                      height: item.height,
                    }}
                  >
                    <div className={`h-full rounded-lg ${getPriorityColor(item.task.priority)} relative overflow-hidden`}>
                      {/* Barre de progression */}
                      <div
                        className="absolute top-0 left-0 h-full bg-white bg-opacity-30 rounded-lg transition-all duration-300"
                        style={{ width: `${item.task.progress}%` }}
                      />
                      
                      {/* Superposition d'informations de tâche */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-white text-xs font-medium text-center px-2">
                          <div className="truncate">{item.task.progress}%</div>
                        </div>
                      </div>

                      {/* Info-bulle au survol */}
                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-20">
                        <div className="font-medium">{item.task.name}</div>
                        <div>Durée : {item.task.duration} jours</div>
                        <div>Progression : {item.task.progress}%</div>
                        <div>Assigné à : {item.task.assignee}</div>
                        <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}