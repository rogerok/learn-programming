import { Data } from "effect";

import type { AidId, AidIdSchema, ReservationId, ReservationIdSchema, SeatId } from "./domain.js";

export class SeatUnavailable extends Data.TaggedError("SeatUnavailable")<{
  readonly seats: ReadonlyArray<SeatId>;
}> {}

export class AidUnavailable extends Data.TaggedError("AidUnavailable")<{
  readonly aid: AidId;
}> {}

export class ReservationNotFound extends Data.TaggedError("ReservationNotFound")<{
  readonly reservationId: ReservationId;
}> {}

export class PaymentDeclined extends Data.TaggedError("PaymentDeclined")<{
  readonly reservationId: ReservationId;
  readonly reason: string;
}> {}

export type BookingError = SeatUnavailable | AidUnavailable | ReservationNotFound | PaymentDeclined;
