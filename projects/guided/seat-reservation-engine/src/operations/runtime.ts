import { Layer, ManagedRuntime } from "effect";

export const makeOperationsRuntime = <R, E>(
  mainLayer: Layer.Layer<R, E, never>,
): ManagedRuntime.ManagedRuntime<R, E> => ManagedRuntime.make(mainLayer);
