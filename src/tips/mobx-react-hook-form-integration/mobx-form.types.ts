// Author - https://github.com/js2me
// @ts-nocheck - only to prevent errors. do not use in development

import {
    DeepPartial,
    FieldValues,
    SubmitErrorHandler,
    SubmitHandler,
    UseFormProps,
} from 'react-hook-form';

import type { MobxForm } from './mobx-form.js';

export type AnyMobxForm = MobxForm<any, any, any>;

/**
 * Additional options for {@link MobxForm} constructor
 */
export interface MobxFormParams<
    TFieldValues extends FieldValues = FieldValues,
    TContext = any,
    TTransformedValues = TFieldValues,
> extends Omit<
    UseFormProps<TFieldValues, TContext, TTransformedValues>,
    'defaultValues'
> {
    /**
     * Async is not supported
     */
    defaultValues?: DeepPartial<TFieldValues>;
    /**
     * Abort signal for mobx form
     */
    abortSignal?: AbortSignal;
    /**
     * Form submit handler
     */
    onSubmit?: SubmitHandler<TTransformedValues>;
    /**
     * Form submit failed handler
     */
    onSubmitFailed?: SubmitErrorHandler<TFieldValues>;
    /**
     * Form reset handler
     */
    onReset?: (event: any) => void;
    /**
     * lazy mobx form state updates using requestAnimationFrame
     * @default - {true}
     */
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
