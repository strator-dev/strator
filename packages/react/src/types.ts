export type Selector<TState extends object, TResult> = (state: TState) => TResult;
