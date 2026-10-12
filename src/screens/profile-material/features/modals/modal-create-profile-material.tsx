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
    /*
     * Копія приходить тим самим шляхом, що й редагування, але з `id: 0`.
     *
     * Це відрізняє «відкрили наявний запис» від «відкрили заповнену форму для
     * нового»: поля ті самі, а зберігається створенням, а не оновленням.
     * Перевіряти саму наявність об'єкта не можна — копія тоді перезаписала б
     * оригінал.
     */
    const isEditMode = !!profileMaterial && profileMaterial.id > 0;

    const { control, handleSubmit, trigger, reset, setValue, watch, register, formState: { errors, isValid }, clearErrors } =
        useForm<IProfileMaterialForm>({
            mode: 'onChange',
            defaultValues: {
                articleCode: '',
                code1C: '',
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
            setValue('code1C', profileMaterial.code1C ?? '');
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
                'max-w-[500px]',
            )}
        >
            <Modal.Title className="gap-2" onClose={props.onClose}>
                {isEditMode ? 'Редагувати матеріал' : 'Створити матеріал'}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-4">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Артикул</p>
                        <Input
                            control={control}
                            name="articleCode"
                            placeholder="Напр. 6.35.0407"
                            classNameContainer="w-full"
                            rules={{ required: 'Артикул обов\'язковий' }}
                        />
                        {errors.articleCode && (
                            <p className="text-destructive-foreground text-sm">{errors.articleCode.message}</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Назва</p>
                        <Input
                            control={control}
                            name="name"
                            placeholder="Напр. Профіль 25мм"
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

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Колір профілю</p>
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
                                    <p className="text-destructive-foreground text-xs mt-1">{errors.colorId.message as string}</p>
                                )}
                            </>
                        ) : (
                            <p className="text-muted-foreground text-sm">Завантаження кольорів...</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Довжина балки</p>
                        <Input
                            control={control}
                            name="beamLength"
                            unit="мм"
                            placeholder="3000"
                            classNameContainer="w-full"
                            type="number"
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