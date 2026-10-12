import { FC, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import { cn } from '@/helpers/cn';
import Input from '@/ui/input/Input';
import Button from '@/ui/button/Button';
import Loading from '@/ui/loading/Loading';
import { useCurrencyRateCreateMutation } from '@/screens/currency-rate/hooks/useCurrencyRateCreateMutation';
import { useCurrencyRateUpdateMutation } from '@/screens/currency-rate/hooks/useCurrencyRateUpdateMutation';
import {ICurrencyRateForm} from "@/screens/currency-rate/type/ICurrencyRateForm";
import {ICurrencyRate} from "@/screens/currency-rate/type/ICurrencyRate";
import DatePicker from "@/componets/date-picker/DatePicker";
import {toISODate} from "@/componets/date-picker/date";

type Props = ModalProps & {
    currencyRate?: ICurrencyRate | null;
};

const CurrencyRateCreateModal: FC<Props> = ({ currencyRate, ...props }) => {
    const isEditMode = !!currencyRate;

    const {
        control,
        handleSubmit, trigger,
        reset,
        setValue,
        formState: { errors, isValid },
    } = useForm<ICurrencyRateForm>({
        mode: 'onChange',
        defaultValues: {
            date: '',
            rate: 0,
            currency: '',
        },
    });

    const { mutateAsync: create, isPending: isCreating } = useCurrencyRateCreateMutation();
    const { mutateAsync: update, isPending: isUpdating } = useCurrencyRateUpdateMutation();

    const isPending = isCreating || isUpdating;

    useEffect(() => {
        if (currencyRate && props.open) {
            setValue('date', currencyRate.date.slice(0, 10));
            setValue('rate', currencyRate.rate);
            setValue('currency', currencyRate.currency);
        } else if (!currencyRate && props.open) {
            reset();
        }
    }, [currencyRate, props.open, setValue, reset]);

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

    const onSubmit = async (data: ICurrencyRateForm) => {
        try {
            if (isEditMode && currencyRate) {
                await update({ id: currencyRate.id, ...data });
            } else {
                await create(data);
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
            // Три коротких поля — дата, валюта, курс. На 500 px вони
            // розтягувались на пів екрана, хоч ширшими за календар бути не мають
            className={cn('max-w-[360px]')}
        >
            <Modal.Title className="gap-2" onClose={props.onClose}>
                {isEditMode ? 'Редагувати курс валюти' : 'Створити курс валюти'}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-4">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Дата</p>
                        {/* Курс заднім числом сенсу не має, тож майбутнє відрізане */}
                        <DatePicker
                            control={control}
                            name="date"
                            max={toISODate(new Date())}
                            clearable={false}
                            classNameContainer="w-full"
                            rules={{ required: 'Дата обов\'язкова' }}
                        />
                        {errors.date && (
                            <p className="text-destructive-foreground text-sm">{errors.date.message}</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Валюта</p>
                        <Input
                            control={control}
                            name="currency"
                            placeholder="Напр. USD"
                            classNameContainer="w-full"
                            rules={{ required: 'Валюта обов\'язкова' }}
                        />
                        {errors.currency && (
                            <p className="text-destructive-foreground text-sm">{errors.currency.message}</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Курс</p>
                        <Input
                            control={control}
                            name="rate"
                            type="number"
                            placeholder="Напр. 41.5"
                            classNameContainer="w-full"
                            rules={{
                                required: 'Курс обов\'язковий',
                                min: { value: 0.0001, message: 'Курс має бути більше 0' },
                            }}
                        />
                        {errors.rate && (
                            <p className="text-destructive-foreground text-sm">{errors.rate.message}</p>
                        )}
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
                            {isEditMode ? 'Оновити курс' : 'Створити курс'}
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

export default CurrencyRateCreateModal;