import { useState, useRef, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { css, setup } from "goober";
import type { FloatingBallProps, InfoItem, MenuItem, Position, VersionInfo } from "../types";

// 初始化 goober
setup(css);

// 样式定义
const ballStyle = css`
  position: fixed;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: grab;
  user-select: none;
  color: white;
  font-size: 10px;
  border: 2px solid rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  opacity: 0.85;
  &:active {
    cursor: grabbing;
  }
`;

const menuOverlayStyle = css`
  position: fixed;
  inset: 0;
  z-index: 40;
`;

const menuStyle = css`
  position: fixed;
  z-index: 50;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 8px 0;
  min-width: 144px;
`;

const menuItemStyle = css`
  width: 100%;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  background: none;
  border: none;
  text-align: left;
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const expanderStyle = css`
  position: absolute;
  right: 0;
  top: 0;
  bottom: 0;
  width: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-left: 1px solid rgba(255, 255, 255, 0.35);
  background-color: rgba(255, 255, 255, 0.2);
  font-size: 16px;
  line-height: 1;
  cursor: pointer;
  color: rgba(255, 255, 255, 0.95);
  user-select: none;
`;

const infoPanelStyle = css`
  position: fixed;
  z-index: 50;
  background-color: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(0, 0, 0, 0.1);
  padding: 8px 10px;
  min-width: 128px;
`;

const infoRowStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 4px 0;
  font-size: 12px;
  color: #333;
  &:not(:last-child) {
    border-bottom: 1px solid rgba(0, 0, 0, 0.04);
  }
`;

const infoLabelStyle = css`
  color: #999;
  flex-shrink: 0;
`;

const infoValueStyle = css`
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
`;

const DEFAULT_WIDTH = 80;
const DEFAULT_HEIGHT = 32;
const DEFAULT_BORDER_RADIUS = 12;
const INFO_PANEL_WIDTH = 150;
const EXPANDER_WIDTH = 20;

const FloatingBall = ({
  extraMenuItems,
  onClick,
  storageKey = "floating-ball-position",
  defaultPosition = { x: 16, y: 16 },
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  borderRadius = DEFAULT_BORDER_RADIUS,
  bgColor = "rgb(34, 139, 34)",
  className = "",
  zIndex = 2999,
  versionInfo,
  extraInfo,
}: FloatingBallProps) => {
  // 检测 versionInfo 是否完整（必填）
  useEffect(() => {
    if (!versionInfo) {
      console.error('[FloatingBall] versionInfo is required. Please provide { version, buildTime } to display version info.');
    } else if (!versionInfo.version || !versionInfo.buildTime) {
      console.error('[FloatingBall] versionInfo is incomplete. Both version and buildTime are required.');
    }
  }, [versionInfo]);

  const [position, setPosition] = useState<Position>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return defaultPosition;
      }
    }
    return defaultPosition;
  });

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef(position);
  const clickTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const touchHandledRef = useRef(false);
  const doubleClickFiredRef = useRef(false);
  const wasJustDraggedRef = useRef(false);
  const ballRef = useRef<HTMLDivElement>(null);
  const expanderRef = useRef<HTMLDivElement>(null);
  const lastTapRef = useRef<{ time: number; x: number; y: number } | null>(null);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  // 展开面板与菜单互斥，避免两个下拉同时出现
  useEffect(() => {
    if (isExpanded) setIsMenuOpen(false);
  }, [isExpanded]);
  useEffect(() => {
    if (isMenuOpen) setIsExpanded(false);
  }, [isMenuOpen]);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    isDraggingRef.current = false;
    dragStartRef.current = { x: clientX, y: clientY };
    setIsMenuOpen(false);
    setIsExpanded(false);
  }, []);

  const handleDragMove = useCallback(
    (clientX: number, clientY: number) => {
      const dx = clientX - dragStartRef.current.x;
      const dy = clientY - dragStartRef.current.y;
      if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
        isDraggingRef.current = true;
      }
      if (isDraggingRef.current) {
        const newX = Math.max(0, Math.min(window.innerWidth - width, positionRef.current.x + dx));
        const newY = Math.max(0, Math.min(window.innerHeight - height, positionRef.current.y + dy));
        setPosition({ x: newX, y: newY });
        dragStartRef.current = { x: clientX, y: clientY };
      }
    },
    [width, height]
  );

  const handleDragEnd = useCallback(() => {
    if (isDraggingRef.current) {
      localStorage.setItem(storageKey, JSON.stringify(positionRef.current));
    }
  }, [storageKey]);

  const handleMouseDown = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0) return;
      handleDragStart(e.clientX, e.clientY);

      const handleMouseMove = (moveEvent: MouseEvent) => {
        handleDragMove(moveEvent.clientX, moveEvent.clientY);
      };

      const handleMouseUp = () => {
        if (isDraggingRef.current) {
          wasJustDraggedRef.current = true;
        }
        handleDragEnd();
        // 延迟重置，让 onClick 的定时器回调能检测到拖动状态
        setTimeout(() => {
          isDraggingRef.current = false;
          // 400ms 后清除 wasJustDraggedRef
          setTimeout(() => {
            wasJustDraggedRef.current = false;
          }, 400);
        }, 0);
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    },
    [handleDragStart, handleDragMove, handleDragEnd]
  );

  const handleClick = useCallback((e: React.MouseEvent) => {
    if (touchHandledRef.current) {
      return;
    }

    if (expanderRef.current?.contains(e.target as Node)) {
      return;
    }

    if (onClick === false) return;

    if (menuItems.length > 0) {
      if (clickTimerRef.current) {
        clearTimeout(clickTimerRef.current);
      }

      clickTimerRef.current = setTimeout(() => {
        clickTimerRef.current = null;
        if (!isDraggingRef.current && !doubleClickFiredRef.current && !wasJustDraggedRef.current) {
          onClick ? onClick() : window.location.reload();
        }
      }, 300);
    } else {
      if (!isDraggingRef.current && !wasJustDraggedRef.current) {
        onClick ? onClick() : window.location.reload();
      }
    }
  }, [onClick, extraMenuItems]);

  const handleDoubleClick = useCallback(() => {
    if (clickTimerRef.current) {
      clearTimeout(clickTimerRef.current);
      clickTimerRef.current = null;
    }
    if (!isDraggingRef.current && menuItems.length > 0) {
      setIsExpanded(false);
      setIsMenuOpen(true);
    }
    doubleClickFiredRef.current = true;
    setTimeout(() => {
      doubleClickFiredRef.current = false;
    }, 400);
  }, [extraMenuItems]);

  const handleMouseDownBall = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (expanderRef.current?.contains(e.target as Node)) {
        return;
      }
      handleMouseDown(e);
    },
    [handleMouseDown]
  );

  useEffect(() => {
    const ball = ballRef.current;
    if (!ball) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      if (expanderRef.current?.contains(e.target as Node)) return;
      handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
    };
    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 1) return;
      handleDragMove(e.touches[0].clientX, e.touches[0].clientY);
      if (isDraggingRef.current) {
        e.preventDefault();
      }
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (expanderRef.current?.contains(e.target as Node)) return;
      handleDragEnd();
      if (!isDraggingRef.current) {
        const now = Date.now();
        const lastTap = lastTapRef.current;
        const isMobileDoubleTap =
          lastTap &&
          now - lastTap.time < 300 &&
          Math.abs(position.x - lastTap.x) < 10 &&
          Math.abs(position.y - lastTap.y) < 10;

        if (isMobileDoubleTap) {
          lastTapRef.current = null;
          if (clickTimerRef.current) {
            clearTimeout(clickTimerRef.current);
            clickTimerRef.current = null;
          }
          if (menuItems.length > 0) {
            setIsExpanded(false);
            setIsMenuOpen(true);
          }
          doubleClickFiredRef.current = true;
          setTimeout(() => {
            doubleClickFiredRef.current = false;
          }, 400);
          touchHandledRef.current = true;
          return;
        }

        lastTapRef.current = { time: now, x: position.x, y: position.y };

        if (clickTimerRef.current) {
          clearTimeout(clickTimerRef.current);
        }

        if (menuItems.length > 0) {
          clickTimerRef.current = setTimeout(() => {
            clickTimerRef.current = null;
            lastTapRef.current = null;
            if (!doubleClickFiredRef.current) {
              onClick ? onClick() : window.location.reload();
            }
          }, 300);
        } else {
          onClick ? onClick() : window.location.reload();
        }

        touchHandledRef.current = true;
      }
    };
    const onDblClick = (e: MouseEvent) => {
      if (expanderRef.current?.contains(e.target as Node)) return;
      handleDoubleClick();
    };

    ball.addEventListener("touchstart", onTouchStart, { passive: false });
    ball.addEventListener("touchmove", onTouchMove, { passive: false });
    ball.addEventListener("touchend", onTouchEnd);
    ball.addEventListener("dblclick", onDblClick);

    return () => {
      ball.removeEventListener("touchstart", onTouchStart);
      ball.removeEventListener("touchmove", onTouchMove);
      ball.removeEventListener("touchend", onTouchEnd);
      ball.removeEventListener("dblclick", onDblClick);
    };
  }, [handleDragStart, handleDragMove, handleDragEnd, handleDoubleClick]);

  const defaultMenuItems: MenuItem[] = [
    { label: "刷新", icon: "🔄", action: () => window.location.reload() },
  ];
  const menuItems: MenuItem[] = [...defaultMenuItems, ...(extraMenuItems || [])];

  const closeMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const toggleExpand = useCallback(() => {
    setIsExpanded((prev) => !prev);
  }, []);

  return (
    <>
      <div
        ref={ballRef}
        className={`${ballStyle} ${className}`.trim() || ballStyle}
        style={{
          left: position.x,
          top: position.y,
          width,
          minHeight: height,
          borderRadius,
          zIndex,
          backgroundColor: bgColor,
          boxSizing: extraInfo && extraInfo.length > 0 ? "border-box" : undefined,
          paddingRight: extraInfo && extraInfo.length > 0 ? EXPANDER_WIDTH : undefined,
        }}
        onMouseDown={handleMouseDownBall}
        onClick={handleClick}
      >
        {versionInfo?.buildTime && (
          <span style={{ opacity: 0.8, lineHeight: 1.1, textAlign: "center", margin: 0 }}>
            {dayjs(versionInfo.buildTime).format("MM-DD(HH:mm)")}
          </span>
        )}
        {versionInfo?.version && (
          <span style={{ opacity: 0.8, lineHeight: 1.1, textAlign: "center", margin: 0, fontWeight: "bold" }}>
            v{versionInfo.version}
          </span>
        )}
        {extraInfo && extraInfo.length > 0 && (
          <div
            ref={expanderRef}
            className={expanderStyle}
            style={{ borderRadius: `0 ${Math.max(0, borderRadius - 2)}px ${Math.max(0, borderRadius - 2)}px 0` }}
            onClick={(e) => {
              e.stopPropagation();
              toggleExpand();
            }}
          >
            {isExpanded ? "▴" : "▾"}
          </div>
        )}
      </div>

      {isMenuOpen && menuItems.length > 0 && (
        <>
          <div className={menuOverlayStyle} onClick={closeMenu} />
          <div
            className={menuStyle}
            style={{
              left: Math.max(16, Math.min(position.x, window.innerWidth - 160)),
              top: position.y + height + 8,
            }}
          >
            {menuItems.map((item, index) => (
              <button
                key={`${item.label}-${index}`}
                className={menuItemStyle}
                onClick={() => {
                  setIsMenuOpen(false);
                  item.action();
                }}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {isExpanded && extraInfo && extraInfo.length > 0 && (
        <>
          <div className={menuOverlayStyle} onClick={() => setIsExpanded(false)} />
          <div
            className={infoPanelStyle}
            style={{
              left: Math.max(16, Math.min(position.x + width - INFO_PANEL_WIDTH, window.innerWidth - INFO_PANEL_WIDTH - 16)),
              top:
                position.y + height + 8 + extraInfo.length * 22 + 16 > window.innerHeight
                  ? Math.max(16, position.y - extraInfo.length * 22 - 16 - 8)
                  : position.y + height + 8,
            }}
          >
            {extraInfo.map((item, index) => (
              <div key={`${item.label}-${index}`} className={infoRowStyle}>
                <span className={infoLabelStyle}>{item.label}</span>
                <span className={infoValueStyle}>{item.value}</span>
              </div>
            ))}
          </div>
        </>
      )}
    </>
  );
};

export default FloatingBall;
export type { FloatingBallProps, MenuItem, InfoItem, Position, VersionInfo };
