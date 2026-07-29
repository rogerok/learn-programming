import { Console, Effect } from "effect";

import {
  AmountCents,
  ApproveByManager,
  ClaimId,
  EmployeeId,
  ReimburseClaim,
  SubmitClaim,
  TransactionId,
} from "./domain.js";
import { expenseClaimDecider } from "./expense-claim.js";
import { runScenario } from "./scenario.js";

const claimId = ClaimId.make("clm_demo0001");
const employeeId = EmployeeId.make("emp_request1");
const managerId = EmployeeId.make("emp_review01");

const program = Effect.gen(function* () {
  const result = yield* runScenario(expenseClaimDecider, [
    SubmitClaim.make({
      claimId,
      employeeId,
      amountCents: AmountCents.make(50_000),
    }),
    ApproveByManager.make({ claimId, reviewerId: managerId }),
    ReimburseClaim.make({
      claimId,
      transactionId: TransactionId.make("txn_demo0001"),
    }),
  ]);

  yield* Console.log(
    `Claim ${claimId}: ${result.state._tag}; events=${result.history.length}`,
  );
});

Effect.runPromise(program).catch((error: unknown) => {
  console.error(error);
  process.exitCode = 1;
});
