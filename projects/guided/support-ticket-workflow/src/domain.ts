import { Data, Schema } from "effect";

export const TicketId = Schema.String.check(
  Schema.isPattern(/^ticket_[a-z0-9]{4,}$/),
).pipe(Schema.brand("TicketId"));
export type TicketId = Schema.Schema.Type<typeof TicketId>;

export const AgentId = Schema.String.check(
  Schema.isPattern(/^agent_[a-z0-9]{3,}$/),
).pipe(Schema.brand("AgentId"));
export type AgentId = Schema.Schema.Type<typeof AgentId>;

const NonEmptyText = Schema.String.check(
  Schema.isTrimmed(),
  Schema.isNonEmpty(),
);

export const OpenTicketSchema = Schema.TaggedStruct("OpenTicket", {
  ticketId: TicketId,
  title: NonEmptyText,
});
export type OpenTicket = Schema.Schema.Type<typeof OpenTicketSchema>;

export const AssignTicketSchema = Schema.TaggedStruct("AssignTicket", {
  ticketId: TicketId,
  agentId: AgentId,
});
export type AssignTicket = Schema.Schema.Type<typeof AssignTicketSchema>;

export const ResolveTicketSchema = Schema.TaggedStruct("ResolveTicket", {
  ticketId: TicketId,
  resolution: NonEmptyText,
});
export type ResolveTicket = Schema.Schema.Type<typeof ResolveTicketSchema>;

export const TicketCommandSchema = Schema.Union([
  OpenTicketSchema,
  AssignTicketSchema,
  ResolveTicketSchema,
]);
export type TicketCommand = Schema.Schema.Type<typeof TicketCommandSchema>;

export const SlaSignalSchema = Schema.Struct({
  ticketId: TicketId,
  observedAt: Schema.Number,
});
export type SlaSignal = Schema.Schema.Type<typeof SlaSignalSchema>;

export interface EscalateTicket {
  readonly _tag: "EscalateTicket";
  readonly ticketId: TicketId;
  readonly observedAt: number;
}

export type TicketDecisionCommand = TicketCommand | EscalateTicket;

export interface TicketOpened {
  readonly _tag: "TicketOpened";
  readonly ticketId: TicketId;
  readonly title: string;
  readonly occurredAt: number;
}

export interface TicketAssigned {
  readonly _tag: "TicketAssigned";
  readonly ticketId: TicketId;
  readonly agentId: AgentId;
  readonly occurredAt: number;
}

export interface TicketResolved {
  readonly _tag: "TicketResolved";
  readonly ticketId: TicketId;
  readonly resolution: string;
  readonly occurredAt: number;
}

export interface TicketEscalated {
  readonly _tag: "TicketEscalated";
  readonly ticketId: TicketId;
  readonly occurredAt: number;
}

export type TicketEvent =
  | TicketOpened
  | TicketAssigned
  | TicketResolved
  | TicketEscalated;

export type TicketState =
  | { readonly _tag: "NotOpened" }
  | {
      readonly _tag: "Open";
      readonly ticketId: TicketId;
      readonly title: string;
      readonly openedAt: number;
    }
  | {
      readonly _tag: "Assigned";
      readonly ticketId: TicketId;
      readonly title: string;
      readonly openedAt: number;
      readonly agentId: AgentId;
      readonly assignedAt: number;
    }
  | {
      readonly _tag: "Resolved";
      readonly ticketId: TicketId;
      readonly title: string;
      readonly agentId: AgentId;
      readonly resolution: string;
      readonly resolvedAt: number;
    }
  | {
      readonly _tag: "Escalated";
      readonly ticketId: TicketId;
      readonly title: string;
      readonly agentId: AgentId | null;
      readonly escalatedAt: number;
    };

export class InvalidTransition extends Data.TaggedError("InvalidTransition")<{
  readonly command: TicketDecisionCommand["_tag"];
  readonly from: TicketState["_tag"];
}> {}

export class InvalidRequest extends Data.TaggedError("InvalidRequest")<{
  readonly message: string;
  readonly cause: unknown;
}> {}

export type TicketResponse =
  | { readonly status: "accepted"; readonly state: TicketState }
  | { readonly status: "invalid-request"; readonly message: string }
  | {
      readonly status: "conflict";
      readonly command: TicketDecisionCommand["_tag"];
      readonly from: TicketState["_tag"];
    };

export const ticketIdOf = (command: TicketDecisionCommand): TicketId =>
  command.ticketId;
