import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";

import { replay } from "../src/decider.js";
import {
  ApproveByFinance,
  decodeExpenseClaimCommand,
} from "../src/domain.js";
import { expenseClaimDecider } from "../src/expense-claim.js";
import { runScenario } from "../src/scenario.js";
import {
  approveByManager,
  claimId,
  financeId,
  reimburseClaim,
  runAt,
  submitClaim,
} from "./support.js";

describe("этап 2: replay и multi-event scenario runner", () => {
  it("применяет все события каждой команды в исходном порядке", async () => {
    const program = Effect.gen(function* () {
      const financeApproval = yield* decodeExpenseClaimCommand(
        ApproveByFinance.make({ claimId, reviewerId: financeId }),
      );
      return yield* runScenario(expenseClaimDecider, [
        submitClaim(150_000),
        approveByManager(),
        financeApproval,
        reimburseClaim(),
      ]);
    });

    const result = await runAt(program);
    expect(result.state._tag).toBe("Reimbursed");
    expect(result.history.map((event) => event._tag)).toEqual([
      "ClaimSubmitted",
      "ManagerApprovalGranted",
      "FinanceReviewRequested",
      "ClaimApproved",
      "ClaimReimbursed",
    ]);
    expect(replay(expenseClaimDecider, result.history)).toEqual(result.state);
  });

  it("вызывает decide один раз на команду, а evolve — на каждое событие", async () => {
    let decideCalls = 0;
    let evolveCalls = 0;
    const observedDecider = {
      ...expenseClaimDecider,
      decide: (state: Parameters<typeof expenseClaimDecider.decide>[0], command: Parameters<typeof expenseClaimDecider.decide>[1]) => {
        decideCalls += 1;
        return expenseClaimDecider.decide(state, command);
      },
      evolve: (state: Parameters<typeof expenseClaimDecider.evolve>[0], event: Parameters<typeof expenseClaimDecider.evolve>[1]) => {
        evolveCalls += 1;
        return expenseClaimDecider.evolve(state, event);
      },
    };

    const result = await runAt(
      runScenario(observedDecider, [
        submitClaim(150_000),
        approveByManager(),
      ]),
    );

    expect(result.state._tag).toBe("PendingFinanceReview");
    expect(decideCalls).toBe(2);
    expect(evolveCalls).toBe(3);
  });

  it("останавливается на первой typed error", async () => {
    const result = await runAt(
      Effect.either(
        runScenario(expenseClaimDecider, [
          submitClaim(50_000),
          submitClaim(50_000),
          approveByManager(),
        ]),
      ),
    );

    expect(Either.isLeft(result)).toBe(true);
    if (
      Either.isLeft(result) &&
      result.left._tag === "InvalidStateTransition"
    ) {
      expect(result.left.command).toBe("SubmitClaim");
    }
  });
});
