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

type Props = ModalProps & {
    currencyRate?: ICurrencyRate | null;
};

const CurrencyRateCreateModal: FC<Props> = ({ currencyRate, ...props }) => {
    const isEditMode = !!currencyRate;

    const {
        control,
        handleSubmit,
        reset,
        setValue,
        formState: { errors },
    } = useForm<ICurrencyRateForm>({
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
            className={cn(
                'flex flex-col gap-2.5 max-w-[500px] min-h-10 rounded-base-mini mx-2 overflow-y-auto max-h-dvh h-auto',
            )}
        >
            <Modal.Title className="gap-2" onClose={props.onClose}>
                {isEditMode ? 'Редагувати курс валюти' : 'Створити курс валюти'}
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-4 rounded-xl p-3">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Дата *</p>
                        <Input
                            control={control}
                            name="date"
                            type="date"
                            classNameContainer="w-full"
                            rules={{ required: 'Дата обов\'язкова' }}
                        />
                        {errors.date && (
                            <p className="text-red-500 text-sm">{errors.date.message}</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Валюта *</p>
                        <Input
                            control={control}
                            name="currency"
                            placeholder="Напр. USD"
                            classNameContainer="w-full"
                            rules={{ required: 'Валюта обов\'язкова' }}
                        />
                        {errors.currency && (
                            <p className="text-red-500 text-sm">{errors.currency.message}</p>
                        )}
                    </div>

                    <div className="relative flex flex-col gap-[5px] h-fit">
                        <p className="text-xs font-semibold pl-4">Курс *</p>
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
                            <p className="text-red-500 text-sm">{errors.rate.message}</p>
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