import type {
  StateCreator,
  StoreApi,
} from 'zustand'
import type { ZustandPatchUndoMiddleware } from './types'
import type { ITemporalStore, Options } from './types/config'
import { enablePatches, produceWithPatches } from 'immer'

import createTemporal from './temporal'

enablePatches()

export const zustandPatchUndo = (<T>(
  initializer: StateCreator<T, [], []>,
  options: Options<T> = {},
) => (
  set: StoreApi<T>['setState'],
  get: StoreApi<T>['getState'],
  store: StoreApi<T> & { temporal: ITemporalStore },
) => {
  // 创建时间线存储
  store.temporal = createTemporal({ set, get }, options)

  // 更改 store.setState 这个是 react 中 useSyncExternalStore 返回的触发，重写 setState 函数
  const setState = store.setState
  store.setState = (updater: any, replace: any, ...a) => {
    const pastState = get()

    const [nextState, patches, inversePatches]
        = typeof updater === 'function'
          ? produceWithPatches(pastState, updater)
          : produceWithPatches(pastState, (draft) => {
              Object.keys(updater).forEach((item) => {
                (draft as Record<string, any>)[item] = updater[item]
              })
            })

    setState(nextState, replace, ...a)

    // 更新 设置缓存
    store.temporal.getState()._handleStateChange([patches, inversePatches])
  }

  return initializer(store.setState, get, store)
}) as ZustandPatchUndoMiddleware
