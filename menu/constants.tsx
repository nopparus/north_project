import React from 'react';
import { 
  LayoutGrid, 
  Sparkles, 
  BarChart3, 
  Settings, 
  MessageSquare, 
  Image as ImageIcon,
  FolderOpen,
  Terminal,
  Cpu,
  Database,
  Cloud,
  Layers
} from 'lucide-react';

export const COLORS = {
  theme: {
    bg: '#020617',     // slate-950
    surface: '#0f172a', // slate-900
    border: '#1e293b',  // slate-800
    muted: '#475569',   // slate-600
    accent: '#38bdf8'   // sky-400
  }
};

export const ICONS = {
  Home: LayoutGrid,
  AI: Sparkles,
  Stats: BarChart3,
  Config: Settings,
  Chat: MessageSquare,
  Media: ImageIcon,
  Project: FolderOpen,
  Dev: Terminal,
  System: Cpu,
  Data: Database,
  Cloud: Cloud,
  Stack: Layers
};