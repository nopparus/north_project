
import React, { useState } from 'react';
import { Plus, CheckCircle2, Circle, MoreHorizontal } from 'lucide-react';

interface Task {
  id: string;
  title: string;
  category: string;
  completed: boolean;
}

const TaskManager: React.FC = () => {
  const [tasks, setTasks] = useState<Task[]>([
    { id: '1', title: 'Review API Documentation', category: 'Tech', completed: false },
    { id: '2', title: 'Update Dashboard UI', category: 'Design', completed: true },
    { id: '3', title: 'Sync with Stakeholders', category: 'Management', completed: false },
  ]);
  const [newTask, setNewTask] = useState('');

  const addTask = () => {
    if (!newTask) return;
    const task: Task = {
      id: Date.now().toString(),
      title: newTask,
      category: 'General',
      completed: false,
    };
    setTasks([task, ...tasks]);
    setNewTask('');
  };

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  return (
    <div className="p-12 max-w-3xl mx-auto">
      <div className="mb-12">
        <h2 className="text-3xl font-bold mb-2">Daily Tasks</h2>
        <p className="text-zinc-500">Stay focused and organized.</p>
      </div>

      <div className="flex gap-4 mb-10">
        <input 
          type="text" 
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && addTask()}
          placeholder="I need to..."
          className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-emerald-500/50 transition-colors"
        />
        <button 
          onClick={addTask}
          className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 rounded-2xl font-bold transition-all shadow-lg shadow-emerald-900/20"
        >
          <Plus size={24} />
        </button>
      </div>

      <div className="space-y-3">
        {tasks.map((task) => (
          <div 
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`
              group flex items-center justify-between p-5 rounded-2xl border transition-all cursor-pointer
              ${task.completed ? 'bg-zinc-950 border-zinc-800 opacity-60' : 'bg-zinc-900 border-zinc-800 hover:border-zinc-700'}
            `}
          >
            <div className="flex items-center gap-4">
              <div className={task.completed ? 'text-emerald-500' : 'text-zinc-600'}>
                {task.completed ? <CheckCircle2 size={22} /> : <Circle size={22} />}
              </div>
              <div>
                <div className={`font-medium ${task.completed ? 'line-through text-zinc-500' : 'text-white'}`}>
                  {task.title}
                </div>
                <div className="text-xs text-zinc-600 mt-1 uppercase tracking-widest font-bold">
                  {task.category}
                </div>
              </div>
            </div>
            <button className="opacity-0 group-hover:opacity-100 p-2 hover:bg-zinc-800 rounded-lg transition-all text-zinc-500">
              <MoreHorizontal size={18} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TaskManager;
