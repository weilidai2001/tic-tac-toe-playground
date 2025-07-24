/* ----------------- core framework (guards + multiple choices) ---------------- */
export interface Transition<S extends string, E extends string> {
  from: S;
  to: S;
  on: E;
  guard?: () => boolean;
  action?: () => void;
}

export class StateMachine<S extends string, E extends string> {
  #state: S;
  #table: Map<S, Map<E, Transition<S, E>[]>> = new Map();

  constructor(initial: S, transitions: Transition<S, E>[]) {
    this.#state = initial;
    transitions.forEach((t) => {
      if (!this.#table.has(t.from)) this.#table.set(t.from, new Map());
      const bucket = this.#table.get(t.from)!.get(t.on) ?? [];
      bucket.push(t);
      this.#table.get(t.from)!.set(t.on, bucket);
    });
  }

  get state(): S {
    return this.#state;
  }

  dispatch(event: E): S {
    const options = this.#table.get(this.#state)?.get(event);
    if (!options?.length) {
      throw new Error(`No transition for "${event}" from "${this.#state}".`);
    }
    const chosen = options.find((tr) => !tr.guard || tr.guard());
    if (!chosen) {
      throw new Error(`All guards blocked "${event}" from "${this.#state}".`);
    }
    chosen.action?.();
    this.#state = chosen.to;
    return this.#state;
  }
}
