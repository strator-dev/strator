// Content script (isolated world): relays between the page and the extension.
import { startContentRelay } from "../../devtools/src/extension/relay.ts";

startContentRelay();
