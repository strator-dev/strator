import { installDevtools } from "./store.ts";

// Installed on import so models created during the app's first render are already tracked.
installDevtools();

export { mountDevtools, mountDevtoolsPanel } from "./mount.tsx";
export type { MountDevtoolsOptions, MountDevtoolsPanelOptions } from "./mount.tsx";
export type { LauncherPosition } from "./StratorDevtools.tsx";
export { DevtoolsStore, installDevtools, uninstallDevtools } from "./store.ts";
export type {
  ActionRecord,
  ActionStatus,
  DevtoolsSource,
  DevtoolsStoreOptions,
  InstanceRecord,
  InstanceView,
} from "./store.ts";
export { testSnippet } from "./snippet.ts";
export type { StateChange } from "./values.ts";
