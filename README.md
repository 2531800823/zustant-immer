# immer-zundo

一个基于 Immer 的 patch 特性的轻量级状态管理解决方案，具有撤销/重做功能。受 [zundo](https://github.com/charkour/zundo) 库的启发。

## 核心特点

- 🎯 使用 Immer 的 patch 特性实现高效的状态管理
- ⚡ 只存储状态差异（patches），而不是完整的状态副本
- 🔄 内置撤销/重做功能
- 🎮 轻松集成到现有的 Zustand 存储中
- 📦 小型包大小
- 💪 TypeScript 支持

## 为什么使用 Patches？

与存储完整的状态快照相比，这个库使用 Immer 的 patch 特性来存储状态之间的差异（patches）。这种方法显著减少了内存使用量并提高了性能，特别是在处理大型状态对象时。

## 安装

```bash
npm install immer-zundo
# 或
yarn add immer-zundo
```

## 基础使用

```typescript
import { create } from "zustand";
import { withZundo } from "immer-zundo";

// 创建一个具有撤销/重做功能的存储
const useStore = create(
  withZundo((set) => ({
    count: 0,
    text: "",
    increase: () => set((state) => ({ count: state.count + 1 })),
    decrease: () => set((state) => ({ count: state.count - 1 })),
    setText: (text: string) => set({ text }),
  }))
);

// 在组件中使用
const MyComponent = () => {
  const { count, text, increase, decrease, setText } = useStore();
  const { undo, redo, clear } = useStore.zundo();

  return (
    <>
      <div>Count: {count}</div>
      <div>Text: {text}</div>
      <button onClick={increase}>Increase</button>
      <button onClick={decrease}>Decrease</button>
      <button onClick={() => setText("hello")}>Set Text</button>
      <button onClick={undo}>Undo</button>
      <button onClick={redo}>Redo</button>
      <button onClick={clear}>Clear History</button>
    </>
  );
};
```

## API

### withZundo

一个用于增强 Zustand 存储的中间件，添加撤销/重做功能。

### 存储方法

临时存储提供以下方法：

- `undo()`: 撤销到上一个状态
- `redo()`: 应用下一个状态（如果可用）
- `clear()`: 清除撤销/重做历史

### 配置

默认情况下，历史记录限制为 10 个状态。可以通过修改源代码中的 `MAX_HISTORY_LIMIT` 常量来更改此限制。

## 工作原理

1. 当状态发生变化时，Immer 的 `produceWithPatches` 生成 patches 和逆向 patches
2. 只存储这些 patches 在历史栈中，而不是完整的状态副本
3. `undo` 操作应用逆向 patches 来撤销更改
4. `redo` 操作应用正向 patches 来恢复更改
5. 新的状态更改清除 redo 栈以维护线性历史

## 许可证

MIT
