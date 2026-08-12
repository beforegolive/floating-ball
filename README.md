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
      data={{
        version: '1.0.0',
        buildTime: dayjs(),
        info: [
          { label: 'Git 分支', value: 'main' },
          { label: 'Commit', value: '7d35263' },
          { label: '环境', value: 'staging' },
        ],
      }}
      storageKey="my-ball-position"
    />
  );
}
```

## 属性

`FloatingBallData` 集中了悬浮球呈现所需的所有数据：

| 字段 | 类型 | 说明 |
| --- | --- | --- |
| `version` | `string` | 版本号，显示在悬浮球上 |
| `buildTime` | `Dayjs \| Date` | 构建时间，显示在悬浮球上（格式化为 `MM-DD(HH:mm)`） |
| `info` | `InfoItem[]` | 底部扩展下拉面板展示的键值对信息；提供后悬浮球右侧显示可点击的展开图标 |

通过 `data` 属性传入：`<FloatingBall data={{ version, buildTime, info }} />`

## peerDependencies

- react >= 18.0.0
- react-dom >= 18.0.0
