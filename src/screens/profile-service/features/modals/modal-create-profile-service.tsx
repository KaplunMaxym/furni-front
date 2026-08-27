import React, { FC, useEffect } from 'react';
import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import { cn } from '@/helpers/cn';
import {Controller, useForm} from 'react-hook-form';
import Input from '@/ui/input/Input';
import Button from '@/ui/button/Button';
import Loading from '@/ui/loading/Loading';
import {IProfileService, SERVICE_UNITS, ServiceUnitType} from '@/screens/profile-service/types/IProfileService';
import { IProfileServiceForm } from '@/screens/profile-service/types/IProfileServiceForm';
import { useProfileServiceCreateMutation } from '@/screens/profile-service/hooks/useProfileServiceCreateMutation';
import { useProfileServiceUpdateMutation } from '@/screens/profile-service/hooks/useProfileServiceUpdateMutation';
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import {useProfileSystem} from "@/screens/profile-system/hooks/useProfileSystem";

type Props = ModalProps & {
    profileService?: IProfileService | null;
};

const ProfileServiceCreateModal: FC<Props> = ({ profileService, ...props }) => {
    const isEditMode = !!profileService;

    const { control, handleSubmit, reset, setValue, clearErrors, formState: { errors } } =
        useForm<IProfileServiceForm>({
            defaultValues: {
                profileSystemId: '',
                name: '',
                unit: '',
                pricePerUnit: null,
                condition: '',
                isActive: true,
            },
        });

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
            setValue('unit', profileService.unit as ServiceUnitType);
            setValue('pricePerUnit', profileService.pricePerUnit);
            setValue('condition', profileService.condition ?? '');
            setValue('isActive', profileService.isActive);
        } else if (!profileService && props.open) {
            reset();
        }
    }, [profileService, props.open, setValue, reset]);

    useEffect(() => {
        if (!props.open) reset();
    }, [props.open, reset]);

    const onSubmit = async (data: IProfileServiceForm) => {
        try {
            if (isEditMode && profileService) {
                const { profileSystemId, ...updatePayload } = data;
                await updateProfileService({
                    id: profileService.id,
                    ...(updatePayload as Omit<IProfileServiceForm, 'profileSystemId'>),
                    pricePerUnit: parseFloat(String(updatePayload.pricePerUnit)),
                });
            } else {
                await createProfileService({
                    ...data,
                    profileSystemId: Number(data.profileSystemId),
                    pricePerUnit: parseFloat(String(data.pricePerUnit)),
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
                'flex flex-col gap-2.5 max-w-[500px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
            )}
        >
            <Modal.Title className="gap-2" onClose={props.onClose}>
                {isEditMode ? 'Редагувати послугу' : 'Створити послугу'}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-4 rounded-xl p-3">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Назва *</p>
                        <Input
                            control={control}
                            name="name"
                            placeholder="Введіть назву"
                            classNameContainer="w-full"
                            rules={{ required: 'Назва обов\'язкова' }}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">{errors.name.message}</p>
                        )}
                    </div>

                    {!isEditMode && (
                        <div className="relative flex flex-col gap-[5px] h-fit">
                            <p className="text-xs font-semibold pl-4">Система профілів *</p>
                            {isPendingProfileSystem ? (
                                <p className="text-gray-400 text-sm pl-4">Завантаження профільних систем...</p>
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
                                        <p className="text-red-500 text-xs mt-1">
                                            {errors.profileSystemId.message as string}
                                        </p>
                                    )}
                                </>
                            )}
                        </div>
                    )}

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Одиниця виміру *</p>
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
                                    placeholder="Оберіть одиниця виміру"
                                    searchable={false}
                                    className="w-full"
                                    options={SERVICE_UNITS as unknown as (ServiceUnitType)[]}
                                />
                            )}
                        />
                        {errors.unit && (
                            <p className="text-red-500 text-sm">{errors.unit.message}</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Ціна за одиницю *</p>
                        <Input
                            control={control}
                            name="pricePerUnit"
                            placeholder="0.0000"
                            classNameContainer="w-full"
                            type="number"
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
                            <p className="text-red-500 text-sm">{errors.pricePerUnit.message}</p>
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
                                        (val) => field.onChange(val),
                                    ]}
                                    placeholder="Оберіть умову"
                                    searchable={false}
                                    className="w-full"
                                    options={['always', 'hasHandle', 'hasHinge', 'hasGlass', 'hasGlassEdge']}
                                />
                            )}
                        />
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