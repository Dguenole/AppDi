import React, { useState, useMemo } from 'react';
import { Task, Project } from './types/project';
import { useLocalStorage } from './hooks/useLocalStorage';
import ProjectDashboard from './components/ProjectDashboard';
import TaskManager from './components/TaskManager';
import GanttChart from './components/GanttChart';
import PertChart from './components/PertChart';
import ProjectCreator from './components/ProjectCreator';
import { 
  BarChart3, 
  Calendar, 
  Network, 
  Users, 
  Menu,
  X,
  Plus,
  Settings,
  Download,
  Upload,
  FolderPlus
} from 'lucide-react';

const sampleTasks: Task[] = [
  {
    id: '1',
    name: 'Planification du projet',
    duration: 5,
    startDate: new Date('2024-01-01'),
    endDate: new Date('2024-01-06'),
    dependencies: [],
    progress: 100,
    assignee: 'Alice Dupont',
    priority: 'élevée',
    description: 'Définir la portée, les objectifs et les livrables du projet'
  },
  {
    id: '2',
    name: 'Analyse des exigences',
    duration: 7,
    startDate: new Date('2024-01-06'),
    endDate: new Date('2024-01-13'),
    dependencies: ['1'],
    progress: 85,
    assignee: 'Bob Martin',
    priority: 'critique',
    description: 'Recueillir et analyser les exigences du système'
  },
  {
    id: '3',
    name: 'Conception du système',
    duration: 10,
    startDate: new Date('2024-01-13'),
    endDate: new Date('2024-01-23'),
    dependencies: ['2'],
    progress: 60,
    assignee: 'Claire Bernard',
    priority: 'élevée',
    description: 'Créer l\'architecture système et les documents de conception'
  },
  {
    id: '4',
    name: 'Développement frontend',
    duration: 15,
    startDate: new Date('2024-01-23'),
    endDate: new Date('2024-02-07'),
    dependencies: ['3'],
    progress: 40,
    assignee: 'David Rousseau',
    priority: 'moyenne',
    description: 'Développer les composants de l\'interface utilisateur'
  },
  {
    id: '5',
    name: 'Développement backend',
    duration: 12,
    startDate: new Date('2024-01-23'),
    endDate: new Date('2024-02-04'),
    dependencies: ['3'],
    progress: 30,
    assignee: 'Eva Moreau',
    priority: 'moyenne',
    description: 'Implémenter la logique côté serveur et les API'
  },
  {
    id: '6',
    name: 'Tests',
    duration: 8,
    startDate: new Date('2024-02-07'),
    endDate: new Date('2024-02-15'),
    dependencies: ['4', '5'],
    progress: 0,
    assignee: 'François Leroy',
    priority: 'élevée',
    description: 'Tests complets du système et assurance qualité'
  },
  {
    id: '7',
    name: 'Déploiement',
    duration: 3,
    startDate: new Date('2024-02-15'),
    endDate: new Date('2024-02-18'),
    dependencies: ['6'],
    progress: 0,
    assignee: 'Gabrielle Simon',
    priority: 'critique',
    description: 'Déployer le système en environnement de production'
  }
];

export default function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('project-tasks', sampleTasks);
  const [currentView, setCurrentView] = useState<'dashboard' | 'tasks' | 'gantt' | 'pert' | 'creator'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projectInfo, setProjectInfo] = useLocalStorage('project-info', {
    name: 'Projet de développement logiciel',
    description: 'Un système complet de gestion de projet avec visualisation Gantt et PERT'
  });

  const project: Project = useMemo(() => ({
    id: '1',
    name: projectInfo.name,
    description: projectInfo.description,
    startDate: new Date(Math.min(...tasks.map(t => t.startDate.getTime()))),
    endDate: new Date(Math.max(...tasks.map(t => t.endDate.getTime()))),
    tasks
  }), [tasks, projectInfo]);

  const addTask = (newTask: Omit<Task, 'id'>) => {
    const task: Task = {
      ...newTask,
      id: Date.now().toString()
    };
    setTasks([...tasks, task]);
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks(tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            ...updates,
            // Recalculer la date de fin si la durée ou la date de début change
            endDate: updates.duration || updates.startDate 
              ? new Date((updates.startDate || task.startDate).getTime() + ((updates.duration || task.duration) * 24 * 60 * 60 * 1000))
              : task.endDate
          }
        : task
    ));
  };

  const deleteTask = (taskId: string) => {
    setTasks(tasks.filter(task => task.id !== taskId));
  };

  const handleProjectCreate = (projectData: { name: string; description: string; tasks: Task[] }) => {
    setProjectInfo({
      name: projectData.name,
      description: projectData.description
    });
    setTasks(projectData.tasks);
    setCurrentView('dashboard');
  };

  const exportProject = () => {
    const projectData = {
      project,
      exportDate: new Date().toISOString()
    };
    const blob = new Blob([JSON.stringify(projectData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${project.name.replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const importProject = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target?.result as string);
          if (data.project?.tasks) {
            const importedTasks = data.project.tasks.map((task: any) => ({
              ...task,
              startDate: new Date(task.startDate),
              endDate: new Date(task.endDate)
            }));
            setTasks(importedTasks);
            if (data.project.name) {
              setProjectInfo({
                name: data.project.name,
                description: data.project.description || ''
              });
            }
          }
        } catch (error) {
          console.error('Échec de l\'importation du projet:', error);
          alert('Échec de l\'importation du projet. Veuillez vérifier le format du fichier.');
        }
      };
      reader.readAsText(file);
    }
  };

  const navigationItems = [
    { id: 'dashboard', label: 'Tableau de bord', icon: BarChart3 },
    { id: 'tasks', label: 'Tâches', icon: Users },
    { id: 'gantt', label: 'Diagramme de Gantt', icon: Calendar },
    { id: 'pert', label: 'Diagramme PERT', icon: Network },
  ] as const;

  const renderCurrentView = () => {
    switch (currentView) {
      case 'creator':
        return <ProjectCreator onProjectCreate={handleProjectCreate} onCancel={() => setCurrentView('dashboard')} />;
      case 'dashboard':
        return <ProjectDashboard tasks={tasks} />;
      case 'tasks':
        return <TaskManager tasks={tasks} onAddTask={addTask} onUpdateTask={updateTask} onDeleteTask={deleteTask} />;
      case 'gantt':
        return <GanttChart tasks={tasks} onTaskUpdate={updateTask} />;
      case 'pert':
        return <PertChart tasks={tasks} />;
      default:
        return <ProjectDashboard tasks={tasks} />;
    }
  };

  // Si on est dans la vue créateur, afficher seulement celle-ci
  if (currentView === 'creator') {
    return renderCurrentView();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Superposition de la barre latérale mobile */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Barre latérale */}
      <div className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out
        lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
              <Network className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold text-gray-800">ProjetFlow</h1>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1 rounded-md hover:bg-gray-100"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentView(item.id);
                  setSidebarOpen(false);
                }}
                className={`
                  w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-left transition-all duration-200
                  ${currentView === item.id
                    ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-800'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="border-t border-gray-200 p-4 space-y-2">
          <button
            onClick={() => setCurrentView('creator')}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <FolderPlus className="w-4 h-4" />
            <span className="text-sm font-medium">Nouveau projet</span>
          </button>
          <button
            onClick={exportProject}
            className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors"
          >
            <Download className="w-4 h-4" />
            <span className="text-sm font-medium">Exporter le projet</span>
          </button>
          <label className="w-full flex items-center space-x-3 px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
            <Upload className="w-4 h-4" />
            <span className="text-sm font-medium">Importer un projet</span>
            <input
              type="file"
              accept=".json"
              onChange={importProject}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="lg:pl-64">
        {/* En-tête */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-md hover:bg-gray-100"
              >
                <Menu className="w-5 h-5 text-gray-500" />
              </button>
              <div>
                <h2 className="text-2xl font-bold text-gray-800">{project.name}</h2>
                <p className="text-sm text-gray-600">{project.description}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-sm font-medium text-gray-800">
                  {project.startDate.toLocaleDateString('fr-FR')} - {project.endDate.toLocaleDateString('fr-FR')}
                </div>
                <div className="text-xs text-gray-500">{tasks.length} tâches</div>
              </div>
              <button className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        {/* Contenu de la page */}
        <main className="p-6">
          {renderCurrentView()}
        </main>
      </div>
    </div>
  );
}