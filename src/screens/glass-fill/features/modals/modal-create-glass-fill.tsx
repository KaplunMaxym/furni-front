'use client'

import {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import {cn} from "@/helpers/cn";
import React, {FC, useEffect} from "react";
import Input from "@/ui/input/Input";
import {useForm} from "react-hook-form";
import Button from "@/ui/button/Button";
import Loading from "@/ui/loading/Loading";
import {IGlassFill} from "@/screens/glass-fill/types/IGlassFill";
import {IGlassFillForm} from "@/screens/glass-fill/types/IGlassFillForm";
import {useGlassFillCreateMutation} from "@/screens/glass-fill/hooks/useGlassFillCreateMutation";
import {useGlassFillUpdateMutation} from "@/screens/glass-fill/hooks/useGlassFillUpdateMutation";

type IGlassFillCreateModal = ModalProps & {
    glassFill?: IGlassFill | null;
}

const GlassFillCreateModal: FC<IGlassFillCreateModal> = ({ glassFill, ...props }) => {
    const isEditMode = !!glassFill;

    const { control, handleSubmit, trigger, reset, formState: { errors, isValid }, setValue } = useForm<IGlassFillForm>({
        mode: 'onChange',
        defaultValues: {
            type: '',
            code1C: '',
            thickness: ''
        }
    });

    const { mutateAsync: createGlassFill, isPending: isCreating } = useGlassFillCreateMutation();
    const { mutateAsync: updateGlassFill, isPending: isUpdating } = useGlassFillUpdateMutation();

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (glassFill && props.open) {
            setValue('type', glassFill.type || '');
            setValue('code1C', glassFill.code1C || '');
            setValue('thickness', glassFill.thickness || '');
        } else if (!glassFill && props.open) {
            reset();
        }
    }, [glassFill, props.open, setValue, reset]);

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

    const onSubmit = async (data: IGlassFillForm) => {
        try {
            if (isEditMode && glassFill) {
                const updateData = {
                    id: glassFill.id,
                    type: data.type,
                    code1C: data.code1C,
                    thickness: data.thickness,
                };
                await updateGlassFill(updateData);
            } else {
                const createData = {
                    type: data.type,
                    code1C: data.code1C,
                    thickness: data.thickness,
                };
                await createGlassFill(createData);
            }

            reset();
            props.onClose();
        } catch (error) {
            console.error(`Error ${isEditMode ? 'updating' : 'creating'} glass fill:`, error);
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
                {isEditMode ? 'Редагувати заповнення' : 'Створити заповнення'}
            </Modal.Title>

            <Modal.Body className={'flex flex-col gap-4'}>
                <form onSubmit={handleSubmit(onSubmit)} className={'flex flex-col gap-4'}>
                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Тип</p>
                        <Input
                            control={control}
                            name={'type'}
                            placeholder={'Введіть тип'}
                            classNameContainer={'w-full'}
                            rules={{
                                required: 'Тип обов\'язковий'
                            }}
                        />
                        {errors.type && (
                            <p className={'text-destructive-foreground text-sm'}>{errors.type.message}</p>
                        )}
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Код 1С</p>
                        <Input
                            control={control}
                            name={'code1C'}
                            placeholder={'Напр. 000045212'}
                            classNameContainer={'w-full'}
                        />
                    </div>

                    <div className={'relative flex flex-col gap-[5px] h-fit'}>
                        <p className="text-xs font-semibold pl-4">Товщина</p>
                        <Input
                            control={control}
                            name={'thickness'}
                            placeholder={'Введіть товщину (необов\'язково)'}
                            classNameContainer={'w-full'}
                            type={'number'}
                            unit="мм"
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
                            {isEditMode ? 'Оновити заповнення' : 'Створити заповнення'}
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

export default GlassFillCreateModal;