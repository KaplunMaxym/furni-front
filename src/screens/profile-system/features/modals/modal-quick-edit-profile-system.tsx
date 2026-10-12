import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import Input from '@/ui/input/Input';
import Button from '@/ui/button/Button';
import Loading from '@/ui/loading/Loading';
import { IProfileSystem } from '@/screens/profile-system/types/profile-system/IProfileSystem';
import { useProfileSystemQuickUpdateMutation } from '@/screens/profile-system/hooks/useProfileSystemQuickUpdateMutation';

type Props = ModalProps & {
    profileSystem?: IProfileSystem | null;
};

interface QuickForm {
    title: string;
    code1C: string;
    minWidth: string;
    maxWidth: string;
    minHeight: string;
    maxHeight: string;
}

const EMPTY: QuickForm = {
    title: '',
    code1C: '',
    minWidth: '',
    maxWidth: '',
    minHeight: '',
    maxHeight: '',
};

/** Порожнє поле означає «межі немає», а не «нуль». */
const toNumber = (value: string) => (value.trim() === '' ? undefined : Number(value));
const toText = (value: number | string | null | undefined) =>
    value === null || value === undefined ? '' : String(value);

/**
 * Швидке редагування профільної системи прямо зі списку.
 *
 * Тут лише те, що правлять регулярно: назва, код 1С і габаритні межі.
 * Решта — деталі, операції, шаблони CNC, прив'язані матеріали — лишається на
 * сторінці системи: це не поля, а окремі розділи з власними таблицями.
 *
 * `code` навмисно показаний лише для читання. На нього зав'язана логіка
 * розкрою й генерації програм CNC (порівняння на 'ALU-80', 'PIN-TYPE'),
 * тож зміна коду з довідника мовчки зламала б виробництво.
 */
const ProfileSystemQuickEditModal: FC<Props> = ({ profileSystem, ...props }) => {
    const { control, handleSubmit, reset, trigger, formState: { errors, isValid } } =
        useForm<QuickForm>({
            mode: 'onChange',
            defaultValues: EMPTY,
        });

    const { mutateAsync: update, isPending } = useProfileSystemQuickUpdateMutation();

    useEffect(() => {
        if (!props.open) return;

        if (profileSystem) {
            reset({
                title: profileSystem.title,
                code1C: toText(profileSystem.code1C),
                minWidth: toText(profileSystem.minWidth),
                maxWidth: toText(profileSystem.maxWidth),
                minHeight: toText(profileSystem.minHeight),
                maxHeight: toText(profileSystem.maxHeight),
            });
            // reset не перераховує isValid — без цього кнопка лишалась би сірою
            void trigger();
        } else {
            reset(EMPTY);
        }
    }, [profileSystem, props.open, reset, trigger]);

    const onSubmit = async (data: QuickForm) => {
        if (!profileSystem) return;

        try {
            await update({
                id: profileSystem.id,
                title: data.title.trim(),
                code1C: data.code1C.trim(),
                minWidth: toNumber(data.minWidth),
                maxWidth: toNumber(data.maxWidth),
                minHeight: toNumber(data.minHeight),
                maxHeight: toNumber(data.maxHeight),
            });
            props.onClose();
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <Modal {...props} className="max-w-[460px]">
            <Modal.Title className="gap-2" onClose={props.onClose}>
                Редагувати систему
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-4">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                    <div className="flex flex-col gap-[5px]">
                        <p className="text-xs font-semibold pl-4">Назва</p>
                        <Input
                            control={control}
                            name="title"
                            placeholder="Напр. Pivot"
                            classNameContainer="w-full"
                            rules={{ required: 'Назва обов\'язкова' }}
                        />
                        {errors.title && (
                            <p className="text-destructive-foreground text-sm">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="flex flex-col gap-[5px]">
                        <p className="text-xs font-semibold pl-4">Код системи</p>
                        <p className="flex h-9 items-center rounded-md border border-input px-3 font-mono text-sm text-muted-foreground">
                            {profileSystem?.code}
                        </p>
                        <p className="pl-4 text-xs text-muted-foreground">
                            Незмінний: на нього спираються розкрій і програми CNC
                        </p>
                    </div>

                    <div className="flex flex-col gap-[5px]">
                        <p className="text-xs font-semibold pl-4">Код 1С</p>
                        <Input
                            control={control}
                            name="code1C"
                            placeholder="Напр. 000045212"
                            classNameContainer="w-full"
                        />
                    </div>

                    {/* Межі парами: так видно, що це діапазон, а не чотири поля */}
                    <div className="grid grid-cols-2 gap-3">
                        <div className="flex flex-col gap-[5px]">
                            <p className="text-xs font-semibold pl-4">Мін. ширина</p>
                            <Input control={control} name="minWidth" type="number" unit="мм" placeholder="—" classNameContainer="w-full" />
                        </div>
                        <div className="flex flex-col gap-[5px]">
                            <p className="text-xs font-semibold pl-4">Макс. ширина</p>
                            <Input control={control} name="maxWidth" type="number" unit="мм" placeholder="—" classNameContainer="w-full" />
                        </div>
                        <div className="flex flex-col gap-[5px]">
                            <p className="text-xs font-semibold pl-4">Мін. висота</p>
                            <Input control={control} name="minHeight" type="number" unit="мм" placeholder="—" classNameContainer="w-full" />
                        </div>
                        <div className="flex flex-col gap-[5px]">
                            <p className="text-xs font-semibold pl-4">Макс. висота</p>
                            <Input control={control} name="maxHeight" type="number" unit="мм" placeholder="—" classNameContainer="w-full" />
                        </div>
                    </div>

                    <div className="flex gap-3 mt-2">
                        <Button type="button" onClick={props.onClose} color="blackNoneLine" className="flex-1" disabled={isPending}>
                            Скасувати
                        </Button>
                        <Button type="submit" color="greenDarkgreen" className="flex-1" disabled={isPending || !isValid}>
                            Зберегти
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

export default ProfileSystemQuickEditModal;
