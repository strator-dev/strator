import { installDevtools } from "./store.ts";

// Installed on import so models created during the app's first render are already tracked.
installDevtools();

export { StratorDevtools, StratorDevtoolsPanel } from "./StratorDevtools.tsx";
export type { LauncherPosition, StratorDevtoolsPanelProps, StratorDevtoolsProps } from "./StratorDevtools.tsx";
export { mountDevtools } from "./mount.tsx";
export { DevtoolsStore, installDevtools, uninstallDevtools } from "./store.ts";
export type { ActionRecord, ActionStatus, DevtoolsStoreOptions, InstanceRecord } from "./store.ts";
export { testSnippet } from "./snippet.ts";
export type { StateChange } from "./values.ts";
