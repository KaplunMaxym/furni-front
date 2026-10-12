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
import {HandleSideEnum} from "@/screens/construction/type/construction/IConstruction";
import {useGlassFill} from "@/screens/glass-fill/hooks/useGlassFill";
import {useProfileSystem} from "@/screens/profile-system/hooks/useProfileSystem";
import {useNavigate} from "react-router";
import {useConstructionCreateMutation} from "@/screens/construction/hooks/construction/useConstructionCreateMutation";
import {useConstructionUpdateMutation} from "@/screens/construction/hooks/construction/useConstructionUpdateMutation";
import {IConstructionForm} from "@/screens/construction/type/construction/IConstructionForm";
import {ToggleBtn} from "@/ui/toggles/toggle-btn";
import {useOrder} from "@/screens/order/hooks/order/useOrder";
import {useProfileColors} from "@/screens/catalog/hooks/useColor";
import {useConstructionStatus} from "@/screens/construction/hooks/construction-status/useConstructionStatus";
import {useConstructionByOrder} from "@/screens/construction/hooks/construction/useConstructionByOrder";
import {useAuthStore} from "@/store/auth/authReducer";
import {isDealerRole} from "@/config/RoleEnum";
import {CONSTRUCTION_HINTS} from "@/constants/paramHints";

interface IConstruction extends IConstructionForm {
    id: number;
}

const HANDLE_WIDTH_MM = 160;


type IConstructionCreateModal = ModalProps & {
    construction?: IConstruction | null;
    orderId?: number;
}

const ConstructionCreateModal: FC<IConstructionCreateModal> = ({ construction, orderId, ...props }) => {
    const navigate = useNavigate();
    const isEditMode = !!construction && construction.id > 0;

    const { role } = useAuthStore();
    const isDealer = isDealerRole(role);

    const { data: dataOrder, isPending: isPendingOrder } = useOrder();
    const { data: dataProfileColors, isPending: isPendingProfileColors } = useProfileColors();
    const { data: dataConstructionStatus, isPending: isPendingConstructionStatus } = useConstructionStatus();
    const { data: dataProfileSystem, isPending: isPendingProfileSystem } = useProfileSystem();
    const { data: dataGlassFill, isPending: isPendingGlassFill } = useGlassFill();

    const { control, handleSubmit, trigger, reset, setError, clearErrors, formState: { errors, isValid }, setValue, watch } = useForm<IConstructionForm>({
        defaultValues: {
            orderId: orderId || undefined,
            profileSystemId: undefined,
            constructionStatusId: undefined,
            width: 0,
            height: 0,
            beamThickness: 22,
            glassFillId: undefined,
            hasGlassEdge: true,
            hasHandle: true,
            hasHinge: true,
            handleSide: HandleSideEnum.LEFT,
            hingeSide: HandleSideEnum.RIGHT,
            handleOffset: HANDLE_WIDTH_MM,
            handlePosition: 0,
            colorId: undefined,
            quantity: 1,
        },
        mode: 'onChange',
    });

    const { mutateAsync: createConstruction, isPending: isCreating } = useConstructionCreateMutation();
    const { mutateAsync: updateConstruction, isPending: isUpdating } = useConstructionUpdateMutation();

    const isPending = isCreating || isUpdating || (!isDealer && isPendingConstructionStatus) || isPendingProfileSystem || isPendingGlassFill || isPendingOrder || isPendingProfileColors;

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
            setValue('width', construction.width || 0);
            setValue('height', construction.height || 0);
            setValue('beamThickness', construction.beamThickness || 22);
            setValue('glassFillId', construction.glassFillId ? construction.glassFillId : undefined);
            setValue('constructionStatusId', construction.constructionStatusId || 0);
            setValue('hasHandle', construction.hasHandle || false);
            setValue('handleSide',
                construction.handleSide
                ?? construction.wireSide
                ?? undefined);
            setValue('hingeSide', construction.hingeSide ?? HandleSideEnum.RIGHT);
            setValue('handleOffset', construction.handleOffset || HANDLE_WIDTH_MM);
            setValue('handlePosition', construction.handlePosition || 0);
            setValue('hasHinge', !!construction.hingeSide);
            setValue('hasGlassEdge', true);
            setValue('colorId', construction.colorId || undefined);
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

    useEffect(() => {
        if (props.open && isEditMode) void trigger();
    }, [props.open, isEditMode, trigger]);

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

            const { hasHinge: _hasHinge, ...formData } = data;

            const submitData = {
                ...formData,
                width: Number(data.width),
                height: Number(data.height),
                profileSystemId: Number(data.profileSystemId),
                constructionStatusId: (!isDealer && data.constructionStatusId)
                    ? Number(data.constructionStatusId)
                    : undefined,
                glassFillId: data.glassFillId ? Number(data.glassFillId) : null,
                beamThickness: Number(data.beamThickness),
                orderId: Number(data.orderId),
                hasGlassEdge: true,
                quantity: isDealer ? 1 : Math.max(1, Number(data.quantity) || 1),
                hasHandle: isHingeProfile ? false : data.hasHandle,
                handleSide: (!isHingeProfile && data.hasHandle) ? data.handleSide : null,
                hingeSide: (canHaveHinges && data.hasHinge) ? data.hingeSide : null,
                wireSide:  isLightingProfile ? data.handleSide : null,
                handleOffset: isHingeProfile ? 0 : (data.hasHandle ? HANDLE_WIDTH_MM : 0),
                handlePosition: isHingeProfile ? 0 : (data.hasHandle ? Number(data.handlePosition || 0) : 0),
                colorId: data.colorId ? Number(data.colorId) : undefined,
            };

            if (isEditMode && construction) {
                const { quantity: _quantity, ...updateData } = submitData;

                await updateConstruction({
                    id: construction.id,
                    ...updateData
                });
                reset();
                props.onClose();
            } else {
                const response = await createConstruction(submitData);
                reset();
                props.onClose();

                if (submitData.quantity === 1 && response?.data?.data?.id) {
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
    const glassFillIdValue = watch('glassFillId');
    const constructionStatusIdValue = watch('constructionStatusId');
    const hasHandleValue = watch('hasHandle') ?? false;
    const hasHingeValue = watch('hasHinge') ?? false;
    const orderIdValue = watch('orderId');
    const colorIdValue = watch('colorId');

    const isFirstRender = useRef(true);

    const selectedOrderId = Number(orderIdValue) || 0;
    const { data: orderConstructions } = useConstructionByOrder(selectedOrderId);

    const lockedProfileSystem = (() => {
        const others = (orderConstructions ?? []).filter(item => item.id !== construction?.id);
        if (!others.length) return null;

        const [first] = others;
        const single = others.every(item => item.profileSystemId === first.profileSystemId);
        if (!single) return null;

        if (construction && construction.profileSystemId !== first.profileSystemId) return null;

        return first.profileSystem;
    })();

    useEffect(() => {
        if (!lockedProfileSystem) return;
        if (Number(profileSystemIdValue) === lockedProfileSystem.id) return;

        setValue('profileSystemId', lockedProfileSystem.id);
        clearErrors('profileSystemId');
    }, [lockedProfileSystem, profileSystemIdValue, setValue, clearErrors]);

    const selectedProfileSystem = dataProfileSystem?.find(s => s.id === Number(profileSystemIdValue));
    const isHingeProfile = (selectedProfileSystem?.defaultParameters)?.hasHandleFeature === false;

    const isLightingProfile = (selectedProfileSystem?.defaultParameters)?.hasLighting === true;
    const sideLabel = isLightingProfile ? 'Сторона виходу дроту' : 'Сторона завісів';

    const canHaveHinges =
        (selectedProfileSystem?.defaultParameters)?.hasHingeFeature === true && !isLightingProfile;

    const hingeSideValue = watch('hingeSide');

    useEffect(() => {
        if (props.open) {
            isFirstRender.current = true;
        }
    }, [props.open]);

    useEffect(() => {
        if (!profileSystemIdValue) return;
        setValue('handleSide', HandleSideEnum.LEFT);
        setValue('hingeSide', HandleSideEnum.RIGHT);
    }, [profileSystemIdValue]);

    useEffect(() => {
        if (isHingeProfile || !handleSideValue) return;

        setValue(
            'hingeSide',
            handleSideValue === HandleSideEnum.LEFT ? HandleSideEnum.RIGHT : HandleSideEnum.LEFT,
        );
    }, [handleSideValue, isHingeProfile, setValue]);

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
                'max-w-[600px]',
            )}
        >
            <Modal.Title className={'gap-2'} onClose={props.onClose}>
                {isEditMode ? 'Редагувати конструкцію' : 'Додати конструкцію'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4'}>
                <form onSubmit={handleSubmit(onSubmit, onInvalid)} className={'flex flex-col gap-4'}>
                    {!orderId && (
                        <div className={'relative flex flex-col gap-[5px] h-fit'}>
                            <p className="text-xs font-semibold pl-4">Замовлення</p>
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
                        <p className="text-xs font-semibold pl-4">Профільна система</p>
                        {lockedProfileSystem ? (
                            <>
                                <div className="flex h-[42px] items-center rounded-[10px] border border-input px-4 text-sm text-foreground/80">
                                    {lockedProfileSystem.title}
                                </div>
                                <p className="pl-4 text-xs text-muted-foreground">
                                    Одна система на замовлення
                                </p>
                            </>
                        ) : !isPendingProfileSystem ? (
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
                        <p className="text-xs font-semibold pl-4">Колір профілю</p>
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
                                name={'height'}
                                type={'number'}
                                label="Висота *" unit="мм"
                                hint={CONSTRUCTION_HINTS.frameHeight}
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

                        <div className={'relative flex flex-col gap-[5px] h-fit flex-1'}>
                            <Input
                                control={control}
                                name={'width'}
                                type={'number'}
                                label="Ширина *" unit="мм"
                                hint={CONSTRUCTION_HINTS.frameWidth}
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

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Скло</p>
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

                    {!isDealer && !isEditMode && (
                        <div className={'relative flex flex-col gap-[5px] h-fit'}>
                            <Input
                                control={control}
                                name={'quantity'}
                                type={'number'}
                                label="Кількість"
                                hint="Скільки однакових конструкцій створити одразу. Номери їм присвоюються послідовно, решта параметрів однакова."
                                placeholder={'1'}
                                rules={{
                                    min: { value: 1, message: 'Мінімум 1' },
                                    max: { value: 50, message: 'Максимум 50' },
                                }}
                                classNameContainer="mb-0"
                            />
                            {errors.quantity && (
                                <p className={'text-red-500 text-xs mt-1'}>{errors.quantity.message}</p>
                            )}
                        </div>
                    )}

                    {!isDealer && (
                        <div className={'relative flex flex-col gap-[5px] h-fit'}>
                            <p className="text-xs font-semibold pl-4">Статус конструкції</p>
                            {!isPendingConstructionStatus ? (
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
                            ) : (
                                <p className="text-muted-foreground text-sm">Завантаження статусів...</p>
                            )}
                        </div>
                    )}

                    <div className={'relative flex flex-col gap-3 h-fit border-t border-border pt-4'}>
                        {canHaveHinges && (
                            <>
                                <ToggleBtn
                                    useStateProps={[
                                        hasHingeValue,
                                        () => setValue('hasHinge', !hasHingeValue)
                                    ]}
                                    description="Без завіс комплект не додається у вартість"
                                >
                                    Завіси
                                </ToggleBtn>

                                {hasHingeValue && isHingeProfile && (
                                    <div className={'mt-4'}>
                                        <p className="text-xs font-semibold pl-4 mb-2">Сторона завісів</p>
                                        <SelectorSearch
                                            getAndSet={[
                                                hingeSideValue || '',
                                                (value) => setValue('hingeSide', value as HandleSideEnum)
                                            ]}
                                            options={handleSideOptions}
                                            placeholder={'Оберіть сторону завісів'}
                                            optionValue="value"
                                            optionLabel="label"
                                            isEmptyValueDisable={true}
                                            searchable={true}
                                        />
                                    </div>
                                )}
                            </>
                        )}

                        {!isHingeProfile && (
                            <ToggleBtn
                                useStateProps={[
                                    hasHandleValue,
                                    () => setValue('hasHandle', !hasHandleValue)
                                ]}
                            >
                                Ручка
                            </ToggleBtn>
                        )}

                        {isLightingProfile && (
                            <div>
                                <p className="text-xs font-semibold pl-4 mb-2">{sideLabel}</p>
                                <SelectorSearch
                                    getAndSet={[
                                        handleSideValue || '',
                                        (value) => setValue('handleSide', value as HandleSideEnum)
                                    ]}
                                    options={handleSideOptions}
                                    placeholder={`Оберіть ${sideLabel.toLowerCase()}`}
                                    optionValue="value"
                                    optionLabel="label"
                                    isEmptyValueDisable={true}
                                    searchable={true}
                                />
                            </div>
                        )}

                        {!isHingeProfile && hasHandleValue && (
                            <>
                                <div className={'mt-4'}>
                                    <p className="text-xs font-semibold pl-4 mb-2">Сторона ручки</p>
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

                                <div className={'flex flex-row gap-4 mt-4'}>
                                    <div className={'flex-1'}>
                                        <Input
                                            control={control}
                                            name={'handlePosition'}
                                            type={'number'}
                                            label="Позиція ручки *" unit="мм"
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