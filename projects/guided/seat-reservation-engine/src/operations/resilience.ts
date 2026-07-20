import { Data, Effect } from "effect";

import type { ReservationId } from "../domain.js";
import type { PaymentDeclined } from "../errors.js";

export class PaymentGatewayUnavailable extends Data.TaggedError(
  "PaymentGatewayUnavailable",
)<{
  readonly message: string;
  readonly cause?: unknown;
}> {}

export class PaymentTimeout extends Data.TaggedError("PaymentTimeout")<{
  readonly reservationId: ReservationId;
  readonly timeoutMs: number;
}> {}

export type ResilientPaymentError =
  | PaymentDeclined
  | PaymentGatewayUnavailable
  | PaymentTimeout;

export interface ResilientPaymentGateway {
  readonly charge: (
    reservationId: ReservationId,
    amount: number,
  ) => Effect.Effect<void, PaymentDeclined | PaymentGatewayUnavailable>;
}

export interface PaymentResilienceOptions {
  readonly timeoutMs: number;
  readonly maxRetries: number;
  readonly initialDelayMs: number;
  readonly maxDelayMs: number;
}

/**
 * The starter delegates one attempt to the gateway. Iteration 2 adds the
 * timeout and tagged retry policy without retrying PaymentDeclined.
 */
export const chargeWithResilience = (
  gateway: ResilientPaymentGateway,
  reservationId: ReservationId,
  amount: number,
  options: PaymentResilienceOptions,
): Effect.Effect<void, ResilientPaymentError> => {
  void options;
  return gateway.charge(reservationId, amount);
};
