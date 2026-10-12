'use client'

import {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import {cn} from "@/helpers/cn";
import React, {FC, useEffect} from "react";
import Input from "@/ui/input/Input";
import {Controller, useForm} from "react-hook-form";
import Button from "@/ui/button/Button";
import Loading from "@/ui/loading/Loading";
import {IClient} from "@/screens/client/types/IClient";
import {IClientForm} from "@/screens/client/types/IClientForm";
import {useClientCreateMutation} from "@/screens/client/hooks/useClientCreateMutation";
import {useClientUpdateMutation} from "@/screens/client/hooks/useClientUpdateMutation";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import Hint from "@/ui/hint/Hint";
import {PRICE_CATEGORIES} from "@/screens/order/types/order/IOrderForm";

type IClientCreateModal = ModalProps & {
    client?: IClient | null;
}

const ClientCreateModal: FC<IClientCreateModal> = ({ client, ...props }) => {
    const isEditMode = !!client;

    const { control, handleSubmit, trigger, reset, watch, formState: { errors, isValid }, setValue } = useForm<IClientForm>({
        mode: 'onChange',
        defaultValues: {
            firstName: '',
            lastName: '',
            middleName: '',
            email: '',
            phone: '',
            code1C: '',
            // Порожньо, а не «представницька»: категорія — це домовленість
            // із конкретним клієнтом, і підставляти її за нього не можна
            priceCategory: '',
        }
    });

    const { mutateAsync: createClient, isPending: isCreating } = useClientCreateMutation();
    const { mutateAsync: updateClient, isPending: isUpdating } = useClientUpdateMutation();

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (client && props.open) {
            setValue('firstName', client.firstName || '');
            setValue('lastName', client.lastName || '');
            setValue('middleName', client.middleName || '');
            setValue('email', client.email || '');
            setValue('phone', client.phone || '');
            setValue('code1C', client.code1C || '');
            setValue('priceCategory', client.priceCategory || '');
        } else if (!client && props.open) {
            reset();
        }
    }, [client, props.open, setValue, reset]);

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

    const onSubmit = async (data: IClientForm) => {
        try {
            if (isEditMode && client) {
                const updateData = {
                    id: client.id,
                    firstName: data.firstName,
                    lastName: data.lastName,
                    middleName: data.middleName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    // Порожній рядок означає «прибрати категорію»,
                    // а не «лишити як було»
                    priceCategory: data.priceCategory || null,
                };
                await updateClient(updateData);
            } else {
                const createData = {
                    firstName: data.firstName,
                    lastName: data.lastName,
                    middleName: data.middleName || '',
                    email: data.email || '',
                    phone: data.phone || '',
                    priceCategory: data.priceCategory || undefined,
                };
                await createClient(createData);
            }

            reset();
            props.onClose();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} client:`, error);
        }
    };

    return (
        <Modal
            {...props}
            className={cn(
                'max-w-[500px]',
            )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                {isEditMode ? 'Редагувати клієнта' : 'Створити клієнта'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4'}>
                <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4'}>
                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Ім'я</p>
                        <Input
                            control={control}
                            name={'firstName'}
                            placeholder={"Введіть ім'я"}
                            classNameContainer={'w-full'}
                            rules={{
                                required: "Ім'я обов'язкове"
                            }}
                        />
                        {errors.firstName && (
                            <p className={'text-destructive-foreground text-sm'}>{errors.firstName.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Прізвище</p>
                        <Input
                            control={control}
                            name={'lastName'}
                            placeholder={'Введіть прізвище'}
                            classNameContainer={'w-full'}
                            rules={{
                                required: 'Прізвище обов\'язкове'
                            }}
                        />
                        {errors.lastName && (
                            <p className={'text-destructive-foreground text-sm'}>{errors.lastName.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">По батькові (необов'язково)</p>
                        <Input
                            control={control}
                            name={'middleName'}
                            placeholder={'Введіть по батькові'}
                            classNameContainer={'w-full'}
                        />
                        {errors.middleName && (
                            <p className={'text-destructive-foreground text-sm'}>{errors.middleName.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Пошта (необов'язково)</p>
                        <Input
                            control={control}
                            name={'email'}
                            type={'email'}
                            placeholder={'Введіть пошту'}
                            classNameContainer={'w-full'}
                            rules={{
                                pattern: {
                                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                    message: 'Невірна адреса пошти'
                                }
                            }}
                        />
                        {errors.email && (
                            <p className={'text-destructive-foreground text-sm'}>{errors.email.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Телефон (необов'язково)</p>
                        <Input
                            control={control}
                            name={'phone'}
                            type={'tel'}
                            placeholder={'Введіть номер телефону'}
                            classNameContainer={'w-full'}
                        />
                        {errors.phone && (
                            <p className={'text-destructive-foreground text-sm'}>{errors.phone.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Код 1С (необов'язково)</p>
                        <Input
                            control={control}
                            name={'code1C'}
                            placeholder={'Напр. 000011366'}
                            classNameContainer={'w-full'}
                        />
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <div className="flex items-center gap-1.5 pl-4">
                            <p className="text-xs font-semibold">Цінова категорія (необов'язково)</p>
                            <Hint title="Цінова категорія">
                                <p>
                                    За нею рахується вартість замовлень цього клієнта:
                                    у новому замовленні категорія підставляється звідси,
                                    і обирати її щоразу не потрібно.
                                </p>
                                <p>
                                    Порожньо — з клієнтом про категорію не домовлялись:
                                    у замовленні її обирають руками, як і раніше.
                                </p>
                                <p>
                                    Якщо клієнт — дилер, категорія обов'язкова: він її не
                                    бачить і обрати не може, тож без неї замовлення не
                                    створиться.
                                </p>
                            </Hint>
                        </div>
                        <Controller
                            control={control}
                            name={'priceCategory'}
                            render={({ field }) => (
                                <SelectorSearch
                                    getAndSet={[watch('priceCategory') ?? '', (value) => field.onChange(value)]}
                                    options={PRICE_CATEGORIES}
                                    optionValue="value"
                                    optionLabel="label"
                                    placeholder="Не задана"
                                    // Категорію треба вміти прибрати, а не лише замінити
                                    allowClear={true}
                                    isEmptyValueDisable={false}
                                    searchable={false}
                                    className="w-full"
                                />
                            )}
                        />
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
                            {isEditMode ? 'Оновити клієнта' : 'Створити клієнта'}
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

export default ClientCreateModal;