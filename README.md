# @beforegolive/floating-ball

React 悬浮球组件，预编译样式，零依赖配置。

## 安装

```bash
npm install @beforegolive/floating-ball
```

## 使用

```tsx
import FloatingBall from '@beforegolive/floating-ball';
import dayjs from 'dayjs';

function App() {
  return (
    <FloatingBall
      versionInfo={{
        version: '1.0.0',
        buildTime: dayjs(),
      }}
      storageKey="my-ball-position"
      extraMenuItems={[
        { label: '游戏首页', icon: '🎮', action: () => { window.location.href = '/'; } },
      ]}
    />
  );
}
```

## peerDependencies

- react >= 18.0.0
- react-dom >= 18.0.0
