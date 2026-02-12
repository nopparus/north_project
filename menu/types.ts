import React from 'react';

export interface SubApp {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  path: string;
  appType?: 'internal' | 'iframe';
  iframeSrc?: string;
  component?: React.ComponentType;
}

export interface NavItemProps {
  app: SubApp;
  isActive: boolean;
  isCollapsed: boolean;
}
