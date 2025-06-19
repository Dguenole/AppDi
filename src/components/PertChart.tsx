import React, { useMemo } from 'react';
import { Task } from '../types/project';
import { calculateCriticalPath } from '../utils/projectCalculations';
import { Network, Clock, AlertTriangle, TrendingUp } from 'lucide-react';

interface PertChartProps {
  tasks: Task[];
}

export default function PertChart({ tasks }: PertChartProps) {
  const { nodes, edges, criticalPathTasks, totalDuration } = useMemo(() => {
    const { nodes, edges } = calculateCriticalPath(tasks);
    const criticalPathTasks = nodes.filter(node => node.isCritical).map(node => node.taskId);
    const totalDuration = Math.max(...nodes.map(n => n.earliestFinish));
    
    return { nodes, edges, criticalPathTasks, totalDuration };
  }, [tasks]);

  if (tasks.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="flex items-center space-x-2 mb-6">
          <Network className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Diagramme PERT</h2>
        </div>
        <div className="text-center py-12 text-gray-500">
          <Network className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>Aucune tâche disponible pour l'analyse PERT</p>
        </div>
      </div>
    );
  }

  const maxX = Math.max(...nodes.map(n => n.x)) + 150;
  const maxY = Math.max(...nodes.map(n => n.y)) + 100;
  const minY = Math.min(...nodes.map(n => n.y)) - 100;
  const svgHeight = maxY - minY + 200;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-2">
          <Network className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-800">Diagramme PERT</h2>
        </div>
        <div className="flex items-center space-x-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-red-500 rounded-full"></div>
            <span className="text-gray-600">Chemin critique</span>
          </div>
          <div className="flex items-center space-x-2">
            <Clock className="w-4 h-4 text-blue-600" />
            <span className="text-gray-600">Durée : {totalDuration} jours</span>
          </div>
        </div>
      </div>

      {/* Métriques du projet */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-r from-blue-50 to-blue-100 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <TrendingUp className="w-5 h-5 text-blue-600" />
            <div>
              <div className="text-sm text-blue-600 font-medium">Tâches critiques</div>
              <div className="text-2xl font-bold text-blue-800">{criticalPathTasks.length}</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-emerald-50 to-emerald-100 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <div>
              <div className="text-sm text-emerald-600 font-medium">Durée du projet</div>
              <div className="text-2xl font-bold text-emerald-800">{totalDuration} jours</div>
            </div>
          </div>
        </div>
        <div className="bg-gradient-to-r from-amber-50 to-amber-100 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <div>
              <div className="text-sm text-amber-600 font-medium">Marge/Battement</div>
              <div className="text-2xl font-bold text-amber-800">
                {Math.max(0, nodes.reduce((sum, n) => sum + n.slack, 0))} jours
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto max-h-[600px]">
          <svg width={Math.max(800, maxX)} height={Math.max(400, svgHeight)} className="bg-gray-50">
            {/* Motif de grille */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#f3f4f6" strokeWidth="1"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Arêtes */}
            {edges.map((edge, index) => {
              const fromNode = nodes.find(n => n.id === edge.from);
              const toNode = nodes.find(n => n.id === edge.to);
              if (!fromNode || !toNode) return null;

              const startX = fromNode.x + 80;
              const startY = fromNode.y;
              const endX = toNode.x - 10;
              const endY = toNode.y;

              return (
                <g key={index}>
                  <line
                    x1={startX}
                    y1={startY}
                    x2={endX}
                    y2={endY}
                    stroke={edge.isCritical ? '#ef4444' : '#6b7280'}
                    strokeWidth={edge.isCritical ? '3' : '2'}
                    markerEnd="url(#arrowhead)"
                    className="transition-all duration-200"
                  />
                </g>
              );
            })}

            {/* Marqueur de flèche */}
            <defs>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#6b7280" />
              </marker>
            </defs>

            {/* Nœuds */}
            {nodes.map((node) => {
              const task = tasks.find(t => t.id === node.taskId);
              if (!task) return null;
              
              return (
                <g key={node.id} className="group">
                  {/* Arrière-plan du nœud */}
                  <rect
                    x={node.x - 40}
                    y={node.y - 25}
                    width="120"
                    height="50"
                    rx="8"
                    fill={node.isCritical ? '#fef2f2' : '#f8fafc'}
                    stroke={node.isCritical ? '#ef4444' : '#e2e8f0'}
                    strokeWidth={node.isCritical ? '2' : '1'}
                    className="transition-all duration-200 group-hover:shadow-lg"
                  />

                  {/* Indicateur de chemin critique */}
                  {node.isCritical && (
                    <rect
                      x={node.x - 40}
                      y={node.y - 25}
                      width="4"
                      height="50"
                      fill="#ef4444"
                      rx="2"
                    />
                  )}

                  {/* Nom de la tâche */}
                  <text
                    x={node.x}
                    y={node.y - 8}
                    textAnchor="middle"
                    className="text-xs font-semibold fill-gray-800"
                  >
                    {task.name.length > 12 ? task.name.substring(0, 12) + '...' : task.name}
                  </text>

                  {/* Durée */}
                  <text
                    x={node.x}
                    y={node.y + 6}
                    textAnchor="middle"
                    className="text-xs fill-gray-600"
                  >
                    {task.duration}j
                  </text>

                  {/* Temps de battement */}
                  <text
                    x={node.x}
                    y={node.y + 18}
                    textAnchor="middle"
                    className={`text-xs ${node.slack === 0 ? 'fill-red-600 font-bold' : 'fill-gray-500'}`}
                  >
                    Marge : {node.slack}j
                  </text>

                  {/* Info-bulle au survol */}
                  <g className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
                    <rect
                      x={node.x - 60}
                      y={node.y - 80}
                      width="120"
                      height="45"
                      rx="4"
                      fill="#1f2937"
                      fillOpacity="0.95"
                    />
                    <text x={node.x} y={node.y - 65} textAnchor="middle" className="text-xs font-medium fill-white">
                      {task.name}
                    </text>
                    <text x={node.x} y={node.y - 52} textAnchor="middle" className="text-xs fill-gray-300">
                      DD : {node.earliestStart} | DT : {node.latestStart}
                    </text>
                    <text x={node.x} y={node.y - 40} textAnchor="middle" className="text-xs fill-gray-300">
                      FD : {node.earliestFinish} | FT : {node.latestFinish}
                    </text>
                  </g>
                </g>
              );
            })}
          </svg>
        </div>
      </div>

      {/* Légende */}
      <div className="mt-4 p-4 bg-gray-50 rounded-lg">
        <div className="text-sm text-gray-600 mb-2 font-medium">Légende :</div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-gray-600">
          <div><strong>DD :</strong> Début au plus tôt</div>
          <div><strong>DT :</strong> Début au plus tard</div>
          <div><strong>FD :</strong> Fin au plus tôt</div>
          <div><strong>FT :</strong> Fin au plus tard</div>
        </div>
      </div>
    </div>
  );
}