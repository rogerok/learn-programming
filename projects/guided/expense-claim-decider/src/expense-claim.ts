import { Clock, Effect } from "effect";

import type { Decider } from "./decider.js";
import {
  ClaimApproved,
  ClaimRejected,
  ClaimReimbursed,
  ClaimSubmitted,
  InvalidStateTransition,
  type ExpenseClaimCommand,
  type ExpenseClaimError,
  type ExpenseClaimEvent,
  type ExpenseClaimState,
} from "./domain.js";

const initial: ExpenseClaimState = { _tag: "NotSubmitted" };

const invalidTransition = (
  state: ExpenseClaimState,
  command: ExpenseClaimCommand,
) =>
  Effect.fail(
    new InvalidStateTransition({
      from: state._tag,
      command: command._tag,
    }),
  );

const hasMatchingClaimId = (
  state: Exclude<ExpenseClaimState, { readonly _tag: "NotSubmitted" }>,
  command: Exclude<ExpenseClaimCommand, { readonly _tag: "SubmitClaim" }>,
): boolean => state.claimId === command.claimId;

const decide = (
  state: ExpenseClaimState,
  command: ExpenseClaimCommand,
): Effect.Effect<ReadonlyArray<ExpenseClaimEvent>, ExpenseClaimError> =>
  Effect.gen(function* () {
    const occurredAt = yield* Clock.currentTimeMillis;

    switch (command._tag) {
      case "SubmitClaim":
        if (state._tag !== "NotSubmitted") {
          return yield* invalidTransition(state, command);
        }
        return [
          ClaimSubmitted.make({
            claimId: command.claimId,
            employeeId: command.employeeId,
            amountCents: command.amountCents,
            occurredAt,
          }),
        ];

      case "ApproveByManager":
        if (
          state._tag !== "PendingManagerReview" ||
          !hasMatchingClaimId(state, command)
        ) {
          return yield* invalidTransition(state, command);
        }
        return [
          ClaimApproved.make({
            claimId: state.claimId,
            employeeId: state.employeeId,
            amountCents: state.amountCents,
            approvedBy: command.reviewerId,
            occurredAt,
          }),
        ];

      case "RejectClaim":
        if (
          state._tag !== "PendingManagerReview" ||
          !hasMatchingClaimId(state, command)
        ) {
          return yield* invalidTransition(state, command);
        }
        return [
          ClaimRejected.make({
            claimId: state.claimId,
            employeeId: state.employeeId,
            amountCents: state.amountCents,
            rejectedBy: command.reviewerId,
            reason: command.reason,
            occurredAt,
          }),
        ];

      case "ReimburseClaim":
        if (
          state._tag !== "Approved" ||
          !hasMatchingClaimId(state, command)
        ) {
          return yield* invalidTransition(state, command);
        }
        return [
          ClaimReimbursed.make({
            claimId: state.claimId,
            employeeId: state.employeeId,
            amountCents: state.amountCents,
            approvedBy: state.approvedBy,
            transactionId: command.transactionId,
            occurredAt,
          }),
        ];
    }
  });

const evolve = (
  _state: ExpenseClaimState,
  event: ExpenseClaimEvent,
): ExpenseClaimState => {
  switch (event._tag) {
    case "ClaimSubmitted":
      return {
        _tag: "PendingManagerReview",
        claimId: event.claimId,
        employeeId: event.employeeId,
        amountCents: event.amountCents,
      };
    case "ClaimApproved":
      return {
        _tag: "Approved",
        claimId: event.claimId,
        employeeId: event.employeeId,
        amountCents: event.amountCents,
        approvedBy: event.approvedBy,
      };
    case "ClaimRejected":
      return {
        _tag: "Rejected",
        claimId: event.claimId,
        employeeId: event.employeeId,
        amountCents: event.amountCents,
        rejectedBy: event.rejectedBy,
        reason: event.reason,
      };
    case "ClaimReimbursed":
      return {
        _tag: "Reimbursed",
        claimId: event.claimId,
        employeeId: event.employeeId,
        amountCents: event.amountCents,
        approvedBy: event.approvedBy,
        transactionId: event.transactionId,
      };
  }
};

export const expenseClaimDecider = {
  initial,
  decide,
  evolve,
} satisfies Decider<
  ExpenseClaimCommand,
  ExpenseClaimState,
  ExpenseClaimEvent,
  ExpenseClaimError
>;
