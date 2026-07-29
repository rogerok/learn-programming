import { describe, expect, it } from "vitest";
import { Effect, Stream } from "effect";

import { makeOrderLineStream } from "../src/pipeline.js";
import { makeOrderFeedHarness, makeOrderLines } from "./support.js";

describe("milestone 1: lazy pagination", () => {
  it("fetches only the page demanded by a partial consumer", async () => {
    const feed = makeOrderFeedHarness();

    const firstPage = await Effect.runPromise(
      makeOrderLineStream(feed.service).pipe(
        Stream.take(3),
        Stream.runCollect,
      ),
    );

    expect(firstPage.map(({ id }) => id)).toEqual([
      "line-1",
      "line-2",
      "line-3",
    ]);
    expect(feed.calls()).toEqual(["page-1"]);
  });

  it("fetches every cursor once for a full consumer", async () => {
    const lines = makeOrderLines();
    const feed = makeOrderFeedHarness(lines);

    const collected = await Effect.runPromise(
      makeOrderLineStream(feed.service).pipe(Stream.runCollect),
    );

    expect(collected.map(({ id }) => id)).toEqual(
      lines.map(({ id }) => id),
    );
    expect(feed.calls()).toEqual(["page-1", "page-2", "page-3"]);
  });
});
