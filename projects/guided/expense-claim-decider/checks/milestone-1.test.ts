import { Effect, Either } from "effect";
import { describe, expect, it } from "vitest";

import {
  ApproveByFinance,
  RejectClaim,
  decodeExpenseClaimCommand,
} from "../src/domain.js";
import {
  approveByManager,
  claimId,
  employeeId,
  financeId,
  managerId,
  reimburseClaim,
  runAt,
  runDirect,
  submitClaim,
} from "./support.js";

describe("этап 1: policy-aware expense claim decider", () => {
  it("оставляет недорогую заявку на одноэтапном manager approval", async () => {
    const result = await runAt(
      runDirect([submitClaim(50_000), approveByManager()]),
    );

    expect(result.state._tag).toBe("Approved");
    expect(result.history.map((event) => event._tag)).toEqual([
      "ClaimSubmitted",
      "ClaimApproved",
    ]);
  });

  it("направляет дорогую заявку на finance review двумя событиями", async () => {
    const result = await runAt(
      runDirect([submitClaim(150_000), approveByManager()]),
    );

    expect(result.state._tag).toBe("PendingFinanceReview");
    expect(result.history.map((event) => event._tag)).toEqual([
      "ClaimSubmitted",
      "ManagerApprovalGranted",
      "FinanceReviewRequested",
    ]);
  });

  it("запрещает manager согласовывать собственную заявку", async () => {
    const result = await runAt(
      Effect.either(
        runDirect([submitClaim(50_000), approveByManager(employeeId)]),
      ),
    );

    expect(Either.isLeft(result)).toBe(true);
    if (Either.isLeft(result)) {
      expect(result.left._tag).toBe("SelfApprovalForbidden");
    }
  });

  it("завершает дорогую заявку только после finance approval", async () => {
    const program = Effect.gen(function* () {
      const financeApproval = yield* decodeExpenseClaimCommand(
        ApproveByFinance.make({ claimId, reviewerId: financeId }),
      );
      return yield* runDirect([
        submitClaim(150_000),
        approveByManager(managerId),
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
  });

  it("разрешает отклонить заявку на finance stage", async () => {
    const result = await runAt(
      runDirect([
        submitClaim(150_000),
        approveByManager(),
        RejectClaim.make({
          claimId,
          reviewerId: financeId,
          reason: "receipt does not match policy",
        }),
      ]),
    );

    expect(result.state._tag).toBe("Rejected");
    expect(result.history.at(-1)?._tag).toBe("ClaimRejected");
  });
});
