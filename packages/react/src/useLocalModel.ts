import type { Model } from "@strator/core";
import { useDebugValue, useId, useState } from "react";
import { useStratorContext } from "./Provider.tsx";
import type { ModelCtor } from "./types.ts";

export function useLocalModel<TModel extends Model<any>, TArgs extends any[]>(
  model: ModelCtor<TModel, TArgs>,
  ...args: TArgs
): TModel {
  const ctx = useStratorContext();
  const id = useId();
  const [instance] = useState<TModel>(() => ctx.getOrCreate(`${model.name}/${id}`, model, ...args));

  useDebugValue(instance);

  return instance;
}
