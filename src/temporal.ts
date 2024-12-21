import type { StoreApi } from 'zustand'
import type { HistoryState, Options, TimelineActions } from './types/config'
import { applyPatches } from 'immer'
import { createStore } from 'zustand'
import { immer } from 'zustand/middleware/immer'
import { MAX_HISTORY_LIMIT } from './common/config'
import { filterPatches } from './utils'

interface ICreateTemporalStore<T> {
  set: StoreApi<T>['setState']
  get: StoreApi<T>['getState']
}

function createTemporal<T>({ set, get }: ICreateTemporalStore<T>, options: Options<T>) {
  return createStore<TimelineActions & HistoryState>()(
    immer((setHistory) => {
      const initialState: HistoryState = {
        undoStack: [],
        redoStack: [],
      }
      return {
        ...initialState,
        undo: () => {
          setHistory((state) => {
            if (!state.undoStack.length) {
              return
            }

            const lastPatches = state.undoStack.pop()!

            const currentState = get() as StoreApi<T>['getState']

            const newState = applyPatches(currentState, lastPatches[1])

            set(newState)

            state.redoStack.push(lastPatches)
          })
        },
        redo: () => {
          setHistory((state) => {
            if (!state.redoStack.length) {
              return
            }

            const currentState = get() as StoreApi<T>['getState']

            const nextPatches = state.redoStack.pop()!
            const newState = applyPatches(currentState, nextPatches[0])
            set(newState)
            state.undoStack.push(nextPatches)
          })
        },
        clear: () => setHistory({ undoStack: [], redoStack: [] }),
        _handleStateChange: (patches) => {
          setHistory((state) => {
            if (
              state.undoStack.length >= (options?.limit ?? MAX_HISTORY_LIMIT)
            ) {
              state.undoStack.shift()
            }
            state.redoStack = [] // 清空重做栈
            // 过滤 ignorePaths 忽略字段
            // [patches, inversePatches]
            const filteredPatches = filterPatches(
              patches,
              options.exclude,
              options.include,
            )

            // 删除记录中不需要缓存的值
            state.undoStack.push(filteredPatches)
          })
        },
      }
    }),
  )
}
export default createTemporal
