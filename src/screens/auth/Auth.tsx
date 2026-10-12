import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { Boxes, Loader2 } from 'lucide-react';

import Input from '@/ui/input/Input';
import { Button } from '@/ui/shadcn/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/ui/shadcn/card';
import { ITokenForm } from '@/screens/auth/types/ITokenForm';
import { useAuthViaTokenMutation } from '@/screens/auth/hooks/useAuthViaTokenMutation';

const EMAIL_PATTERN = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

/**
 * Вхід у систему.
 *
 * Було три поля посеред порожньої сторінки: два інпути з англійськими
 * плейсхолдерами замість підписів, кнопка «Login» і жодної згадки, куди
 * людина взагалі увійшла. Помилковий пароль не показував нічого — форма
 * просто нічого не робила у відповідь на натиск.
 *
 * Тепер це картка за зразком проєкту dashboard: назва системи, підписи до
 * полів, показ пароля і зрозуміла відмова. Форма зібрана на `<form>` з
 * `type="submit"` — вхід спрацьовує з клавіатури, а не тільки мишею по кнопці.
 */
const Auth = () => {
    const {
        control,
        handleSubmit,
        formState: { errors },
    } = useForm<ITokenForm>({
        defaultValues: { email: '', password: '' },
    });

    const { mutateAsync: login, isPending } = useAuthViaTokenMutation();

    const [error, setError] = useState<string | null>(null);

    const submitHandler: SubmitHandler<ITokenForm> = async (data) => {
        setError(null);
        try {
            await login(data);
        } catch (err) {
            /*
             * Бек на невірну пару відповідає 401 без пояснень — і не повинен
             * казати більше: «такої пошти немає» перетворило б форму на спосіб
             * перевіряти, хто заведений у системі.
             */
            const status = (err as { response?: { status?: number } })?.response?.status;
            setError(status === 401
                ? 'Невірна пошта або пароль'
                : 'Не вдалося увійти. Спробуйте ще раз');
        }
    };

    return (
        <div className="flex min-h-dvh items-center justify-center bg-background p-4">
            <Card className="w-full max-w-sm">
                <CardHeader className="items-start gap-1">
                    <span className="mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-foreground text-background">
                        <Boxes className="h-5 w-5" />
                    </span>

                    <CardTitle>
                        <span className="font-semibold">FURNI</span>{' '}
                        <span className="text-muted-foreground">CRM</span>
                    </CardTitle>
                    <CardDescription>Алюмінієві фасади — вхід у систему</CardDescription>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleSubmit(submitHandler)} className="flex flex-col gap-4">
                        <div className="flex flex-col gap-1.5">
                            <Input
                                control={control}
                                name="email"
                                type="email"
                                label="Пошта"
                                placeholder="Введіть пошту"
                                autoComplete="username"
                                classNameContainer="w-full"
                                rules={{
                                    required: 'Пошта обовʼязкова',
                                    pattern: { value: EMAIL_PATTERN, message: 'Невірна адреса пошти' },
                                }}
                            />
                            {errors.email && (
                                <p className="text-sm text-destructive-foreground">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="flex flex-col gap-1.5">
                            {/* «Око» малює саме поле — його не треба ставити руками */}
                            <Input
                                control={control}
                                name="password"
                                type="password"
                                label="Пароль"
                                placeholder="Введіть пароль"
                                autoComplete="current-password"
                                classNameContainer="w-full"
                                rules={{ required: 'Пароль обовʼязковий' }}
                            />
                            {errors.password && (
                                <p className="text-sm text-destructive-foreground">{errors.password.message}</p>
                            )}
                        </div>

                        {/*
                          * Помилка в самій формі, а не тостом: вона стосується
                          * того, що людина щойно ввела, і має лишатись перед
                          * очима, доки вона не спробує ще раз.
                          */}
                        {error && (
                            <p className="rounded-md border border-input px-3 py-2 text-sm text-destructive-foreground">
                                {error}
                            </p>
                        )}

                        <Button type="submit" className="w-full" disabled={isPending}>
                            {isPending && <Loader2 className="animate-spin" />}
                            {isPending ? 'Перевіряємо…' : 'Увійти'}
                        </Button>
                    </form>
                </CardContent>
            </Card>
        </div>
    );
};

export default Auth;
