import { useEffect, useState } from 'react';

import MainLayout from '@/ui/layouts/main-layout/MainLatout';
import PageHeader from '@/ui/page-header/PageHeader';
import Button from '@/ui/button/Button';
import { cn } from '@/helpers/cn';
import { refreshIcon } from '@/assets';
import { useSettingsMutation, useSettingsQuery } from '@/screens/settings/hooks/useSettings';
import { ISetting } from '@/screens/settings/types/ISetting';

/**
 * Глобальні налаштування системи.
 *
 * Сторінка малюється з того, що віддав бек: підписи, межі й варіанти приходять
 * разом зі значеннями. Нове налаштування з'являється тут саме, без правок на
 * фронті — інакше кожен параметр доводилося б заводити двічі й у двох репозиторіях.
 *
 * Зберігається все одразу, а не по полю: значення однієї групи мають сенс лише
 * разом, і автозбереження на кожен натиск лишало б систему на мить із новим
 * лімітом і старим правилом.
 */
const Settings = () => {
    const { data, isPending, isError } = useSettingsQuery();
    const { mutateAsync: save, isPending: isSaving } = useSettingsMutation();

    const [draft, setDraft] = useState<Record<string, string>>({});

    useEffect(() => {
        if (!data) return;

        setDraft(Object.fromEntries(data.map(item => [item.key, item.value])));
    }, [data]);

    const isDirty = !!data?.some(item => draft[item.key] !== undefined && draft[item.key] !== item.value);

    const groups = [...new Set(data?.map(item => item.group) ?? [])];

    const handleSave = async () => {
        if (!data) return;

        await save({
            settings: data
                .filter(item => draft[item.key] !== item.value)
                .map(item => ({ key: item.key, value: draft[item.key] })),
        });
    };

    const handleReset = () => {
        if (!data) return;

        setDraft(Object.fromEntries(data.map(item => [item.key, item.value])));
    };

    return (
        <MainLayout>
            <div className="flex w-full flex-col gap-3">
                <PageHeader
                    title="Налаштування"
                    description="Параметри, що діють на всю систему"
                    actions={
                        <div className="flex items-center gap-2">
                            <Button
                                color="transparent"
                                className="mx-0 h-9 w-auto"
                                onClick={handleReset}
                                disabled={!isDirty || isSaving}
                            >
                                Скасувати
                            </Button>
                            <Button
                                color="grayGreen"
                                className="mx-0 h-9 w-auto"
                                onClick={handleSave}
                                disabled={!isDirty}
                                isPending={isSaving}
                            >
                                Зберегти
                            </Button>
                        </div>
                    }
                />

                {isPending && (
                    <div className="flex h-6 w-full animate-spin justify-center">
                        <img src={refreshIcon} alt="оновлення" />
                    </div>
                )}

                {isError && (
                    <p className="text-sm text-destructive-foreground">
                        Не вдалося завантажити налаштування
                    </p>
                )}

                {groups.map(group => (
                    <div key={group} className="overflow-hidden rounded-xl border border-border bg-card">
                        <div className="border-b border-border px-4 py-3">
                            <p className="text-sm font-medium text-foreground">{group}</p>
                        </div>

                        <div className="flex flex-col divide-y divide-border">
                            {data
                                ?.filter(item => item.group === group)
                                .map(item => (
                                    <SettingRow
                                        key={item.key}
                                        setting={item}
                                        value={draft[item.key] ?? item.value}
                                        onChange={value =>
                                            setDraft(prev => ({ ...prev, [item.key]: value }))
                                        }
                                    />
                                ))}
                        </div>
                    </div>
                ))}
            </div>
        </MainLayout>
    );
};

interface SettingRowProps {
    setting: ISetting;
    value: string;
    onChange: (value: string) => void;
}

const SettingRow = ({ setting, value, onChange }: SettingRowProps) => {
    const isChanged = value !== setting.value;
    const isDefault = value === setting.default;

    return (
        <div className="flex flex-col gap-3 px-4 py-4 md:flex-row md:items-start md:justify-between">
            <div className="max-w-[560px]">
                <div className="flex items-center gap-2">
                    <p className="text-sm text-foreground">{setting.title}</p>
                    {isChanged && (
                        <span className="rounded bg-muted px-1.5 py-0.5 text-[11px] text-muted-foreground">
                            не збережено
                        </span>
                    )}
                </div>
                <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                    {setting.description}
                </p>
                {!isDefault && (
                    <button
                        type="button"
                        onClick={() => onChange(setting.default)}
                        className="mt-1.5 cursor-pointer text-xs text-muted-foreground underline-offset-2 hover:underline"
                    >
                        Повернути стандартне ({setting.default})
                    </button>
                )}
            </div>

            <div className="flex w-full shrink-0 flex-col gap-1.5 md:w-[320px]">
                {setting.type === 'number' ? (
                    <input
                        type="number"
                        value={value}
                        min={setting.min}
                        max={setting.max}
                        onChange={event => onChange(event.target.value)}
                        className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm tabular-nums text-foreground outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                    />
                ) : (
                    <div className="flex flex-col gap-1.5">
                        {setting.options?.map(option => (
                            <label
                                key={option.value}
                                className={cn(
                                    'flex cursor-pointer flex-col rounded-md border px-3 py-2 transition-colors',
                                    value === option.value
                                        ? 'border-ring bg-muted'
                                        : 'border-input hover:bg-muted/50',
                                )}
                            >
                                <span className="flex items-center gap-2 text-sm text-foreground">
                                    <input
                                        type="radio"
                                        name={setting.key}
                                        checked={value === option.value}
                                        onChange={() => onChange(option.value)}
                                        className="accent-current"
                                    />
                                    {option.label}
                                </span>
                                {/* Приклад перетворення — коротший шлях зрозуміти варіант, ніж опис */}
                                <span className="ml-6 font-mono text-[11px] text-muted-foreground">
                                    {option.hint}
                                </span>
                            </label>
                        ))}
                    </div>
                )}

                {setting.type === 'number' && (setting.min !== undefined || setting.max !== undefined) && (
                    <span className="text-[11px] text-muted-foreground">
                        від {setting.min ?? '—'} до {setting.max ?? '—'}
                    </span>
                )}
            </div>
        </div>
    );
};

export default Settings;
