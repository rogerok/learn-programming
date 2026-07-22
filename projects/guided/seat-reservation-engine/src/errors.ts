import { Data } from "effect";

import type { AidIdSchema, ReservationIdSchema, SeatId } from "./domain.js";

export class SeatUnavailable extends Data.TaggedError("SeatUnavailable")<{
  readonly seats: ReadonlyArray<SeatId>;
}> {}

export class AidUnavailable extends Data.TaggedError("AidUnavailable")<{
  readonly aid: AidIdSchema;
}> {}

export class ReservationNotFound extends Data.TaggedError("ReservationNotFound")<{
  readonly reservationId: ReservationIdSchema;
}> {}

export class PaymentDeclined extends Data.TaggedError("PaymentDeclined")<{
  readonly reservationId: ReservationIdSchema;
  readonly reason: string;
}> {}

export type BookingError = SeatUnavailable | AidUnavailable | ReservationNotFound | PaymentDeclined;
