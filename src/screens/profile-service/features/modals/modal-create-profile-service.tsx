import React, { FC, useEffect, useState } from 'react';
import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import { cn } from '@/helpers/cn';
import {Controller, useForm} from 'react-hook-form';
import Input from '@/ui/input/Input';
import CurrencyToggle, {
    CURRENCY_SIGN,
    PriceCurrency,
    readPriceCurrency,
    writePriceCurrency,
} from "@/ui/prices/CurrencyToggle";
import { useLatestCurrencyRate } from "@/screens/currency-rate/hooks/useLatestCurrencyRate";
import Button from '@/ui/button/Button';
import Loading from '@/ui/loading/Loading';
import {
    IProfileService,
    SERVICE_CONDITIONS,
    SERVICE_CONDITION_LABELS,
    SERVICE_UNITS,
    SERVICE_UNIT_LABELS,
    ServiceConditionType,
    ServiceUnitType,
} from '@/screens/profile-service/types/IProfileService';
import { IProfileServiceForm } from '@/screens/profile-service/types/IProfileServiceForm';
import { useProfileServiceCreateMutation } from '@/screens/profile-service/hooks/useProfileServiceCreateMutation';
import { useProfileServiceUpdateMutation } from '@/screens/profile-service/hooks/useProfileServiceUpdateMutation';
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import {useProfileSystem} from "@/screens/profile-system/hooks/useProfileSystem";

type Props = ModalProps & {
    profileService?: IProfileService | null;
};

/**
 * У селектах показуємо підпис, а зберігаємо технічне значення.
 * Раніше в списку стояли самі значення — «per_facade» і «hasGlassEdge».
 */
const UNIT_OPTIONS = SERVICE_UNITS.map(unit => ({
    value: unit,
    label: SERVICE_UNIT_LABELS[unit],
}));

const CONDITION_OPTIONS = SERVICE_CONDITIONS.map(condition => ({
    value: condition,
    label: SERVICE_CONDITION_LABELS[condition],
}));

const ProfileServiceCreateModal: FC<Props> = ({ profileService, ...props }) => {
    const isEditMode = !!profileService;

    const { control, handleSubmit, trigger, reset, setValue, getValues, clearErrors, formState: { errors, isValid } } =
        useForm<IProfileServiceForm>({
            mode: 'onChange',
            defaultValues: {
                profileSystemId: '',
                name: '',
                code1C: '',
                unit: '',
                pricePerUnit: null,
                condition: '',
                isActive: true,
            },
        });

    /*
     * Валюта вводу ціни.
     *
     * У базі ціна послуги, як і решта прайсів, доларова. Гривня тут — лише
     * спосіб набрати: введене ділиться на поточний курс, у базу йде долар.
     * Так ціна не залежить від того, у чому її цього разу диктували.
     */
    const { rate } = useLatestCurrencyRate();
    const [priceCurrency, setPriceCurrency] = useState<PriceCurrency>(readPriceCurrency);
    const currency: PriceCurrency = rate === null ? 'USD' : priceCurrency;

    /**
     * Перемикання валюти переводить те, що вже стоїть у полі.
     *
     * Без цього змінювався тільки знак: під «₴» лишалось доларове число,
     * тобто ціна, менша в тридцять разів — і саме така поїхала б у базу.
     *
     * Беремо значення з форми, а не з `profileService`: у полі може стояти
     * вже набране вручну число, і підстановка збереженого стерла б його.
     */
    const changeCurrency = (next: PriceCurrency) => {
        if (next !== currency && rate) {
            const current = Number(getValues('pricePerUnit'));

            if (Number.isFinite(current) && current !== 0) {
                const converted = next === 'UAH' ? current * rate : current / rate;
                setValue('pricePerUnit', Number(converted.toFixed(4)), { shouldValidate: true });
            }
        }

        setPriceCurrency(next);
        writePriceCurrency(next);
    };

    const { mutateAsync: createProfileService, isPending: isCreating } =
        useProfileServiceCreateMutation();
    const { mutateAsync: updateProfileService, isPending: isUpdating } =
        useProfileServiceUpdateMutation();

    const { data: dataProfileSystem, isPending: isPendingProfileSystem } = useProfileSystem();

    const formattedProfileSystemOptions = dataProfileSystem?.map(system => ({
        label: system.title,
        value: system.id,
    })) || [];

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (profileService && props.open) {
            setValue('profileSystemId', profileService.profileSystemId);
            setValue('name', profileService.name);
            setValue('code1C', profileService.code1C ?? '');
            setValue('unit', profileService.unit as ServiceUnitType);
            setValue(
                'pricePerUnit',
                currency === 'UAH' && rate
                    ? Number((profileService.pricePerUnit * rate).toFixed(2))
                    : profileService.pricePerUnit,
            );
            setValue('condition', profileService.condition ?? '');
            setValue('isActive', profileService.isActive);
        } else if (!profileService && props.open) {
            reset();
        }
    }, [profileService, props.open, setValue, reset]);

    useEffect(() => {
        if (!props.open) reset();
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

    // Назовні завжди долар — незалежно від того, у чому набрали
    const toUsd = (value: number) => (currency === 'UAH' && rate ? value / rate : value);

    const onSubmit = async (data: IProfileServiceForm) => {
        try {
            if (isEditMode && profileService) {
                const { profileSystemId, ...updatePayload } = data;
                await updateProfileService({
                    id: profileService.id,
                    ...(updatePayload as Omit<IProfileServiceForm, 'profileSystemId'>),
                    pricePerUnit: toUsd(parseFloat(String(updatePayload.pricePerUnit))),
                });
            } else {
                await createProfileService({
                    ...data,
                    profileSystemId: Number(data.profileSystemId),
                    pricePerUnit: toUsd(parseFloat(String(data.pricePerUnit))),
                });
            }
            reset();
            props.onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Modal
            {...props}
            className={cn(
                'max-w-[500px]',
            )}
        >
            <Modal.Title className="gap-2" onClose={props.onClose}>
                {isEditMode ? 'Редагувати послугу' : 'Створити послугу'}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-4">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Назва</p>
                        <Input
                            control={control}
                            name="name"
                            placeholder="Введіть назву"
                            classNameContainer="w-full"
                            rules={{ required: 'Назва обов\'язкова' }}
                        />
                        {errors.name && (
                            <p className="text-destructive-foreground text-sm">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Код 1С</p>
                        <Input
                            control={control}
                            name="code1C"
                            placeholder="Напр. 000045212"
                            classNameContainer="w-full"
                        />
                    </div>

                    {!isEditMode && (
                        <div className="relative flex flex-col gap-[5px] h-fit">
                            <p className="text-xs font-semibold pl-4">Система профілів</p>
                            {isPendingProfileSystem ? (
                                <p className="text-muted-foreground text-sm pl-4">Завантаження профільних систем...</p>
                            ) : (
                                <>
                                    <Controller
                                        control={control}
                                        name="profileSystemId"
                                        rules={{ required: 'Система профілів обов\'язкова' }}
                                        render={({ field }) => (
                                            <SelectorSearch
                                                getAndSet={[
                                                    field.value ? field.value.toString() : '',
                                                    (val) => {
                                                        field.onChange(parseInt(val as string) || 0);
                                                        clearErrors('profileSystemId');
                                                    },
                                                ]}
                                                options={formattedProfileSystemOptions}
                                                placeholder="Оберіть профільну систему"
                                                optionValue="value"
                                                optionLabel="label"
                                                isEmptyValueDisable={true}
                                                searchable={true}
                                                hasError={!!errors.profileSystemId}
                                            />
                                        )}
                                    />
                                    {errors.profileSystemId && (
                                        <p className="text-destructive-foreground text-xs mt-1">
                                            {errors.profileSystemId.message as string}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Одиниця виміру</p>
                        <Controller
                            control={control}
                            name="unit"
                            rules={{ required: 'Одиниця виміру обов\'язкова' }}
                            render={({ field }) => (
                                <SelectorSearch
                                    getAndSet={[
                                        field.value as ServiceUnitType | '',
                                        (val) => field.onChange(val as ServiceUnitType),
                                    ]}
                                    placeholder="Оберіть одиницю виміру"
                                    searchable={false}
                                    className="w-full"
                                    options={UNIT_OPTIONS}
                                    optionValue="value"
                                    optionLabel="label"
                                    hasError={!!errors.unit}
                                />
                            )}
                        />
                        {errors.unit && (
                            <p className="text-destructive-foreground text-sm">{errors.unit.message}</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <div className="flex items-center justify-between gap-3 pl-4">
                            <p className="text-xs font-semibold">Ціна за одиницю</p>
                            <CurrencyToggle value={currency} onChange={changeCurrency} rate={rate} />
                        </div>
                        <Input
                            control={control}
                            name="pricePerUnit"
                            placeholder="0.0000"
                            classNameContainer="w-full"
                            type="number"
                            unit={CURRENCY_SIGN[currency]}
                            rules={{
                                required: 'Ціна обов\'язкова',
                                validate: (val: number) => {
                                    const num = parseFloat(String(val));
                                    if (isNaN(num)) return 'Введіть коректне число';
                                    if (num < 0) return 'Має бути ≥ 0';
                                    return true;
                                },
                            }}
                        />
                        {errors.pricePerUnit && (
                            <p className="text-destructive-foreground text-sm">{errors.pricePerUnit.message}</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Умова</p>
                        <Controller
                            control={control}
                            name="condition"
                            render={({ field }) => (
                                <SelectorSearch
                                    getAndSet={[
                                        field.value ?? '',
                                        (val) => field.onChange(val as ServiceConditionType),
                                    ]}
                                    placeholder="Оберіть умову"
                                    searchable={false}
                                    className="w-full"
                                    options={CONDITION_OPTIONS}
                                    optionValue="value"
                                    optionLabel="label"
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
                            {isEditMode ? 'Оновити послугу' : 'Створити послугу'}
                        </Button>
                    </div>
                </form>

                {isPending && (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Loading />
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default ProfileServiceCreateModal;