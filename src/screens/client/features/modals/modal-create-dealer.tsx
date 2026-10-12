'use client'

import {FC, useEffect, useState} from "react";
import {Controller, useForm} from "react-hook-form";

import {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";
import Input from "@/ui/input/Input";
import Button from "@/ui/button/Button";
import Loading from "@/ui/loading/Loading";
import SelectorSearch from "@/componets/select/virtualized-list/SelectorSearch";
import {SectionLabel} from "@/ui/section-label/SectionLabel";
import Hint from "@/ui/hint/Hint";
import {IDealerForm} from "@/screens/client/types/IDealerForm";
import {useDealerCreateMutation} from "@/screens/client/hooks/useDealerCreateMutation";
import {PRICE_CATEGORIES} from "@/screens/order/types/order/IOrderForm";
import {generatePassword} from "@/helpers/user-password/generatePassword";

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * Створення дилера — клієнта з власним входом.
 *
 * Одна форма на дві сутності навмисно. Дилер без клієнта не бачить нічого,
 * клієнт без входу — це просто клієнт; окремими кроками між ними лишалася б
 * щілина, у якій половина дилера вже є, а половини ще немає. Сервер створює
 * обидва записи однією транзакцією.
 *
 * Цінова категорія стоїть тут, а не в замовленні: сам дилер її не бачить і
 * обрати не може, тож єдиний, хто її призначає, — той, хто заводить дилера.
 */
const DealerCreateModal: FC<ModalProps> = (props) => {
    const {
        control, handleSubmit, reset, watch, setValue, trigger,
        formState: {errors, isValid},
    } = useForm<IDealerForm>({
        mode: 'onChange',
        defaultValues: {
            lastName: '',
            firstName: '',
            middleName: '',
            phone: '',
            email: '',
            code1C: '',
            priceCategory: 'REPRESENTATIVE',
            userName: '',
            login: '',
            password: '',
        },
    });

    const {mutateAsync: createDealer, isPending} = useDealerCreateMutation();
    const [serverError, setServerError] = useState<string | null>(null);

    useEffect(() => {
        if (!props.open) {
            reset();
            setServerError(null);
        }
    }, [props.open, reset]);

    /**
     * Згенерувати пароль — так само, як при створенні користувача.
     *
     * `trigger` тут обовʼязковий: `setValue` не перераховує `isValid`, і
     * кнопка «Створити» лишалась би сірою при заповненому полі. Показати
     * згенероване можна оком у самому полі — його малює `Input`.
     */
    const fillGeneratedPassword = () => {
        setValue('password', generatePassword());
        void trigger('password');
    };

    const priceCategory = watch('priceCategory');

    const onSubmit = async (data: IDealerForm) => {
        setServerError(null);
        try {
            await createDealer({
                ...data,
                // Порожні рядки в необовʼязкових полях — це «не заповнив»,
                // а не значення; інакше в базі осідали б порожні контакти
                middleName: data.middleName?.trim() || undefined,
                phone: data.phone?.trim() || undefined,
                email: data.email?.trim() || undefined,
                code1C: data.code1C?.trim() || undefined,
                userName: data.userName?.trim() || undefined,
            });
            props.onClose();
        } catch (error) {
            /*
             * Найчастіша причина відмови — зайнята пошта. Без цього тексту
             * модалка просто нічого не робила б у відповідь на натиск.
             */
            const message = (error as { response?: { data?: { message?: string } } })
                ?.response?.data?.message;
            setServerError(message ?? 'Не вдалося створити дилера');
        }
    };

    return (
        <Modal {...props} className="max-w-[560px]">
            <Modal.Title className="gap-2" onClose={props.onClose}>
                Створити дилера
            </Modal.Title>

            <Modal.Body className="flex flex-col gap-4">
                <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">

                    <div className="overflow-hidden rounded-xl border border-border">
                        <SectionLabel>Клієнт</SectionLabel>

                        <div className="flex flex-col gap-4 p-4">
                            <div className="flex flex-col gap-[5px]">
                                <p className="pl-4 text-xs font-semibold">Прізвище</p>
                                <Input
                                    control={control}
                                    name="lastName"
                                    placeholder="Введіть прізвище"
                                    classNameContainer="w-full"
                                    rules={{required: 'Прізвище обовʼязкове'}}
                                />
                                {errors.lastName && (
                                    <p className="text-sm text-destructive-foreground">{errors.lastName.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <p className="pl-4 text-xs font-semibold">Імʼя</p>
                                <Input
                                    control={control}
                                    name="firstName"
                                    placeholder="Введіть імʼя"
                                    classNameContainer="w-full"
                                    rules={{required: 'Імʼя обовʼязкове'}}
                                />
                                {errors.firstName && (
                                    <p className="text-sm text-destructive-foreground">{errors.firstName.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <p className="pl-4 text-xs font-semibold">По батькові (необовʼязково)</p>
                                <Input
                                    control={control}
                                    name="middleName"
                                    placeholder="Введіть по батькові"
                                    classNameContainer="w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <p className="pl-4 text-xs font-semibold">Телефон (необовʼязково)</p>
                                <Input
                                    control={control}
                                    name="phone"
                                    type="tel"
                                    placeholder="Введіть номер телефону"
                                    classNameContainer="w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <p className="pl-4 text-xs font-semibold">Пошта для звʼязку (необовʼязково)</p>
                                <Input
                                    control={control}
                                    name="email"
                                    type="email"
                                    placeholder="Введіть пошту"
                                    classNameContainer="w-full"
                                    rules={{pattern: {value: EMAIL_PATTERN, message: 'Невірна адреса пошти'}}}
                                />
                                {errors.email && (
                                    <p className="text-sm text-destructive-foreground">{errors.email.message}</p>
                                )}
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <p className="pl-4 text-xs font-semibold">Код 1С (необовʼязково)</p>
                                <Input
                                    control={control}
                                    name="code1C"
                                    placeholder="Напр. 000011366"
                                    classNameContainer="w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <div className="flex items-center gap-1.5 pl-4">
                                    <p className="text-xs font-semibold">Цінова категорія</p>
                                    <Hint title="Цінова категорія">
                                        <p>
                                            За нею рахується вартість усіх замовлень цього
                                            дилера — вона підставляється автоматично, і
                                            обирати її в кожному замовленні не потрібно.
                                        </p>
                                        <p>
                                            Самому дилеру категорія не показується ніде:
                                            він бачить лише готову суму.
                                        </p>
                                    </Hint>
                                </div>
                                <Controller
                                    control={control}
                                    name="priceCategory"
                                    rules={{required: 'Оберіть категорію'}}
                                    render={({field}) => (
                                        <SelectorSearch
                                            getAndSet={[priceCategory ?? '', (value) => field.onChange(value)]}
                                            options={PRICE_CATEGORIES}
                                            optionValue="value"
                                            optionLabel="label"
                                            placeholder="Оберіть категорію"
                                            searchable={false}
                                            className="w-full"
                                        />
                                    )}
                                />
                                {errors.priceCategory && (
                                    <p className="text-sm text-destructive-foreground">{errors.priceCategory.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="overflow-hidden rounded-xl border border-border">
                        <SectionLabel>Вхід у систему</SectionLabel>

                        <div className="flex flex-col gap-4 p-4">
                            <div className="flex flex-col gap-[5px]">
                                <p className="pl-4 text-xs font-semibold">Імʼя в системі (необовʼязково)</p>
                                <Input
                                    control={control}
                                    name="userName"
                                    placeholder="Порожнє — візьметься «Прізвище Імʼя»"
                                    classNameContainer="w-full"
                                />
                            </div>

                            <div className="flex flex-col gap-[5px]">
                                <p className="pl-4 text-xs font-semibold">Логін (пошта)</p>
                                <Input
                                    control={control}
                                    name="login"
                                    type="email"
                                    placeholder="З цією поштою він входитиме"
                                    classNameContainer="w-full"
                                    rules={{
                                        required: 'Логін обовʼязковий',
                                        pattern: {value: EMAIL_PATTERN, message: 'Невірна адреса пошти'},
                                    }}
                                />
                                {errors.login && (
                                    <p className="text-sm text-destructive-foreground">{errors.login.message}</p>
                                )}
                            </div>

                            {/*
                              * Розкладка блоку пароля — точна копія з форми
                              * створення користувача, разом із внутрішнім
                              * `flex flex-col gap-2`. Він тут не для вигляду:
                              * око позиціонується `top-[45%]` від цього
                              * контейнера, і будь-який зайвий рядок усередині
                              * зсуває іконку повз поле.
                              */}
                            <div className="flex flex-col gap-[5px] h-fit">
                                <p className="pl-4 text-xs font-semibold">Пароль</p>
                                <Input
                                    control={control}
                                    name="password"
                                    type="password"
                                    placeholder="Введіть пароль (мін. 6 символів)"
                                    classNameContainer="w-full"
                                    rules={{
                                        required: 'Пароль обовʼязковий',
                                        minLength: {
                                            value: 6,
                                            message: 'Пароль має містити щонайменше 6 символів',
                                        },
                                    }}
                                />
                                <p
                                    onClick={fillGeneratedPassword}
                                    className={'cursor-pointer text-sm text-right'}
                                >
                                    Згенерувати пароль?
                                </p>
                                {errors.password && (
                                    <p className="text-sm text-destructive-foreground">{errors.password.message}</p>
                                )}
                            </div>
                        </div>
                    </div>

                    {serverError && (
                        <p className="text-sm text-destructive-foreground">{serverError}</p>
                    )}

                    <div className="mt-2 flex gap-3">
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
                            Створити дилера
                        </Button>
                    </div>
                </form>

                {isPending && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Loading/>
                    </div>
                )}
            </Modal.Body>
        </Modal>
    );
};

export default DealerCreateModal;
