import { Data, Effect, Schema } from "effect";

export const ClaimId = Schema.String.pipe(
  Schema.pattern(/^clm_[a-z0-9]{8}$/),
  Schema.brand("ClaimId"),
);
export type ClaimId = Schema.Schema.Type<typeof ClaimId>;

export const EmployeeId = Schema.String.pipe(
  Schema.pattern(/^emp_[a-z0-9]{8}$/),
  Schema.brand("EmployeeId"),
);
export type EmployeeId = Schema.Schema.Type<typeof EmployeeId>;

export const TransactionId = Schema.String.pipe(
  Schema.pattern(/^txn_[a-z0-9]{8}$/),
  Schema.brand("TransactionId"),
);
export type TransactionId = Schema.Schema.Type<typeof TransactionId>;

export const AmountCents = Schema.Number.pipe(
  Schema.int(),
  Schema.greaterThan(0),
  Schema.brand("AmountCents"),
);
export type AmountCents = Schema.Schema.Type<typeof AmountCents>;

export const RejectionReason = Schema.String.pipe(
  Schema.filter((value) => value.trim().length > 0 || "reason must not be blank"),
);
export type RejectionReason = Schema.Schema.Type<typeof RejectionReason>;

export const SubmitClaim = Schema.TaggedStruct("SubmitClaim", {
  claimId: ClaimId,
  employeeId: EmployeeId,
  amountCents: AmountCents,
});

export const ApproveByManager = Schema.TaggedStruct("ApproveByManager", {
  claimId: ClaimId,
  reviewerId: EmployeeId,
});

export const RejectClaim = Schema.TaggedStruct("RejectClaim", {
  claimId: ClaimId,
  reviewerId: EmployeeId,
  reason: RejectionReason,
});

export const ReimburseClaim = Schema.TaggedStruct("ReimburseClaim", {
  claimId: ClaimId,
  transactionId: TransactionId,
});

// Этап 1: finance-команда объявлена для ориентации, но working baseline
// намеренно не включает её в публичный union ExpenseClaimCommand.
export const ApproveByFinance = Schema.TaggedStruct("ApproveByFinance", {
  claimId: ClaimId,
  reviewerId: EmployeeId,
});

export const ExpenseClaimCommand = Schema.Union(
  SubmitClaim,
  ApproveByManager,
  RejectClaim,
  ReimburseClaim,
);
export type ExpenseClaimCommand = Schema.Schema.Type<typeof ExpenseClaimCommand>;

const EventBase = {
  claimId: ClaimId,
  employeeId: EmployeeId,
  amountCents: AmountCents,
  occurredAt: Schema.Number,
};

export const ClaimSubmitted = Schema.TaggedStruct("ClaimSubmitted", EventBase);

export const ClaimApproved = Schema.TaggedStruct("ClaimApproved", {
  ...EventBase,
  approvedBy: EmployeeId,
});

export const ClaimRejected = Schema.TaggedStruct("ClaimRejected", {
  ...EventBase,
  rejectedBy: EmployeeId,
  reason: RejectionReason,
});

export const ClaimReimbursed = Schema.TaggedStruct("ClaimReimbursed", {
  ...EventBase,
  approvedBy: EmployeeId,
  transactionId: TransactionId,
});

// Этап 1: эти event schemas показывают требуемую форму finance policy.
// Их ещё нужно включить в ExpenseClaimEvent и материализовать в evolve.
export const ManagerApprovalGranted = Schema.TaggedStruct(
  "ManagerApprovalGranted",
  {
    ...EventBase,
    managerId: EmployeeId,
  },
);

export const FinanceReviewRequested = Schema.TaggedStruct(
  "FinanceReviewRequested",
  {
    ...EventBase,
    managerId: EmployeeId,
  },
);

export const ExpenseClaimEvent = Schema.Union(
  ClaimSubmitted,
  ClaimApproved,
  ClaimRejected,
  ClaimReimbursed,
);
export type ExpenseClaimEvent = Schema.Schema.Type<typeof ExpenseClaimEvent>;

interface ClaimData {
  readonly claimId: ClaimId;
  readonly employeeId: EmployeeId;
  readonly amountCents: AmountCents;
}

export type ExpenseClaimState =
  | { readonly _tag: "NotSubmitted" }
  | ({ readonly _tag: "PendingManagerReview" } & ClaimData)
  | ({ readonly _tag: "Approved"; readonly approvedBy: EmployeeId } & ClaimData)
  | ({
      readonly _tag: "Rejected";
      readonly rejectedBy: EmployeeId;
      readonly reason: RejectionReason;
    } & ClaimData)
  | ({
      readonly _tag: "Reimbursed";
      readonly approvedBy: EmployeeId;
      readonly transactionId: TransactionId;
    } & ClaimData);

export class InvalidClaimInput extends Data.TaggedError("InvalidClaimInput")<{
  readonly cause: unknown;
}> {}

export class InvalidStateTransition extends Data.TaggedError(
  "InvalidStateTransition",
)<{
  readonly from: ExpenseClaimState["_tag"];
  readonly command: string;
}> {}

export class SelfApprovalForbidden extends Data.TaggedError(
  "SelfApprovalForbidden",
)<{
  readonly employeeId: EmployeeId;
  readonly reviewerId: EmployeeId;
}> {}

export type ExpenseClaimError =
  | InvalidStateTransition
  | SelfApprovalForbidden;

export const decodeExpenseClaimCommand = (input: unknown) =>
  Schema.decodeUnknown(ExpenseClaimCommand)(input).pipe(
    Effect.mapError((cause) => new InvalidClaimInput({ cause })),
  );
