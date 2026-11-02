import { type DevtoolsSubscriber, getDevtoolsHook } from "@strator/core";

export const SOURCE = "@strator/react";

const STRATOR_FRAME = /\b(?:useModel|useGlobalModel|useSharedModel|useLocalModel|useScopedModel)\b/;

interface Frame {
  name?: string;
  file?: string;
}

function parseFrame(line: string): Frame | undefined {
  const trimmed = line.trim();
  // V8: "at Name (url:line:col)" or "at url:line:col"
  let match = /^at (?:(.+?) \()?(.+?):(\d+):\d+\)?$/.exec(trimmed);
  // Firefox / Safari: "Name@url:line:col"
  if (!match) match = /^(.*?)@(.+?):(\d+):\d+$/.exec(trimmed);
  if (!match) return undefined;
  const name = match[1]?.split(".").pop()?.trim();
  const url = match[2] ?? "";
  const file = url.split(/[?#]/)[0]!.split("/").pop();
  return { name: name || undefined, file: file ? `${file}:${match[3]}` : undefined };
}

/** Best-effort name and location of the component calling a Strator hook, read from a stack trace. */
export function guessCaller(): Frame {
  const stack = new Error().stack;
  if (!stack) return {};
  const lines = stack.split("\n");
  let seenStratorFrame = false;
  for (const line of lines) {
    if (STRATOR_FRAME.test(line)) {
      seenStratorFrame = true;
      continue;
    }
    if (!seenStratorFrame) continue;
    const frame = parseFrame(line);
    if (!frame) continue;
    // Skip custom hooks wrapping ours; a component name starts with an upper case letter.
    if (frame.name && /^use[A-Z0-9]/.test(frame.name)) continue;
    if (frame.name && /^[A-Z]/.test(frame.name)) return frame;
    return {};
  }
  return {};
}

export function createSubscriberRecord(hook: string, selector: Function | undefined): DevtoolsSubscriber | null {
  if (!getDevtoolsHook()) return null;
  const caller = guessCaller();
  return {
    hook,
    component: caller.name,
    file: caller.file,
    selector: selector ? String(selector) : undefined,
    renders: 0,
  };
}
