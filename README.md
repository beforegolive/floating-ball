# @beforegolive/floating-ball

React 悬浮球组件，预编译样式，零依赖配置。

## 安装

```bash
npm install @beforegolive/floating-ball
```

## 使用

```tsx
import FloatingBall from '@beforegolive/floating-ball';

function App() {
  return (
    <>
      <FloatingBall
        version="1.0.0"
        buildTime="2026-04-06"
        theme="light"
      />
    </>
  );
}
```

## API

| Prop | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `version` | `string` | 必填 | 版本号 |
| `buildTime` | `string` | 必填 | 构建时间 |
| `theme` | `'light' \| 'dark'` | `'light'` | 主题色 |
| `position` | `{ x: number, y: number }` | 右下角 | 初始位置 |
| `menuItems` | `MenuItem[]` | 默认菜单 | 自定义菜单项 |
| `storageKey` | `string` | `'floating-ball-position'` | localStorage key |

## peerDependencies

- react >= 18.0.0
- react-dom >= 18.0.0
- react-router-dom >= 6.0.0
