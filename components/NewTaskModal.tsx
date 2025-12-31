import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Clock, 
  Tag, 
  Plus, 
  Check,
  Trash2
} from 'lucide-react';
import { format, addMinutes } from 'date-fns';
import { Task, CategoryConfig } from '../types';

// --- Helper Components ---

const SmartTimeInput = ({ value, onChange, label, themeStyles }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const activeItemRef = useRef<HTMLButtonElement>(null);
  const [localValue, setLocalValue] = useState(value);

  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Auto-scroll to selected time
  useEffect(() => {
    if (isOpen && activeItemRef.current) {
      activeItemRef.current.scrollIntoView({ block: 'center', behavior: 'instant' });
    }
  }, [isOpen]);

  const handleBlur = () => {
    let clean = localValue.replace(/[^0-9]/g, '');
    let formatted = '09:00'; 

    if (clean.length === 0) return;

    if (clean.length <= 2) {
      const h = parseInt(clean, 10);
      if (h >= 0 && h < 24) formatted = `${h.toString().padStart(2, '0')}:00`;
    } else if (clean.length >= 3) {
      const h = parseInt(clean.substring(0, clean.length === 3 ? 1 : 2), 10);
      const m = parseInt(clean.substring(clean.length === 3 ? 1 : 2), 10);
      if (h >= 0 && h < 24 && m >= 0 && m < 60) {
        formatted = `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
      }
    }

    setLocalValue(formatted);
    onChange(formatted);
  };

  const timeOptions = [];
  for (let i = 0; i < 24; i++) {
    timeOptions.push(`${i.toString().padStart(2, '0')}:00`);
    timeOptions.push(`${i.toString().padStart(2, '0')}:30`);
  }

  return (
    <div className="flex-1 relative" ref={containerRef}>
      {label && <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>}
      <div className="relative group">
        <input 
          type="text"
          value={localValue}
          onChange={(e) => setLocalValue(e.target.value)}
          onBlur={handleBlur}
          onFocus={() => setIsOpen(false)}
          maxLength={5}
          className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 pr-10 outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-sm dark:text-white transition-all"
        />
        <button 
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-indigo-500 transition-colors"
        >
          <Clock size={16} />
        </button>
      </div>

      {isOpen && (
        <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto custom-scrollbar">
           {timeOptions.map(t => (
             <button
               key={t}
               type="button"
               ref={t === value ? activeItemRef : null}
               onClick={() => { onChange(t); setIsOpen(false); }}
               className={`w-full text-left px-4 py-2 text-sm font-mono hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors ${t === value ? `${themeStyles.text} font-bold bg-zinc-50 dark:bg-zinc-800/50` : 'text-zinc-600 dark:text-zinc-300'}`}
             >
               {t}
             </button>
           ))}
        </div>
      )}
    </div>
  );
};

// --- Main Component ---

interface NewTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (task: any) => void;
  onDelete?: (taskId: string) => void;
  categories: CategoryConfig[];
  editingTask?: Partial<Task>;
  themeStyles: any;
}

export default function NewTaskModal({ isOpen, onClose, onSave, onDelete, categories, editingTask, themeStyles }: NewTaskModalProps) {
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(categories[0]?.id || '');
  
  // Strict Mode: Single tag string instead of array
  const [selectedTag, setSelectedTag] = useState<string>('');
  
  const [tagInput, setTagInput] = useState('');
  const [isTagDropdownOpen, setIsTagDropdownOpen] = useState(false);
  const [taskImpact, setTaskImpact] = useState(5);

  const containerRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsTagDropdownOpen(false);
      }
    };
    if (isTagDropdownOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isTagDropdownOpen]);

  // Initialization Effect
  useEffect(() => {
    if (isOpen) {
      if (editingTask) {
        // Edit Mode: Load existing task data
        setFormStartTime(editingTask.startTime || '09:00');
        setFormEndTime(editingTask.endTime || '10:00');
        setSelectedCategoryId(editingTask.categoryId || categories[0].id);
        
        // Flatten tags to single string
        const existingTags = editingTask.tags || [];
        setSelectedTag(existingTags.length > 0 ? existingTags[0] : '');
        
        setTaskImpact(editingTask.impact || 5);
      } else {
        // Create Mode: Initialize New Task
        const now = new Date();
        const start = new Date(now);
        start.setSeconds(0, 0);
        
        // Smart Time: Round UP to next 30-minute slot
        const remainder = 30 - (start.getMinutes() % 30);
        const smartStart = addMinutes(start, remainder);
        const smartEnd = addMinutes(smartStart, 60);
        
        setFormStartTime(format(smartStart, 'HH:mm'));
        setFormEndTime(format(smartEnd, 'HH:mm'));
        setTaskImpact(5);

        // Auto-select first category and its primary tag
        const defaultCat = categories.find(c => c.isDefault) || categories[0];
        if (defaultCat) {
          setSelectedCategoryId(defaultCat.id);
          const configTags = defaultCat.defaultTags || [];
          setSelectedTag(configTags.length > 0 ? configTags[0] : '');
        }
      }
      setTagInput('');
      setIsTagDropdownOpen(false);
    }
  }, [isOpen, editingTask, categories]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategoryId(catId);
    
    // STRICT CONTEXT: When category changes, switch to the first tag of that category automatically
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      const configTags = cat.defaultTags || [];
      setSelectedTag(configTags.length > 0 ? configTags[0] : '');
    }
    setTagInput(''); // Clear any custom input
  };

  const handleQuickDuration = (minutes: number) => {
    const [h, m] = formStartTime.split(':').map(Number);
    const d = new Date();
    d.setHours(h, m);
    const newEnd = addMinutes(d, minutes);
    setFormEndTime(format(newEnd, 'HH:mm'));
  };

  const selectTag = (tag: string) => {
    setSelectedTag(tag);
    setTagInput('');
    setIsTagDropdownOpen(false);
  };

  const clearTag = () => {
    setSelectedTag('');
    setIsTagDropdownOpen(true); // Keep dropdown open to pick new one immediately
  };

  const handleTagChipClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent container click
    // Edit mode: Convert tag back to input text
    setTagInput(selectedTag);
    setSelectedTag('');
    setIsTagDropdownOpen(true);
  };

  // Determine available tags based on selected category
  const currentCategory = categories.find(c => c.id === selectedCategoryId);
  const currentCategoryName = currentCategory?.name || '';
  const availableTags = currentCategory?.defaultTags || [];
  
  // Filter for dropdown
  const filteredTags = availableTags.filter(t => t.toLowerCase().includes(tagInput.toLowerCase()));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border dark:border-zinc-700 animate-in fade-in zoom-in-95 duration-200">
        <h2 className="text-xl font-bold dark:text-white mb-4">{editingTask ? 'Edit Task' : 'New Task'}</h2>
        
        <form onSubmit={(e) => {
           e.preventDefault();
           const formData = new FormData(e.currentTarget);
           onSave({
             id: editingTask?.id,
             title: formData.get('title'),
             description: formData.get('description'),
             impact: taskImpact,
             startTime: formStartTime,
             endTime: formEndTime,
             categoryId: selectedCategoryId,
             tags: selectedTag ? [selectedTag] : [] // Convert back to array for compatibility
           });
        }}>
          {/* 1. Title Input */}
          <input 
            name="title" 
            required 
            defaultValue={editingTask?.title} 
            placeholder="Task Title" 
            autoFocus
            className="w-full mb-3 p-3 rounded-xl border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white font-medium" 
          />
          
          {/* 2. Time Section (Grouped) */}
          <div className="bg-zinc-100 dark:bg-zinc-900/50 border border-zinc-200 dark:border-zinc-800 rounded-xl p-3 mb-4">
            <div className="flex gap-3 mb-2">
               <SmartTimeInput value={formStartTime} onChange={setFormStartTime} label="Start Time" themeStyles={themeStyles} />
               <SmartTimeInput value={formEndTime} onChange={setFormEndTime} label="End Time" themeStyles={themeStyles} />
            </div>

            {/* Quick Duration Presets */}
            <div className="flex gap-2">
              {[30, 60, 90, 120].map(mins => {
                const [sh, sm] = formStartTime.split(':').map(Number);
                const [eh, em] = formEndTime.split(':').map(Number);
                const startMins = sh * 60 + sm;
                const endMins = eh * 60 + em;
                const diff = endMins - startMins;
                const isActive = Math.abs(diff - mins) < 5;

                return (
                  <button
                    key={mins}
                    type="button"
                    onClick={() => handleQuickDuration(mins)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-colors border ${isActive ? `${themeStyles.bg} text-white border-transparent` : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}
                  >
                    +{mins < 60 ? `${mins}m` : `${mins/60}h`}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4" />

          {/* 3. Context Section */}
          <div className="space-y-4 mb-4">
            {/* Categories */}
            <div>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">Category</label>
              <div className="grid grid-cols-2 gap-2">
                {categories.map(cat => (
                   <label key={cat.id} className="cursor-pointer group">
                     <input 
                       type="radio" 
                       name="categoryId" 
                       value={cat.id} 
                       checked={selectedCategoryId === cat.id}
                       onChange={() => handleCategorySelect(cat.id)}
                       className="peer hidden" 
                     />
                     <div className="h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 peer-checked:ring-2 peer-checked:ring-offset-1 flex items-center justify-center text-xs font-bold px-1 transition-all group-hover:bg-zinc-50 dark:group-hover:bg-zinc-800" style={{ backgroundColor: selectedCategoryId === cat.id ? `${cat.color}15` : undefined, color: selectedCategoryId === cat.id ? cat.color : undefined }}>
                       {cat.name}
                     </div>
                   </label>
                ))}
              </div>
            </div>

            {/* Smart Tag Selector - Strict Mode */}
            <div className="relative" ref={containerRef}>
              <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">Tag (Single Selection)</label>
              <div 
                className="w-full p-2.5 rounded-xl border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 focus-within:ring-2 focus-within:ring-indigo-500 flex items-center gap-2 min-h-[44px] cursor-pointer"
                onClick={() => setIsTagDropdownOpen(!isTagDropdownOpen)}
              >
                <Tag size={16} className="text-zinc-400 mr-1 flex-shrink-0" />
                
                {selectedTag ? (
                  <span 
                    onClick={handleTagChipClick}
                    className="flex items-center gap-1 bg-white dark:bg-zinc-700 border border-zinc-200 dark:border-zinc-600 text-zinc-700 dark:text-zinc-200 px-2 py-0.5 rounded-lg text-xs font-bold shadow-sm hover:bg-zinc-50 dark:hover:bg-zinc-600 transition-colors"
                  >
                    {selectedTag}
                    <button 
                      type="button" 
                      onClick={(e) => { e.stopPropagation(); clearTag(); }} 
                      className="hover:text-red-500 rounded-full p-0.5 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                    >
                      <X size={12} />
                    </button>
                  </span>
                ) : (
                    <input 
                      value={tagInput}
                      onChange={e => { setTagInput(e.target.value); setIsTagDropdownOpen(true); }}
                      onFocus={() => setIsTagDropdownOpen(true)}
                      onClick={(e) => e.stopPropagation()} 
                      placeholder={availableTags.length > 0 ? "Select a tag..." : "Type custom tag..."}
                      className="flex-1 bg-transparent outline-none text-sm dark:text-white min-w-[80px]"
                    />
                )}
              </div>
              
              {isTagDropdownOpen && (
                <div className="absolute top-full left-0 w-full mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-50 overflow-hidden max-h-48 overflow-y-auto">
                    {/* Suggested Tags based on Category */}
                    {filteredTags.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        onClick={() => selectTag(tag)}
                        className={`w-full text-left px-4 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-sm flex items-center gap-2 ${tag === selectedTag ? `${themeStyles.text} font-bold bg-zinc-50 dark:bg-zinc-800/50` : 'text-zinc-700 dark:text-zinc-200'}`}
                      >
                        <Tag size={14} className={tag === selectedTag ? themeStyles.text : "text-zinc-400"} />
                        {tag}
                        {tag === selectedTag && <Check size={14} className="ml-auto" />}
                      </button>
                    ))}
                    
                    {/* Allow creating custom tags if input exists and isn't a duplicate */}
                    {tagInput.trim() && !filteredTags.includes(tagInput.trim()) && (
                       <button
                         type="button"
                         onClick={() => selectTag(tagInput.trim())}
                         className="w-full text-left px-4 py-2 hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2 border-t border-zinc-100 dark:border-zinc-800"
                       >
                         <Plus size={14} />
                         Create "{tagInput}"
                       </button>
                    )}
                    
                    {filteredTags.length === 0 && !tagInput.trim() && (
                      <div className="px-4 py-3 text-xs text-zinc-400 italic text-center">
                        No preset tags found. Type to create.
                      </div>
                    )}

                    <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1"></div>
                    <button type="button" onClick={() => setIsTagDropdownOpen(false)} className="w-full text-center py-2 text-xs text-zinc-400 hover:text-zinc-600">Close</button>
                </div>
              )}
            </div>
          </div>

          <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-4" />

          {/* 4. Details Section */}
          <div className="mb-4">
            <label className="block text-[10px] uppercase font-bold text-zinc-500 tracking-wider mb-2">Priority (1-10)</label>
            <div className="flex items-center gap-2">
              <input 
                type="range" 
                name="impact" 
                min="1" 
                max="10" 
                value={taskImpact} 
                onChange={(e) => setTaskImpact(parseInt(e.target.value))}
                className={`w-full h-1.5 bg-zinc-200 rounded-lg appearance-none cursor-pointer dark:bg-zinc-700 accent-${themeStyles.text.split('-')[1]}-600`} 
              />
              <span className="text-sm font-bold w-6 text-center text-zinc-700 dark:text-zinc-300">{taskImpact}</span>
            </div>
          </div>
          
          <div className="mb-6">
            <textarea 
              name="description" 
              defaultValue={editingTask?.description} 
              placeholder="Notes..." 
              className="w-full h-20 p-3 rounded-xl border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none text-sm" 
            />
          </div>
          
          {/* 5. Footer */}
          <div className="flex gap-3">
            {/* Delete Button - Only shown when editing existing task */}
            {editingTask && onDelete && (
               <button 
                  type="button" 
                  onClick={() => onDelete(editingTask.id!)}
                  className="p-3 text-red-500 bg-red-50 hover:bg-red-100 dark:bg-red-900/20 dark:hover:bg-red-900/40 rounded-xl transition-colors"
                  title="Delete Task"
               >
                 <Trash2 size={20} />
               </button>
            )}
            <button type="button" onClick={onClose} className="flex-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 py-3 rounded-xl transition-colors font-medium">Cancel</button>
            <button className={`flex-[2] ${themeStyles.bg} ${themeStyles.hover} text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-transform active:scale-95`}>Save Task</button>
          </div>
        </form>
      </div>
    </div>
  );
}