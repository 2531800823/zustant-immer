import type { StateCreator, StoreMutatorIdentifier } from 'zustand'
import type { ITemporalStore, Options } from './config'
import type { WithImmer } from './immer'

export type ZustandPatchUndoMiddleware = <
  TState,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  UState = TState,
>(
  config: StateCreator<
    TState,
    [...Mps, ['temporal', unknown], ['zustand/immer', never]],
    Mcs
  >,
  options?: Options<TState, UState>
) => StateCreator<
  TState,
  Mps,
  [['temporal', ITemporalStore], ['zustand/immer', never], ...Mcs]
>
declare module 'zustand/vanilla' {
  interface StoreMutators<S, A> {
    temporal: Write<S, { temporal: A }>
    ['zustand/immer']: WithImmer<S>
  }
}
export type Write<T, U> = Omit<T, keyof U> & U
