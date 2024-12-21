import { zustandPatchUndo } from '@spliu/zustand-immer'
import { create } from 'zustand'

const useStore = create(
  zustandPatchUndo(set => ({
    count: 0,
    text: '',
    increase: () => set(state => ({ count: state.count + 1 })),
    decrease: () => set(state => ({ count: state.count - 1 })),
    setText: (text: string) => set({ text }),
  })),
)
export default useStore
