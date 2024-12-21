import type { Options } from '../src'
import {} from 'immer'
import { createStore } from 'zustand'
import { zustandPatchUndo } from '../src'

interface MyState {
  count: number
  count2: number
  myString: string
  string2: string
  boolean1: true
  boolean2: false
}
interface Action {
  increment: () => void
  incrementCountOnly: () => void
  incrementCount2Only: () => void
  decrement: () => void
  doNothing: () => void
}

const initialState: MyState = {
  count: 0,
  count2: 0,
  myString: 'hello',
  string2: 'world',
  boolean1: true,
  boolean2: false,
}

function createVanillaStore(options?: Options<MyState & Action, Pick<MyState & Action, 'count'>>) {
  return createStore<MyState & Action>()(
    zustandPatchUndo((set) => {
      return {
        ...initialState,
        increment: () =>
          set((state) => {
            state.count = state.count + 1
            state.count2 = state.count2 + 1
          }),
        decrement: () =>
          set(state => ({
            count: state.count - 1,
            count2: state.count2 - 1,
          })),
        incrementCountOnly: () => set(state => ({ count: state.count + 1 })),
        incrementCount2Only: () =>
          set(state => ({ count2: state.count2 + 1 })),
        doNothing: () => set(state => ({ ...state })),
      }
    }, options),
  )
}

describe('limit', () => {
  it('测试 limit', () => {
    const useStore = createVanillaStore({ limit: 2 })
    const store = useStore.temporal
    expect(store.getState().undoStack).toHaveLength(0)
    useStore.getState().increment()
    expect(store.getState().undoStack).toHaveLength(1)
    useStore.getState().increment()
    expect(store.getState().undoStack).toHaveLength(2)
    useStore.getState().increment()
    expect(store.getState().undoStack).toHaveLength(2)
    useStore.getState().increment()
    expect(store.getState().undoStack).toHaveLength(2)

    store.getState().undo()

    expect(useStore.getState().count).toBe(3)
    expect(useStore.getState().count2).toBe(3)

    expect(store.getState().undoStack).toHaveLength(1)
    expect(store.getState().redoStack).toHaveLength(1)

    useStore.getState().increment()
    useStore.getState().increment()

    expect(useStore.getState().count).toBe(5)
    expect(useStore.getState().count2).toBe(5)

    expect(store.getState().undoStack).toHaveLength(2)
    expect(store.getState().redoStack).toHaveLength(0)
  })

  it('测试 ignorePaths', () => {
    const useStore = createVanillaStore({
      exclude: [['count2']],
    })

    const store = useStore.temporal
    useStore.getState().increment()
    useStore.getState().increment()
    useStore.getState().increment()
    useStore.getState().increment()

    expect(useStore.getState().count).toBe(4)
    expect(useStore.getState().count2).toBe(4)

    store.getState().undo()

    expect(useStore.getState().count).toBe(3)
    expect(useStore.getState().count2).toBe(4)
  })
})
