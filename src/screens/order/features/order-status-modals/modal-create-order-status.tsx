'use client'

import {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import {cn} from "@/helpers/cn";
import React, {FC, useEffect} from "react";
import Input from "@/ui/input/Input";
import {useForm} from "react-hook-form";
import Button from "@/ui/button/Button";
import Loading from "@/ui/loading/Loading";
import {IOrderStatusForm} from "@/screens/order/types/order-status/IOrderStatusForm";
import {useOrderStatusCreateMutation} from "@/screens/order/hooks/order-status/useOrderStatusCreateMutation";
import {useOrderStatusUpdateMutation} from "@/screens/order/hooks/order-status/useOrderStatusUpdateMutation";
import {IOrderStatus} from "@/screens/order/types/order-status/IOrderStataus";
import { ToggleBtn } from "@/ui/toggles/toggle-btn";

type IModalCreateOrderStatus = ModalProps & {
    orderStatus?: IOrderStatus | null;
}

const OrderStatusCreateModal: FC<IModalCreateOrderStatus> = ({orderStatus, ...props}) => {
    const isEditMode = !!orderStatus;

    const {control, handleSubmit, trigger, reset, watch, formState: { errors, isValid }, setValue} = useForm<IOrderStatusForm>({
        mode: 'onChange',
        defaultValues: {
            code: '',
            title: '',
            // Новий статус за замовчуванням видимий: ховати — свідома дія
            isVisibleToDealer: true
        }
    });

    const {mutateAsync: createOrderStatus, isPending: isCreating} = useOrderStatusCreateMutation();
    const {mutateAsync: updateOrderStatus, isPending: isUpdating} = useOrderStatusUpdateMutation();

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (orderStatus && props.open) {
            setValue('code', orderStatus.code);
            setValue('title', orderStatus.title);
            setValue('isVisibleToDealer', orderStatus.isVisibleToDealer ?? true);
        } else if (!orderStatus && props.open) {
            reset();
        }
    }, [orderStatus, props.open, setValue, reset]);

    useEffect(() => {
        if (!props.open) {
            reset();
        }
    }, [props.open, reset]);

    /**
     * Кнопка збереження вимкнена, поки форма невалідна.
     *
     * У режимі редагування значення підставляються через `setValue`, а він не
     * перераховує `isValid` — без явного `trigger` кнопка лишалась би сірою на
     * вже заповненій формі. У режимі створення `trigger` не викликаємо: він би
     * одразу підсвітив червоним усі порожні обов'язкові поля.
     */
    useEffect(() => {
        if (props.open && isEditMode) void trigger();
    }, [props.open, isEditMode, trigger]);

    const isVisibleToDealer = watch('isVisibleToDealer');

    const onSubmit = async (data: IOrderStatusForm) => {
        try {
            if (isEditMode && orderStatus) {
                const updateData = {
                    id: orderStatus.id,
                    code: data.code,
                    title: data.title,
                    isVisibleToDealer: data.isVisibleToDealer,
                };
                await updateOrderStatus(updateData);
            } else {
                const createData = { ...data };
                await createOrderStatus(createData);
            }

            reset();
            props.onClose();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} order status:`, error);
        }
    };

    return (
        <Modal {...props} className={cn(
            'max-w-[500px]',
        )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                {isEditMode ? 'Редагувати статус замовлення' : 'Створити статус замовлення'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4'}>
                <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4'}>
                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Код</p>
                        <Input
                            control={control}
                            name={'code'}
                            placeholder={'Введіть код'}
                            classNameContainer={'w-full'}
                            rules={{
                                required: 'Код обов\'язковий'
                            }}
                        />
                        {errors.code && (
                            <p className={'text-destructive-foreground text-sm'}>{errors.code.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Назва</p>
                        <Input
                            control={control}
                            name={'title'}
                            placeholder={'Введіть назву'}
                            classNameContainer={'w-full'}
                            rules={{
                                required: 'Назва обов\'язкова'
                            }}
                        />
                        {errors.title && (
                            <p className={'text-destructive-foreground text-sm'}>{errors.title.message}</p>
                        )}
                    </div>

                    <ToggleBtn
                        useStateProps={[
                            isVisibleToDealer,
                            () => setValue('isVisibleToDealer', !isVisibleToDealer)
                        ]}
                        description="Вимкнено — дилер не побачить цей статус ні в списку своїх замовлень, ні у виборі"
                    >
                        Показувати дилеру
                    </ToggleBtn>

                    <div className="flex gap-3 mt-4">
                        <Button
                            type="button"
                            onClick={props.onClose}
                            color="blackNoneLine"
                            className="flex-1"
                            disabled={isPending}
                        >
                            Скасувати
                        </Button>
                        <Button
                            type="submit"
                            color="greenDarkgreen"
                            className="flex-1"
                            disabled={isPending || !isValid}
                        >
                            {isEditMode ? 'Оновити статус' : 'Створити статус'}
                        </Button>
                    </div>
                </form>

                {isPending && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Loading/>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default OrderStatusCreateModal;