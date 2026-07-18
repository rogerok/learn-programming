import {
  combineValidations,
  invalid,
  mapValidator,
  refineValidator,
  valid,
  type Validation,
  type Validator,
} from "./validation.js";

export interface Recipient {
  readonly name: string;
  readonly email: string;
}

export type Delivery =
  | {
      readonly kind: "courier";
      readonly address: string;
      readonly timeWindow: "morning" | "evening";
    }
  | {
      readonly kind: "locker";
      readonly lockerId: string;
    };

export interface ParcelOrder {
  readonly orderId: string;
  readonly recipient: Recipient;
  readonly declaredValueCents: number;
  readonly delivery: Delivery;
}

const recordValue: Validator<Record<string, unknown>> = (input, path) => {
  if (typeof input !== "object" || input === null || Array.isArray(input)) {
    return invalid(path, "type", "Ожидался JSON-объект");
  }

  return valid(input as Record<string, unknown>);
};

const textValue: Validator<string> = (input, path) => {
  if (input === undefined || input === null) {
    return invalid(path, "required", "Поле обязательно");
  }
  if (typeof input !== "string") {
    return invalid(path, "type", "Ожидалась строка");
  }

  return valid(input);
};

const normalizedText = mapValidator(textValue, (value) =>
  value.trim().replace(/\s+/g, " "),
);

const requiredText = refineValidator(
  normalizedText,
  (value) => value.length > 0,
  (path) => ({ path, code: "required", message: "Строка не должна быть пустой" }),
);

const orderIdValue = refineValidator(
  mapValidator(requiredText, (value) => value.toUpperCase()),
  (value) => /^ORD-\d{4}-\d{4}$/.test(value),
  (path) => ({
    path,
    code: "format",
    message: "Нужен идентификатор вида ORD-2026-0042",
  }),
);

const emailValue = refineValidator(
  mapValidator(requiredText, (value) => value.toLowerCase()),
  (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
  (path) => ({ path, code: "format", message: "Некорректный email" }),
);

const addressValue = refineValidator(
  requiredText,
  (value) => value.length >= 10,
  (path) => ({
    path,
    code: "range",
    message: "Адрес должен содержать не менее 10 символов",
  }),
);

const lockerIdValue = refineValidator(
  mapValidator(requiredText, (value) => value.toUpperCase()),
  (value) => /^LCK-[A-Z0-9]{4}$/.test(value),
  (path) => ({
    path,
    code: "format",
    message: "Нужен идентификатор вида LCK-A1B2",
  }),
);

const decimalValue: Validator<number> = (input, path) => {
  if (typeof input === "number" && Number.isFinite(input)) {
    return valid(input);
  }
  if (typeof input === "string") {
    const normalized = input.trim();
    if (/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
      return valid(Number(normalized));
    }
  }

  return invalid(path, "format", "Ожидалось число с максимум двумя знаками после точки");
};

const declaredValue = mapValidator(
  refineValidator(
    decimalValue,
    (value) => value >= 0.01 && value <= 1_000_000,
    (path) => ({
      path,
      code: "range",
      message: "Стоимость должна быть от 0.01 до 1000000",
    }),
  ),
  (value) => Math.round(value * 100),
);

const timeWindowValue: Validator<"morning" | "evening"> = (input, path) => {
  if (input === "morning" || input === "evening") {
    return valid(input);
  }

  return invalid(path, "unsupported", "Допустимы morning или evening");
};

const validateRecipient = (input: unknown, path: string): Validation<Recipient> => {
  const object = recordValue(input, path);
  if (object.kind === "invalid") {
    return object;
  }

  const fields = combineValidations(
    requiredText(object.value.name, `${path}.name`),
    emailValue(object.value.email, `${path}.email`),
  );

  return fields.kind === "invalid"
    ? fields
    : valid({ name: fields.value[0], email: fields.value[1] });
};

const validateDelivery = (input: unknown, path: string): Validation<Delivery> => {
  const object = recordValue(input, path);
  if (object.kind === "invalid") {
    return object;
  }

  if (object.value.kind === "courier") {
    const fields = combineValidations(
      addressValue(object.value.address, `${path}.address`),
      timeWindowValue(object.value.timeWindow, `${path}.timeWindow`),
    );

    return fields.kind === "invalid"
      ? fields
      : valid({
          kind: "courier",
          address: fields.value[0],
          timeWindow: fields.value[1],
        });
  }

  if (object.value.kind === "locker") {
    const lockerId = lockerIdValue(object.value.lockerId, `${path}.lockerId`);
    return lockerId.kind === "invalid"
      ? lockerId
      : valid({ kind: "locker", lockerId: lockerId.value });
  }

  return invalid(
    `${path}.kind`,
    "unsupported",
    "Допустимы варианты courier или locker",
  );
};

export const validateParcelOrder = (input: unknown): Validation<ParcelOrder> => {
  const object = recordValue(input, "$input");
  if (object.kind === "invalid") {
    return object;
  }

  const fields = combineValidations(
    orderIdValue(object.value.orderId, "$input.orderId"),
    validateRecipient(object.value.recipient, "$input.recipient"),
    declaredValue(object.value.declaredValue, "$input.declaredValue"),
    validateDelivery(object.value.delivery, "$input.delivery"),
  );

  return fields.kind === "invalid"
    ? fields
    : valid({
        orderId: fields.value[0],
        recipient: fields.value[1],
        declaredValueCents: fields.value[2],
        delivery: fields.value[3],
      });
};
