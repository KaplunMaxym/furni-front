import { FC, useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import { cn } from '@/helpers/cn';
import Input from '@/ui/input/Input';
import Button from '@/ui/button/Button';
import Loading from '@/ui/loading/Loading';
import SelectorSearch from '@/componets/select/virtualized-list/SelectorSearch';
import {
    IProfileAccessory,
    ACCESSORY_UNITS,
    ACCESSORY_UNIT_LABELS,
    AccessoryUnitType,
} from '@/screens/profile-accessory/types/IProfileAccessory';
import { IProfileAccessoryForm } from '@/screens/profile-accessory/types/IProfileAccessoryForm';
import { useProfileAccessoryCreateMutation } from '@/screens/profile-accessory/hooks/useProfileAccessoryCreateMutation';
import { useProfileAccessoryUpdateMutation } from '@/screens/profile-accessory/hooks/useProfileAccessoryUpdateMutation';
import {useColor} from "@/screens/catalog/hooks/useColor";

type Props = ModalProps & {
    profileAccessory?: IProfileAccessory | null;
};

const ProfileAccessoryCreateModal: FC<Props> = ({ profileAccessory, ...props }) => {
    const isEditMode = !!profileAccessory;

    const { control, handleSubmit, reset, setValue, watch, register, formState: { errors }, clearErrors } =
        useForm<IProfileAccessoryForm>({
            defaultValues: {
                articleCode: '',
                name: '',
                unit: '',
                colorId: '',
            },
        });

    const { mutateAsync: create, isPending: isCreating } = useProfileAccessoryCreateMutation();
    const { mutateAsync: update, isPending: isUpdating } = useProfileAccessoryUpdateMutation();

    const { data: dataColors, isPending: isPendingProfileColors } = useColor();

    const isPending = isCreating || isUpdating;

    const formattedColorOptions = dataColors?.map(color => ({
        label: color.name,
        value: color.id
    })) || [];

    useEffect(() => {
        if (profileAccessory && props.open) {
            setValue('articleCode', profileAccessory.articleCode);
            setValue('name', profileAccessory.name);
            setValue('unit', profileAccessory.unit);
            setValue('colorId', profileAccessory.colorId ?? '');
        } else if (!profileAccessory && props.open) {
            reset();
        }
    }, [profileAccessory, props.open, setValue, reset]);

    useEffect(() => {
        if (!props.open) reset();
    }, [props.open, reset]);

    useEffect(() => {
        register('colorId', { required: 'Колір обов\'язковий' });
    }, [register]);

    const onSubmit = async (data: IProfileAccessoryForm) => {
        try {
            if (isEditMode && profileAccessory) {
                await update({ id: profileAccessory.id, ...data });
            } else {
                await create(data);
            }
            reset();
            props.onClose();
        } catch (error) {
            console.error(error);
        }
    };

    const colorIdValue = watch('colorId');

    return (
        <Modal
            {...props}
            className={cn(
                'flex flex-col gap-2.5 max-w-[500px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
            )}
        >
            <Modal.Title className="gap-2" onClose={props.onClose}>
                {isEditMode ? 'Редагувати аксесуар' : 'Створити аксесуар'}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-4 rounded-xl p-3">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Артикул *</p>
                        <Input
                            control={control}
                            name="articleCode"
                            placeholder="Напр. 5.24.03.188"
                            classNameContainer="w-full"
                            rules={{ required: 'Артикул обов\'язковий' }}
                        />
                        {errors.articleCode && (
                            <p className="text-red-500 text-sm">{errors.articleCode.message}</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Назва *</p>
                        <Input
                            control={control}
                            name="name"
                            placeholder="Напр. Кутик лівий"
                            classNameContainer="w-full"
                            rules={{ required: 'Назва обов\'язкова' }}
                        />
                        {errors.name && (
                            <p className="text-red-500 text-sm">{errors.name.message}</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Колір профілю *</p>
                        {!isPendingProfileColors ? (
                            <>
                                <SelectorSearch
                                    getAndSet={[
                                        colorIdValue?.toString() || '',
                                        (value) => {
                                            setValue('colorId', value ? parseInt(value as string) : '');
                                            clearErrors('colorId');
                                        }
                                    ]}
                                    options={formattedColorOptions}
                                    placeholder="Оберіть колір профілю"
                                    optionValue="value"
                                    optionLabel="label"
                                    isEmptyValueDisable={true}
                                    searchable={true}
                                    hasError={!!errors.colorId}
                                />
                                {errors.colorId && (
                                    <p className="text-red-500 text-xs mt-1">{errors.colorId.message as string}</p>
                                )}
                            </>
                        ) : (
                            <p className="text-gray-400 text-sm">Завантаження кольорів...</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Одиниця виміру *</p>
                        <Controller
                            control={control}
                            name="unit"
                            rules={{ required: 'Одиниця виміру обов\'язкова' }}
                            render={({ field }) => (
                                <SelectorSearch
                                    getAndSet={[
                                        field.value as AccessoryUnitType | '',
                                        (val) => field.onChange(val as AccessoryUnitType),
                                    ]}
                                    searchable={false}
                                    className="w-full"
                                    options={ACCESSORY_UNITS.map(u => ({
                                        value: u,
                                        label: ACCESSORY_UNIT_LABELS[u],
                                    }))}
                                    optionValue="value"
                                    optionLabel="label"
                                    placeholder="Оберіть одиницю"
                                />
                            )}
                        />
                        {errors.unit && (
                            <p className="text-red-500 text-sm">{errors.unit.message}</p>
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
                            {isEditMode ? 'Оновити аксесуар' : 'Створити аксесуар'}
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

export default ProfileAccessoryCreateModal;