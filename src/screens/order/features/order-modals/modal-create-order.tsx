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
import {useAuthStore} from "@/store/auth/authReducer";
import {isDealerRole} from "@/config/RoleEnum";

type IOrderCreateModal = ModalProps & {
    order?: IOrderQuery | null;
}

const OrderCreateModal: FC<IOrderCreateModal> = ({ order, ...props }) => {
    const navigate = useNavigate();
    const isEditMode = !!order;

    /*
     * Дилер завжди замовляє на себе, і його цінова категорія задана заздалегідь
     * у картці клієнта. Тому обидва поля для нього не показуються й не
     * надсилаються: клієнта і категорію підставляє сервер. Довідник клієнтів
     * йому теж закритий, тож запит за ним не робимо взагалі — інакше кожне
     * відкриття форми впиралося б у 403.
     */
    const { role } = useAuthStore();
    const isDealer = isDealerRole(role);

    const { data: dataOrderStatus, isPending: isPendingOrderStatus } = useOrderStatus();
    const { data: dataClients, isPending: isPendingClients } = useClient({ enabled: !isDealer });

    const { control, handleSubmit, trigger, reset, setError, clearErrors, formState: { errors, isValid }, setValue, watch } = useForm<IOrderForm>({
        mode: 'onChange',
        defaultValues: {
            name: '',
            clientId: '',
            statusId: '',
            priceCategory: 'REPRESENTATIVE',
        }
    });

    const { mutateAsync: createOrder, isPending: isCreating } = useOrderCreateMutation();
    const { mutateAsync: updateOrder, isPending: isUpdating } = useOrderUpdateMutation();

    const isPending = isCreating || isUpdating || isPendingOrderStatus || (!isDealer && isPendingClients);

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
        if (isDealer) return;

        const data = watch();
        if (!data.clientId || data.clientId === '') {
            setError('clientId', { message: 'Клієнт обов\'язковий' });
        }
    };

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

    const onSubmit = async (data: IOrderForm) => {
        try {
            if (!isDealer && (!data.clientId || data.clientId === '')) {
                setError('clientId', { message: 'Клієнт обов\'язковий' });
                return;
            }

            /*
             * Полів, яких дилер не бачить, не надсилаємо взагалі — не порожніми
             * і не «як було». Сервер їх усе одно відкидає, але з `undefined`
             * вони не потрапляють у тіло запиту й не читаються в мережі.
             */
            const ownership = isDealer
                ? {}
                : { clientId: data.clientId, priceCategory: data.priceCategory };

            if (isEditMode && order) {
                const updateData = {
                    id: order.id,
                    name: data.name,
                    statusId: data.statusId || undefined,
                    ...ownership,
                };
                await updateOrder(updateData);

                reset();
                props.onClose();
            } else {
                const createData = {
                    name: data.name,
                    statusId: data.statusId || undefined,
                    ...ownership,
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
                'max-w-[500px]',
            )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                {isEditMode ? 'Редагувати замовлення' : 'Створити замовлення'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4'}>
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

                    {!isDealer && (
                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Клієнт</p>
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
                                    <p className={'text-destructive-foreground text-xs mt-1'}>{errors.clientId.message as string}</p>
                                )}
                            </>
                        ) : (
                            <p className="text-muted-foreground text-sm">Завантаження клієнтів...</p>
                        )}
                    </div>
                    )}

                    {!isDealer && (
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
                    )}

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
                            <p className="text-muted-foreground text-sm">Завантаження статусів...</p>
                        )}
                    </div>

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