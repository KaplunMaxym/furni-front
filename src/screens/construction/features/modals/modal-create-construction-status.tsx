'use client'

import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import Input from '@/ui/input/Input';
import Button from '@/ui/button/Button';
import Loading from '@/ui/loading/Loading';
import { IConstructionStatus } from '@/screens/construction/type/construction/IConstruction';
import { IConstructionStatusForm } from '@/screens/construction/type/construction-status/IConstructionStatusForm';
import {
    useConstructionStatusCreateMutation,
    useConstructionStatusUpdateMutation,
} from '@/screens/construction/hooks/construction-status/useConstructionStatusMutations';

type Props = ModalProps & {
    constructionStatus?: IConstructionStatus | null;
};

const EMPTY: IConstructionStatusForm = { code: '', title: '' };

/**
 * Створення й редагування статусу конструкції.
 *
 * Довідник був лише для читання: статуси заводились сідом, і додати новий
 * етап виробництва без розробника було неможливо.
 */
const ConstructionStatusCreateModal: FC<Props> = ({ constructionStatus, ...props }) => {
    const isEditMode = !!constructionStatus;

    const { control, handleSubmit, reset, trigger, formState: { errors, isValid } } =
        useForm<IConstructionStatusForm>({ mode: 'onChange', defaultValues: EMPTY });

    const { mutateAsync: create, isPending: isCreating } = useConstructionStatusCreateMutation();
    const { mutateAsync: update, isPending: isUpdating } = useConstructionStatusUpdateMutation();

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (!props.open) return;

        if (constructionStatus) {
            reset({ code: constructionStatus.code, title: constructionStatus.title });
            // reset не перераховує isValid — без цього кнопка лишалась би сірою
            void trigger();
        } else {
            reset(EMPTY);
        }
    }, [constructionStatus, props.open, reset, trigger]);

    const onSubmit = async (data: IConstructionStatusForm) => {
        try {
            if (isEditMode && constructionStatus) {
                await update({ id: constructionStatus.id, ...data });
            } else {
                await create(data);
            }
            props.onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Modal {...props} className="max-w-[460px]">
            <Modal.Title className="gap-2" onClose={props.onClose}>
                {isEditMode ? 'Редагувати статус конструкції' : 'Створити статус конструкції'}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-4">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-[5px]">
                        <p className="text-xs font-semibold pl-4">Код</p>
                        <Input
                            control={control}
                            name="code"
                            placeholder="Напр. IN_PROGRESS"
                            classNameContainer="w-full"
                            rules={{ required: 'Код обов\'язковий' }}
                        />
                        {errors.code && (
                            <p className="text-destructive-foreground text-sm">{errors.code.message}</p>
                        )}
                        <p className="pl-4 text-xs text-muted-foreground">
                            На код спирається логіка — після створення краще не міняти
                        </p>
                    </div>

                    <div className="flex flex-col gap-[5px]">
                        <p className="text-xs font-semibold pl-4">Назва</p>
                        <Input
                            control={control}
                            name="title"
                            placeholder="Напр. У виробництві"
                            classNameContainer="w-full"
                            rules={{ required: 'Назва обов\'язкова' }}
                        />
                        {errors.title && (
                            <p className="text-destructive-foreground text-sm">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="flex gap-3 mt-2">
                        <Button type="button" onClick={props.onClose} color="blackNoneLine" className="flex-1" disabled={isPending}>
                            Скасувати
                        </Button>
                        <Button type="submit" color="greenDarkgreen" className="flex-1" disabled={isPending || !isValid}>
                            {isEditMode ? 'Зберегти' : 'Створити'}
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

export default ConstructionStatusCreateModal;
