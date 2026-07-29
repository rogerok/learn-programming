import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";

import { expenseClaimDecider } from "../src/expense-claim.js";
import { runScenario } from "../src/scenario.js";
import {
  approveByManager,
  reimburseClaim,
  runAt,
  submitClaim,
} from "./support.js";

describe("working starter", () => {
  it("проводит недорогую заявку до reimbursement", async () => {
    const result = await runAt(
      runScenario(expenseClaimDecider, [
        submitClaim(50_000),
        approveByManager(),
        reimburseClaim(),
      ]),
    );

    expect(result.state._tag).toBe("Reimbursed");
    expect(result.history.map((event) => event._tag)).toEqual([
      "ClaimSubmitted",
      "ClaimApproved",
      "ClaimReimbursed",
    ]);
    expect(result.history.every((event) => event.occurredAt === 1_725_000_000_000)).toBe(
      true,
    );
  });

  it("отклоняет reimbursement до approval через typed error", async () => {
    const result = await runAt(
      Effect.either(
        expenseClaimDecider.decide(
          expenseClaimDecider.initial,
          reimburseClaim(),
        ),
      ),
    );

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left._tag).toBe("InvalidStateTransition");
    }
  });
});
