import type { Draft } from 'immer'

export type WithImmer<S> = Write<S, StoreImmer<S>>
export type Write<T, U> = Omit<T, keyof U> & U

type StoreImmer<S> = S extends {
  setState: infer SetState
}
  ? SetState extends {
    (...a: infer A1): infer Sr1
    (...a: infer A2): infer Sr2
  }
    ? {
        // Ideally, we would want to infer the `nextStateOrUpdater` `T` type from the
        // `A1` type, but this is infeasible since it is an intersection with
        // a partial type.
        setState: ((
          nextStateOrUpdater:
            | SetStateType<A2>
            | Partial<SetStateType<A2>>
            | ((state: Draft<SetStateType<A2>>) => void),
          shouldReplace?: false,
          ...a: SkipTwo<A1>
        ) => Sr1) & ((
          nextStateOrUpdater:
            | SetStateType<A2>
            | ((state: Draft<SetStateType<A2>>) => void),
          shouldReplace: true,
          ...a: SkipTwo<A2>
        ) => Sr2)
      }
    : never
  : never
type SetStateType<T extends unknown[]> = Exclude<T[0], (...args: any[]) => any>
type SkipTwo<T> = T extends { length: 0 }
  ? []
  : T extends { length: 1 }
    ? []
    : T extends { length: 0 | 1 }
      ? []
      : T extends [unknown, unknown, ...infer A]
        ? A
        : T extends [unknown, unknown?, ...infer A]
          ? A
          : T extends [unknown?, unknown?, ...infer A]
            ? A
            : never
