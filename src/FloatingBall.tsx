import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { css } from 'goober';
import { useNavigate } from 'react-router-dom';
import type { FloatingBallProps, Position, MenuItem } from '../types';

// 默认菜单位置：右下角，距离边缘 20px
const DEFAULT_POSITION: Position = { x: 20, y: 20 };

// 创建默认菜单项（需要 navigate 函数）
const createDefaultMenuItems = (navigate: ReturnType<typeof useNavigate>): MenuItem[] => [
  {
    label: '刷新',
    icon: '🔄',
    action: () => window.location.reload(),
  },
  {
    label: '回到首页',
    icon: '🏠',
    action: () => navigate('/'),
  },
  {
    label: '打开笔记页面',
    icon: '📝',
    action: () => navigate('/notes'),
  },
];

// 样式定义
const ballStyle = css({
  position: 'fixed',
  width: '56px',
  height: '56px',
  borderRadius: '50%',
  backgroundColor: 'rgba(0, 0, 0, 0.4)',
  backdropFilter: 'blur(10px)',
  WebkitBackdropFilter: 'blur(10px)',
  zIndex: 50,
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  userSelect: 'none',
  transition: 'box-shadow 0.2s ease',
  '&:hover': {
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
});

const ballDarkStyle = css({
  backgroundColor: 'rgba(255, 255, 255, 0.2)',
});

const menuStyle = css({
  position: 'fixed',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
  border: '1px solid rgba(0, 0, 0, 0.1)',
  padding: '8px 0',
  minWidth: '160px',
  zIndex: 51,
});

const menuDarkStyle = css({
  backgroundColor: '#2d2d2d',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.4)',
});

const menuItemStyle = css({
  padding: '10px 16px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  fontSize: '14px',
  color: '#333',
  transition: 'background-color 0.15s ease',
  '&:hover': {
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});

const menuItemDarkStyle = css({
  color: '#e0e0e0',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});

interface DragState {
  isDragging: boolean;
  startX: number;
  startY: number;
  offsetX: number;
  offsetY: number;
  hasMoved: boolean;
}

const FloatingBall: React.FC<FloatingBallProps> = ({
  version,
  buildTime,
  theme = 'light',
  position = DEFAULT_POSITION,
  menuItems,
  storageKey = 'floating-ball-position',
}) => {
  const navigate = useNavigate();
  const defaultMenuItems = useMemo(() => createDefaultMenuItems(navigate), [navigate]);
  const actualMenuItems = menuItems ?? defaultMenuItems;
  const [pos, setPos] = useState<Position>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {
          return position;
        }
      }
    }
    return position;
  });

  const [showMenu, setShowMenu] = useState(false);
  const dragState = useRef<DragState>({
    isDragging: false,
    startX: 0,
    startY: 0,
    offsetX: 0,
    offsetY: 0,
    hasMoved: false,
  });
  const clickTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const clickCount = useRef(0);

  // 保存位置到 localStorage
  const savePosition = useCallback((newPos: Position) => {
    localStorage.setItem(storageKey, JSON.stringify(newPos));
  }, [storageKey]);

  // 鼠标/触摸按下
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragState.current = {
      isDragging: true,
      startX: e.clientX,
      startY: e.clientY,
      offsetX: pos.x,
      offsetY: pos.y,
      hasMoved: false,
    };
  }, [pos]);

  // 鼠标/触摸移动
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragState.current.isDragging) return;

    const deltaX = e.clientX - dragState.current.startX;
    const deltaY = e.clientY - dragState.current.startY;

    // 超过 5px 才算拖动
    if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
      dragState.current.hasMoved = true;
    }

    if (dragState.current.hasMoved) {
      const newX = Math.max(0, dragState.current.offsetX + deltaX);
      const newY = Math.max(0, dragState.current.offsetY + deltaY);
      setPos({ x: newX, y: newY });
    }
  }, []);

  // 鼠标/触摸释放
  const handleMouseUp = useCallback(() => {
    if (dragState.current.isDragging && dragState.current.hasMoved) {
      // 拖动结束，保存位置
      savePosition(pos);
    }
    dragState.current.isDragging = false;
  }, [pos, savePosition]);

  // 添加全局事件监听
  useEffect(() => {
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [handleMouseMove, handleMouseUp]);

  // 点击处理（区分单击和双击）
  const handleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();

    // 如果正在拖动，不处理点击
    if (dragState.current.hasMoved) {
      return;
    }

    clickCount.current += 1;

    if (clickCount.current === 1) {
      // 第一次点击，启动定时器
      clickTimer.current = setTimeout(() => {
        // 250ms 内没有第二次点击，执行单击操作（刷新页面）
        window.location.reload();
        clickCount.current = 0;
      }, 250);
    } else if (clickCount.current === 2) {
      // 250ms 内有第二次点击，执行双击操作（弹出菜单）
      if (clickTimer.current) {
        clearTimeout(clickTimer.current);
      }
      setShowMenu(true);
      clickCount.current = 0;
    }
  }, []);

  // 双击处理
  const handleDoubleClick = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(true);
  }, []);

  // 菜单项点击
  const handleMenuItemClick = useCallback((item: MenuItem) => {
    setShowMenu(false);
    item.action();
  }, []);

  // 点击其他地方关闭菜单
  useEffect(() => {
    if (!showMenu) return;

    const handleClickOutside = () => {
      setShowMenu(false);
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [showMenu]);

  const isDark = theme === 'dark';
  const ballX = isDark ? 'auto' : `${pos.x}px`;
  const ballY = isDark ? 'auto' : `${pos.y}px`;
  const ballRight = isDark ? `${pos.x}px` : 'auto';
  const ballBottom = isDark ? `${pos.y}px` : 'auto';

  // 计算菜单位置（在球的左上方）
  const menuX = pos.x > 200 ? pos.x - 180 : pos.x;
  const menuY = pos.y > 150 ? pos.y - 100 : pos.y + 60;

  return (
    <>
      <div
        className={`${ballStyle} ${isDark ? ballDarkStyle : ''}`}
        style={{
          left: ballX,
          right: ballRight,
          top: ballY,
          bottom: ballBottom,
        }}
        onMouseDown={handleMouseDown}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
        title={`${version} (${buildTime})`}
      >
        <span style={{ fontSize: '24px' }}>⚽</span>
      </div>

      {showMenu && (
        <div
          className={`${menuStyle} ${isDark ? menuDarkStyle : ''}`}
          style={{
            left: `${menuX}px`,
            top: `${menuY}px`,
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {actualMenuItems.map((item, index) => (
            <div
              key={index}
              className={`${menuItemStyle} ${isDark ? menuItemDarkStyle : ''}`}
              onClick={() => handleMenuItemClick(item)}
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      )}
    </>
  );
};

export default FloatingBall;
