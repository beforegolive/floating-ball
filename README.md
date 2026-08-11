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
      extraInfo={[
        { label: 'Git 分支', value: 'main' },
        { label: 'Commit', value: '7d35263' },
        { label: '环境', value: 'staging' },
      ]}
    />
  );
}
```

## 属性

| 属性 | 类型 | 默认值 | 说明 |
| --- | --- | --- | --- |
| `extraInfo` | `InfoItem[]` | — | 底部扩展行展示的键值对信息；提供后在悬浮球右侧显示可点击的展开图标，点击展开下拉面板 |

## peerDependencies

- react >= 18.0.0
- react-dom >= 18.0.0
