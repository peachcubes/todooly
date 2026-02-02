import React, { useState, useEffect } from 'react';
import { Check, Plus, X, ChevronLeft, ChevronRight } from 'lucide-react';

export default function Todooly() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [tasks, setTasks] = useState([]);
  const [completions, setCompletions] = useState({});
  const [newTaskText, setNewTaskText] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('theme');
      if (saved) return saved === 'dark';
      return false;
    } catch (e) {
      return false;
    }
  });

  // Load data from localStorage on mount
  useEffect(() => {
    loadData();
  }, []);

  // Save data whenever it changes
  useEffect(() => {
    if (!isLoading) {
      saveData();
    }
  }, [tasks, completions, isLoading]);

  useEffect(() => {
    try {
      document.documentElement.classList.toggle('dark', isDark);
      localStorage.setItem('theme', isDark ? 'dark' : 'light');
    } catch (e) {
      // ignore
    }
  }, [isDark]);

  const loadData = () => {
    try {
      const savedTasks = localStorage.getItem('tasks');
      const savedCompletions = localStorage.getItem('completions');
      
      if (savedTasks) {
        setTasks(JSON.parse(savedTasks));
      }
      if (savedCompletions) {
        setCompletions(JSON.parse(savedCompletions));
      }
    } catch (error) {
      console.log('No saved data found, starting fresh');
    }
    setIsLoading(false);
  };

  const saveData = () => {
    try {
      localStorage.setItem('tasks', JSON.stringify(tasks));
      localStorage.setItem('completions', JSON.stringify(completions));
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    return { daysInMonth, startingDayOfWeek };
  };

  const formatDateKey = (date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const getCompletionStatus = (dateKey) => {
    const dayCompletions = completions[dateKey] || {};
    const completedCount = Object.values(dayCompletions).filter(Boolean).length;
    
    if (tasks.length === 0) return 'none';
    if (completedCount === tasks.length) return 'complete';
    if (completedCount > 0) return 'partial';
    return 'none';
  };

  const toggleTask = (taskId, dateKey) => {
    setCompletions(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        [taskId]: !prev[dateKey]?.[taskId]
      }
    }));
  };

  const addTask = () => {
    if (newTaskText.trim()) {
      const newTask = {
        id: Date.now().toString(),
        text: newTaskText.trim()
      };
      setTasks([...tasks, newTask]);
      setNewTaskText('');
    }
  };

  const deleteTask = (taskId) => {
    setTasks(tasks.filter(h => h.id !== taskId));
    // Clean up completions for this task
    const newCompletions = { ...completions };
    Object.keys(newCompletions).forEach(dateKey => {
      delete newCompletions[dateKey][taskId];
    });
    setCompletions(newCompletions);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const monthName = currentDate.toLocaleString('default', { month: 'long', year: 'numeric' });
  const todayKey = formatDateKey(new Date());
  const todayCompletions = completions[todayKey] || {};

  const renderCalendar = () => {
    const days = [];
    const totalCells = Math.ceil((daysInMonth + startingDayOfWeek) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
      const dayNumber = i - startingDayOfWeek + 1;
      const isValidDay = dayNumber > 0 && dayNumber <= daysInMonth;
      
      if (isValidDay) {
        const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
        const dateKey = formatDateKey(date);
        const status = getCompletionStatus(dateKey);
        const isToday = dateKey === todayKey;
        
        let bgColor = 'bg-white';
        if (status === 'complete') bgColor = 'bg-green-100 border-green-400';
        else if (status === 'partial') bgColor = 'bg-red-100 border-red-400';
        
        days.push(
          <div
            key={i}
            className={`aspect-square border-2 ${bgColor} ${isToday ? 'ring-2 ring-blue-500' : 'border-gray-200'} rounded-lg flex items-center justify-center font-medium transition-colors`}
          >
            {dayNumber}
          </div>
        );
      } else {
        days.push(<div key={i} className="aspect-square"></div>);
      }
    }

    return days;
  };

  if (isLoading) {
    return (
      <div style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'Georgia, "Times New Roman", Times, serif' }} className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-800 dark:text-gray-100 mb-3">Todooly</h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Track your daily repeating tasks. Complete all tasks to turn the day <span className="text-green-600 font-semibold">green</span>, 
            or leave some incomplete and it turns <span className="text-red-600 font-semibold">red</span>. 
            Build your streak and stay consistent!
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-8">
          {/* Calendar Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-6">
              <button onClick={previousMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronLeft className="w-6 h-6" />
              </button>
              <h2 className="text-2xl font-semibold text-gray-800">{monthName}</h2>
              <button onClick={nextMonth} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
            
            <div className="grid grid-cols-7 gap-2 mb-2">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
                  {day}
                </div>
              ))}
            </div>
            
            <div className="grid grid-cols-7 gap-2">
              {renderCalendar()}
            </div>

            <div className="mt-6 flex items-center justify-center gap-6 text-sm">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
                <span>All Done</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-red-100 border-2 border-red-400 rounded"></div>
                <span>Incomplete</span>
              </div>
            </div>
          </div>

          {/* Checklist Section */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-semibold text-gray-800 dark:text-gray-100 mb-6">Today's Tasks</h2>
            
            <div className="space-y-3 mb-6">
              {tasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors">
                  <button
                    onClick={() => toggleTask(task.id, todayKey)}
                    className={`w-6 h-6 rounded border-2 flex items-center justify-center transition-colors ${
                      todayCompletions[task.id]
                        ? 'bg-green-500 border-green-500'
                        : 'border-gray-300 hover:border-green-400'
                    }`}
                  >
                    {todayCompletions[task.id] && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <span className={`flex-1 ${todayCompletions[task.id] ? 'line-through text-gray-500' : 'text-gray-800 dark:text-gray-100'}`}>
                    {task.text}
                  </span>
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="p-1 hover:bg-red-100 rounded transition-colors"
                  >
                    <X className="w-5 h-5 text-red-500" />
                  </button>
                </div>
              ))}
              
              {tasks.length === 0 && (
                <p className="text-gray-500 dark:text-gray-300 text-center py-8">No tasks yet. Add one below!</p>
              )}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addTask()}
                placeholder="Add a new task..."
                className="flex-1 px-4 py-2 border-2 border-gray-200 dark:border-gray-600 rounded-lg focus:outline-none focus:border-blue-500 dark:bg-gray-700 dark:text-gray-100 transition-colors"
              />
              <button
                onClick={addTask}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                Add
              </button>
            </div>
          </div>
        </div>
      </div>
      <button
        onClick={() => setIsDark(prev => !prev)}
        className="fixed bottom-6 right-6 px-4 py-2 bg-gray-800 dark:bg-gray-100 text-white dark:text-gray-800 border-2 border-gray-700 dark:border-gray-300 rounded-lg hover:bg-gray-700 dark:hover:bg-gray-200 transition font-medium"
      >
        {isDark ? 'Light' : 'Dark'}
      </button>
    </div>
  );
}