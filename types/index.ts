export interface Position {
  x: number;
  y: number;
}

export interface MenuItem {
  label: string;
  icon: string;
  action: () => void;
}

export interface FloatingBallProps {
  version: string;
  buildTime: string;
  theme?: 'light' | 'dark';
  position?: Position;
  menuItems?: MenuItem[];
  storageKey?: string;
}
