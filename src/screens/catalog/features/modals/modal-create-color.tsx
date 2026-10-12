import { FC, useEffect } from 'react';
import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import { cn } from '@/helpers/cn';
import { useForm } from 'react-hook-form';
import Input from '@/ui/input/Input';
import Button from '@/ui/button/Button';
import { Checkbox } from '@/ui/shadcn/checkbox';
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

    const { control, handleSubmit, trigger, reset, setValue, watch, formState: { errors, isValid } } =
        useForm<IColorForm>({
            mode: 'onChange',
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

    useEffect(() => {
        if (props.open && isEditMode) void trigger();
    }, [props.open, isEditMode, trigger]);

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
                'max-w-[500px]',
            )}
        >
            <Modal.Title className="gap-2" onClose={props.onClose}>
                {isEditMode ? 'Редагувати колір' : 'Створити колір'}
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
                        <p className="text-xs font-semibold pl-4">Код кольору (HEX)</p>
                        <Input
                            control={control}
                            name="code"
                            placeholder="#FFFFFF"
                            classNameContainer="w-full"
                        />
                    </div>

                    {/*
                      * Типи використання — список прапорців, а не кольорові чипи.
                      *
                      * Чипи були зашиті в кольори старого проєкту: олива
                      * `#596B00` для обраного, `#D1D1D1` для рамки. Тему вони
                      * не читали взагалі — у темній це були три салатові пігулки
                      * з чужого інтерфейсу, у світлій сірий текст на сірому.
                      *
                      * Головне ж — стан читався тільки кольором: у чипа немає
                      * ні прапорця, ні галочки, тож «обрано» від «не обрано»
                      * відрізнялось лише відтінком, а це три пункти, які
                      * визначають, де колір узагалі можна вибрати.
                      */}
                    <div className="flex flex-col gap-[5px]">
                        <p className="pl-4 text-xs font-semibold">Типи використання</p>

                        <div className="overflow-hidden rounded-lg border border-input">
                            {COLOR_TYPES.map((type, index) => {
                                const isSelected = !!selectedTypes?.includes(type);

                                return (
                                    <button
                                        key={type}
                                        type="button"
                                        onClick={() => toggleType(type)}
                                        className={cn(
                                            'flex w-full items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors',
                                            'hover:bg-accent/60',
                                            index > 0 && 'border-t border-border',
                                            isSelected ? 'text-foreground' : 'text-muted-foreground',
                                        )}
                                    >
                                        {/*
                                          * `pointer-events-none`: натиск обробляє
                                          * рядок цілком, і власний обробник
                                          * прапорця перемкнув би тип двічі
                                          */}
                                        <span className="pointer-events-none">
                                            <Checkbox
                                                state={isSelected ? 'all' : 'none'}
                                                onChange={() => {}}
                                                aria-label={COLOR_TYPE_LABELS[type]}
                                            />
                                        </span>
                                        {COLOR_TYPE_LABELS[type]}
                                    </button>
                                );
                            })}
                        </div>

                        <p className="pl-4 text-xs text-muted-foreground">
                            Де цей колір можна обрати: у профілі, ручці чи завісі
                        </p>
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