'use client'

import {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import {cn} from "@/helpers/cn";
import React, {FC, useEffect, useRef} from "react";
import Input from "@/ui/input/Input";
import {useForm} from "react-hook-form";
import Button from "@/ui/button/Button";
import Loading from "@/ui/loading/Loading";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import {useConstructionStatus} from "@/screens/construction/hooks/construction-status/useConstructionStatus";
import {HandleSideEnum} from "@/screens/construction/type/construction/IConstruction";
import {useGlassFill} from "@/screens/glass-fill/hooks/useGlassFill";
import {useProfileSystem} from "@/screens/profile-system/hooks/useProfileSystem";
import {useNavigate} from "react-router";
import {useConstructionCreateMutation} from "@/screens/construction/hooks/construction/useConstructionCreateMutation";
import {useConstructionUpdateMutation} from "@/screens/construction/hooks/construction/useConstructionUpdateMutation";
import {IConstructionForm} from "@/screens/construction/type/construction/IConstructionForm";
import {ToggleBtn} from "@/ui/toggles/toggle-btn";
import {useOrder} from "@/screens/order/hooks/order/useOrder";
import {useHandleColors, useProfileColors} from "@/screens/catalog/hooks/useColor";

interface IConstruction extends IConstructionForm {
    id: number;
}

type IConstructionCreateModal = ModalProps & {
    construction?: IConstruction | null;
    orderId?: number;
}

const ConstructionCreateModal: FC<IConstructionCreateModal> = ({ construction, orderId, ...props }) => {
    const navigate = useNavigate();
    const isEditMode = !!construction && construction.id > 0;

    const { data: dataOrder, isPending: isPendingOrder } = useOrder();
    const { data: dataProfileColors, isPending: isPendingProfileColors } = useProfileColors();
    const { data: dataHandleColors, isPending: isPendingHandleColors } = useHandleColors();
    const { data: dataConstructionStatus, isPending: isPendingConstructionStatus } = useConstructionStatus();
    const { data: dataProfileSystem, isPending: isPendingProfileSystem } = useProfileSystem();
    const { data: dataGlassFill, isPending: isPendingGlassFill } = useGlassFill();

    const { control, handleSubmit, reset, setError, clearErrors, formState: { errors }, setValue, watch } = useForm<IConstructionForm>({
        defaultValues: {
            orderId: orderId || undefined,
            profileSystemId: undefined,
            constructionStatusId: undefined,
            width: 0,
            height: 0,
            // sawThickness: 1.344,
            beamThickness: 22,
            glassFillId: undefined,
            hasGlassEdge: true,
            hasHandle: true,
            handleSide: HandleSideEnum.LEFT,
            handleOffset: 160,
            handlePosition: 0,
            colorId: undefined,
            handleColorId: undefined
        },
        mode: 'onChange',
    });

    const { mutateAsync: createConstruction, isPending: isCreating } = useConstructionCreateMutation();
    const { mutateAsync: updateConstruction, isPending: isUpdating } = useConstructionUpdateMutation();

    const isPending = isCreating || isUpdating || isPendingConstructionStatus || isPendingProfileSystem || isPendingGlassFill || isPendingOrder || isPendingProfileColors || isPendingHandleColors;

    const formattedConstructionStatusOptions = dataConstructionStatus?.map(status => ({
        label: status.title,
        value: status.id
    })) || [];

    const formattedProfileSystemOptions = dataProfileSystem?.map(system => ({
        label: system.title,
        value: system.id
    })) || [];

    const formattedGlassFillOptions = dataGlassFill?.map(fill => ({
        label: fill.type,
        value: fill.id
    })) || [];

    const formattedOrderOptions = dataOrder?.map(order => ({
        label: `Замовлення ${order.orderNumber} ${order.client.firstName} ${order.client.lastName}`,
        value: order.id
    })) || [];

    const formattedColorOptions = dataProfileColors?.map(color => ({
        label: color.name,
        value: color.id
    })) || [];

    const formattedHandleColorOptions = dataHandleColors?.map(color => ({
        label: color.name,
        value: color.id
    })) || [];

    const handleSideOptions = [
        { label: 'Ліво', value: HandleSideEnum.LEFT },
        { label: 'Право', value: HandleSideEnum.RIGHT },
    ];

    const validateDecimalPlaces = (value: number) => {
        if (value === undefined || value === null) return true;
        const str = String(value);
        const decimalPart = str.split('.')[1];
        if (decimalPart && decimalPart.length > 3) {
            return 'Максимум 3 цифри після коми';
        }
        return true;
    };

    useEffect(() => {
        if (construction && props.open) {
            setValue('orderId', construction.orderId || 0);
            setValue('profileSystemId', construction.profileSystemId || 0);
            setValue('constructionStatusId', construction.constructionStatusId || 0);
            setValue('width', construction.width || 0);
            setValue('height', construction.height || 0);
            // setValue('sawThickness', construction.sawThickness || 1.344);
            setValue('beamThickness', construction.beamThickness || 22);
            setValue('glassFillId', construction.glassFillId ? construction.glassFillId : undefined);
            setValue('hasHandle', construction.hasHandle || false);
            setValue('handleSide', construction.handleSide ? construction.handleSide : undefined);
            setValue('handleOffset', construction.handleOffset || 160);
            setValue('handlePosition', construction.handlePosition || 0);
            setValue('hasGlassEdge', construction.hasGlassEdge || false);
            setValue('colorId', construction.colorId || undefined);
            setValue('handleColorId', construction.handleColorId || undefined);
        } else if (!construction && props.open) {
            reset();
            if (orderId) {
                setValue('orderId', orderId);
            }
        }
    }, [construction, props.open, setValue, reset, orderId]);

    useEffect(() => {
        if (!props.open) {
            reset();
        }
    }, [props.open, reset]);

    const onInvalid = () => {
        const data = watch();

        if (!data.profileSystemId || data.profileSystemId === 0) {
            setError('profileSystemId', { message: 'Профільна система обов\'язкова' });
        }
        if (!data.glassFillId || data.glassFillId === 0) {
            setError('glassFillId', { message: 'Скло обов\'язкове' });
        }
        if (!data.orderId || data.orderId === 0) {
            setError('orderId', { message: 'Замовлення обов\'язкове' });
        }
    };

    const onSubmit = async (data: IConstructionForm) => {
        try {
            let hasError = false;

            if (!data.profileSystemId || data.profileSystemId === 0) {
                setError('profileSystemId', { message: 'Профільна система обов\'язкова' });
                hasError = true;
            }
            if (!data.glassFillId || data.glassFillId === 0) {
                setError('glassFillId', { message: 'Скло обов\'язкове' });
                hasError = true;
            }
            if (!data.orderId || data.orderId === 0) {
                setError('orderId', { message: 'Замовлення обов\'язкове' });
                hasError = true;
            }
            if (!data.colorId || data.colorId === 0) {
                setError('colorId', { message: 'Колір профілю обов\'язковий' });
                hasError = true;
            }

            if (hasError) return;

            const submitData = {
                ...data,
                width: Number(data.width),
                height: Number(data.height),
                profileSystemId: Number(data.profileSystemId),
                constructionStatusId: data.constructionStatusId ? Number(data.constructionStatusId) : undefined,
                glassFillId: data.glassFillId ? Number(data.glassFillId) : null,
                // sawThickness: Number(data.sawThickness),
                beamThickness: Number(data.beamThickness),
                orderId: Number(data.orderId),
                hasGlassEdge: data.hasGlassEdge ?? false,
                hasHandle: isHingeProfile ? false : data.hasHandle,
                handleSide: isHingeProfile ? undefined : (data.hasHandle ? data.handleSide : undefined),
                hingeSide: isHingeProfile ? data.handleSide : undefined,
                handleOffset: isHingeProfile ? 0 : (data.hasHandle ? Number(data.handleOffset || 0) : 0),
                handlePosition: isHingeProfile ? 0 : (data.hasHandle ? Number(data.handlePosition || 0) : 0),
                colorId: data.colorId ? Number(data.colorId) : undefined,
                handleColorId: (!isHingeProfile && data.hasHandle && data.handleColorId)
                    ? Number(data.handleColorId)
                    : undefined,
            };

            if (isEditMode && construction) {
                await updateConstruction({
                    id: construction.id,
                    ...submitData
                });
                reset();
                props.onClose();
            } else {
                const response = await createConstruction(submitData);
                reset();
                props.onClose();

                if (response?.data?.data?.id) {
                    const constructionId = response.data.data.id;
                    const editorUrl = `/construction-editor?id=${constructionId}&orderId=${submitData.orderId}`;
                    navigate(editorUrl);
                }
            }
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} construction:`, error);
        }
    };

    const widthValue = watch('width');
    const heightValue = watch('height');
    const handleSideValue = watch('handleSide');
    const profileSystemIdValue = watch('profileSystemId');
    const constructionStatusIdValue = watch('constructionStatusId');
    const glassFillIdValue = watch('glassFillId');
    const hasHandleValue = watch('hasHandle') ?? false;
    const orderIdValue = watch('orderId');
    const colorIdValue = watch('colorId');
    const handleColorIdValue = watch('handleColorId');

    const isFirstRender = useRef(true);

    const selectedProfileSystem = dataProfileSystem?.find(s => s.id === Number(profileSystemIdValue));
    const isHingeProfile = (selectedProfileSystem?.defaultParameters)?.hasHandleFeature === false;

    useEffect(() => {
        if (props.open) {
            isFirstRender.current = true;
        }
    }, [props.open]);

    useEffect(() => {
        if (!profileSystemIdValue) return;
        setValue('handleSide', HandleSideEnum.LEFT);
    }, [profileSystemIdValue]);

    useEffect(() => {
        if (!hasHandleValue || !handleSideValue) return;

        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        const isVerticalSide = handleSideValue === HandleSideEnum.LEFT || handleSideValue === HandleSideEnum.RIGHT;
        const dimension = isVerticalSide ? Number(heightValue) : Number(widthValue);

        if (dimension > 0) {
            setValue('handlePosition', Math.round(dimension / 2));
        }
    }, [handleSideValue, heightValue, widthValue]);

    return (
        <Modal
            {...props}
            className={cn(
                'flex flex-col gap-2.5 max-w-[600px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
            )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                {isEditMode ? 'Редагувати конструкцію' : 'Додати конструкцію'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4 rounded-xl p-3'}>
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className={'flex flex-col gap-4'}>
                    {!orderId && (
                        <div className={'relative flex flex-col gap-[5px] h-fit'}>
                            <p className="text-xs font-semibold pl-4">Замовлення *</p>
                            {!isPendingOrder ? (
                                <>
                                    <SelectorSearch
                                        getAndSet={[
                                            orderIdValue?.toString() || '',
                                            (value) => {
                                                setValue('orderId', parseInt(value as string) || 0);
                                                clearErrors('orderId');
                                            }
                                        ]}
                                        options={formattedOrderOptions}
                                        placeholder={'Оберіть замовлення'}
                                        optionValue="value"
                                        optionLabel="label"
                                        isEmptyValueDisable={true}
                                        searchable={true}
                                        hasError={!!errors.orderId}
                                    />
                                    {errors.orderId && (
                                        <p className={'text-red-500 text-xs mt-1'}>{errors.orderId.message as string}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-400 text-sm">Завантаження замовлень...</p>
                            )}
                        </div>
                    )}

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Профільна система *</p>
                        {!isPendingProfileSystem ? (
                            <>
                                <SelectorSearch
                                    getAndSet={[
                                        profileSystemIdValue ? profileSystemIdValue.toString() : '',
                                        (value) => {
                                            setValue('profileSystemId', parseInt(value as string) || 0);
                                            clearErrors('profileSystemId');
                                        }
                                    ]}
                                    options={formattedProfileSystemOptions}
                                    placeholder={'Оберіть профільну систему'}
                                    optionValue="value"
                                    optionLabel="label"
                                    isEmptyValueDisable={true}
                                    searchable={true}
                                    hasError={!!errors.profileSystemId}
                                />
                                {errors.profileSystemId && (
                                    <p className={'text-red-500 text-xs mt-1'}>{errors.profileSystemId.message as string}</p>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">Завантаження профільних систем...</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Колір профілю *</p>
                        {!isPendingProfileColors ? (
                            <>
                                <SelectorSearch
                                    getAndSet={[
                                        colorIdValue?.toString() || '',
                                        (value) => {
                                            setValue('colorId', value ? parseInt(value as string) : undefined);
                                            clearErrors('colorId');
                                        }
                                    ]}
                                    options={formattedColorOptions}
                                    placeholder={'Оберіть колір профілю'}
                                    optionValue="value"
                                    optionLabel="label"
                                    isEmptyValueDisable={true}
                                    searchable={true}
                                    hasError={!!errors.colorId}
                                />
                                {errors.colorId && (
                                    <p className={'text-red-500 text-xs mt-1'}>{errors.colorId.message as string}</p>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">Завантаження кольорів...</p>
                        )}
                    </div>

                    <div className={'flex flex-row gap-4'}>
                        <div className={'relative flex flex-col gap-[5px] h-fit flex-1'}>
                            <Input
                                control={control}
                                name={'width'}
                                type={'number'}
                                label="Ширина (мм) *"
                                placeholder={'0'}
                                rules={{
                                    required: 'Ширина обов\'язкова',
                                    min: { value: 100, message: 'Мінімум 100 мм' },
                                    max: { value: 3000, message: 'Максимум 3000 мм' },
                                    validate: validateDecimalPlaces
                                }}
                                classNameContainer="mb-0"
                            />
                            {errors.width && (
                                <p className={'text-red-500 text-xs mt-1'}>{errors.width.message}</p>
                            )}
                        </div>

                        <div className={'relative flex flex-col gap-[5px] h-fit flex-1'}>
                            <Input
                                control={control}
                                name={'height'}
                                type={'number'}
                                label="Висота (мм) *"
                                placeholder={'0'}
                                rules={{
                                    required: 'Висота обов\'язкова',
                                    min: { value: 100, message: 'Мінімум 100 мм' },
                                    max: { value: 3000, message: 'Максимум 3000 мм' },
                                    validate: validateDecimalPlaces
                                }}
                                classNameContainer="mb-0"
                            />
                            {errors.height && (
                                <p className={'text-red-500 text-xs mt-1'}>{errors.height.message}</p>
                            )}
                        </div>
                    </div>

                    {/*<div className={'flex gap-4'}>*/}
                    {/*    <div className={'relative flex flex-col gap-[5px] h-fit flex-1'}>*/}
                    {/*        <Input*/}
                    {/*            control={control}*/}
                    {/*            name={'sawThickness'}*/}
                    {/*            type={'number'}*/}
                    {/*            step="0.001"*/}
                    {/*            label="Товщина пиляння (мм) *"*/}
                    {/*            placeholder={'0'}*/}
                    {/*            rules={{*/}
                    {/*                required: 'Товщина пиляння обов\'язкова',*/}
                    {/*                min: { value: 0.1, message: 'Мінімум 0.1 мм' },*/}
                    {/*                max: { value: 10, message: 'Максимум 10 мм' },*/}
                    {/*                validate: validateDecimalPlaces*/}
                    {/*            }}*/}
                    {/*            classNameContainer="mb-0"*/}
                    {/*        />*/}
                    {/*        {errors.sawThickness && (*/}
                    {/*            <p className={'text-red-500 text-xs mt-1'}>{errors.sawThickness.message}</p>*/}
                    {/*        )}*/}
                    {/*    </div>*/}

                    {/*    <div className={'relative flex flex-col gap-[5px] h-fit flex-1'}>*/}
                    {/*        <Input*/}
                    {/*            control={control}*/}
                    {/*            name={'beamThickness'}*/}
                    {/*            type={'number'}*/}
                    {/*            label="Товщина імпосту (мм) *"*/}
                    {/*            placeholder={'0'}*/}
                    {/*            rules={{*/}
                    {/*                required: 'Товщина імпосту обов\'язкова',*/}
                    {/*                min: { value: 5, message: 'Мінімум 5 мм' },*/}
                    {/*                max: { value: 100, message: 'Максимум 100 мм' },*/}
                    {/*                validate: validateDecimalPlaces*/}
                    {/*            }}*/}
                    {/*            classNameContainer="mb-0"*/}
                    {/*        />*/}
                    {/*        {errors.beamThickness && (*/}
                    {/*            <p className={'text-red-500 text-xs mt-1'}>{errors.beamThickness.message}</p>*/}
                    {/*        )}*/}
                    {/*    </div>*/}
                    {/*</div>*/}

                    <div className={'flex flex-row items-center gap-4'}>
                        <div className={'relative flex flex-col gap-[5px] h-fit flex-1'}>
                            <p className="text-xs font-semibold pl-4">Скло *</p>
                            {!isPendingGlassFill ? (
                                <>
                                    <SelectorSearch
                                        getAndSet={[
                                            glassFillIdValue?.toString() || '',
                                            (value) => {
                                                setValue('glassFillId', value ? parseInt(value as string) : undefined);
                                                clearErrors('glassFillId');
                                            }
                                        ]}
                                        options={formattedGlassFillOptions}
                                        placeholder={'Оберіть скло'}
                                        optionValue="value"
                                        optionLabel="label"
                                        isEmptyValueDisable={true}
                                        searchable={true}
                                        hasError={!!errors.glassFillId}
                                    />
                                    {errors.glassFillId && (
                                        <p className={'text-red-500 text-xs mt-1'}>{errors.glassFillId.message as string}</p>
                                    )}
                                </>
                            ) : (
                                <p className="text-gray-400 text-sm">Завантаження скла...</p>
                            )}
                        </div>

                        <ToggleBtn
                            className="flex flex-1 mt-5 max-w-[260px]"
                            useStateProps={[
                                watch('hasGlassEdge') ?? false,
                                () => setValue('hasGlassEdge', !watch('hasGlassEdge'))
                            ]}
                        >
                            Шліфування торців скла
                        </ToggleBtn>
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Статус конструкції</p>
                        {!isPendingConstructionStatus ? (
                            <>
                                <SelectorSearch
                                    getAndSet={[
                                        constructionStatusIdValue ? constructionStatusIdValue.toString() : '',
                                        (value) => {
                                            setValue('constructionStatusId', parseInt(value as string) || 0);
                                            clearErrors('constructionStatusId');
                                        }
                                    ]}
                                    options={formattedConstructionStatusOptions}
                                    placeholder={'Оберіть статус'}
                                    optionValue="value"
                                    optionLabel="label"
                                    isEmptyValueDisable={true}
                                    searchable={true}
                                    hasError={!!errors.constructionStatusId}
                                />
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">Завантаження статусів...</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit border-t pt-4'}>
                        {!isHingeProfile && (
                            <ToggleBtn
                                className="flex-1 w-full"
                                useStateProps={[
                                    hasHandleValue,
                                    () => setValue('hasHandle', !hasHandleValue)
                                ]}
                            >
                                Ручка
                            </ToggleBtn>
                        )}

                        {isHingeProfile ? (
                            <div className={'mt-2'}>
                                <p className="text-xs font-semibold pl-4 mb-2">Сторона завісів *</p>
                                <SelectorSearch
                                    getAndSet={[
                                        handleSideValue || '',
                                        (value) => setValue('handleSide', value as HandleSideEnum)
                                    ]}
                                    options={handleSideOptions}
                                    placeholder={'Оберіть сторону завісів'}
                                    optionValue="value"
                                    optionLabel="label"
                                    isEmptyValueDisable={true}
                                    searchable={true}
                                />
                                {errors.handleSide && (
                                    <p className={'text-red-500 text-sm mt-1'}>Сторона завісів обов'язкова</p>
                                )}
                            </div>
                        ) : hasHandleValue && (
                            <>
                                <div className={'mt-4'}>
                                    <p className="text-xs font-semibold pl-4 mb-2">Сторона ручки *</p>
                                    <SelectorSearch
                                        getAndSet={[
                                            handleSideValue || '',
                                            (value) => setValue('handleSide', value as HandleSideEnum)
                                        ]}
                                        options={handleSideOptions}
                                        placeholder={'Оберіть сторону ручки'}
                                        optionValue="value"
                                        optionLabel="label"
                                        isEmptyValueDisable={true}
                                        searchable={true}
                                    />
                                    {errors.handleSide && (
                                        <p className={'text-red-500 text-sm mt-1'}>Сторона ручки обов'язкова</p>
                                    )}
                                </div>

                                <div className={'mt-4'}>
                                    <p className="text-xs font-semibold pl-4 mb-2">Колір ручки *</p>
                                    {!isPendingHandleColors ? (
                                        <SelectorSearch
                                            getAndSet={[
                                                handleColorIdValue?.toString() || '',
                                                (value) => setValue('handleColorId', value ? parseInt(value as string) : undefined)
                                            ]}
                                            options={formattedHandleColorOptions}
                                            placeholder={'Оберіть колір ручки'}
                                            optionValue="value"
                                            optionLabel="label"
                                            isEmptyValueDisable={false}
                                            searchable={true}
                                        />
                                    ) : (
                                        <p className="text-gray-400 text-sm">Завантаження кольорів...</p>
                                    )}
                                </div>

                                <div className={'flex flex-row gap-4 mt-4'}>
                                    <div className={'flex-1'}>
                                        <Input
                                            control={control}
                                            name={'handleOffset'}
                                            type={'number'}
                                            label="Ширина ручки (мм) *"
                                            placeholder={'0'}
                                            rules={{
                                                required: 'Ширина ручки обов\'язкова',
                                                min: { value: 0, message: 'Мінімум 0 мм' },
                                                max: { value: 1000, message: 'Максимум 1000 мм' },
                                                validate: validateDecimalPlaces
                                            }}
                                            classNameContainer="mb-0 w-full"
                                        />
                                        {errors.handleOffset && (
                                            <p className={'text-red-500 text-xs mt-1'}>{errors.handleOffset.message}</p>
                                        )}
                                    </div>

                                    <div className={'flex-1'}>
                                        <Input
                                            control={control}
                                            name={'handlePosition'}
                                            type={'number'}
                                            label="Позиція ручки (мм) *"
                                            placeholder={'0'}
                                            rules={{
                                                required: 'Позиція ручки обов\'язкова',
                                                min: { value: 0, message: 'Мінімум 0 мм' },
                                                max: {
                                                    value: handleSideValue === HandleSideEnum.LEFT || handleSideValue === HandleSideEnum.RIGHT
                                                        ? Number(heightValue) || 2000
                                                        : Number(widthValue) || 2000,
                                                    message: `Максимум ${
                                                        handleSideValue === HandleSideEnum.LEFT || handleSideValue === HandleSideEnum.RIGHT
                                                            ? heightValue
                                                            : widthValue
                                                    } мм`
                                                },
                                                validate: validateDecimalPlaces
                                            }}
                                            classNameContainer="mb-0 w-full"
                                        />
                                        {errors.handlePosition && (
                                            <p className={'text-red-500 text-xs mt-1'}>{errors.handlePosition.message}</p>
                                        )}
                                    </div>
                                </div>
                            </>
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
                            {isEditMode ? 'Оновити конструкцію' : 'Додати конструкцію'}
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

export default ConstructionCreateModal;