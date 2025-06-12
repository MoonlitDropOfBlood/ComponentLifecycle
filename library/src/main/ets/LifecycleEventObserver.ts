import { LifecycleState } from "./LifecycleState";

export type LifecycleEventObserver = (source: object | undefined, event: LifecycleState) => void;
