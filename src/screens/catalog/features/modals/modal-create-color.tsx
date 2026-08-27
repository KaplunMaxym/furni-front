import { FC, useEffect } from 'react';
import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import { cn } from '@/helpers/cn';
import { useForm } from 'react-hook-form';
import Input from '@/ui/input/Input';
import Button from '@/ui/button/Button';
import Loading from '@/ui/loading/Loading';
import { useColorCreateMutation } from '@/screens/catalog/hooks/useColorCreateMutation';
import { useColorUpdateMutation } from '@/screens/catalog/hooks/useColorUpdateMutation';
import {IColor, ColorType, COLOR_TYPE_LABELS} from '@/screens/catalog/types/IColor';
import { IColorForm } from '@/screens/catalog/types/IColorForm';
import { COLOR_TYPES } from '@/screens/catalog/types/IColor';

type Props = ModalProps & {
    color?: IColor | null;
};

const ColorCreateModal: FC<Props> = ({ color, ...props }) => {
    const isEditMode = !!color;

    const { control, handleSubmit, reset, setValue, watch, formState: { errors } } =
        useForm<IColorForm>({
            defaultValues: {
                name: '',
                code: '',
                types: [],
            },
        });

    const { mutateAsync: createColor, isPending: isCreating } = useColorCreateMutation();
    const { mutateAsync: updateColor, isPending: isUpdating } = useColorUpdateMutation();
    const isPending = isCreating || isUpdating;

    const selectedTypes = watch('types');

    const toggleType = (type: ColorType) => {
        const current = selectedTypes ?? [];
        const updated = current.includes(type)
            ? current.filter(t => t !== type)
            : [...current, type];
        setValue('types', updated);
    };

    useEffect(() => {
        if (color && props.open) {
            setValue('name', color.name);
            setValue('code', color.code ?? '');
            setValue('types', color.types.map(t => t.type));
        } else if (!color && props.open) {
            reset();
        }
    }, [color, props.open, setValue, reset]);

    useEffect(() => {
        if (!props.open) reset();
    }, [props.open, reset]);

    const onSubmit = async (data: IColorForm) => {
        try {
            if (isEditMode && color) {
                await updateColor({ id: color.id, ...data });
            } else {
                await createColor(data);
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
                {isEditMode ? 'Редагувати колір' : 'Створити колір'}
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

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Код кольору (HEX)</p>
                        <Input
                            control={control}
                            name="code"
                            placeholder="#FFFFFF"
                            classNameContainer="w-full"
                        />
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Типи використання</p>
                        <div className="flex gap-2 flex-wrap pl-1">
                            {COLOR_TYPES.map(type => {
                                const isSelected = selectedTypes?.includes(type);
                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => toggleType(type)}
                                        className={cn(
                                            'px-3 py-1.5 rounded-full text-sm border transition-colors',
                                            isSelected
                                                ? 'bg-[#596B00] text-[#fff] border-[#596B00]'
                                                : 'bg-transparent text-[#727272] border-[#D1D1D1] hover:border-[#596B00]'
                                        )}
                                    >
                                        {COLOR_TYPE_LABELS[type]}
                                    </button>
                                );
                            })}
                        </div>
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
                            {isEditMode ? 'Оновити колір' : 'Створити колір'}
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

export default ColorCreateModal;