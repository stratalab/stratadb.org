import init, { StrataSession, engineVersion } from "./pkg/strata_wasm.js";
import { ColoniesEngine } from "./engine.mjs";

let engine,
  wasm,
  timer,
  queue = Promise.resolve();
const pause = () => {
  clearTimeout(timer);
  timer = undefined;
};

async function dispatch(type, args = {}) {
  if (type === "init") {
    pause();
    engine?.dispose();
    engine = undefined;
    wasm ??= await init();
    if (engineVersion() !== "1.2.2")
      throw new Error(`Expected Strata 1.2.2, received ${engineVersion()}.`);
    engine = new ColoniesEngine(() => new StrataSession(), args);
    return {
      ...engine.initialize(),
      engineVersion: engineVersion(),
      wasmBytes: wasm.memory.buffer.byteLength,
    };
  }
  if (!engine) throw new Error("Initialize the browser engine first.");
  if (type === "dispose") {
    pause();
    engine.dispose();
    engine = undefined;
    return { disposed: true };
  }
  if (type === "pause") {
    pause();
    return engine.snapshot();
  }
  if (type === "run") {
    pause();
    const hz = args.hz ?? 8;
    if (!Number.isFinite(hz) || hz < 1 || hz > 20)
      throw new Error("Speed must be between 1 and 20 generations per second.");
    const tick = () => {
      const start = performance.now();
      try {
        const snapshot = engine.step();
        postMessage({ event: "tick", result: snapshot });
        timer = setTimeout(
          tick,
          Math.max(0, 1000 / hz - (performance.now() - start)),
        );
      } catch (error) {
        pause();
        postMessage({ event: "error", error: error.message });
      }
    };
    timer = setTimeout(tick, 1000 / hz);
    return engine.snapshot();
  }
  if (type === "benchmark") {
    pause();
    const { steps = 100 } = args;
    if (!Number.isInteger(steps) || steps < 1 || steps > 1000)
      throw new Error("Benchmark steps must be 1–1000.");
    const timings = [],
      memoryBefore = wasm.memory.buffer.byteLength;
    for (let i = 0; i < steps; i++) {
      const start = performance.now();
      // Include the same snapshot serialization and worker-to-page transfer
      // used by live playback, at unthrottled speed for a stress measurement.
      const result = engine.step();
      postMessage({ event: "benchmark-tick", result });
      timings.push(performance.now() - start);
      if (i % 10 === 9) await new Promise((resolve) => setTimeout(resolve, 0));
    }
    const sorted = [...timings].sort((a, b) => a - b);
    return {
      steps,
      branches: engine.branches.size,
      width: engine.width,
      height: engine.height,
      medianMs: sorted[Math.floor(sorted.length / 2)],
      p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1],
      maxMs: sorted.at(-1),
      totalMs: timings.reduce((a, b) => a + b, 0),
      wasmBytesBefore: memoryBefore,
      wasmBytesAfter: wasm.memory.buffer.byteLength,
    };
  }
  if (type === "snapshot") return engine.snapshot();
  if (type === "history") return engine.history(args);
  if (type === "read") return engine.read(args);
  if (type === "compare") return engine.compare(args);
  if (type === "comparison-history") return engine.comparisonHistory(args);
  if (["fork", "mutate", "step"].includes(type)) {
    pause();
    return engine[type](args);
  }
  throw new Error(`Unknown worker operation: ${type}`);
}

self.onmessage = ({ data: { id, type, args } }) => {
  // Initialization can await WASM. Serialize requests so a following edit
  // cannot race it; benchmarks cannot interleave with writes either.
  queue = queue.then(async () => {
    const start = performance.now();
    try {
      postMessage({
        id,
        result: await dispatch(type, args),
        elapsedMs: performance.now() - start,
      });
    } catch (error) {
      postMessage({ id, error: error.message });
    }
  });
};
