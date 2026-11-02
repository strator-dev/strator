import type { ActionRecord, InstanceView } from "./store.ts";
import { toCode } from "./values.ts";

/** `CartModel` → `cart`, `SearchFormModel` → `searchForm`. */
export function variableName(model: string): string {
  const base = model.replace(/Model$/, "") || "model";
  const name = base.charAt(0).toLowerCase() + base.slice(1);
  return /^[A-Za-z_$][\w$]*$/.test(name) ? name : "model";
}

export function callLabel(instance: InstanceView, action: ActionRecord): string {
  if (action.status === "lifecycle") return `${instance.model} ${action.method}d`;
  if (action.status === "external") return action.method;
  return `${variableName(instance.model)}.${action.method}(${action.args.map(a => toCode(a)).join(", ")})`;
}

/** A vitest / jest unit test that replays the action against the captured state. */
export function testSnippet(instance: InstanceView, action: ActionRecord): string {
  if (action.status === "lifecycle" || action.status === "external") {
    return "// Only model method calls can be replayed as a test.";
  }
  if (action.status === "pending") {
    return "// The call is still running; the test appears once it settles.";
  }
  const v = variableName(instance.model);
  const args = action.args.map(a => toCode(a, "  ")).join(", ");
  const call = `${v}.${action.method}(${args})`;
  const lines = [
    `import { expect, test } from "vitest";`,
    `import { ${instance.model} } from "./${instance.model}";`,
    "",
    `test(${JSON.stringify(`${instance.model}.${action.method}`)}, ${action.isAsync ? "async " : ""}() => {`,
    `  const ${v} = new ${instance.model}(${toCode(action.before, "  ")});`,
    "",
  ];
  if (action.status === "threw") {
    const message = action.error?.message ?? "";
    if (action.isAsync) lines.push(`  await expect(${call}).rejects.toThrow(${JSON.stringify(message)});`);
    else lines.push(`  expect(() => ${call}).toThrow(${JSON.stringify(message)});`);
  } else if (action.result !== undefined) {
    lines.push(`  expect(${action.isAsync ? "await " : ""}${call}).toEqual(${toCode(action.result, "  ")});`);
  } else {
    lines.push(`  ${action.isAsync ? "await " : ""}${call};`);
  }
  lines.push(`  expect(${v}.getState()).toEqual(${toCode(action.after, "  ")});`);
  lines.push("});");
  return lines.join("\n");
}
