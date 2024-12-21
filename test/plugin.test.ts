import { createStore } from 'zustand'
import { zustandPatchUndo } from '../src'

interface TestState {
  count: number
  text: string
  increase: () => void
  decrease: () => void
  setText: (text: string) => void
}

describe('zustandPatchUndo', () => {
  it('should create store with undo/redo functionality', () => {
    const useStore = createStore<TestState>()(
      zustandPatchUndo(set => ({
        count: 0,
        text: '',
        increase: () => set(state => ({ count: state.count + 1 })),
        decrease: () => set(state => ({ count: state.count - 1 })),
        setText: (text: string) => set({ text }),
      })),
    )

    const store = useStore.temporal

    // 初始状态检查
    expect(useStore.getState().count).toBe(0)
    expect(useStore.getState().text).toBe('')
    expect(store.getState().undoStack).toHaveLength(0)
    expect(store.getState().redoStack).toHaveLength(0)

    // 测试状态修改
    useStore.getState().increase()
    expect(useStore.getState().count).toBe(1)
    expect(store.getState().undoStack).toHaveLength(1)

    useStore.getState().setText('hello')
    expect(useStore.getState().text).toBe('hello')
    expect(store.getState().undoStack).toHaveLength(2)

    // 测试撤销
    store.getState().undo()
    expect(useStore.getState().text).toBe('')
    expect(store.getState().undoStack).toHaveLength(1)
    expect(store.getState().redoStack).toHaveLength(1)

    store.getState().undo()
    expect(useStore.getState().count).toBe(0)
    expect(store.getState().undoStack).toHaveLength(0)
    expect(store.getState().redoStack).toHaveLength(2)

    // 测试重做
    store.getState().redo()
    expect(useStore.getState().count).toBe(1)
    store.getState().redo()
    expect(useStore.getState().text).toBe('hello')
  })

  it('should clear history when clear is called', () => {
    const useStore = createStore<TestState>()(
      zustandPatchUndo(set => ({
        count: 0,
        text: '',
        increase: () => set(state => ({ count: state.count + 1 })),
        decrease: () => set(state => ({ count: state.count - 1 })),
        setText: (text: string) => set({ text }),
      })),
    )

    const store = useStore.temporal

    // 进行一些状态修改
    useStore.getState().increase()
    useStore.getState().setText('hello')
    expect(store.getState().undoStack).toHaveLength(2)

    // 测试清除历史
    store.getState().clear()
    expect(store.getState().undoStack).toHaveLength(0)
    expect(store.getState().redoStack).toHaveLength(0)
  })

  it('should handle maximum history limit', () => {
    const useStore = createStore<TestState>()(
      zustandPatchUndo(set => ({
        count: 0,
        text: '',
        increase: () => set(state => ({ count: state.count + 1 })),
        decrease: () => set(state => ({ count: state.count - 1 })),
        setText: (text: string) => set({ text }),
      })),
    )

    const store = useStore.temporal

    // 超过最大历史记录限制
    for (let i = 0; i < 12; i++) {
      useStore.getState().increase()
    }

    // 由于限制是10，所以历史记录应该只有10条
    expect(store.getState().undoStack).toHaveLength(10)
  })

  it('should clear redo stack when new action is performed', () => {
    const useStore = createStore<TestState>()(
      zustandPatchUndo(set => ({
        count: 0,
        text: '',
        increase: () => set(state => ({ count: state.count + 1 })),
        decrease: () => set(state => ({ count: state.count - 1 })),
        setText: (text: string) => set({ text }),
      })),
    )

    const store = useStore.temporal

    // 进行一些操作并撤销
    useStore.getState().increase()
    useStore.getState().increase()
    store.getState().undo()
    expect(store.getState().redoStack).toHaveLength(1)

    // 执行新操作，重做栈应该被清空
    useStore.getState().setText('hello')
    expect(store.getState().redoStack).toHaveLength(0)
  })
})
