import type { Mission } from "./mission-types";
import { MISSIONS } from "./missions";
import { WEB_MISSIONS } from "./missions-web";

/** The whole deck: the base bank plus the web-researched additions. */
export const ALL_MISSIONS: Mission[] = [...MISSIONS, ...WEB_MISSIONS];
