'use client'

import {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import {cn} from "@/helpers/cn";
import React, {FC, useEffect} from "react";
import Input from "@/ui/input/Input";
import {useForm} from "react-hook-form";
import Button from "@/ui/button/Button";
import Loading from "@/ui/loading/Loading";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import {IOrderForm, PRICE_CATEGORIES} from "@/screens/order/types/order/IOrderForm";
import {useOrderCreateMutation} from "@/screens/order/hooks/order/useOrderCreateMutation";
import {useOrderUpdateMutation} from "@/screens/order/hooks/order/useOrderUpdateMutation";
import {useOrderStatus} from "@/screens/order/hooks/order-status/useOrderStatus";
import {useClient} from "@/screens/client/hooks/useClient";
import {useNavigate} from "react-router";
import {IOrderQuery} from "@/screens/order/types/order/IOrderQuery";

type IOrderCreateModal = ModalProps & {
    order?: IOrderQuery | null;
}

const OrderCreateModal: FC<IOrderCreateModal> = ({ order, ...props }) => {
    const navigate = useNavigate();
    const isEditMode = !!order;

    const { data: dataOrderStatus, isPending: isPendingOrderStatus } = useOrderStatus();
    const { data: dataClients, isPending: isPendingClients } = useClient();

    const { control, handleSubmit, reset, setError, clearErrors, formState: { errors }, setValue, watch } = useForm<IOrderForm>({
        defaultValues: {
            name: '',
            clientId: '',
            statusId: '',
            priceCategory: 'REPRESENTATIVE',
        }
    });

    const { mutateAsync: createOrder, isPending: isCreating } = useOrderCreateMutation();
    const { mutateAsync: updateOrder, isPending: isUpdating } = useOrderUpdateMutation();

    const isPending = isCreating || isUpdating || isPendingOrderStatus || isPendingClients;

    const formattedOrderStatusOptions = dataOrderStatus?.map(status => ({
        label: status.title,
        value: status.id
    })) || [];

    const formattedUsersOptions = dataClients?.map(client => ({
        label: `${client.firstName} ${client.lastName}`,
        value: client.id
    })) || [];

    useEffect(() => {
        if (!props.open) {
            reset();
            return;
        }

        if (isEditMode && order) {
            setValue('name', order.name || '');
            setValue('clientId', order.client?.id || '');
            setValue('statusId', order.status?.id || '');
            setValue('priceCategory', order.priceCategory || 'REPRESENTATIVE');
        } else {
            reset();
        }
    }, [props.open, isEditMode, order, setValue, reset]);

    const onInvalid = () => {
        const data = watch();
        if (!data.clientId || data.clientId === '') {
            setError('clientId', { message: 'Клієнт обов\'язковий' });
        }
    };

    const onSubmit = async (data: IOrderForm) => {
        try {
            let hasError = false;

            if (!data.clientId || data.clientId === '') {
                setError('clientId', { message: 'Клієнт обов\'язковий' });
                hasError = true;
            }

            if (hasError) return;

            if (isEditMode && order) {
                const updateData = {
                    id: order.id,
                    name: data.name,
                    clientId: data.clientId,
                    statusId: data.statusId || undefined,
                    priceCategory: data.priceCategory,
                };
                await updateOrder(updateData);

                reset();
                props.onClose();
            } else {
                const createData = {
                    name: data.name,
                    clientId: data.clientId,
                    statusId: data.statusId || undefined,
                    priceCategory: data.priceCategory,
                };

                const response = await createOrder(createData);

                reset();
                props.onClose();

                console.log(response?.data)

                if (response?.data.data.id) {
                    console.log(response?.data.data.id)
                    navigate(`/order/${response?.data.data.id}`);
                } else {
                    navigate('/order');
                }
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} order:`, error);
        }
    };

    const clientIdValue = watch('clientId');
    const statusIdValue = watch('statusId');
    const priceCategoryValue = watch('priceCategory');

    return (
        <Modal
            {...props}
            className={cn(
                'flex flex-col gap-2.5 max-w-[500px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
            )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                {isEditMode ? 'Редагувати замовлення' : 'Створити замовлення'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className={'flex flex-col gap-4'}>
                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Назва (необов'язково)</p>
                        <Input
                            control={control}
                            name={'name'}
                            placeholder={'Введіть назву замовлення (необов\'язково)'}
                            classNameContainer={'w-full'}
                        />
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Клієнт *</p>
                        {!isPendingClients ? (
                            <>
                                <SelectorSearch
                                    getAndSet={[
                                        clientIdValue || '',
                                        (value) => {
                                            setValue('clientId', value as string);
                                            clearErrors('clientId');
                                        }
                                    ]}
                                    options={formattedUsersOptions}
                                    placeholder={'Оберіть клієнта'}
                                    optionValue="value"
                                    optionLabel="label"
                                    isEmptyValueDisable={true}
                                    searchable={true}
                                    hasError={!!errors.clientId}
                                />
                                {errors.clientId && (
                                    <p className={'text-red-500 text-xs mt-1'}>{errors.clientId.message as string}</p>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">Завантаження клієнтів...</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Цінова категорія</p>
                        <SelectorSearch
                            getAndSet={[
                                priceCategoryValue || 'REPRESENTATIVE',
                                (value) => setValue('priceCategory', value as string)
                            ]}
                            options={PRICE_CATEGORIES}
                            placeholder={'Оберіть цінову категорію'}
                            optionValue="value"
                            optionLabel="label"
                            isEmptyValueDisable={true}
                            searchable={false}
                        />
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Статус (необов'язково)</p>
                        {!isPendingOrderStatus ? (
                            <SelectorSearch
                                getAndSet={[
                                    statusIdValue || '',
                                    (value) => setValue('statusId', value as string)
                                ]}
                                options={formattedOrderStatusOptions}
                                placeholder={'Оберіть статус'}
                                optionValue="value"
                                optionLabel="label"
                                isEmptyValueDisable={false}
                                searchable={true}
                            />
                        ) : (
                            <p className="text-gray-400 text-sm">Завантаження статусів...</p>
                        )}
                    </div>

                    <div className="flex gap-3 mt-4">
                        <Button
                            type="button"
                            onClick={props.onClose}
                            color="red"
                            className="flex-1"
                            disabled={isPending}
                        >
                            Скасувати
                        </Button>
                        <Button
                            type="submit"
                            color="greenDarkgreen"
                            className="flex-1"
                            disabled={isPending}
                        >
                            {isEditMode ? 'Оновити замовлення' : 'Створити замовлення'}
                        </Button>
                    </div>
                </form>

                {isPending && (
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <Loading />
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default OrderCreateModal;