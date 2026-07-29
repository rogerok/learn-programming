import { Effect, TestClock, TestContext } from "effect";

import {
  AmountCents,
  ApproveByManager,
  ClaimId,
  EmployeeId,
  ReimburseClaim,
  SubmitClaim,
  TransactionId,
  type ExpenseClaimCommand,
  type ExpenseClaimError,
  type ExpenseClaimEvent,
  type ExpenseClaimState,
} from "../src/domain.js";
import { expenseClaimDecider } from "../src/expense-claim.js";

export const claimId = ClaimId.make("clm_test0001");
export const employeeId = EmployeeId.make("emp_owner001");
export const managerId = EmployeeId.make("emp_manager1");
export const financeId = EmployeeId.make("emp_finance1");
export const transactionId = TransactionId.make("txn_test0001");

export const submitClaim = (amountCents: number): ExpenseClaimCommand =>
  SubmitClaim.make({
    claimId,
    employeeId,
    amountCents: AmountCents.make(amountCents),
  });

export const approveByManager = (
  reviewerId = managerId,
): ExpenseClaimCommand =>
  ApproveByManager.make({ claimId, reviewerId });

export const reimburseClaim = (): ExpenseClaimCommand =>
  ReimburseClaim.make({ claimId, transactionId });

export const runAt = <A, E>(
  effect: Effect.Effect<A, E>,
  time = 1_725_000_000_000,
): Promise<A> =>
  Effect.runPromise(
    Effect.gen(function* () {
      yield* TestClock.setTime(time);
      return yield* effect;
    }).pipe(Effect.provide(TestContext.TestContext)),
  );

export const runDirect = (
  commands: ReadonlyArray<ExpenseClaimCommand>,
): Effect.Effect<
  { readonly state: ExpenseClaimState; readonly history: ExpenseClaimEvent[] },
  ExpenseClaimError
> =>
  Effect.gen(function* () {
    let state: ExpenseClaimState = expenseClaimDecider.initial;
    const history: ExpenseClaimEvent[] = [];

    for (const command of commands) {
      const events = yield* expenseClaimDecider.decide(state, command);
      for (const event of events) {
        state = expenseClaimDecider.evolve(state, event);
        history.push(event);
      }
    }

    return { state, history };
  });
