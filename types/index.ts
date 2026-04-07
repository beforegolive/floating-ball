export interface MenuItem {
  /** 显示的标签 */
  label: string;
  /** 图标（emoji 或 HTML） */
  icon?: string;
  /** 点击后的行为 */
  action: () => void;
}

export interface FloatingBallProps {
  /** 附加菜单项（常驻项：刷新、回到首页） */
  extraMenuItems?: MenuItem[];
  /** 刷新菜单项的点击行为 */
  onRefresh?: () => void;
  /** 回到首页菜单项的点击行为 */
  onGoHome?: () => void;
  /** 单击行为（默认刷新页面），设为 false 禁用单击 */
  onClick?: (() => void) | false;
  /** localStorage 存储位置持久化的 key */
  storageKey?: string;
  /** 默认位置 */
  defaultPosition?: Position;
  /** 悬浮球尺寸 */
  width?: number;
  height?: number;
  /** 圆角 */
  borderRadius?: number;
  /** 背景色，默认蓝色 */
  bgColor?: string;
  /** 样式类名 */
  className?: string;
  /** 层级 */
  zIndex?: number;
}

export interface Position {
  x: number;
  y: number;
}

export interface VersionInfo {
  version?: string;
  buildTime?: string;
}
