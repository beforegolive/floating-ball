import type { Dayjs } from "dayjs";

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
  /**
   * 版本信息，用于显示在悬浮球上（必填）
   * - version: 从引用方项目的 package.json 读取
   * - buildTime: 从引用方项目的构建时间获取
   */
  versionInfo: VersionInfo;
}

export interface Position {
  x: number;
  y: number;
}

export interface VersionInfo {
  /**
   * 版本号，应从引用方项目的 package.json 读取
   * @example import packageJson from './package.json';
   * version: packageJson.version
   */
  version: string;
  /**
   * 构建时间，dayjs 实例
   */
  buildTime: Dayjs;
}
