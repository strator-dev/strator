// Runs in the page itself (MAIN world) before the app's scripts: installs the devtools hook.
import { startPageBridge } from "../../devtools/src/extension/bridge.ts";

startPageBridge();
