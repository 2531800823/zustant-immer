import { createStore } from 'zustand'
import { zustandPatchUndo } from '../src'

interface TestState {
  selected: string[]
  setAll: (selected: TestState['selected']) => void
  resetAll: () => void
  addOne: (select: string) => void
  removeOne: (select: string) => void
}

const initialState: {
  selected: string[]
} = {
  selected: [],
}

describe('数据检查', () => {
  it('复杂数据-数组', () => {
    const useStore = createStore<TestState>()(
      zustandPatchUndo(set => ({
        ...initialState,
        setAll: selected =>
          set((state) => {
            state.selected = selected
          }),
        resetAll: () =>
          set((state) => {
            state.selected = []
          }),
        addOne: select =>
          set((state) => {
            state.selected.push(select)
          }),
        removeOne: select =>
          set((state) => {
            const idx = state.selected.findIndex(id => id === select)

            if (idx === -1)
              return

            state.selected.splice(idx, 1)
          }),
      })),
    )

    const store = useStore.temporal
    //   初始化状态
    expect(useStore.getState().selected).toHaveLength(0)
    expect(store.getState().undoStack).toHaveLength(0)
    expect(store.getState().redoStack).toHaveLength(0)

    //   函数修改内容
    useStore.getState().setAll(['1', '2'])
    expect(store.getState().undoStack).toHaveLength(1)
    expect(useStore.getState().selected).toEqual(['1', '2'])

    useStore.getState().addOne('3')
    expect(store.getState().undoStack).toHaveLength(2)
    expect(useStore.getState().selected).toEqual(['1', '2', '3'])

    useStore.getState().removeOne('2')
    expect(store.getState().undoStack).toHaveLength(3)
    expect(useStore.getState().selected).toEqual(['1', '3'])

    //   撤销
    store.getState().undo()
    expect(store.getState().undoStack).toHaveLength(2)
    expect(useStore.getState().selected).toEqual(['1', '2', '3'])
    expect(store.getState().redoStack).toHaveLength(1)

    store.getState().undo()
    expect(store.getState().undoStack).toHaveLength(1)
    expect(useStore.getState().selected).toEqual(['1', '2'])
    expect(store.getState().redoStack).toHaveLength(2)

    //   重做
    store.getState().redo()
    expect(store.getState().undoStack).toHaveLength(2)
    expect(useStore.getState().selected).toEqual(['1', '2', '3'])
    expect(store.getState().redoStack).toHaveLength(1)

    //   清空
    useStore.getState().resetAll()
    expect(useStore.getState().selected).toHaveLength(0)
    expect(store.getState().redoStack).toHaveLength(0)
    expect(store.getState().undoStack).toHaveLength(3)
    store.getState().clear()
    expect(store.getState().redoStack).toHaveLength(0)
    expect(store.getState().undoStack).toHaveLength(0)
  })
})
