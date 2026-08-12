import { useState, useRef, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import { css, setup } from "goober";
import type { FloatingBallData, FloatingBallProps, InfoItem, Position, VersionInfo } from "../types";

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
  onClick,
  storageKey = "floating-ball-position",
  defaultPosition = { x: 16, y: 16 },
  width = DEFAULT_WIDTH,
  height = DEFAULT_HEIGHT,
  borderRadius = DEFAULT_BORDER_RADIUS,
  bgColor = "rgb(34, 139, 34)",
  className = "",
  zIndex = 2999,
  data = {},
}: FloatingBallProps) => {

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

  const [isExpanded, setIsExpanded] = useState(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef({ x: 0, y: 0 });
  const positionRef = useRef(position);
  const touchHandledRef = useRef(false);
  const wasJustDraggedRef = useRef(false);
  const ballRef = useRef<HTMLDivElement>(null);
  const expanderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    positionRef.current = position;
  }, [position]);

  const handleDragStart = useCallback((clientX: number, clientY: number) => {
    isDraggingRef.current = false;
    dragStartRef.current = { x: clientX, y: clientY };
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

    if (!isDraggingRef.current && !wasJustDraggedRef.current) {
      onClick ? onClick() : window.location.reload();
    }
  }, [onClick]);

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
        if (onClick === false) return;
        onClick ? onClick() : window.location.reload();
        touchHandledRef.current = true;
      }
    };

    ball.addEventListener("touchstart", onTouchStart, { passive: false });
    ball.addEventListener("touchmove", onTouchMove, { passive: false });
    ball.addEventListener("touchend", onTouchEnd);

    return () => {
      ball.removeEventListener("touchstart", onTouchStart);
      ball.removeEventListener("touchmove", onTouchMove);
      ball.removeEventListener("touchend", onTouchEnd);
    };
  }, [handleDragStart, handleDragMove, handleDragEnd]);

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
          boxSizing: data.info && data.info.length > 0 ? "border-box" : undefined,
          paddingRight: data.info && data.info.length > 0 ? EXPANDER_WIDTH : undefined,
        }}
        onMouseDown={handleMouseDownBall}
        onClick={handleClick}
      >
        {data.buildTime && (
          <span style={{ opacity: 0.8, lineHeight: 1.1, textAlign: "center", margin: 0 }}>
            {dayjs(data.buildTime).format("MM-DD(HH:mm)")}
          </span>
        )}
        {data.version && (
          <span style={{ opacity: 0.8, lineHeight: 1.1, textAlign: "center", margin: 0, fontWeight: "bold" }}>
            v{data.version}
          </span>
        )}
        {data.info && data.info.length > 0 && (
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

      {isExpanded && data.info && data.info.length > 0 && (
        <>
          <div className={menuOverlayStyle} onClick={() => setIsExpanded(false)} />
          <div
            className={infoPanelStyle}
            style={{
              left: Math.max(16, Math.min(position.x + width - INFO_PANEL_WIDTH, window.innerWidth - INFO_PANEL_WIDTH - 16)),
              top:
                position.y + height + 8 + data.info.length * 22 + 16 > window.innerHeight
                  ? Math.max(16, position.y - data.info.length * 22 - 16 - 8)
                  : position.y + height + 8,
            }}
          >
            {data.info.map((item, index) => (
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
export type { FloatingBallData, FloatingBallProps, InfoItem, Position, VersionInfo };
