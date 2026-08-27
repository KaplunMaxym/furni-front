import { FC, useEffect } from 'react';
import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import { cn } from '@/helpers/cn';
import { useForm } from 'react-hook-form';
import Input from '@/ui/input/Input';
import Button from '@/ui/button/Button';
import Loading from '@/ui/loading/Loading';
import { IProfileMaterial } from '@/screens/profile-material/types/IProfileMaterial';
import { IProfileMaterialForm } from '@/screens/profile-material/types/IProfileMaterialForm';
import { useProfileMaterialCreateMutation } from '@/screens/profile-material/hooks/useProfileMaterialCreateMutation';
import { useProfileMaterialUpdateMutation } from '@/screens/profile-material/hooks/useProfileMaterialUpdateMutation';
import {useProfileColors} from "@/screens/catalog/hooks/useColor";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";

type Props = ModalProps & {
    profileMaterial?: IProfileMaterial | null;
};

const ProfileMaterialCreateModal: FC<Props> = ({ profileMaterial, ...props }) => {
    const isEditMode = !!profileMaterial;

    const { control, handleSubmit, reset, setValue, watch, register, formState: { errors }, clearErrors } =
        useForm<IProfileMaterialForm>({
            defaultValues: {
                articleCode: '',
                name: '',
                colorId: '',
                beamLength: '3000',
            },
        });

    const { mutateAsync: create, isPending: isCreating } = useProfileMaterialCreateMutation();
    const { mutateAsync: update, isPending: isUpdating } = useProfileMaterialUpdateMutation();

    const { data: dataProfileColors, isPending: isPendingProfileColors } = useProfileColors();

    const isPending = isCreating || isUpdating;

    const formattedColorOptions = dataProfileColors?.map(color => ({
        label: color.name,
        value: color.id
    })) || [];

    useEffect(() => {
        if (profileMaterial && props.open) {
            setValue('articleCode', profileMaterial.articleCode);
            setValue('name', profileMaterial.name);
            setValue('colorId', profileMaterial.colorId ?? '');
            setValue('beamLength', profileMaterial.beamLength.toString());
        } else if (!profileMaterial && props.open) {
            reset();
        }
    }, [profileMaterial, props.open, setValue, reset]);

    useEffect(() => {
        if (!props.open) reset();
    }, [props.open, reset]);

    useEffect(() => {
        register('colorId', { required: 'Колір обов\'язковий' });
    }, [register]);

    const onSubmit = async (data: IProfileMaterialForm) => {
        try {
            if (isEditMode && profileMaterial) {
                await update({ id: profileMaterial.id, ...data });
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
                {isEditMode ? 'Редагувати матеріал' : 'Створити матеріал'}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-4 rounded-xl p-3">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Артикул *</p>
                        <Input
                            control={control}
                            name="articleCode"
                            placeholder="Напр. 6.35.0407"
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
                            placeholder="Напр. Профіль 25мм"
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
                        <p className="text-xs font-semibold pl-4">Довжина балки (мм)</p>
                        <Input
                            control={control}
                            name="beamLength"
                            placeholder="3000"
                            classNameContainer="w-full"
                            type="number"
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
                            {isEditMode ? 'Оновити матеріал' : 'Створити матеріал'}
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

export default ProfileMaterialCreateModal;