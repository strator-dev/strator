import type { Model } from "@strator/core";
import { useDebugValue, useState } from "react";
import { useStratorContext } from "./Provider.tsx";
import type { ModelCtor } from "./types.ts";

export function useGlobalModel<TModel extends Model<any>, TArgs extends any[]>(
  model: ModelCtor<TModel, TArgs>,
  ...args: TArgs
): TModel {
  const ctx = useStratorContext();
  const [instance] = useState<TModel>(() => ctx.getOrCreate(model.name, model, ...args));

  useDebugValue(instance);

  return instance;
}
