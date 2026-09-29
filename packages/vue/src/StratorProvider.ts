import { defineComponent, type PropType } from "vue";
import { provideStratorContext } from "./context.ts";
import type { InitialStateMap } from "./types.ts";

export const StratorProvider = defineComponent({
  name: "StratorProvider",
  props: {
    initialState: {
      type: [Object, Map] as PropType<InitialStateMap>,
      required: false,
      default: undefined,
    },
  },
  setup(props, { slots }) {
    provideStratorContext(props.initialState);

    return () => {
      return slots.default ? slots.default() : null;
    };
  },
});

export const Provider = StratorProvider;
