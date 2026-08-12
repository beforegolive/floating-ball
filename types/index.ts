import type { Dayjs } from "dayjs";

export interface InfoItem {
  /** 信息项的标签 */
  label: string;
  /** 信息项的值 */
  value: string;
}

/**
 * 悬浮球呈现所需的数据
 * 集中了悬浮球渲染用到的所有字段
 */
export interface FloatingBallData {
  /** 版本号，显示在悬浮球上，如 "1.0.0" */
  version?: string;
  /** 构建时间，显示在悬浮球上（格式化为 MM-DD(HH:mm)） */
  buildTime?: Dayjs | Date;
  /** 底部扩展下拉面板展示的键值对信息；提供后悬浮球右侧显示可点击的展开图标 */
  info?: InfoItem[];
}

export interface FloatingBallProps {
  /** 悬浮球呈现所需的数据（版本 / 构建时间 / 扩展信息） */
  data?: FloatingBallData;
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
  /** 背景色，默认绿色 */
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

/** @deprecated 已合并进 FloatingBallData（version / buildTime 字段） */
export interface VersionInfo {
  version: string;
  buildTime: Dayjs | Date;
}
