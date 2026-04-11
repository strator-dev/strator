import type { Model } from "@strator/core";

export interface ModelCtor<TModel extends Model<any>, TArgs extends any[] = any[]> {
  new (...args: TArgs): TModel;
}
