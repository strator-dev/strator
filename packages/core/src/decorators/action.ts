import { hasDispatcher } from "../internals.ts";
import type { Model } from "../Model.ts";

export function action<TClass extends Model<any>, TMethod extends (this: TClass, payload?: unknown) => any>(
  value: TMethod,
  context: ClassMethodDecoratorContext<TClass, TMethod>,
) {
  if (context.static) throw new Error(`@action decorator can only be used on instance methods`);
  if (context.private) throw new Error(`@action decorator can only be used on public methods`);

  return function (this: TClass, payload?: unknown) {
    const actionName = `${this.constructor.name}/${context.name.toString()}`;
    if (hasDispatcher(this)) this.$dispatcher.dispatchAction(actionName, payload);
    try {
      const result = value.apply(this, [payload]);
      if (hasDispatcher(this)) this.$dispatcher.dispatchActionFinish(actionName, result);
      return result;
    } catch (e) {
      if (hasDispatcher(this)) this.$dispatcher.dispatchActionError(actionName, e);
      throw e;
    }
  };
}
