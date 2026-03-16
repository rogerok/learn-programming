---
tags: [tips, mobx, react-hook-form, forms, integration, typescript]
aliases: [MobxForm, MobX + React Hook Form]
---

# Интеграция MobX с React Hook Form

Автор оригинала: [js2me](https://github.com/js2me)

Паттерн: оборачиваем `react-hook-form` в MobX-класс, чтобы состояние формы (`isValid`, `errors`, `values`) стало observable и реагировало на изменения в компонентах автоматически.

## Зачем это нужно

`react-hook-form` управляет состоянием сам по себе через ref'ы и re-render подписки. В проекте с MobX хочется работать с формой как с обычным observable-стором: читать `form.isValid`, `form.errors` прямо в `observer`-компонентах без лишней обвязки.

## mobx-form.types.ts — типы параметров

```typescript
import {
    DeepPartial,
    FieldValues,
    SubmitErrorHandler,
    SubmitHandler,
    UseFormProps,
} from 'react-hook-form';

import type { MobxForm } from './mobx-form.js';

export type AnyMobxForm = MobxForm<any, any, any>;

export interface MobxFormParams<
    TFieldValues extends FieldValues = FieldValues,
    TContext = any,
    TTransformedValues = TFieldValues,
> extends Omit<
    UseFormProps<TFieldValues, TContext, TTransformedValues>,
    'defaultValues'
> {
    defaultValues?: DeepPartial<TFieldValues>;
    abortSignal?: AbortSignal;
    onSubmit?: SubmitHandler<TTransformedValues>;
    onSubmitFailed?: SubmitErrorHandler<TFieldValues>;
    onReset?: (event: any) => void;
    /** lazy mobx form state updates using requestAnimationFrame @default true */
    lazyUpdates?: boolean;
}

export type ExtractFormFieldValues<T extends AnyMobxForm> = Exclude<
    T['values'],
    undefined | null
>;

export type ExtractFormFieldOutputValues<T extends AnyMobxForm> =
    T extends MobxForm<any, any, infer TFieldOutputValues>
        ? TFieldOutputValues
        : never;
```

## mobx-form.ts — класс MobxForm

```typescript
import { LinkedAbortController } from 'linked-abort-controller';
import { action, comparer, makeObservable, observable } from 'mobx';
import { createFormControl } from 'react-hook-form';
import { MobxFormParams } from './mobx-form.types.js';

export class MobxForm<
    TFieldValues extends FieldValues = FieldValues,
    TContext = any,
    TTransformedValues = TFieldValues,
> {
    // Observable состояние формы
    values!: TFieldValues;
    isDirty: boolean = false;
    isLoading: boolean = false;
    isSubmitted: boolean = false;
    isSubmitSuccessful: boolean = false;
    isSubmitting: boolean = false;
    isValidating: boolean = false;
    isValid: boolean = false;
    disabled: boolean = false;
    submitCount: number = 0;
    defaultValues!: Readonly<DefaultValues<TFieldValues>>;
    dirtyFields = {};
    touchedFields = {};
    validatingFields = {};
    errors: FieldErrors<TFieldValues> = {};
    isReady: boolean = false;

    // Методы react-hook-form делегируются напрямую
    setError: UseFormSetError<TFieldValues>;
    clearErrors: UseFormClearErrors<TFieldValues>;
    trigger: UseFormTrigger<TFieldValues>;
    resetField: UseFormResetField<TFieldValues>;
    unregister: UseFormUnregister<TFieldValues>;
    control: Control<TFieldValues, TContext, TTransformedValues>;
    register: UseFormRegister<TFieldValues>;
    setFocus: UseFormSetFocus<TFieldValues>;
    setValue: UseFormSetValue<TFieldValues>;
    resetForm: UseFormReset<TFieldValues>;

    protected abortController: AbortController;
    originalForm: ReturnType<typeof createFormControl>;

    constructor(private config: MobxFormParams<TFieldValues, TContext, TTransformedValues>) {
        this.abortController = new LinkedAbortController(config.abortSignal);

        this.originalForm = createFormControl({ ...config });

        // Делегируем все методы оригинальной форме
        this.setError = this.originalForm.setError;
        this.clearErrors = this.originalForm.clearErrors;
        this.trigger = this.originalForm.trigger;
        this.resetField = this.originalForm.resetField;
        this.unregister = this.originalForm.unregister;
        this.control = this.originalForm.control;
        this.register = this.originalForm.register;
        this.setFocus = this.originalForm.setFocus;
        this.setValue = this.originalForm.setValue;
        this.resetForm = this.originalForm.reset;

        // Подписываемся на изменения формы
        const subscription = this.originalForm.subscribe({
            formState: { values: true, errors: true, isValid: true, isDirty: true, /* ... */ },
            callback: (rawFormState) => {
                if (this.config.lazyUpdates === false) {
                    this.updateFormState(rawFormState);
                } else {
                    // Обновление через RAF чтобы не перерисовывать на каждый keystroke
                    this.lastRafId = requestAnimationFrame(() => {
                        this.updateFormState(rawFormState);
                    });
                }
            },
        });

        // Помечаем поля observable
        observable.deep(this, 'values');
        observable.ref(this, 'isValid');
        observable.deep(this, 'errors');
        // ... и т.д. для всех полей состояния
        action(this, 'updateFormState');
        action.bound(this, 'submit');
        action.bound(this, 'reset');

        makeObservable(this);

        // Очищаем при destroy
        this.abortController.signal.addEventListener('abort', () => {
            subscription();
            this.originalForm = null!;
        });
    }

    submit(e?: BaseSyntheticEvent) {
        return new Promise<TTransformedValues>((resolve, reject) => {
            this.originalForm.handleSubmit(
                (data, event) => { this.config.onSubmit?.(data, event); resolve(data); },
                (errors, event) => { this.config.onSubmitFailed?.(errors, event); reject(errors); },
            )(e);
        });
    }

    reset(e?: BaseSyntheticEvent) {
        this.resetForm();
        this.config.onReset?.(e);
    }

    private updateFormState({ values, errors, ...simpleProperties }) {
        // Обновляем примитивные поля
        Object.entries(simpleProperties).forEach(([key, value]) => {
            if (value != null) this[key] = value;
        });

        // Умное обновление errors — избегаем лишних реакций через structural comparer
        if (errors) {
            const currentErrorsSet = new Set(Object.keys(this.errors));
            for (const errorField of Object.keys(errors)) {
                if (!comparer.structural(this.errors[errorField], errors[errorField])) {
                    Object.assign(this.errors[errorField] ?? {}, errors[errorField]);
                }
                currentErrorsSet.delete(errorField);
            }
            currentErrorsSet.forEach(f => delete this.errors[f]);
        } else {
            this.errors = {};
        }

        this.values = values ?? {};
    }

    destroy(): void {
        this.abortController.abort();
        if (this.lastRafId !== undefined) cancelAnimationFrame(this.lastRafId);
    }
}
```

## controller.tsx — Observer-обёртка для Controller

```tsx
import { Observer } from 'mobx-react-lite';
import { Controller as LibController } from 'react-hook-form';

// Оборачиваем render в <Observer> чтобы поля реагировали на MobX-изменения
export const Controller = ((props: any) => (
    <LibController
        {...props}
        render={(renderProps) => (
            <Observer>{() => props.render(renderProps)}</Observer>
        )}
    />
)) as unknown as typeof LibController;
```

## Использование

```tsx
const form = new MobxForm({
    defaultValues: { username: '', email: '' },
    onSubmit: async (data) => { await api.register(data); },
});

const MyForm = observer(() => (
    <form onSubmit={form.submit} onReset={form.reset}>
        <Controller
            control={form.control}
            name="username"
            render={({ field }) => <input {...field} />}
        />
        <button disabled={!form.isValid}>Submit</button>
        {/* form.isValid — observable, компонент перерисуется автоматически */}
    </form>
));
```

## Ключевые идеи

- `MobxForm` реализует тот же интерфейс `FormState`, что и `react-hook-form` — можно использовать как drop-in
- `requestAnimationFrame` для `lazyUpdates` — батчинг обновлений, не перерисовываем на каждый символ
- `comparer.structural` для `errors` — избегаем лишних MobX-реакций при одинаковых ошибках
- `LinkedAbortController` — привязываем время жизни формы к родительскому сигналу (от стора)

## Связанные темы

- [[../05-frontend/mobx/MOC|MobX MOC]]
- [[../05-frontend/react/MOC|React MOC]]
- [[using-zod-with-classes|Zod с классами]]
