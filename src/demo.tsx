import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';
import FloatingBall from './FloatingBall';

const VERSION = '1.0.0';
const BUILD_TIME = dayjs();

function DemoApp() {
  const navigate = useNavigate();

  const extraMenuItems = [
    {
      label: '打开笔记页面',
      icon: '📝',
      action: () => {
        navigate('/notes');
      },
    },
  ];

  return (
    <div style={{ padding: '20px', fontFamily: 'system-ui' }}>
      <h1>Floating Ball Demo</h1>
      <p>点击悬浮球：刷新页面</p>
      <p>双击悬浮球：打开菜单</p>
      <p>拖拽悬浮球：移动位置</p>

      <div style={{ marginTop: '100px' }}>
        <h2>页面内容</h2>
        <p>这是演示页面，用于测试悬浮球组件。</p>
      </div>

      <FloatingBall
        extraMenuItems={extraMenuItems}
        storageKey="floating-ball-position"
        defaultPosition={{ x: 16, y: 16 }}
        width={80}
        height={32}
        borderRadius={12}
        bgColor="rgb(34, 139, 34)"
        versionInfo={{
          version: VERSION,
          buildTime: BUILD_TIME,
        }}
      />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <DemoApp />
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
