import type { Patch } from 'immer'
import type { StoreApi } from 'zustand'

type NestedPaths<T, P extends string[] = []> = T extends object
  ? {
      [K in keyof T]: NestedPaths<T[K], [...P, K & string]>;
    }[keyof T]
  : P

/** 配置项 */
export interface Options<TState, PartialTState = TState> {
  /** 最大缓存, default 10 */
  limit?: number
  partialize?: (state: TState) => PartialTState
  exclude?: NestedPaths<TState>[]
  include?: NestedPaths<TState>[]
}

export interface HistoryState {
  undoStack: Patch[][][] // 撤销栈
  redoStack: Patch[][][] // 重做栈
}

export interface TimelineActions {
  /** 撤销操作 */
  undo: (steps?: number) => void
  /** 重做操作 */
  redo: (steps?: number) => void
  /** 清空历史记录 */
  clear: () => void
  /** 处理状态变更 */
  _handleStateChange: (patches: Patch[][]) => void
}

export type ITemporalStore = StoreApi<TimelineActions & HistoryState>
