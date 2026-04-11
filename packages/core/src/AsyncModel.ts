import type { Model } from "./Model.ts";
import type { Storage } from "./Storage.ts";

export type AsyncState<T extends object> = {
  [K in keyof T]: T[K] extends object ? AsyncState<T[K]> : T[K];
} & { query(): Promise<T>; mutate(mutation: T): Promise<void> };

export abstract class AsyncModel<T extends object> implements Model<AsyncState<T>> {
  protected readonly target: T;
  public state: AsyncState<T>;

  protected constructor(
    initialState: T,
    protected readonly storage: Storage,
  ) {
    this.target = initialState;
    this.state = this.createAsyncStateAt<T>([]);
  }

  private createAsyncStateAt<TObject extends object>(path: (string | symbol)[]): AsyncState<TObject> {
    return new Proxy({} as AsyncState<TObject>, {
      get: (_, property) => {
        const value = this.getRealValueAt(path, property);
      },
    });
  }

  private getRealValueAt(path: (string | symbol)[], property: string | symbol): unknown {}
}
