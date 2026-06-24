/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { 
  Plus, 
  CheckCircle, 
  Trash2, 
  Layers, 
  FolderLock, 
  Calendar, 
  Tag, 
  AlertTriangle, 
  Filter, 
  CheckSquare, 
  X,
  Compass
} from 'lucide-react';
import { Task, Project, LifeOSData } from '../types';

interface TasksTabProps {
  data: LifeOSData;
  updateData: (newData: Partial<LifeOSData>) => void;
  getCurrentDate: () => string;
}

export default function TasksTab({ data, updateData, getCurrentDate }: TasksTabProps) {
  // Task creator states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDesc, setNewTaskDesc] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskCategory, setNewTaskCategory] = useState<'Work' | 'Personal' | 'Health' | 'Finance' | 'Growth'>('Work');
  const [newTaskProjectId, setNewTaskProjectId] = useState<string>('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);

  // Project creator states
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [newProjectCategory, setNewProjectCategory] = useState('Work');
  const [newProjectColor, setNewProjectColor] = useState('#3B82F6');
  const [showProjectForm, setShowProjectForm] = useState(false);

  // Filter/Sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('All');
  const [filterProjectId, setFilterProjectId] = useState<string>('All');
  const [completedFilter, setCompletedFilter] = useState<'pending' | 'completed' | 'all'>('pending');
  const [sortBy, setSortBy] = useState<'dueDate' | 'priority' | 'none'>('none');

  const todayStr = getCurrentDate();

  // Create task
  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const newTask: Task = {
      id: `task_${Date.now()}`,
      title: newTaskTitle.trim(),
      description: newTaskDesc.trim() || undefined,
      completed: false,
      priority: newTaskPriority,
      category: newTaskCategory,
      projectId: newTaskProjectId || undefined,
      dueDate: newTaskDueDate || undefined,
    };

    updateData({
      tasks: [...data.tasks, newTask],
    });

    // Reset inputs
    setNewTaskTitle('');
    setNewTaskDesc('');
    setNewTaskPriority('medium');
    setNewTaskDueDate('');
    setNewTaskProjectId('');
    setShowAddForm(false);
  };

  // Create project
  const handleAddProject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const newProject: Project = {
      id: `proj_${Date.now()}`,
      name: newProjectName.trim(),
      description: newProjectDesc.trim() || undefined,
      category: newProjectCategory,
      color: newProjectColor,
    };

    updateData({
      projects: [...data.projects, newProject],
    });

    setNewProjectName('');
    setNewProjectDesc('');
    setShowProjectForm(false);
  };

  // Delete Action / Completed toggler
  const handleToggleTask = (id: string) => {
    const updatedTasks = data.tasks.map((task) => {
      if (task.id === id) {
        return {
          ...task,
          completed: !task.completed,
          completedAt: !task.completed ? todayStr : undefined,
        };
      }
      return task;
    });
    updateData({ tasks: updatedTasks });
  };

  const handleDeleteTask = (id: string) => {
    const updatedTasks = data.tasks.filter((task) => task.id !== id);
    updateData({ tasks: updatedTasks });
  };

  const handleDeleteProject = (projId: string) => {
    // Delete project and unassign tasks associated
    const updatedProjects = data.projects.filter((p) => p.id !== projId);
    const updatedTasks = data.tasks.map((t) => {
      if (t.projectId === projId) {
        return { ...t, projectId: undefined };
      }
      return t;
    });
    updateData({ projects: updatedProjects, tasks: updatedTasks });
  };

  // Filter and Sort implementation
  const priorityWeight = { high: 3, medium: 2, low: 1 };

  const processedTasks = data.tasks
    .filter((task) => {
      const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (task.description || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = filterCategory === 'All' || task.category === filterCategory;
      const matchesProject = filterProjectId === 'All' || task.projectId === filterProjectId;
      const matchesStatus = completedFilter === 'all' ||
                            (completedFilter === 'completed' && task.completed) ||
                            (completedFilter === 'pending' && !task.completed);

      return matchesSearch && matchesCategory && matchesProject && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'priority') {
        return priorityWeight[b.priority] - priorityWeight[a.priority];
      }
      if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return a.dueDate.localeCompare(b.dueDate);
      }
      return 0; // standard insertion layout
    });

  // Action Progress HUD calculations
  const totalTasksCount = data.tasks.length;
  const completedTasksCount = data.tasks.filter(t => t.completed).length;
  const progressPercentage = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  const matchedProject = filterProjectId !== 'All' 
    ? data.projects.find(p => p.id === filterProjectId) 
    : null;
  const projectTasks = filterProjectId === 'All' 
    ? data.tasks 
    : data.tasks.filter(t => t.projectId === filterProjectId);
  const totalProjectTasks = projectTasks.length;
  const completedProjectTasks = projectTasks.filter(t => t.completed).length;
  const projectProgressPercentage = totalProjectTasks > 0 
    ? Math.round((completedProjectTasks / totalProjectTasks) * 100) 
    : 0;

  return (
    <div className="space-y-6">

      {/* Grid: Task Controls + Projects HUD List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left Side: Projects Panel */}
        <div className="clay-card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[10px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Active Projects</h2>
            <button
              onClick={() => {
                setShowProjectForm(!showProjectForm);
                setShowAddForm(false);
              }}
              className="text-[10px] font-black text-accent hover:text-accent-hover flex items-center space-x-1.5 cursor-pointer transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              <span className="uppercase tracking-widest">New</span>
            </button>
          </div>

          {/* New Project Dialog Overlay Form Inline */}
          {showProjectForm && (
            <form onSubmit={handleAddProject} className="bg-accent/5 p-4 rounded-2xl border border-accent/10 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-[8px] font-black text-accent/60 uppercase tracking-widest">Headline</label>
                <input
                  type="text"
                  placeholder="Project Name..."
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-xs font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent/40"
                  required
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-[8px] font-black text-accent/60 uppercase tracking-widest">Strategy</label>
                <input
                  type="text"
                  placeholder="Strategic description..."
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-[10px] font-bold rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-accent/40"
                />
              </div>
              <div className="flex items-center gap-2 justify-between">
                <span className="text-[9px] font-black text-accent/60 uppercase tracking-widest">Visual Tag</span>
                <input
                  type="color"
                  value={newProjectColor}
                  onChange={(e) => setNewProjectColor(e.target.value)}
                  className="w-10 h-6 bg-transparent border-0 cursor-pointer rounded overflow-hidden"
                />
              </div>
              <div className="flex gap-2 pt-1">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-accent-hover font-black text-[9px] uppercase tracking-widest text-white dark:text-cocoa py-2.5 rounded-xl transition shadow-sm"
                >
                  Create
                </button>
                <button
                  type="button"
                  onClick={() => setShowProjectForm(false)}
                  className="bg-white dark:bg-espresso-surface font-black text-[9px] uppercase tracking-widest text-espresso/40 dark:text-alabaster/40 px-3 py-2.5 rounded-xl border border-sand dark:border-espresso-surface-bright"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Projects List with counter badges */}
          <div className="space-y-1.5">
            <button
              onClick={() => setFilterProjectId('All')}
              className={`w-full text-left px-4 py-3 rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-between transition-all duration-200 border ${
                filterProjectId === 'All' 
                  ? 'bg-accent/10 text-accent border-accent/20 shadow-sm' 
                  : 'text-espresso/60 dark:text-alabaster/60 border-transparent hover:bg-parchment dark:hover:bg-espresso-surface-bright'
              }`}
            >
              <span className="flex items-center space-x-3">
                <span className="w-2.5 h-2.5 rounded-full bg-accent animate-pulse" />
                <span>Inbox Matrix</span>
              </span>
              <span className="font-mono text-[9px] bg-accent/20 dark:bg-black/20 px-2 py-0.5 rounded-md">
                {data.tasks.filter(t => !t.completed).length}
              </span>
            </button>

            {data.projects.map((project) => {
              const pendingCount = data.tasks.filter((t) => t.projectId === project.id && !t.completed).length;
              return (
                <div 
                  key={project.id}
                  className={`group flex items-center justify-between px-4 py-1.5 rounded-2xl text-[11px] transition-all duration-200 border ${
                    filterProjectId === project.id 
                      ? 'bg-parchment dark:bg-espresso-surface-bright text-espresso dark:text-alabaster border-sand dark:border-white/10 shadow-sm' 
                      : 'text-espresso/50 dark:text-alabaster/50 border-transparent hover:bg-parchment/50 dark:hover:bg-espresso-surface/50'
                  }`}
                >
                  <button
                    onClick={() => setFilterProjectId(project.id)}
                    className="flex-1 text-left py-2 font-black uppercase tracking-widest flex items-center space-x-3 min-w-0"
                  >
                    <span 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0 border border-black/10" 
                      style={{ backgroundColor: project.color }}
                    />
                    <span className="truncate pr-1 group-hover:text-accent transition-colors">{project.name}</span>
                  </button>

                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[9px] bg-sand/30 dark:bg-black/30 px-2 py-0.5 rounded-md text-espresso dark:text-alabaster font-bold opacity-60">
                      {pendingCount}
                    </span>
                    <button
                      onClick={() => {
                        if (confirm('Deconstruct project? associated tasks will remain but become unassigned.')) {
                          handleDeleteProject(project.id);
                        }
                      }}
                      className="opacity-0 group-hover:opacity-100 text-espresso/20 dark:text-alabaster/20 hover:text-red-500 transition-all cursor-pointer p-1 rounded-lg hover:bg-red-50 dark:hover:bg-red-500/10"
                      title="Deconstruct Project"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>


        {/* Task lists & Action creator */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Subtle Progress Bar Info HUD */}
          <div className="clay-card p-5 border border-sand dark:border-white/5 bg-parchment/40 dark:bg-espresso-surface/40 shadow-sm relative overflow-hidden transition-all duration-300">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
              <div className="space-y-1">
                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-accent flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
                  {filterProjectId !== 'All' && matchedProject 
                    ? `Project Vector: ${matchedProject.name}` 
                    : 'System Action Velocity'}
                </h3>
                <p className="text-[11px] font-bold text-espresso/80 dark:text-alabaster/80">
                  {filterProjectId !== 'All' && matchedProject 
                    ? 'Tracking commitment metrics for project execution' 
                    : 'Consolidated operational throughput performance'}
                </p>
              </div>
              <div className="flex flex-col sm:items-end">
                <div className="flex items-baseline space-x-1.5 justify-end">
                  <span className="text-xl font-black font-mono text-accent">
                    {filterProjectId !== 'All' && matchedProject ? projectProgressPercentage : progressPercentage}%
                  </span>
                  <span className="text-[9px] font-mono font-bold text-espresso/40 dark:text-alabaster/40 uppercase tracking-wider">
                    ({filterProjectId !== 'All' && matchedProject 
                      ? `${completedProjectTasks}/${totalProjectTasks}` 
                      : `${completedTasksCount}/${totalTasksCount}`} units)
                  </span>
                </div>
              </div>
            </div>

            {/* Progress track */}
            <div className="w-full h-2 rounded-full bg-sand/40 dark:bg-black/40 overflow-hidden relative border border-sand/10">
              <div 
                className="h-full bg-accent rounded-full transition-all duration-500 ease-out shadow-[0_0_8px_rgba(139,94,60,0.3)]"
                style={{ width: `${filterProjectId !== 'All' && matchedProject ? projectProgressPercentage : progressPercentage}%` }}
              />
            </div>
          </div>
          
          {/* Header row / Filter Toolbar */}
          <div className="clay-card p-6 space-y-6">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
              <div className="flex-1 relative group">
                <Compass className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/20 dark:text-alabaster/20 group-focus-within:text-accent transition-colors" />
                <input
                  type="text"
                  placeholder="Search operational tasks or details..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-parchment dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-[11px] font-bold uppercase tracking-wider rounded-2xl pl-11 pr-4 py-3.5 focus:outline-none focus:ring-2 focus:ring-accent/40 placeholder:text-espresso/20 dark:placeholder:text-alabaster/20 transition-all"
                />
              </div>
              <div className="flex gap-2 flex-shrink-0">
                <button
                  onClick={() => {
                    setShowAddForm(!showAddForm);
                    setShowProjectForm(false);
                  }}
                  className="bg-accent hover:bg-accent-hover text-white dark:text-cocoa font-black text-[10px] uppercase tracking-[0.2em] px-6 py-3.5 rounded-2xl transition-all duration-200 shadow-lg shadow-accent/20 flex items-center space-x-2 cursor-pointer active:scale-95"
                >
                  <Plus className="w-4 h-4" />
                  <span>Log Action</span>
                </button>
              </div>
            </div>

            {/* Quick Filters Panel */}
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-sand dark:border-white/5">
              <div className="flex flex-wrap gap-2">
                {/* Status Toggles */}
                {[
                  { id: 'pending', label: 'Pending Action' },
                  { id: 'completed', label: 'Completed' },
                  { id: 'all', label: 'All Entries' }
                ].map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setCompletedFilter(filter.id as any)}
                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all duration-200 cursor-pointer border ${
                      completedFilter === filter.id 
                        ? 'bg-black dark:bg-alabaster text-white dark:text-espresso border-black dark:border-alabaster shadow-md' 
                        : 'text-espresso/40 dark:text-alabaster/40 border-transparent hover:bg-parchment dark:hover:bg-espresso-surface-bright'
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Sorting and category filtering */}
              <div className="flex items-center gap-3">
                <div className="flex items-center space-x-2">
                  <Filter className="w-3.5 h-3.5 text-espresso/30 dark:text-alabaster/30" />
                  <select
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="bg-parchment dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso/70 dark:text-alabaster/70 text-[9px] font-black uppercase tracking-widest rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                  >
                    <option value="All">All Sectors</option>
                    <option value="Work">💼 Work</option>
                    <option value="Personal">🧘 Personal</option>
                    <option value="Health">⚕️ Health</option>
                    <option value="Finance">💰 Finance</option>
                    <option value="Growth">📚 Growth</option>
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <Layers className="w-3.5 h-3.5 text-espresso/30 dark:text-alabaster/30" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as any)}
                    className="bg-parchment dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso/70 dark:text-alabaster/70 text-[9px] font-black uppercase tracking-widest rounded-xl px-3 py-2 focus:outline-none focus:ring-1 focus:ring-accent cursor-pointer"
                  >
                    <option value="none">Default Sequence</option>
                    <option value="dueDate">🎯 Sort by Due Date</option>
                    <option value="priority">🔥 Sort by Priority</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* New Task Creator Form Inline */}
          {showAddForm && (
            <form onSubmit={handleAddTask} className="clay-card p-8 border-accent/20 bg-accent/5 space-y-6 transition-all animate-in fade-in slide-in-from-top-4">
              <div className="flex items-center justify-between pb-4 border-b border-accent/10">
                <h3 className="text-[10px] font-black text-accent uppercase tracking-[0.3em]">Log Custom Action</h3>
                <span className="text-[9px] text-accent/50 font-mono font-bold tracking-widest">COMMITMENT UNIT</span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Action Headline</label>
                  <input
                    type="text"
                    required
                    placeholder="Submit budget spreadsheets or draft portfolio case studies..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-espresso/20 shadow-sm"
                  />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Operational Details</label>
                  <textarea
                    placeholder="Describe specific milestones or context..."
                    value={newTaskDesc}
                    onChange={(e) => setNewTaskDesc(e.target.value)}
                    rows={3}
                    className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-sm font-bold rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 placeholder:text-espresso/20 shadow-sm resize-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Deadline</label>
                  <div className="relative">
                    <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-espresso/20" />
                    <input
                      type="date"
                      value={newTaskDueDate}
                      onChange={(e) => setNewTaskDueDate(e.target.value)}
                      className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-[11px] font-bold rounded-2xl pl-12 pr-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-sm cursor-pointer"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Urgency Index</label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['low', 'medium', 'high'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setNewTaskPriority(p)}
                        className={`py-3.5 text-[10px] font-black uppercase tracking-widest rounded-2xl border transition-all duration-200 cursor-pointer shadow-sm ${
                          newTaskPriority === p 
                            ? 'bg-black dark:bg-alabaster text-white dark:text-espresso border-black dark:border-alabaster scale-[1.02]' 
                            : 'bg-white dark:bg-espresso-surface border-sand dark:border-espresso-surface-bright text-espresso/40 dark:text-alabaster/40 hover:bg-parchment'
                        }`}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Sector Allocation</label>
                  <select
                    value={newTaskCategory}
                    onChange={(e) => setNewTaskCategory(e.target.value as any)}
                    className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-[11px] font-bold uppercase tracking-widest rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-sm cursor-pointer"
                  >
                    <option value="Work">💼 Work</option>
                    <option value="Personal">🧘 Personal</option>
                    <option value="Health">⚕️ Health</option>
                    <option value="Finance">💰 Finance</option>
                    <option value="Growth">📚 Growth</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-[9px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Project Mapping</label>
                  <select
                    value={newTaskProjectId}
                    onChange={(e) => setNewTaskProjectId(e.target.value)}
                    className="w-full bg-white dark:bg-espresso-surface border border-sand dark:border-espresso-surface-bright text-espresso dark:text-alabaster text-[11px] font-bold uppercase tracking-widest rounded-2xl px-5 py-4 focus:outline-none focus:ring-2 focus:ring-accent/50 shadow-sm cursor-pointer"
                  >
                    <option value="">No Allocation</option>
                    {data.projects.map((p) => (
                      <option key={p.id} value={p.id}>🎯 {p.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-3 justify-end pt-4">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="bg-white dark:bg-espresso-surface text-espresso/40 dark:text-alabaster/40 px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] border border-sand dark:border-espresso-surface-bright hover:bg-parchment transition shadow-sm"
                >
                  Dismiss
                </button>
                <button
                  type="submit"
                  className="bg-accent hover:bg-accent-hover text-white dark:text-cocoa px-8 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-[0.15em] transition shadow-lg shadow-accent/20 cursor-pointer active:scale-95"
                >
                  Confirm Unit
                </button>
              </div>
            </form>
          )}

          {/* Render Active Task Lists */}
          <div className="space-y-4">
            {processedTasks.length > 0 ? (
              processedTasks.map((task) => {
                const assignedProject = data.projects.find((p) => p.id === task.projectId);
                return (
                  <div 
                    key={task.id}
                    className={`clay-card p-5 group flex items-start gap-5 transition-all duration-300 hover:translate-y-[-2px] hover:shadow-md ${
                      task.completed ? 'opacity-60 border-sand/40 grayscale-[0.2]' : 'border-sand dark:border-white/5'
                    }`}
                  >
                    {/* Tick Checkbox */}
                    <button
                      onClick={() => handleToggleTask(task.id)}
                      className="mt-1 flex-shrink-0 cursor-pointer group/tick"
                    >
                      <div className={`w-6 h-6 rounded-xl border-2 flex items-center justify-center transition-all duration-300 ${
                        task.completed 
                          ? 'bg-accent border-accent text-white dark:text-cocoa scale-110' 
                          : 'border-sand dark:border-espresso-surface-bright text-transparent bg-parchment/30 group-hover/tick:border-accent/50'
                      }`}>
                        {task.completed && <CheckSquare className="w-4 h-4" />}
                      </div>
                    </button>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`text-[9px] font-black uppercase tracking-[0.15em] px-3 py-1 rounded-full border shadow-sm ${
                          task.priority === 'high' 
                            ? 'bg-rose-500/10 text-rose-600 border-rose-500/20' 
                            : task.priority === 'medium' 
                            ? 'bg-accent/10 text-accent border-accent/20' 
                            : 'bg-sand/10 text-espresso/40 dark:text-alabaster/40 border-sand/30'
                        }`}>
                          {task.priority} Priority
                        </span>
                        
                        <div className="flex items-center space-x-1 font-black text-[9px] uppercase tracking-widest text-espresso/30 dark:text-alabaster/30">
                          <Tag className="w-3 h-3" />
                          <span>{task.category}</span>
                        </div>

                        {assignedProject && (
                          <div 
                            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-wider text-white shadow-sm"
                            style={{ backgroundColor: assignedProject.color }}
                          >
                            <FolderLock className="w-3 h-3" />
                            <span>{assignedProject.name}</span>
                          </div>
                        )}
                      </div>

                      <h4 className={`text-base font-black tracking-tight leading-none ${
                        task.completed ? 'text-espresso/30 dark:text-alabaster/30 line-through' : 'text-espresso dark:text-alabaster'
                      }`}>
                        {task.title}
                      </h4>

                      {task.description && (
                        <p className={`text-xs leading-relaxed font-medium ${task.completed ? 'text-espresso/20' : 'text-espresso/50 dark:text-alabaster/50'}`}>
                          {task.description}
                        </p>
                      )}

                      {/* Metadata Row */}
                      <div className="flex flex-wrap items-center gap-5 pt-2 text-[10px] font-mono font-bold tracking-tight text-espresso/30 dark:text-alabaster/30">
                        {task.dueDate && (
                          <div className="flex items-center space-x-1.5 bg-parchment/50 dark:bg-black/10 px-2 py-0.5 rounded-md">
                            <Calendar className="w-3.5 h-3.5 text-accent" />
                            <span className="uppercase tracking-widest">Deadline: {task.dueDate}</span>
                          </div>
                        )}
                        {task.completedAt && (
                          <div className="flex items-center space-x-1.5 bg-accent/10 px-2 py-0.5 rounded-md text-accent">
                            <CheckSquare className="w-3.5 h-3.5" />
                            <span className="uppercase tracking-widest">Executed: {task.completedAt}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Trash controls */}
                    <button
                      onClick={() => {
                        if (confirm('Permanently purge this action unit?')) {
                          handleDeleteTask(task.id);
                        }
                      }}
                      className="p-2.5 text-espresso/10 dark:text-alabaster/10 hover:text-red-500 hover:bg-rose-50 dark:hover:bg-red-500/10 rounded-xl transition-all duration-200 cursor-pointer opacity-0 group-hover:opacity-100"
                      title="Purge Unit"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                );
              })
            ) : (
              <div className="clay-card p-20 text-center border-dashed">
                <Compass className="w-12 h-12 text-espresso/10 dark:text-alabaster/10 mx-auto mb-6" />
                <h4 className="text-[11px] font-black text-espresso/40 dark:text-alabaster/40 uppercase tracking-[0.2em]">Operational Silence</h4>
                <p className="text-[10px] text-espresso/30 dark:text-alabaster/30 mt-2 max-w-sm mx-auto font-bold font-mono tracking-widest uppercase">
                  No pending action units detected.
                </p>
              </div>
            )}
          </div>

        </div>


      </div>

    </div>
  );
}
