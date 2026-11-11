import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { TaskItem, TaskCategory, TaskPriority } from '../../types';
import {
  CheckSquare,
  Plus,
  Calendar,
  Clock,
  AlertCircle,
  CheckCircle2,
  Trash2,
  Edit2,
  X,
  Filter,
  Check,
  Bell
} from 'lucide-react';

export const TaskManager: React.FC = () => {
  const { tasks, addTask, updateTask, toggleTaskCompleted, deleteTask, t, language } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'all' | 'today' | 'overdue' | 'completed'>('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskItem | null>(null);

  const todayStr = new Date().toISOString().split('T')[0];

  const initialFormState: Omit<TaskItem, 'id'> = {
    title: '',
    category: 'Follow-up',
    priority: 'Medium',
    dueDate: todayStr,
    dueTime: '15:00',
    completed: false,
    reminder: true,
    notes: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const filteredTasks = tasks.filter(t => {
    const matchesCategory = categoryFilter === 'all' || t.category === categoryFilter;
    const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;

    let matchesView = true;
    if (viewMode === 'today') {
      matchesView = t.dueDate === todayStr && !t.completed;
    } else if (viewMode === 'overdue') {
      matchesView = t.dueDate < todayStr && !t.completed;
    } else if (viewMode === 'completed') {
      matchesView = t.completed;
    }

    return matchesCategory && matchesPriority && matchesView;
  });

  const overdueCount = tasks.filter(t => t.dueDate < todayStr && !t.completed).length;
  const todayCount = tasks.filter(t => t.dueDate === todayStr && !t.completed).length;

  const handleOpenAdd = () => {
    setEditingTask(null);
    setFormData(initialFormState);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (task: TaskItem) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      category: task.category,
      priority: task.priority,
      dueDate: task.dueDate,
      dueTime: task.dueTime || '15:00',
      completed: task.completed,
      reminder: task.reminder,
      relatedEntityType: task.relatedEntityType,
      relatedEntityName: task.relatedEntityName,
      notes: task.notes || ''
    });
    setIsFormOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) return;

    if (editingTask) {
      updateTask(editingTask.id, formData);
    } else {
      addTask(formData);
    }
    setIsFormOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Title & Add */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-2">
            <CheckSquare className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            <span>{t.tasksTitle}</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.tasksSubtitle}</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-700 text-white transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <Plus className="w-4 h-4" />
          <span>{t.addTask}</span>
        </button>
      </div>

      {/* Segmented View Mode Tabs & Quick Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-2 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setViewMode('all')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              viewMode === 'all'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            All Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setViewMode('today')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              viewMode === 'today'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
            }`}
          >
            Today's Focus ({todayCount})
          </button>
          <button
            onClick={() => setViewMode('overdue')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              viewMode === 'overdue'
                ? 'bg-white dark:bg-slate-700 text-rose-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-rose-600'
            }`}
          >
            Overdue ({overdueCount})
          </button>
          <button
            onClick={() => setViewMode('completed')}
            className={`px-3 py-1.5 rounded-lg font-semibold transition-colors ${
              viewMode === 'completed'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-emerald-600'
            }`}
          >
            Completed
          </button>
        </div>

        <div className="flex items-center gap-2">
          {/* Category filter */}
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-xs"
          >
            <option value="all">All Categories</option>
            <option value="Follow-up">Follow-up</option>
            <option value="Find New Buyers">Find New Buyers</option>
            <option value="Find New Suppliers">Find New Suppliers</option>
            <option value="Verify Leads">Verify Leads</option>
            <option value="Send Outreach Messages">Send Outreach Messages</option>
            <option value="Match Buyers and Suppliers">Match Buyers and Suppliers</option>
            <option value="Introduce Business Partners">Introduce Partners</option>
            <option value="Check Deal Status">Check Deal Status</option>
            <option value="Collect Commission">Collect Commission</option>
          </select>
        </div>
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            <p className="text-sm font-semibold">No tasks in this view!</p>
            <p className="text-xs mt-1">You are all caught up on scheduled follow-ups and outreach.</p>
          </div>
        ) : (
          filteredTasks.map(task => {
            const isOverdue = task.dueDate < todayStr && !task.completed;

            return (
              <div
                key={task.id}
                className={`p-4 rounded-xl border transition-all flex items-start justify-between gap-4 text-xs ${
                  task.completed
                    ? 'bg-slate-50/60 dark:bg-slate-900/40 border-slate-200 dark:border-slate-800 opacity-70'
                    : isOverdue
                    ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/40'
                    : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xs'
                }`}
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <input
                    type="checkbox"
                    checked={task.completed}
                    onChange={() => toggleTaskCompleted(task.id)}
                    className="mt-1 w-4 h-4 rounded text-blue-600 focus:ring-blue-500 cursor-pointer"
                  />

                  <div className="space-y-1 min-w-0">
                    <p
                      className={`text-xs sm:text-sm font-semibold leading-snug ${
                        task.completed ? 'line-through text-slate-400' : 'text-slate-900 dark:text-slate-100'
                      }`}
                    >
                      {task.title}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{task.category}</span>
                      <span aria-hidden="true">·</span>
                      <span
                        className={`font-semibold ${
                          task.priority === 'Urgent'
                            ? 'text-rose-600'
                            : task.priority === 'High'
                            ? 'text-amber-600'
                            : 'text-slate-500'
                        }`}
                      >
                        {task.priority} Priority
                      </span>
                      {task.relatedEntityName && (
                        <>
                          <span aria-hidden="true">·</span>
                          <span className="text-slate-600 dark:text-slate-300 font-medium">{task.relatedEntityName}</span>
                        </>
                      )}
                    </div>

                    {task.notes && (
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 pt-0.5">{task.notes}</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <div
                      className={`font-mono text-xs font-semibold ${
                        isOverdue ? 'text-rose-600' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {task.dueDate} {task.dueTime}
                    </div>
                    {isOverdue && <span className="text-[10px] font-bold text-rose-600 uppercase">Overdue</span>}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleOpenEdit(task)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-amber-600"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* ADD / EDIT TASK MODAL */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl p-6 text-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">
                {editingTask ? 'Edit Task' : 'Add New Task / Follow-up'}
              </h2>
              <button onClick={() => setIsFormOpen(false)}>
                <X className="w-5 h-5 text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Task Title *</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Call Arthur at Keystone regarding pallet MOQ"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value as TaskCategory })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="Follow-up">Follow-up</option>
                    <option value="Find New Buyers">Find New Buyers</option>
                    <option value="Find New Suppliers">Find New Suppliers</option>
                    <option value="Verify Leads">Verify Leads</option>
                    <option value="Send Outreach Messages">Send Outreach Messages</option>
                    <option value="Qualify Clients">Qualify Clients</option>
                    <option value="Match Buyers and Suppliers">Match Buyers and Suppliers</option>
                    <option value="Introduce Business Partners">Introduce Partners</option>
                    <option value="Check Deal Status">Check Deal Status</option>
                    <option value="Collect Commission">Collect Commission</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={e => setFormData({ ...formData, priority: e.target.value as TaskPriority })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-medium"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Due Date</label>
                  <input
                    type="date"
                    required
                    value={formData.dueDate}
                    onChange={e => setFormData({ ...formData, dueDate: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Time (Dhaka)</label>
                  <input
                    type="time"
                    value={formData.dueTime}
                    onChange={e => setFormData({ ...formData, dueTime: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-600 dark:text-slate-400 font-medium mb-1">Notes / Instructions</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Add specific instructions or phone contact details..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-xs"
                >
                  {editingTask ? 'Save Updates' : 'Add Task'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
