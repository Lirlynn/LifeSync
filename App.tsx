import React, { useState, useEffect, useMemo, useRef } from 'react';
import { 
  Plus, 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Trash2, 
  Edit2, 
  Settings, 
  LogOut, 
  RefreshCcw, 
  Download, 
  Upload,
  BrainCircuit,
  X,
  Moon,
  Sun,
  PenTool,
  Check,
  MoreVertical,
  Activity,
  Target,
  Zap,
  Coffee,
  Clock,
  AlertCircle,
  User as UserIcon,
  Mail,
  Lock,
  Save,
  Copy,
  Layout,
  Share,
  Sparkles,
  CheckCircle2,
  Flag,
  BarChart3,
  TrendingUp,
  Timer,
  Smile,
  Meh,
  Frown,
  Palette,
  Dumbbell,
  Briefcase,
  BookOpen,
  Chrome,
  Tag,
  Code,
  Music,
  Home,
  ShoppingCart,
  Gamepad2,
  Plane,
  Tv,
  Utensils,
  Monitor,
  Smartphone,
  Headphones,
  GraduationCap,
  Leaf,
  Heart,
  Circle,
  HelpCircle,
  MoreHorizontal,
  Users,
  AlertTriangle,
  ExternalLink,
  Database,
  DollarSign,
  Wallet,
  CreditCard,
  Landmark,
  PiggyBank,
  Receipt,
  Gift,
  Car,
  Bus,
  Train,
  Bike
} from 'lucide-react';
import { 
  format, 
  addDays, 
  addMonths, 
  addYears, 
  endOfMonth, 
  endOfWeek, 
  eachDayOfInterval, 
  isSameDay, 
  differenceInMinutes, 
  differenceInDays, 
  isSameMonth, 
  isSameYear,
  eachDayOfInterval as eachDayOfIntervalFn
} from 'date-fns';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid, 
  LabelList, 
  Legend, 
  Cell
} from 'recharts';
import { Task, CategoryConfig, DailyLog, TimeRange, User, WeekTemplate } from './types';
import { generateDailyInsight } from './geminiService';

// Firebase Imports
import { 
  signInWithPopup, 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut as firebaseSignOut,
  onAuthStateChanged
} from "firebase/auth";
import { auth, googleProvider } from "./firebase";

// --- Constants & Themes ---

const APP_VERSION = "1.0.15"; // Update this before every deploy to track changes

const TIME_START_HOUR = 5; // 5:00 AM
const TIME_END_HOUR = 29; // 5:00 AM next day (covers until 04:59)
const PIXELS_PER_HOUR = 54; // Reduced height for better zoom out
const TIMELINE_HEIGHT = (TIME_END_HOUR - TIME_START_HOUR) * PIXELS_PER_HOUR;

const COLOR_THEMES = {
  red: {
    bg: 'bg-red-600', hover: 'hover:bg-red-700', text: 'text-red-600',
    border: 'border-red-500', ring: 'focus:ring-red-500',
    bgLight: 'bg-red-100', textLight: 'text-red-200',
    softBg: 'bg-red-50', hoverBorder: 'hover:border-red-300',
    activeBg: 'bg-red-600', activeText: 'text-red-100'
  },
  orange: {
    bg: 'bg-orange-600', hover: 'hover:bg-orange-700', text: 'text-orange-600',
    border: 'border-orange-500', ring: 'focus:ring-orange-500',
    bgLight: 'bg-orange-100', textLight: 'text-orange-200',
    softBg: 'bg-orange-50', hoverBorder: 'hover:border-orange-300',
    activeBg: 'bg-orange-600', activeText: 'text-orange-100'
  },
  amber: {
    bg: 'bg-amber-600', hover: 'hover:bg-amber-700', text: 'text-amber-600',
    border: 'border-amber-500', ring: 'focus:ring-amber-500',
    bgLight: 'bg-amber-100', textLight: 'text-amber-200',
    softBg: 'bg-amber-50', hoverBorder: 'hover:border-amber-300',
    activeBg: 'bg-amber-600', activeText: 'text-amber-100'
  },
  yellow: {
    bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600', text: 'text-yellow-600',
    border: 'border-yellow-500', ring: 'focus:ring-yellow-500',
    bgLight: 'bg-yellow-100', textLight: 'text-yellow-200',
    softBg: 'bg-yellow-50', hoverBorder: 'hover:border-yellow-300',
    activeBg: 'bg-yellow-500', activeText: 'text-yellow-100'
  },
  lime: {
    bg: 'bg-lime-600', hover: 'hover:bg-lime-700', text: 'text-lime-600',
    border: 'border-lime-500', ring: 'focus:ring-lime-500',
    bgLight: 'bg-lime-100', textLight: 'text-lime-200',
    softBg: 'bg-lime-50', hoverBorder: 'hover:border-lime-300',
    activeBg: 'bg-lime-600', activeText: 'text-lime-100'
  },
  emerald: {
    bg: 'bg-emerald-600', hover: 'hover:bg-emerald-700', text: 'text-emerald-600',
    border: 'border-emerald-500', ring: 'focus:ring-emerald-500',
    bgLight: 'bg-emerald-100', textLight: 'text-emerald-200',
    softBg: 'bg-emerald-50', hoverBorder: 'hover:border-emerald-300',
    activeBg: 'bg-emerald-600', activeText: 'text-emerald-100'
  },
  teal: {
    bg: 'bg-teal-600', hover: 'hover:bg-teal-700', text: 'text-teal-600',
    border: 'border-teal-500', ring: 'focus:ring-teal-500',
    bgLight: 'bg-teal-100', textLight: 'text-teal-200',
    softBg: 'bg-teal-50', hoverBorder: 'hover:border-teal-300',
    activeBg: 'bg-teal-600', activeText: 'text-teal-100'
  },
  cyan: {
    bg: 'bg-cyan-600', hover: 'hover:bg-cyan-700', text: 'text-cyan-600',
    border: 'border-cyan-500', ring: 'focus:ring-cyan-500',
    bgLight: 'bg-cyan-100', textLight: 'text-cyan-200',
    softBg: 'bg-cyan-50', hoverBorder: 'hover:border-cyan-300',
    activeBg: 'bg-cyan-600', activeText: 'text-cyan-100'
  },
  sky: {
    bg: 'bg-sky-600', hover: 'hover:bg-sky-700', text: 'text-sky-600',
    border: 'border-sky-500', ring: 'focus:ring-sky-500',
    bgLight: 'bg-sky-100', textLight: 'text-sky-200',
    softBg: 'bg-sky-50', hoverBorder: 'hover:border-sky-300',
    activeBg: 'bg-sky-600', activeText: 'text-sky-100'
  },
  blue: {
    bg: 'bg-blue-600', hover: 'hover:bg-blue-700', text: 'text-blue-600',
    border: 'border-blue-500', ring: 'focus:ring-blue-500',
    bgLight: 'bg-blue-100', textLight: 'text-blue-200',
    softBg: 'bg-blue-50', hoverBorder: 'hover:border-blue-300',
    activeBg: 'bg-blue-600', activeText: 'text-blue-100'
  },
  indigo: {
    bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700', text: 'text-indigo-600',
    border: 'border-indigo-500', ring: 'focus:ring-indigo-500',
    bgLight: 'bg-indigo-100', textLight: 'text-indigo-200',
    softBg: 'bg-indigo-50', hoverBorder: 'hover:border-indigo-300',
    activeBg: 'bg-indigo-600', activeText: 'text-indigo-100'
  },
  violet: {
    bg: 'bg-violet-600', hover: 'hover:bg-violet-700', text: 'text-violet-600',
    border: 'border-violet-500', ring: 'focus:ring-violet-500',
    bgLight: 'bg-violet-100', textLight: 'text-violet-200',
    softBg: 'bg-violet-50', hoverBorder: 'hover:border-violet-300',
    activeBg: 'bg-violet-600', activeText: 'text-violet-100'
  },
  fuchsia: {
    bg: 'bg-fuchsia-600', hover: 'hover:bg-fuchsia-700', text: 'text-fuchsia-600',
    border: 'border-fuchsia-500', ring: 'focus:ring-fuchsia-500',
    bgLight: 'bg-fuchsia-100', textLight: 'text-fuchsia-200',
    softBg: 'bg-fuchsia-50', hoverBorder: 'hover:border-fuchsia-300',
    activeBg: 'bg-fuchsia-600', activeText: 'text-fuchsia-100'
  },
  pink: {
    bg: 'bg-pink-600', hover: 'hover:bg-pink-700', text: 'text-pink-600',
    border: 'border-pink-500', ring: 'focus:ring-pink-500',
    bgLight: 'bg-pink-100', textLight: 'text-pink-200',
    softBg: 'bg-pink-50', hoverBorder: 'hover:border-pink-300',
    activeBg: 'bg-pink-600', activeText: 'text-pink-100'
  },
  rose: {
    bg: 'bg-rose-600', hover: 'hover:bg-rose-700', text: 'text-rose-600',
    border: 'border-rose-500', ring: 'focus:ring-rose-500',
    bgLight: 'bg-rose-100', textLight: 'text-rose-200',
    softBg: 'bg-rose-50', hoverBorder: 'hover:border-rose-300',
    activeBg: 'bg-rose-600', activeText: 'text-rose-100'
  },
  slate: {
    bg: 'bg-slate-600', hover: 'hover:bg-slate-700', text: 'text-slate-600',
    border: 'border-slate-500', ring: 'focus:ring-slate-500',
    bgLight: 'bg-slate-100', textLight: 'text-slate-200',
    softBg: 'bg-slate-50', hoverBorder: 'hover:border-slate-300',
    activeBg: 'bg-slate-600', activeText: 'text-slate-100'
  }
};

type ColorTheme = keyof typeof COLOR_THEMES;

const ICON_MAP: Record<string, any> = {
  dumbbell: Dumbbell,
  briefcase: Briefcase,
  book: BookOpen,
  user: UserIcon,
  zap: Zap,
  code: Code,
  music: Music,
  home: Home,
  cart: ShoppingCart,
  coffee: Coffee,
  game: Gamepad2,
  plane: Plane,
  tv: Tv,
  food: Utensils,
  monitor: Monitor,
  phone: Smartphone,
  audio: Headphones,
  grad: GraduationCap,
  leaf: Leaf,
  heart: Heart,
  tag: Tag,
  flag: Flag,
  users: Users,
  dollar: DollarSign,
  wallet: Wallet,
  card: CreditCard,
  bank: Landmark,
  piggy: PiggyBank,
  receipt: Receipt,
  gift: Gift,
  car: Car,
  bus: Bus,
  train: Train,
  bike: Bike
};

const DEFAULT_CATEGORIES: CategoryConfig[] = [
  { id: 'phys', name: 'Health & Fitness', color: '#ef4444', icon: 'dumbbell', isDefault: true, isFocus: true },
  { id: 'work', name: 'Work', color: '#3b82f6', icon: 'briefcase', isDefault: true, isFocus: true },
  { id: 'pers', name: 'Personal', color: '#10b981', icon: 'user', isDefault: true, isFocus: false },
  { id: 'learn', name: 'Learning', color: '#f59e0b', icon: 'book', isDefault: true, isFocus: true },
  { id: 'soc', name: 'Social', color: '#ec4899', icon: 'users', isDefault: true, isFocus: false },
];

const getCategoryIcon = (iconName: string | undefined, size = 14, className = "") => {
  const IconComp = iconName && ICON_MAP[iconName] ? ICON_MAP[iconName] : Tag;
  return <IconComp size={size} className={className} />;
};

// Helper to replace date-fns startOfWeek (Starts on Sunday)
const getStartOfWeek = (date: Date) => {
  const d = new Date(date);
  const day = d.getDay(); // 0 is Sunday
  const diff = d.getDate() - day; // Subtract day index to get back to Sunday
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper to replace date-fns startOfMonth
const getStartOfMonth = (date: Date) => {
  const d = new Date(date);
  d.setDate(1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper to replace date-fns startOfYear
const getStartOfYear = (date: Date) => {
  const d = new Date(date);
  d.setMonth(0, 1);
  d.setHours(0, 0, 0, 0);
  return d;
};

// Helper to replace date-fns endOfYear
const getEndOfYear = (date: Date) => {
  const d = new Date(date);
  d.setMonth(11, 31);
  d.setHours(23, 59, 59, 999);
  return d;
};

// Helper to parse YYYY-MM-DD string to local Date object
const parseDateKey = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d);
};

// --- Mock Data Generator with Realistic Scenarios ---
const generateMockData = (): { tasks: Task[], logs: DailyLog[] } => {
  const tasks: Task[] = [];
  const logs: DailyLog[] = [];
  const now = new Date();
  const yearStart = getStartOfYear(now);
  const yearEnd = getEndOfYear(now);
  
  const days = eachDayOfIntervalFn({ start: yearStart, end: yearEnd });

  days.forEach(currentDate => {
    const dateStr = format(currentDate, 'yyyy-MM-dd');
    const dayOfWeek = currentDate.getDay(); // 0=Sun, 6=Sat
    const isPast = currentDate < now;

    // Generate Log for past days (randomly skip some)
    if (isPast && Math.random() > 0.1) {
      const score = Math.floor(Math.random() * 5) + 1; // 1-5
      const reflections = [
        "Productive day but tired.",
        "Got distracted in the afternoon.",
        "Great workout session!",
        "Struggled to focus.",
        "Achieved all goals."
      ];
      logs.push({
        date: dateStr,
        score,
        reflection: reflections[Math.floor(Math.random() * reflections.length)]
      });
    }

    // Task Generation
    // Weekdays
    if (dayOfWeek !== 0 && dayOfWeek !== 6) { 
      // Morning
      if (Math.random() > 0.1) {
        tasks.push({
          id: `morn-${dateStr}`,
          title: 'Morning Routine / Gym',
          description: 'Start the day right',
          impact: 8,
          date: dateStr,
          startTime: '06:00',
          endTime: '07:30',
          categoryId: 'phys',
          completed: isPast ? Math.random() > 0.2 : false // 80% completion chance
        });
      }

      // Deep Work
      tasks.push({
        id: `work1-${dateStr}`,
        title: 'Deep Work / Focus',
        description: 'Key project tasks',
        impact: 9,
        date: dateStr,
        startTime: '09:00',
        endTime: '12:00',
        categoryId: 'work',
        completed: isPast ? Math.random() > 0.3 : false // 70% completion
      });

      // Afternoon Work
      tasks.push({
        id: `work2-${dateStr}`,
        title: 'Meetings & Email',
        description: 'Team sync and comms',
        impact: 6,
        date: dateStr,
        startTime: '13:00',
        endTime: '16:00',
        categoryId: 'work',
        completed: isPast ? Math.random() > 0.1 : false // 90% completion
      });

      // Evening (Learning or Social)
      const eveningRand = Math.random();
      if (eveningRand > 0.6) {
        tasks.push({
          id: `learn-${dateStr}`,
          title: 'Reading / Course',
          description: 'Self improvement',
          impact: 7,
          date: dateStr,
          startTime: '20:00',
          endTime: '21:00',
          categoryId: 'learn',
          completed: isPast ? Math.random() > 0.4 : false
        });
      } else if (eveningRand > 0.3) {
        tasks.push({
          id: `soc-${dateStr}`,
          title: 'Dinner / Social',
          description: 'Hangout',
          impact: 6,
          date: dateStr,
          startTime: '19:00',
          endTime: '21:00',
          categoryId: 'soc',
          completed: isPast ? Math.random() > 0.1 : false
        });
      }
    } else { // Weekend
      tasks.push({
        id: `wknd-phys-${dateStr}`,
        title: 'Long Hike / Run',
        description: 'Zone 2 cardio',
        impact: 9,
        date: dateStr,
        startTime: '08:00',
        endTime: '11:00',
        categoryId: 'phys',
        completed: isPast ? Math.random() > 0.3 : false
      });
      
      tasks.push({
        id: `wknd-social-${dateStr}`,
        title: 'Social / Family',
        description: 'Quality time',
        impact: 8,
        date: dateStr,
        startTime: '13:00',
        endTime: '17:00',
        categoryId: 'soc',
        completed: isPast ? Math.random() > 0.1 : false
      });

      if (Math.random() > 0.5) {
         tasks.push({
          id: `wknd-proj-${dateStr}`,
          title: 'Side Project',
          description: 'Coding',
          impact: 7,
          date: dateStr,
          startTime: '19:00',
          endTime: '21:00',
          categoryId: 'learn',
          completed: isPast ? Math.random() > 0.5 : false
        });
      }
    }
  });

  return { tasks, logs };
};

// --- Sub-Components ---

// Minimalist 24h Time Picker
const CustomTimePicker = ({ value, onChange, label, themeStyles }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Parse HH:mm
  const [hours, minutes] = value ? value.split(':') : ['09', '00'];

  const hourOptions = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, '0'));
  const minuteOptions = Array.from({ length: 12 }, (_, i) => (i * 5).toString().padStart(2, '0'));

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const handleHourSelect = (h: string) => {
    onChange(`${h}:${minutes}`);
  };

  const handleMinuteSelect = (m: string) => {
    onChange(`${hours}:${m}`);
    setIsOpen(false); // Close after picking minute
  };

  return (
    <div className="flex-1 relative" ref={containerRef}>
       {label && <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-1.5">{label}</label>}
       <button
         type="button"
         onClick={() => setIsOpen(!isOpen)}
         className="w-full bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-xl p-3 text-left flex items-center justify-between hover:border-zinc-300 dark:hover:border-zinc-600 transition-colors"
       >
         <span className="font-mono text-lg font-medium dark:text-white tracking-wider">{value || '09:00'}</span>
         <Clock size={16} className="text-zinc-400" />
       </button>
       
       <input type="hidden" name={label ? label.toLowerCase().replace(' ', '') : 'time'} value={value} />

       {isOpen && (
         <div className="absolute top-full left-0 w-64 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 rounded-xl shadow-xl z-[60] flex overflow-hidden">
            <div className="flex-1 border-r border-zinc-100 dark:border-zinc-800">
               <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 sticky top-0">Hour</div>
               <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                  <div className="grid grid-cols-2 gap-1">
                    {hourOptions.map(h => (
                      <button 
                        key={h} 
                        type="button"
                        onClick={() => handleHourSelect(h)}
                        className={`py-1.5 rounded-lg text-sm font-medium transition-colors ${h === hours ? `${themeStyles.bg} text-white` : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-300'}`}
                      >
                        {h}
                      </button>
                    ))}
                  </div>
               </div>
            </div>
            <div className="flex-1">
               <div className="px-3 py-2 text-xs font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50 dark:bg-zinc-800/50 sticky top-0">Minute</div>
               <div className="max-h-48 overflow-y-auto p-1 custom-scrollbar">
                   <div className="grid grid-cols-1 gap-1">
                    {minuteOptions.map(m => (
                      <button 
                        key={m} 
                        type="button"
                        onClick={() => handleMinuteSelect(m)}
                        className={`py-1.5 rounded-lg text-sm font-medium transition-colors ${m === minutes ? `${themeStyles.bg} text-white` : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 dark:text-zinc-300'}`}
                      >
                        {m}
                      </button>
                    ))}
                   </div>
               </div>
            </div>
         </div>
       )}
    </div>
  );
};

// Improved Custom Tooltip
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-3 rounded-xl shadow-xl z-50">
        <div className="flex items-center gap-2 mb-2">
           <div className="w-2.5 h-2.5 rounded-full" style={{background: data.color}}></div>
           <p className="font-bold text-sm dark:text-white">{label}</p>
        </div>
        <div className="space-y-1.5">
          <p className="text-xs text-zinc-500 dark:text-zinc-400 flex justify-between gap-6 items-center">
            <span>Total:</span> <span className="font-mono font-bold dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded">{data.total}h</span>
          </p>
          <p className="text-xs text-emerald-600 dark:text-emerald-500 flex justify-between gap-6 items-center">
            <span>Done:</span> <span className="font-mono font-bold bg-emerald-50 dark:bg-emerald-900/20 px-1.5 py-0.5 rounded">{data.completed}h</span>
          </p>
          <p className="text-xs text-zinc-400 flex justify-between gap-6 items-center">
            <span>Left:</span> <span className="font-mono font-medium">{data.pending}h</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

const DatePicker = ({ currentDate, onChange, themeStyles }: any) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(currentDate);
  const [viewMode, setViewMode] = useState<'day' | 'month' | 'year'>('day');
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setViewDate(currentDate);
    setViewMode('day'); // Reset on date change from outside
  }, [currentDate, isOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if(isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  // Calendar Logic
  const monthStart = getStartOfMonth(viewDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = getStartOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);
  const days = eachDayOfInterval({ start: startDate, end: endDate });
  const weekDays = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

  // Month View Logic
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Year View Logic
  const startYear = Math.floor(viewDate.getFullYear() / 12) * 12;
  const years = Array.from({ length: 12 }, (_, i) => startYear + i);

  const handleHeaderClick = () => {
    if (viewMode === 'day') setViewMode('month');
    else if (viewMode === 'month') setViewMode('year');
  };

  const handlePrev = () => {
    if (viewMode === 'day') setViewDate(addMonths(viewDate, -1));
    else if (viewMode === 'month') setViewDate(addMonths(viewDate, -12)); // Previous year
    else setViewDate(addYears(viewDate, -12)); // Previous year block
  };

  const handleNext = () => {
    if (viewMode === 'day') setViewDate(addMonths(viewDate, 1));
    else if (viewMode === 'month') setViewDate(addMonths(viewDate, 12)); // Next year
    else setViewDate(addYears(viewDate, 12)); // Next year block
  };

  const getHeaderText = () => {
    if (viewMode === 'day') return format(viewDate, 'MMMM yyyy');
    if (viewMode === 'month') return format(viewDate, 'yyyy');
    return `${startYear} - ${startYear + 11}`;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button 
        onClick={() => setIsOpen(!isOpen)} 
        className={`flex items-center gap-1 cursor-pointer hover:${themeStyles.text} transition-colors font-semibold`}
      >
         <span>{format(currentDate, 'MMM d, yyyy')}</span>
         <ChevronRight size={14} className={`rotate-90 text-zinc-400 ${isOpen ? themeStyles.text : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl shadow-xl z-50 w-64 p-3 animation-fade-in">
           <div className="flex justify-between items-center mb-3">
              <button onClick={handlePrev} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><ChevronLeft size={16}/></button>
              <button onClick={handleHeaderClick} className="text-sm font-bold text-zinc-800 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 px-2 py-1 rounded transition-colors">
                {getHeaderText()}
              </button>
              <button onClick={handleNext} className="p-1 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-lg text-zinc-500"><ChevronRight size={16}/></button>
           </div>
           
           {viewMode === 'day' && (
             <>
               <div className="grid grid-cols-7 mb-1">
                  {weekDays.map(d => (
                    <div key={d} className="text-center text-[10px] text-zinc-400 font-medium py-1">{d}</div>
                  ))}
               </div>
               <div className="grid grid-cols-7 gap-1">
                  {days.map((day, i) => {
                     const isSelected = isSameDay(day, currentDate);
                     const isCurrentMonth = isSameMonth(day, viewDate);
                     const isToday = isSameDay(day, new Date());
                     
                     return (
                       <button 
                         key={i}
                         onClick={() => { onChange(day); setIsOpen(false); }}
                         className={`
                            h-8 w-8 rounded-lg flex items-center justify-center text-xs relative
                            ${isSelected ? `${themeStyles.bg} text-white font-bold shadow-md` : ''}
                            ${!isSelected && isCurrentMonth ? 'text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800' : ''}
                            ${!isSelected && !isCurrentMonth ? 'text-zinc-300 dark:text-zinc-700' : ''}
                            ${!isSelected && isToday ? `${themeStyles.text} font-bold ring-1 ring-inset ${themeStyles.ring}` : ''}
                         `}
                       >
                         {format(day, 'd')}
                       </button>
                     );
                  })}
               </div>
             </>
           )}

           {viewMode === 'month' && (
             <div className="grid grid-cols-3 gap-2">
               {months.map((m, i) => (
                 <button
                   key={m}
                   onClick={() => {
                     const newDate = new Date(viewDate);
                     newDate.setMonth(i);
                     setViewDate(newDate);
                     setViewMode('day');
                   }}
                   className={`h-10 rounded-lg text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 ${viewDate.getMonth() === i ? `${themeStyles.text} font-bold bg-zinc-50 dark:bg-zinc-800/50` : 'text-zinc-600 dark:text-zinc-400'}`}
                 >
                   {m}
                 </button>
               ))}
             </div>
           )}

           {viewMode === 'year' && (
             <div className="grid grid-cols-3 gap-2">
               {years.map((y) => (
                 <button
                   key={y}
                   onClick={() => {
                     const newDate = new Date(viewDate);
                     newDate.setFullYear(y);
                     setViewDate(newDate);
                     setViewMode('month');
                   }}
                   className={`h-10 rounded-lg text-xs font-medium hover:bg-zinc-100 dark:hover:bg-zinc-800 ${viewDate.getFullYear() === y ? `${themeStyles.text} font-bold bg-zinc-50 dark:bg-zinc-800/50` : 'text-zinc-600 dark:text-zinc-400'}`}
                 >
                   {y}
                 </button>
               ))}
             </div>
           )}
           
           <button onClick={() => { onChange(new Date()); setIsOpen(false); }} className={`w-full mt-3 py-1.5 text-xs font-bold ${themeStyles.text} ${themeStyles.bgLight} dark:bg-zinc-800 rounded-lg hover:opacity-80`}>
             Go to Today
           </button>
        </div>
      )}
    </div>
  );
};

const AuthModal = ({ 
  isOpen, 
  onLogin 
}: { 
  isOpen: boolean; 
  onLogin: (user: User) => void;
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [domainError, setDomainError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGuest = () => {
    onLogin({ id: 'guest', name: 'Guest User', isGuest: true });
  };
  
  const handleGoogleLogin = async () => {
    setError(null);
    setDomainError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      // Main App useEffect will catch the state change
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
        setDomainError(window.location.hostname);
      } else if (err.code === 'auth/popup-closed-by-user') {
         setError("Sign-in cancelled.");
      } else {
        setError(err.message || "Failed to sign in with Google.");
      }
    }
  };

  const handleEmailAuth = async () => {
    setError(null);
    setDomainError(null);
    try {
      if (isSignUp) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/unauthorized-domain') {
         setDomainError(window.location.hostname);
      } else if (err.code === 'auth/invalid-credential') {
        setError("Invalid email or password.");
      } else {
        setError(err.message || "Authentication failed.");
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black/95 flex items-center justify-center p-4 z-50 overflow-y-auto">
      <div className="bg-zinc-900 rounded-2xl w-full max-w-sm p-8 border border-zinc-800/50 shadow-2xl relative overflow-hidden">
        <div className="relative z-10 text-center flex flex-col items-center">
            
            {/* Logo Icon */}
            <div className="w-16 h-16 bg-red-900/10 rounded-2xl flex items-center justify-center mb-6 text-red-500 border border-red-500/20 shadow-lg shadow-red-900/20">
               <CalendarIcon size={32} strokeWidth={1.5} />
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Welcome to LifeSync</h2>
            <p className="text-zinc-500 text-sm mb-8">Master your time, master your life.</p>

            {/* ERROR ALERT BOX FOR UNAUTHORIZED DOMAIN */}
            {domainError && (
              <div className="w-full bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6 text-left">
                <div className="flex items-start gap-2 mb-2">
                  <AlertTriangle className="text-red-500 shrink-0" size={18} />
                  <h3 className="text-sm font-bold text-red-400">Unauthorized Domain</h3>
                </div>
                <p className="text-xs text-red-200/80 mb-3 leading-relaxed">
                  Firebase has blocked the sign-in because <strong>{domainError}</strong> is not in the allowed list.
                </p>
                <div className="bg-black/40 rounded p-2 text-[10px] font-mono text-zinc-400 mb-3 break-all">
                  Firebase Console {'>'} Auth {'>'} Settings {'>'} Authorized Domains
                </div>
                <a 
                  href="https://console.firebase.google.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-red-400 hover:text-red-300 transition-colors"
                >
                  Open Firebase Console <ExternalLink size={10} />
                </a>
              </div>
            )}

            <div className="w-full space-y-4">
               {/* Google Button */}
               <button 
                 onClick={handleGoogleLogin} 
                 className="w-full bg-white hover:bg-zinc-200 text-black font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-3"
               >
                 <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                 </svg>
                 <span>Google Authentication</span>
               </button>
               
               {/* Divider */}
               <div className="relative py-2 flex items-center justify-center">
                 <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-zinc-800"></div></div>
                 <div className="relative bg-zinc-900 px-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest">Or</div>
               </div>

               {/* Email Inputs */}
               <div className="space-y-3">
                  <div className="space-y-2">
                    <input 
                      type="email" 
                      placeholder="Email Address" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-zinc-950/50 text-white p-3.5 rounded-lg border border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 outline-none placeholder:text-zinc-600 text-sm transition-all"
                    />
                    <input 
                      type="password" 
                      placeholder="Password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-zinc-950/50 text-white p-3.5 rounded-lg border border-zinc-800 focus:border-zinc-600 focus:ring-1 focus:ring-zinc-600 outline-none placeholder:text-zinc-600 text-sm transition-all"
                    />
                  </div>
                  
                  {error && <p className="text-red-500 text-xs text-left">{error}</p>}

                  <button 
                    onClick={handleEmailAuth} 
                    className="w-full bg-red-600 hover:bg-red-700 active:scale-[0.98] text-white font-bold py-3.5 rounded-xl transition-all shadow-lg shadow-red-900/20"
                  >
                    {isSignUp ? "Create Account" : "Sign In"}
                  </button>
                  
                  <div className="text-center">
                    <button onClick={() => setIsSignUp(!isSignUp)} className="text-zinc-500 text-xs hover:text-white transition-colors">
                      {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
                    </button>
                  </div>
               </div>

               {/* Guest Button */}
               <button onClick={handleGuest} className="w-full bg-zinc-800/30 hover:bg-zinc-800 border border-zinc-800 text-zinc-500 hover:text-zinc-300 text-sm font-semibold py-3 rounded-xl transition-colors mt-2">
                 Continue as Guest
               </button>
            </div>
            
            {/* VERSION FOOTER */}
            <div className="mt-6 text-zinc-600 text-[10px] font-mono">v{APP_VERSION}</div>
        </div>
      </div>
    </div>
  );
};

const InsightModal = ({ isOpen, onClose, insight, isGenerating, onGenerate, themeStyles }: any) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6 border dark:border-zinc-700 shadow-2xl">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
             <BrainCircuit className={themeStyles.text} />
             <h2 className="text-xl font-bold dark:text-white">AI Coach</h2>
          </div>
          <button onClick={onClose}><X size={20} className="text-zinc-400 hover:text-zinc-200" /></button>
        </div>
        
        <div className="min-h-[120px] bg-zinc-50 dark:bg-zinc-800 rounded-xl p-4 mb-4 text-sm leading-relaxed text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700/50">
           {isGenerating ? (
             <div className={`flex flex-col items-center justify-center h-full gap-2 ${themeStyles.text} py-8`}>
               <RefreshCcw className="animate-spin" size={24} /> 
               <span className="text-xs font-bold uppercase tracking-wider">Analyzing schedule...</span>
             </div>
           ) : (
             insight ? (
               <div className="whitespace-pre-wrap">{insight}</div>
             ) : (
               <div className="text-center text-zinc-500 py-8 italic">
                 "Success is the sum of small efforts, repeated day in and day out."
                 <br/><br/>
                 Click generate to analyze your day.
               </div>
             )
           )}
        </div>

        <button 
          onClick={onGenerate}
          disabled={isGenerating}
          className={`w-full ${themeStyles.bg} ${themeStyles.hover} text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20`}
        >
          {isGenerating ? 'Thinking...' : (insight ? 'Regenerate Analysis' : 'Generate Analysis')}
        </button>
      </div>
    </div>
  );
};

const SettingsMenu = ({ isOpen, onClose, theme, setTheme, onImport, onExport, onReset, onLoadSample, onTemplates, onLogout, user, accentColor, setAccentColor }: any) => {
  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) onClose();
    };
    if (isOpen) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div ref={menuRef} className="absolute top-16 right-6 w-72 bg-white dark:bg-zinc-900 rounded-2xl shadow-xl border border-zinc-100 dark:border-zinc-800 z-50 overflow-hidden animation-fade-in">
       {user && (
         <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-full ${COLOR_THEMES[accentColor as ColorTheme].bgLight} dark:bg-zinc-800 flex items-center justify-center ${COLOR_THEMES[accentColor as ColorTheme].text} font-bold text-lg overflow-hidden`}>
              {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
               <p className="font-bold text-zinc-800 dark:text-white truncate">{user.name}</p>
               <p className="text-xs text-zinc-500 truncate">{user.email || 'Guest Session'}</p>
            </div>
         </div>
       )}
       <div className="p-2">
         <div className="px-3 py-2">
            <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">Theme Color</div>
            <div className="grid grid-cols-8 gap-2">
              {(Object.keys(COLOR_THEMES) as ColorTheme[]).map((c) => (
                <button 
                  key={c}
                  onClick={() => setAccentColor(c)}
                  className={`w-6 h-6 rounded-full ${COLOR_THEMES[c].bg} ${accentColor === c ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-zinc-900 ring-zinc-400' : ''}`}
                />
              ))}
            </div>
         </div>
         <div className="border-t border-zinc-100 dark:border-zinc-800 my-1"></div>
         <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">
           <div className="flex items-center gap-2">{theme === 'light' ? <Sun size={18} /> : <Moon size={18} />}<span>{theme === 'light' ? 'Light Mode' : 'Dark Mode'}</span></div>
         </button>
         <button onClick={onTemplates} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"><Layout size={18} /><span>Weekly Templates</span></button>
         <label className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"><Upload size={18} /><span>Import Data</span><input type="file" accept=".json" onChange={onImport} className="hidden" /></label>
         <button onClick={onExport} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"><Download size={18} /><span>Export Data</span></button>
         <button 
           type="button"
           onClick={(e) => { 
             e.preventDefault(); 
             e.stopPropagation(); 
             if(window.confirm('Are you sure you want to clear all data? This action cannot be undone.')) { 
                onReset(); 
                onClose(); 
             } 
           }} 
           className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 text-red-600 transition-colors"
         >
            <Trash2 size={18} /><span>Reset Data</span>
         </button>
         <button onClick={onLoadSample} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors">
           <Database size={18} /><span>Load Sample Data</span>
         </button>
       </div>
       <div className="border-t border-zinc-100 dark:border-zinc-800 p-2">
         <button onClick={onLogout} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"><LogOut size={18} /><span>Log Out</span></button>
         {/* VERSION FOOTER */}
         <div className="text-center mt-2 pb-1">
           <span className="text-[10px] text-zinc-400 font-mono">v{APP_VERSION}</span>
         </div>
       </div>
    </div>
  );
};

const TemplateManager = ({ isOpen, onClose, templates, onSaveCurrent, onApplyTemplate, onDeleteTemplate, themeStyles }: any) => {
  const [name, setName] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-md p-6 border dark:border-zinc-700">
        <div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white">Templates</h3><button onClick={onClose}><X size={20}/></button></div>
        <div className="flex gap-2 mb-4"><input value={name} onChange={e=>setName(e.target.value)} placeholder="Current Week Name" className="flex-1 bg-zinc-100 dark:bg-zinc-800 p-2 rounded outline-none"/><button onClick={()=>{onSaveCurrent(name);setName('')}} className={`${themeStyles.bg} text-white px-3 rounded`}>Save</button></div>
        <div className="space-y-2 max-h-60 overflow-y-auto">{templates.map((t:any)=>(<div key={t.id} className="flex justify-between p-2 bg-zinc-50 dark:bg-zinc-800 rounded"><span>{t.name}</span><div className="flex gap-2"><button onClick={()=>onApplyTemplate(t)} className={themeStyles.text}>Apply</button><button onClick={()=>onDeleteTemplate(t.id)} className="text-red-500">Del</button></div></div>))}</div>
      </div>
    </div>
  );
};

const ReflectionModal = ({ isOpen, onClose, log, onSave, themeStyles }: any) => {
  const [score, setScore] = useState(log?.score || 3);
  const [text, setText] = useState(log?.reflection || '');
  useEffect(() => { if (isOpen) { setScore(log?.score || 3); setText(log?.reflection || ''); } }, [isOpen, log]);
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg p-6 border dark:border-zinc-700 shadow-2xl">
        <h2 className="text-xl font-bold dark:text-white mb-4">Daily Retrospective</h2>
        <div className="flex gap-2 mb-4">{[1,2,3,4,5].map(s=>(<button key={s} onClick={()=>setScore(s)} className={`flex-1 h-10 rounded-lg font-bold ${score===s? `${themeStyles.bg} text-white`:'bg-zinc-100 dark:bg-zinc-800 text-zinc-500'}`}>{s}</button>))}</div>
        <textarea value={text} onChange={e=>setText(e.target.value)} className="w-full h-32 bg-zinc-50 dark:bg-zinc-800 border dark:border-zinc-700 rounded-xl p-3 mb-4 outline-none dark:text-white" placeholder="Notes..."/>
        <div className="flex gap-2"><button onClick={onClose} className="flex-1 py-2 text-zinc-500">Cancel</button><button onClick={()=>onSave({score,reflection:text})} className={`flex-1 ${themeStyles.bg} text-white rounded-xl font-bold`}>Save</button></div>
      </div>
    </div>
  );
};

const CategoryManager = ({ isOpen, onClose, categories, setCategories, themeStyles }: any) => {
  const [name, setName] = useState('');
  const [isFocus, setIsFocus] = useState(true);
  const [selectedIcon, setSelectedIcon] = useState('tag');
  
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editIsFocus, setEditIsFocus] = useState(false);
  const [editIcon, setEditIcon] = useState('tag');

  useEffect(() => {
    setEditingId(null);
  }, [isOpen]);

  const handleStartEdit = (cat: CategoryConfig) => {
    setEditingId(cat.id);
    setEditName(cat.name);
    setEditIsFocus(cat.isFocus || false);
    setEditIcon(cat.icon || 'tag');
  };

  const handleSaveEdit = () => {
    if (!editingId || !editName.trim()) return;
    setCategories(categories.map((c: CategoryConfig) => 
      c.id === editingId ? { ...c, name: editName, isFocus: editIsFocus, icon: editIcon } : c
    ));
    setEditingId(null);
  };
  
  const iconList = Object.keys(ICON_MAP);
  
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-lg p-6 border dark:border-zinc-700 shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4"><h3 className="font-bold dark:text-white text-lg">Categories</h3><button onClick={onClose}><X size={20}/></button></div>
        
        {/* Add New Category */}
        <div className="flex flex-col gap-3 mb-6 p-4 bg-zinc-50 dark:bg-zinc-800/50 rounded-xl border border-zinc-100 dark:border-zinc-800">
           <div className="flex gap-2">
             <input value={name} onChange={e=>setName(e.target.value)} placeholder="New Category Name" className="flex-1 bg-white dark:bg-zinc-800 p-2.5 rounded-lg border border-zinc-200 dark:border-zinc-700 outline-none dark:text-white text-sm"/>
             <button onClick={()=>{if(name)setCategories([...categories,{id:crypto.randomUUID(),name,color:'#6366f1', isFocus, icon: selectedIcon}]);setName('')}} className={`${themeStyles.bg} ${themeStyles.hover} text-white px-4 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200 dark:shadow-none`}><Plus size={20}/></button>
           </div>
           
           <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-500 select-none">
                <input type="checkbox" checked={isFocus} onChange={e => setIsFocus(e.target.checked)} className={`accent-${themeStyles.text.split('-')[1]}-600 rounded`} />
                <span>Focus / High Impact?</span>
              </label>
              
              <div className="flex items-center gap-2">
                 <span className="text-xs text-zinc-500">Icon:</span>
                 <div className="flex gap-1">
                   {/* Simplified icon selection for creation */}
                   <div className="bg-white dark:bg-zinc-900 p-1 rounded border dark:border-zinc-700">
                      {getCategoryIcon(selectedIcon, 16)}
                   </div>
                 </div>
              </div>
           </div>
           
           {/* Icon Grid for Creation */}
           <div className="grid grid-cols-8 gap-2 mt-1">
              {iconList.map(iconKey => (
                 <button 
                   key={iconKey} 
                   onClick={() => setSelectedIcon(iconKey)}
                   className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${selectedIcon === iconKey ? `${themeStyles.bg} text-white` : 'hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500'}`}
                 >
                    {getCategoryIcon(iconKey, 14)}
                 </button>
              ))}
           </div>
        </div>

        {/* List */}
        <div className="space-y-2 max-h-[300px] overflow-y-auto">
           {categories.map((c:any)=>(
             <div key={c.id} className="flex justify-between items-center p-3 bg-zinc-50 dark:bg-zinc-800 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700 transition-colors">
                {editingId === c.id ? (
                   <div className="flex-1 flex flex-col gap-2">
                      <div className="flex gap-2">
                          <input 
                            value={editName} 
                            onChange={e => setEditName(e.target.value)} 
                            className="flex-1 bg-white dark:bg-zinc-900 p-1.5 rounded border border-zinc-200 dark:border-zinc-600 text-sm outline-none dark:text-white"
                          />
                          <div className="flex gap-1">
                            <button onClick={handleSaveEdit} className="p-1.5 bg-green-500/10 text-green-600 rounded hover:bg-green-500/20"><Check size={16}/></button>
                            <button onClick={() => setEditingId(null)} className="p-1.5 bg-zinc-200 dark:bg-zinc-700 text-zinc-500 rounded hover:bg-zinc-300"><X size={16}/></button>
                          </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                          <label className="flex items-center gap-2 cursor-pointer text-xs text-zinc-500">
                            <input type="checkbox" checked={editIsFocus} onChange={e => setEditIsFocus(e.target.checked)} className="accent-indigo-600" />
                            <span>Focus?</span>
                          </label>
                      </div>

                      {/* Icon Edit Grid */}
                      <div className="grid grid-cols-8 gap-2 mt-1">
                        {iconList.map(iconKey => (
                           <button 
                             key={iconKey} 
                             onClick={() => setEditIcon(iconKey)}
                             className={`p-1.5 rounded-lg flex items-center justify-center transition-colors ${editIcon === iconKey ? `${themeStyles.bg} text-white` : 'hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-500'}`}
                           >
                              {getCategoryIcon(iconKey, 12)}
                           </button>
                        ))}
                      </div>
                   </div>
                ) : (
                   <>
                    <div className="flex gap-3 items-center">
                       <div className="w-8 h-8 rounded-full shadow-sm flex items-center justify-center text-white" style={{backgroundColor:c.color}}>
                          {getCategoryIcon(c.icon, 14)}
                       </div>
                       <div className="flex flex-col">
                          <span className="font-medium text-sm dark:text-zinc-200 flex items-center gap-1.5">
                            {c.name}
                            {c.isFocus && <Zap size={10} className="text-amber-500 fill-amber-500" />}
                          </span>
                       </div>
                    </div>
                    <div className="flex items-center gap-1">
                       <button onClick={()=>setCategories(categories.filter((cat:any)=>cat.id!==c.id))} className="p-1.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"><Trash2 size={14}/></button>
                       <button onClick={() => handleStartEdit(c)} className={`p-1.5 text-zinc-400 hover:${themeStyles.text} hover:${themeStyles.bgLight} dark:hover:${themeStyles.bgLight}/10 rounded transition-colors`}><Edit2 size={14}/></button>
                    </div>
                   </>
                )}
             </div>
           ))}
        </div>
      </div>
    </div>
  );
};

// Custom Chart Tick with Icons
const CustomXAxisTick = ({ x, y, payload, categories }: any) => {
  const category = categories.find((c: any) => c.name === payload.value);
  const iconName = category?.icon || 'tag';
  
  return (
    <g transform={`translate(${x},${y})`}>
      <foreignObject x={-40} y={0} width={80} height={40} style={{overflow: 'visible'}}>
         <div className="flex flex-row justify-center items-center gap-1.5 h-full text-zinc-500 dark:text-zinc-400">
            {getCategoryIcon(iconName, 14)}
            <span className="text-xs font-medium leading-none">{payload.value}</span>
         </div>
      </foreignObject>
    </g>
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [templates, setTemplates] = useState<WeekTemplate[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [categories, setCategories] = useState<CategoryConfig[]>(DEFAULT_CATEGORIES);
  const [logs, setLogs] = useState<DailyLog[]>([]);
  
  const [currentDate, setCurrentDate] = useState(new Date());
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [accentColor, setAccentColor] = useState<ColorTheme>('red');

  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isReflectionOpen, setIsReflectionOpen] = useState(false);
  const [isCatManagerOpen, setIsCatManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isTemplatesOpen, setIsTemplatesOpen] = useState(false);
  const [isInsightModalOpen, setIsInsightModalOpen] = useState(false);
  
  const [editingTask, setEditingTask] = useState<Partial<Task> | undefined>(undefined);
  const [insightTimeRange, setInsightTimeRange] = useState<TimeRange | 'Monthly' | 'Yearly'>('Daily');
  const [aiInsight, setAiInsight] = useState<string>("");
  const [isGeneratingAi, setIsGeneratingAi] = useState(false);
  
  const [taskImpact, setTaskImpact] = useState(5);
  
  // Custom Time Picker State for Form
  const [formStartTime, setFormStartTime] = useState('09:00');
  const [formEndTime, setFormEndTime] = useState('10:00');

  const themeStyles = COLOR_THEMES[accentColor];

  // Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          id: firebaseUser.uid,
          name: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'User',
          email: firebaseUser.email || undefined,
          isGuest: false,
          avatar: firebaseUser.photoURL || undefined
        });
      } else {
        // If logged out, user is null. We do not automatically clear user if they are in 'Guest' mode 
        // because Guest mode handles local state differently. But if we want to force login:
        // setUser(null); 
        // For now, we rely on the handleLogout to clear user state manually.
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogout = () => {
    firebaseSignOut(auth).then(() => {
      setUser(null);
    });
  };

  // Load Initial Mock Data
  useEffect(() => {
    if (tasks.length === 0 && !user) { 
      const { tasks: initialTasks, logs: initialLogs } = generateMockData();
      setTasks(initialTasks); 
      setLogs(initialLogs);
    }
  }, [user]);

  useEffect(() => {
    document.documentElement.className = theme;
  }, [theme]);

  useEffect(() => {
     if (isTaskModalOpen) {
        setTaskImpact(editingTask?.impact || 5);
        setFormStartTime(editingTask?.startTime || '09:00');
        setFormEndTime(editingTask?.endTime || '10:00');
     }
  }, [isTaskModalOpen, editingTask]);

  const formattedDate = format(currentDate, 'yyyy-MM-dd');
  const daysInWeek = useMemo(() => {
    const start = getStartOfWeek(currentDate);
    return Array.from({ length: 7 }).map((_, i) => addDays(start, i));
  }, [currentDate]);

  const todaysTasks = useMemo(() => tasks.filter(t => t.date === formattedDate), [tasks, formattedDate]);
  const todaysLog = useMemo(() => logs.find(l => l.date === formattedDate), [logs, formattedDate]);

  // Unified Analytics Logic
  const analytics = useMemo(() => {
    let filteredTasks = [];
    let filteredLogs = [];

    const startOfWeek = getStartOfWeek(currentDate);
    const endOfWeekDate = endOfWeek(startOfWeek);
    
    // Define Filter Range
    if (insightTimeRange === 'Daily') {
      filteredTasks = tasks.filter(t => t.date === formattedDate);
      filteredLogs = logs.filter(l => l.date === formattedDate);
    } else if (insightTimeRange === 'Weekly') {
      filteredTasks = tasks.filter(t => {
         const d = parseDateKey(t.date);
         return d >= startOfWeek && d <= endOfWeekDate;
      });
      filteredLogs = logs.filter(l => {
         const d = parseDateKey(l.date);
         return d >= startOfWeek && d <= endOfWeekDate;
      });
    } else if (insightTimeRange === 'Monthly') {
      filteredTasks = tasks.filter(t => isSameMonth(parseDateKey(t.date), currentDate));
      filteredLogs = logs.filter(l => isSameMonth(parseDateKey(l.date), currentDate));
    } else if (insightTimeRange === 'Yearly') {
      filteredTasks = tasks.filter(t => isSameYear(parseDateKey(t.date), currentDate));
      filteredLogs = logs.filter(l => isSameYear(parseDateKey(l.date), currentDate));
    }

    // Calculate Stats
    const total = filteredTasks.length;
    const completed = filteredTasks.filter(t => t.completed).length;
    const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    let totalMinutes = 0;
    let deepWorkMinutes = 0;
    const categoryStats: Record<string, { completed: number, pending: number, total: number, color: string }> = {};
    const catDurations: Record<string, number> = {};

    // Initialize Categories
    categories.forEach(c => { 
      categoryStats[c.name] = { completed: 0, pending: 0, total: 0, color: c.color }; 
    });

    filteredTasks.forEach(t => {
       const start = new Date(`${t.date}T${t.startTime}`);
       let end = new Date(`${t.date}T${t.endTime}`);
       if (end < start) end = addDays(end, 1);
       const dur = differenceInMinutes(end, start);
       totalMinutes += dur;
       
       const cat = categories.find(c => c.id === t.categoryId);
       if (cat?.isFocus) {
          if (t.completed) deepWorkMinutes += dur;
       }
       
       const catName = cat?.name || 'Other';
       const catColor = cat?.color || '#94a3b8';

       // Chart Data
       if (!categoryStats[catName]) categoryStats[catName] = { completed: 0, pending: 0, total: 0, color: catColor };
       const hours = dur / 60;
       categoryStats[catName].total += hours;
       if (t.completed) categoryStats[catName].completed += hours;
       else categoryStats[catName].pending += hours;

       // Top Activities Data
       catDurations[catName] = (catDurations[catName] || 0) + dur;
    });

    // Bar Data
    const barData = Object.entries(categoryStats)
      .filter(([_, d]) => d.total > 0)
      .map(([name, d]) => ({ 
        name, 
        completed: parseFloat(d.completed.toFixed(1)), 
        pending: parseFloat(d.pending.toFixed(1)), 
        total: parseFloat(d.total.toFixed(1)),
        color: d.color
      }))
      .sort((a, b) => b.total - a.total);

    // Top Activities
    const topActivities = Object.entries(catDurations)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 3)
      .map(([name, mins]) => {
         const cat = categories.find(c => c.name === name);
         return { 
           name, 
           hours: (mins/60).toFixed(1),
           color: cat?.color || '#71717a', // default zinc-500
           icon: cat?.icon // Added icon
         };
      });

    // Mood
    const totalScore = filteredLogs.reduce((acc, l) => acc + l.score, 0);
    const avgMood = filteredLogs.length > 0 ? (totalScore / filteredLogs.length).toFixed(1) : '-';

    return {
      total,
      completed,
      completionRate,
      totalHours: (totalMinutes / 60).toFixed(1),
      deepWorkHours: (deepWorkMinutes / 60).toFixed(1),
      barData,
      topActivities,
      avgMood
    };
  }, [tasks, logs, currentDate, insightTimeRange, categories, formattedDate]);

  const handleSaveTask = (formData: any) => {
    const newTask = { ...formData, id: formData.id || crypto.randomUUID(), date: formattedDate, completed: formData.completed || false };
    setTasks(prev => formData.id ? prev.map(t => t.id === formData.id ? newTask : t) : [...prev, newTask]);
    setIsTaskModalOpen(false); setEditingTask(undefined);
  };

  const handleSaveReflection = (logData: DailyLog) => {
    const newLog = { ...logData, date: formattedDate };
    setLogs(prev => [...prev.filter(l => l.date !== formattedDate), newLog]);
    setIsReflectionOpen(false);
  };

  const generateInsight = async () => {
    setIsGeneratingAi(true);
    const insight = await generateDailyInsight(todaysTasks, categories, formattedDate, todaysLog);
    setAiInsight(insight);
    setIsGeneratingAi(false);
  };

  const handleSaveTemplate = (name: string) => {
    const startOfWeek = getStartOfWeek(currentDate);
    const weekTasks = tasks.filter(t => {
      const tDate = parseDateKey(t.date);
      const diff = differenceInDays(tDate, startOfWeek);
      return diff >= 0 && diff < 7;
    });

    const templateTasks = weekTasks.map(t => {
      const tDate = parseDateKey(t.date);
      const dayIndex = differenceInDays(tDate, startOfWeek);
      const { id, date, ...rest } = t;
      return { ...rest, dayIndex };
    });

    setTemplates(prev => [...prev, {
      id: crypto.randomUUID(),
      name,
      tasks: templateTasks
    }]);
  };

  const handleApplyTemplate = (template: WeekTemplate) => {
    const startOfWeek = getStartOfWeek(currentDate);
    const newTasks = template.tasks.map(t => {
      const { dayIndex, ...rest } = t;
      return {
        ...rest,
        id: crypto.randomUUID(),
        date: format(addDays(startOfWeek, dayIndex), 'yyyy-MM-dd'),
        completed: false
      } as Task;
    });
    setTasks(prev => [...prev, ...newTasks]);
    setIsTemplatesOpen(false);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.tasks) setTasks(data.tasks);
        if (data.logs) setLogs(data.logs);
        if (data.categories) setCategories(data.categories);
        if (data.templates) setTemplates(data.templates);
        setIsSettingsOpen(false);
      } catch (err) {
        console.error(err);
        alert('Failed to import data. Invalid JSON.');
      }
    };
    reader.readAsText(file);
  };

  const handleExport = () => {
    const data = {
      version: APP_VERSION,
      timestamp: new Date().toISOString(),
      tasks,
      logs,
      categories,
      templates,
      user: { name: user?.name, email: user?.email } 
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `lifesync-backup-${format(new Date(), 'yyyy-MM-dd-HHmm')}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    if (window.confirm('This will overwrite your current schedule with sample data. Continue?')) {
      const { tasks: sampleTasks, logs: sampleLogs } = generateMockData();
      setTasks(sampleTasks);
      setLogs(sampleLogs);
      setIsSettingsOpen(false);
    }
  };

  const handleReset = () => { 
    setTasks([]); 
    setLogs([]); 
  };
  
  const getPosition = (timeStr: string) => {
    const [h, m] = timeStr.split(':').map(Number);
    const effH = h < TIME_START_HOUR ? h + 24 : h;
    return ((effH - TIME_START_HOUR) * 60 + m) / 60 * PIXELS_PER_HOUR;
  };
  
  const getScoreColor = (score: number) => {
     if (score >= 4) return 'text-emerald-500';
     if (score === 3) return 'text-amber-500';
     return 'text-red-500';
  };
  
  const getMoodIcon = (score: number) => {
     if (score >= 4) return <Smile size={12} className="text-emerald-500" />;
     if (score === 3) return <Meh size={12} className="text-amber-500" />;
     return <Frown size={12} className="text-red-500" />;
  };

  if (!user) return <AuthModal isOpen={true} onLogin={setUser} />;

  return (
    <div className={`flex flex-col lg:flex-row h-screen overflow-hidden bg-zinc-50 dark:bg-zinc-950 text-zinc-800 dark:text-zinc-100 font-sans transition-colors duration-300`}>
      {/* LEFT COLUMN - TIMELINE */}
      <div className="w-full lg:w-5/12 xl:w-5/12 flex flex-col border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 h-full relative z-10 shadow-xl overflow-hidden min-h-0">
        <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 z-20 flex justify-between items-center flex-shrink-0">
          <div className="flex items-center gap-3">
             <div className="bg-zinc-100 dark:bg-zinc-800 p-2.5 rounded-xl"><CalendarIcon className={themeStyles.text} size={20} /></div>
             <div>
               <h1 className="text-xl font-bold tracking-tight leading-none">{format(currentDate, 'EEEE')}</h1>
               <div className="flex items-center gap-1 text-zinc-500 dark:text-zinc-400 font-medium text-xs mt-1">
                 <DatePicker currentDate={currentDate} onChange={setCurrentDate} themeStyles={themeStyles} />
                 
                 <div className="flex gap-0.5 ml-2 bg-zinc-100 dark:bg-zinc-800 rounded-md">
                    <button onClick={() => setCurrentDate(addDays(currentDate, -1))} className={`hover:${themeStyles.text} p-0.5`}><ChevronLeft size={14} /></button>
                    <button onClick={() => setCurrentDate(addDays(currentDate, 1))} className={`hover:${themeStyles.text} p-0.5`}><ChevronRight size={14} /></button>
                 </div>
               </div>
             </div>
          </div>
          <div className="flex gap-2">
             <button onClick={() => { setEditingTask(undefined); setIsTaskModalOpen(true); }} className={`flex items-center gap-1.5 ${themeStyles.bg} ${themeStyles.hover} text-white px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-lg shadow-indigo-200 dark:shadow-indigo-900/30 transition-all hover:scale-105`}>
               <Plus size={16} /><span>Task</span>
             </button>
             <button 
                onClick={() => setIsReflectionOpen(true)}
                className="hidden sm:flex items-center gap-2 bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 px-3 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors"
                title="End Day / Score Day"
              >
                <Flag size={16} />
                <span>End Day</span>
             </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto relative no-scrollbar bg-zinc-50/30 dark:bg-zinc-950/30 min-h-0">
          <div className="relative w-full" style={{ height: `${TIMELINE_HEIGHT + 100}px` }}>
            {Array.from({ length: TIME_END_HOUR - TIME_START_HOUR }).map((_, i) => (
              <div key={i} className="absolute w-full border-b border-zinc-100 dark:border-zinc-800 flex items-start group" style={{ top: i * PIXELS_PER_HOUR, height: PIXELS_PER_HOUR }}>
                <span className={`text-xs font-bold text-zinc-400 dark:text-zinc-600 w-16 pl-4 pt-1 select-none group-hover:${themeStyles.text} transition-colors`}>
                  {format(new Date().setHours((TIME_START_HOUR + i) % 24, 0, 0, 0), 'HH:00')}
                </span>
                <div className="absolute top-1/2 left-16 right-0 border-t border-zinc-50 dark:border-zinc-800/50 border-dashed w-full h-px" />
              </div>
            ))}
            {isSameDay(currentDate, new Date()) && (
               <div className="absolute w-full border-t-2 border-red-500 z-30 flex items-center pointer-events-none" style={{ top: getPosition(format(new Date(), 'HH:mm')) }}>
                 <div className="w-16 bg-red-500 text-white text-[10px] px-1 rounded-r font-bold -mt-3.5 ml-0 flex justify-end">{format(new Date(), 'HH:mm')}</div>
               </div>
            )}
            {todaysTasks.map((task, idx) => {
              const top = getPosition(task.startTime);
              const height = Math.max(getPosition(task.endTime) - top, 32);
              const catConfig = categories.find(c => c.id === task.categoryId) || DEFAULT_CATEGORIES[0];
              const prevTask = idx > 0 ? todaysTasks[idx - 1] : null;
              const isOverlapping = prevTask && getPosition(prevTask.endTime) > top;
              const widthClass = isOverlapping ? 'left-[calc(4rem+45%)] right-2 w-[45%]' : 'left-20 right-4';
              
              // New logic for short tasks (approx 1 hour or less)
              const isShort = height <= 60; // 1 hour is 54px

              return (
                <div key={task.id} className={`absolute ${widthClass} rounded-lg border-l-[3px] p-2 flex flex-col justify-center transition-all cursor-pointer group shadow-sm hover:shadow-2xl hover:z-50 hover:h-auto hover:min-h-fit ${task.completed ? 'bg-zinc-100 dark:bg-zinc-800/50 border-zinc-300 dark:border-zinc-600 grayscale opacity-70' : 'bg-white dark:bg-zinc-800 border-transparent dark:border-transparent'}`} style={{ top: `${top}px`, height: `${height}px`, minHeight: `${height}px`, borderLeftColor: task.completed ? undefined : catConfig.color }} onClick={() => { setEditingTask(task); setIsTaskModalOpen(true); }}>
                  <div className="flex items-start gap-3 overflow-hidden h-full p-1">
                    <div className="pt-1" onClick={(e) => e.stopPropagation()}>
                       <div className={`w-4 h-4 rounded border cursor-pointer flex items-center justify-center transition-colors ${task.completed ? 'bg-zinc-400 border-zinc-400' : `bg-white border-zinc-300 ${themeStyles.hoverBorder}`}`} onClick={() => setTasks(ts => ts.map(t => t.id === task.id ? {...t, completed: !t.completed} : t))}>{task.completed && <Check size={10} className="text-white" />}</div>
                    </div>
                    <div className="min-w-0 flex-1 h-full">
                      {isShort ? (
                         // Horizontal Layout for Short Tasks
                         <div className="flex items-center gap-2 h-full">
                            <div className="flex-shrink-0 flex flex-col justify-center min-w-[30%] max-w-[50%]">
                               <h3 className={`font-bold text-xs truncate leading-tight ${task.completed ? 'line-through text-zinc-500' : ''}`}>{task.title}</h3>
                               <span className="text-[10px] text-zinc-500 dark:text-zinc-400 font-mono mt-0.5">{task.startTime}-{task.endTime}</span>
                            </div>
                            {task.description && (
                               <div className="flex-1 border-l border-zinc-200 dark:border-zinc-700 pl-2 min-w-0 h-full flex items-center">
                                  <p className={`text-[10px] truncate ${task.completed ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400'}`}>{task.description}</p>
                               </div>
                            )}
                         </div>
                      ) : (
                         // Standard Vertical Layout
                         <div className="flex flex-col h-full">
                            <div className="flex justify-between items-start"><h3 className={`font-bold text-sm leading-tight truncate ${task.completed && 'line-through text-zinc-500'}`}>{task.title}</h3></div>
                            <div className="flex items-center gap-2 mt-0.5 mb-1"><span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 bg-zinc-100 dark:bg-zinc-700 px-1.5 rounded">{task.startTime}-{task.endTime}</span></div>
                            {task.description && (
                               <p className={`text-xs leading-snug line-clamp-3 group-hover:line-clamp-none ${task.completed ? 'text-zinc-400' : 'text-zinc-500 dark:text-zinc-400'}`}>
                                 {task.description}
                               </p>
                            )}
                         </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN - DASHBOARD - FIXED FIT TO SCREEN */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950 relative">
         {/* Top Navigation Bar */}
         <div className="px-6 py-5 flex justify-between items-center bg-transparent z-20 shrink-0">
            <div>
               <h2 className="text-2xl font-bold dark:text-white tracking-tight">
                 Good {new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening'}, {user.name.split(' ')[0]}
               </h2>
               <p className="text-zinc-500 text-sm font-medium mt-0.5">Ready to conquer the day?</p>
            </div>
            <div className="flex gap-3 relative items-center">
               {/* Insight Time Range Filter moved here */}
               <div className="bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1 rounded-xl flex text-xs font-bold mr-2">
                  {(['Daily', 'Weekly', 'Monthly', 'Yearly'] as const).map(range => (
                    <button
                      key={range}
                      onClick={() => setInsightTimeRange(range)}
                      className={`px-3 py-1.5 rounded-lg transition-all ${insightTimeRange === range ? 'bg-white dark:bg-zinc-800 shadow-sm text-zinc-900 dark:text-white' : 'text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'}`}
                    >
                      {range}
                    </button>
                  ))}
               </div>

               <button 
                 onClick={() => setIsInsightModalOpen(true)}
                 className={`flex items-center gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl font-bold text-sm hover:border-zinc-300 dark:hover:border-zinc-700 transition-all shadow-sm group`}
               >
                  <Sparkles size={16} className={`${themeStyles.text} group-hover:animate-pulse`} />
                  <span className="dark:text-zinc-200">AI Coach</span>
               </button>
               
               <button 
                 onClick={() => setIsCatManagerOpen(true)}
                 className="p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors shadow-sm"
                 title="Manage Categories"
               >
                  <Tag size={20} />
               </button>

               <button 
                 onClick={() => setIsSettingsOpen(!isSettingsOpen)}
                 className={`p-2.5 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-zinc-500 hover:${themeStyles.text} transition-colors shadow-sm ${isSettingsOpen ? 'ring-2 ring-indigo-500 border-transparent' : ''}`}
               >
                  <Settings size={20} />
               </button>
               
               {/* Settings Dropdown */}
               <SettingsMenu 
                 isOpen={isSettingsOpen} 
                 onClose={() => setIsSettingsOpen(false)}
                 theme={theme}
                 setTheme={setTheme}
                 onImport={handleImport}
                 onExport={handleExport}
                 onReset={handleReset}
                 onLoadSample={handleLoadSample}
                 onTemplates={() => { setIsSettingsOpen(false); setIsTemplatesOpen(true); }}
                 onLogout={handleLogout}
                 user={user}
                 accentColor={accentColor}
                 setAccentColor={setAccentColor}
               />
            </div>
         </div>

         {/* Dashboard Content - Fit to Screen Flex Layout */}
         <div className="flex-1 flex flex-col px-6 pb-6 gap-4 overflow-hidden">
             
               {/* Stats Row - Filter removed from here */}
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 shrink-0">
                  <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-2">
                         <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Deep Focus</p>
                         <div className={`p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:${themeStyles.text} transition-colors`}><Zap size={18} /></div>
                     </div>
                     <h3 className="text-4xl font-bold dark:text-white tracking-tight">{analytics.deepWorkHours}<span className="text-base text-zinc-400 font-medium ml-1">h</span></h3>
                     <div className="mt-3 text-xs text-zinc-400 flex items-center gap-1 font-medium">
                        <Target size={12} /> Target: 4h
                     </div>
                  </div>
                  
                  <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-2">
                         <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Total Time</p>
                         <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-blue-500 transition-colors"><Clock size={18} /></div>
                     </div>
                     <h3 className="text-4xl font-bold dark:text-white tracking-tight">{analytics.totalHours}<span className="text-base text-zinc-400 font-medium ml-1">h</span></h3>
                     <div className="mt-3 text-xs text-zinc-400 flex items-center gap-1 font-medium">
                        <span className="text-emerald-500">{analytics.completionRate}%</span> completion
                     </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-2">
                         <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Tasks Done</p>
                         <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-emerald-500 transition-colors"><CheckCircle2 size={18} /></div>
                     </div>
                     <h3 className="text-4xl font-bold dark:text-white tracking-tight">{analytics.completed}<span className="text-base text-zinc-400 font-medium ml-1">/ {analytics.total}</span></h3>
                     <div className="mt-3 text-xs text-zinc-400 font-medium">
                        {analytics.total - analytics.completed} remaining
                     </div>
                  </div>

                  <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm relative overflow-hidden group">
                     <div className="flex justify-between items-start mb-2">
                         <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-widest">Avg Mood</p>
                         <div className="p-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-400 group-hover:text-amber-500 transition-colors"><Smile size={18} /></div>
                     </div>
                     <h3 className="text-4xl font-bold dark:text-white flex items-center gap-2 tracking-tight">
                        {analytics.avgMood} 
                        {analytics.avgMood !== '-' && (
                          <span className={`text-2xl ${Number(analytics.avgMood) >= 4 ? 'text-emerald-500' : Number(analytics.avgMood) >= 3 ? 'text-amber-500' : 'text-red-500'}`}>
                             {Number(analytics.avgMood) >= 4 ? <Smile size={24}/> : Number(analytics.avgMood) >= 3 ? <Meh size={24}/> : <Frown size={24}/>}
                          </span>
                        )}
                     </h3>
                     <div className="mt-3 text-xs text-zinc-400 font-medium">
                        Based on logs
                     </div>
                  </div>
               </div>

               {/* Charts Area - Fixed proportion to allow fit-to-screen */}
               <div className="shrink-0 h-[32%] min-h-[200px] grid grid-cols-1 lg:grid-cols-3 gap-4">
                  {/* Main Bar Chart */}
                  <div className="lg:col-span-2 bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm h-full flex flex-col">
                     <h3 className="font-bold dark:text-white text-base flex items-center gap-2 mb-4 shrink-0"><BarChart3 size={20} className="text-zinc-400"/> Activity Distribution</h3>
                     <div className="flex-1 w-full min-h-0">
                         <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics.barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }} barSize={32}>
                               <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'dark' ? '#27272a' : '#f4f4f5'} />
                               <XAxis 
                                  dataKey="name" 
                                  axisLine={false} 
                                  tickLine={false} 
                                  tick={<CustomXAxisTick categories={categories} />}
                                  interval={0}
                                  height={40}
                               />
                               <YAxis axisLine={false} tickLine={false} tick={{fill: '#a1a1aa', fontSize: 10}} />
                               <Tooltip content={<CustomTooltip />} cursor={{fill: theme==='dark'?'#27272a':'#f4f4f5', opacity: 0.4}} />
                               <Bar dataKey="completed" stackId="a" radius={[0, 0, 4, 4]}>
                                  {analytics.barData.map((entry: any, index: number) => (
                                     <Cell key={`cell-${index}`} fill={entry.color} />
                                  ))}
                               </Bar>
                               <Bar dataKey="pending" stackId="a" radius={[4, 4, 0, 0]}>
                                  {analytics.barData.map((entry: any, index: number) => (
                                     <Cell key={`cell-${index}`} fill={entry.color} opacity={0.3} />
                                  ))}
                               </Bar>
                            </BarChart>
                         </ResponsiveContainer>
                     </div>
                  </div>

                  {/* Top Activities List - Optimized to not scroll */}
                  <div className="bg-white dark:bg-zinc-900 p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex flex-col h-full overflow-hidden">
                     <h3 className="font-bold dark:text-white text-base flex items-center gap-2 mb-4 shrink-0"><TrendingUp size={20} className="text-zinc-400"/> Top Activities</h3>
                     
                     {analytics.topActivities.length > 0 ? (
                        <div className="flex-1 flex flex-col justify-between overflow-hidden min-h-0">
                           {analytics.topActivities.map((activity: any, i: number) => (
                              <div key={i} className="flex items-center gap-3 p-3 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-100 dark:border-zinc-800/50 h-[30%]">
                                 <div className="font-bold text-lg text-zinc-300 w-5 text-center shrink-0">{i + 1}</div>
                                 <div className="w-10 h-10 rounded-full flex items-center justify-center text-white shadow-sm shrink-0" style={{background: activity.color}}>
                                    {getCategoryIcon(activity.icon, 18)}
                                 </div>
                                 <div className="flex-1 min-w-0 flex flex-col justify-center">
                                    <p className="font-bold text-sm dark:text-zinc-200 truncate leading-none mb-1.5">{activity.name}</p>
                                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 h-1.5 rounded-full overflow-hidden">
                                       <div className="h-full rounded-full" style={{width: `${Math.min(100, (parseFloat(activity.hours) / parseFloat(analytics.totalHours)) * 100)}%`, background: activity.color}}></div>
                                    </div>
                                 </div>
                                 <div className="text-right shrink-0 flex flex-col justify-center">
                                    <span className="font-bold text-sm dark:text-white block leading-none">{activity.hours}</span>
                                    <span className="text-[10px] text-zinc-500 block mt-0.5">hrs</span>
                                 </div>
                              </div>
                           ))}
                        </div>
                     ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-zinc-400 text-sm">
                           <Activity size={32} className="mb-2 opacity-20" />
                           No activity data yet
                        </div>
                     )}
                  </div>
               </div>

               {/* Week at a Glance - Redesigned & Flex Fill */}
               <div className="bg-white dark:bg-zinc-900 rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-sm flex-1 min-h-0 flex flex-col overflow-hidden">
                  <div className="px-5 pt-5 pb-3 shrink-0">
                     <h3 className="font-bold dark:text-white text-base flex items-center gap-2"><CalendarIcon size={20} className="text-zinc-400"/> Week at a Glance</h3>
                  </div>
                  <div className="grid grid-cols-7 h-full divide-x divide-zinc-100 dark:divide-zinc-800 border-t border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                     {daysInWeek.map((day, i) => {
                        const dayStr = format(day, 'yyyy-MM-dd');
                        const dayTasks = tasks.filter(t => t.date === dayStr).sort((a, b) => a.startTime.localeCompare(b.startTime));
                        const dayLog = logs.find(l => l.date === dayStr);
                        const isToday = isSameDay(day, new Date());
                        const isSelected = isSameDay(day, currentDate);
                        
                        const total = dayTasks.length;
                        const completed = dayTasks.filter(t => t.completed).length;
                        const completion = total > 0 ? Math.round((completed / total) * 100) : 0;
                        
                        // Calculate Deep Work for the day
                        let deepWorkMins = 0;
                        dayTasks.forEach(t => {
                           const cat = categories.find(c => c.id === t.categoryId);
                           if (cat?.isFocus) {
                              const start = new Date(`${t.date}T${t.startTime}`);
                              let end = new Date(`${t.date}T${t.endTime}`);
                              if (end < start) end = addDays(end, 1);
                              deepWorkMins += differenceInMinutes(end, start);
                           }
                        });
                        const deepWorkHours = (deepWorkMins / 60).toFixed(1);
                        
                        return (
                           <button 
                              key={i}
                              onClick={() => setCurrentDate(day)}
                              className={`flex flex-col text-left h-full transition-all relative group ${isSelected ? 'bg-zinc-50 dark:bg-zinc-800/20' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/10'}`}
                           >
                              {/* Header Section */}
                              <div className={`p-3 border-b border-zinc-100 dark:border-zinc-800 shrink-0 ${isSelected ? `border-l-4 ${themeStyles.border.replace('border-', 'border-l-')}` : ''}`}>
                                 <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-bold uppercase text-zinc-400 group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors">{format(day, 'EEE')}</span>
                                    <div className="flex items-center gap-1">
                                         {dayLog && getMoodIcon(dayLog.score)}
                                         <span className="text-[10px] font-medium text-zinc-500 dark:text-zinc-400">{dayLog?.score || '-'}</span>
                                    </div>
                                 </div>
                                 <div className="flex justify-between items-end">
                                    <span className={`text-2xl font-bold leading-none ${isToday ? 'text-red-500' : 'text-zinc-800 dark:text-zinc-200'}`}>{format(day, 'd')}</span>
                                    <div className="text-right flex flex-col items-end gap-0.5">
                                         {/* Completion */}
                                         <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-500" title="Completion">
                                            <CheckCircle2 size={10} />
                                            <span className="font-bold">{completion}%</span>
                                         </div>
                                         {/* Deep Work */}
                                         <div className="flex items-center gap-1 text-[10px] text-amber-500" title="Deep Focus Hours">
                                            <Zap size={10} className="fill-amber-500" />
                                            <span className="font-bold">{deepWorkHours}h</span>
                                         </div>
                                    </div>
                                 </div>
                              </div>
                              
                              {/* Task List Section */}
                              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 custom-scrollbar min-h-0 bg-zinc-50/30 dark:bg-zinc-900/30">
                                 {dayTasks.map(task => {
                                    const cat = categories.find(c => c.id === task.categoryId);
                                    return (
                                       <div key={task.id} className="flex items-center gap-2 group/task opacity-70 hover:opacity-100 transition-opacity">
                                          <div className={`min-w-[10px] flex justify-center text-zinc-400`} style={{ color: cat?.color }}>
                                             {getCategoryIcon(cat?.icon, 10)}
                                          </div>
                                          <span className={`text-[9px] leading-tight truncate w-full ${task.completed ? 'line-through text-zinc-400' : 'text-zinc-600 dark:text-zinc-300'}`}>
                                             {task.title}
                                          </span>
                                       </div>
                                    );
                                 })}
                              </div>
                           </button>
                        );
                     })}
                  </div>
               </div>

         </div>
      </div>

      {isTaskModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-zinc-900 rounded-2xl w-full max-w-sm p-6 shadow-2xl border dark:border-zinc-700">
             {/* Task Modal Content */}
             <h2 className="text-xl font-bold dark:text-white mb-4">{editingTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={(e) => {
               e.preventDefault();
               const formData = new FormData(e.currentTarget);
               handleSaveTask({
                 id: editingTask?.id,
                 title: formData.get('title'),
                 description: formData.get('description'),
                 impact: Number(formData.get('impact')),
                 startTime: formStartTime,
                 endTime: formEndTime,
                 categoryId: formData.get('categoryId')
               });
            }}>
              <input name="title" required defaultValue={editingTask?.title} placeholder="Task Title" className="w-full mb-3 p-3 rounded-xl border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white" />
              
              {/* Custom Time Picker */}
              <div className="flex gap-3 mb-3">
                 <CustomTimePicker value={formStartTime} onChange={setFormStartTime} label="Start Time" themeStyles={themeStyles} />
                 <CustomTimePicker value={formEndTime} onChange={setFormEndTime} label="End Time" themeStyles={themeStyles} />
              </div>

              <div className="grid grid-cols-2 gap-2 mb-4">
                {categories.map(cat => (
                   <label key={cat.id} className="cursor-pointer"><input type="radio" name="categoryId" value={cat.id} defaultChecked={editingTask?.categoryId === cat.id || (!editingTask && cat.id === categories[0].id)} className="peer hidden" /><div className="h-9 rounded-lg border border-zinc-200 dark:border-zinc-700 peer-checked:ring-2 peer-checked:ring-offset-1 flex items-center justify-center text-xs font-bold px-1 transition-all" style={{ backgroundColor: `${cat.color}15`, color: cat.color }}>{cat.name}</div></label>
                ))}
              </div>
              <div className="mb-4">
                <label className="block text-xs font-bold text-zinc-500 uppercase tracking-wider mb-2">Impact / Priority (1-10)</label>
                <div className="flex items-center gap-2">
                  <input 
                    type="range" 
                    name="impact" 
                    min="1" 
                    max="10" 
                    value={taskImpact} 
                    onChange={(e) => setTaskImpact(parseInt(e.target.value))}
                    className={`w-full accent-${themeStyles.text.split('-')[1]}-600`} 
                  />
                  <span className="text-sm font-bold w-6 text-center text-zinc-700 dark:text-zinc-300">{taskImpact}</span>
                </div>
              </div>
              <div className="mb-6"><textarea name="description" defaultValue={editingTask?.description} placeholder="Notes..." className="w-full h-20 p-3 rounded-xl border dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 outline-none focus:ring-2 focus:ring-indigo-500 dark:text-white resize-none text-sm" /></div>
              <div className="flex gap-3"><button type="button" onClick={() => setIsTaskModalOpen(false)} className="flex-1 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 py-3 rounded-xl transition-colors">Cancel</button><button className={`flex-[2] ${themeStyles.bg} ${themeStyles.hover} text-white py-3 rounded-xl font-bold shadow-lg shadow-indigo-200 dark:shadow-none transition-transform active:scale-95`}>Save Task</button></div>
            </form>
          </div>
        </div>
      )}
      <CategoryManager isOpen={isCatManagerOpen} onClose={() => setIsCatManagerOpen(false)} categories={categories} setCategories={setCategories} themeStyles={themeStyles} />
      <ReflectionModal isOpen={isReflectionOpen} onClose={() => setIsReflectionOpen(false)} log={todaysLog} onSave={handleSaveReflection} themeStyles={themeStyles} />
      <InsightModal isOpen={isInsightModalOpen} onClose={() => setIsInsightModalOpen(false)} insight={aiInsight} isGenerating={isGeneratingAi} onGenerate={generateInsight} themeStyles={themeStyles} />
      <TemplateManager isOpen={isTemplatesOpen} onClose={() => setIsTemplatesOpen(false)} templates={templates} onSaveCurrent={handleSaveTemplate} onApplyTemplate={handleApplyTemplate} onDeleteTemplate={(id:string)=>setTemplates(t=>t.filter(x=>x.id!==id))} themeStyles={themeStyles} />
    </div>
  );
}