import { FC, useState } from 'react';

import Modal from '@/ui/Modal/Modal';
import { ModalProps } from '@/hooks/useModal/useModal';
import Button from '@/ui/button/Button';
import { Badge } from '@/ui/shadcn/badge';
import { cn } from '@/helpers/cn';
import { refreshIcon } from '@/assets';
import { useIntegrationLogQuery } from '@/screens/integration-log/hooks/useIntegrationLogQuery';
import {
    IIntegrationLog,
    INTEGRATION_LOG_STATUS_LABELS,
} from '@/screens/integration-log/types/IIntegrationLog';
import { formatLogDateTime, formatLogDuration } from '@/screens/integration-log/utils/format';

type Props = ModalProps & {
    /** Рядок, на який натиснули. Потрібен, щоб показати шапку ще до завантаження тіла. */
    log: IIntegrationLog | null;
};

type Tab = 'payload' | 'response';

/**
 * Один запис журналу: що пішло в 1С і що вона відповіла.
 *
 * Два таби, а не все підряд: пакет — це ціле замовлення на кілька сотень
 * рядків, і відповідь під ним ніхто б не знайшов. А шукають зазвичай саме
 * відповідь — через неї й зрозуміло, чому обмін упав.
 */
const IntegrationLogModal: FC<Props> = ({ log, ...props }) => {
    const [tab, setTab] = useState<Tab>('payload');
    const { data, isPending, isError } = useIntegrationLogQuery(props.open ? log?.id ?? null : null);

    const payloadText = data ? JSON.stringify(data.payload, null, 2) : '';

    /*
     * Відповідь 1С приходить текстом, і це може бути як JSON, так і сторінка
     * помилки від веб-сервера. Тому форматуємо лише те, що справді JSON, а
     * решту показуємо як є: зіпсувати HTML спробою розібрати його як JSON —
     * найшвидший спосіб сховати причину збою.
     */
    const responseText = (() => {
        if (!data?.response) return '';
        try {
            return JSON.stringify(JSON.parse(data.response), null, 2);
        } catch {
            return data.response;
        }
    })();

    const copy = (value: string) => {
        void navigator.clipboard?.writeText(value);
    };

    const activeText = tab === 'payload' ? payloadText : responseText;

    return (
        <Modal {...props} className="max-w-[900px]">
            <Modal.Title className="gap-2" onClose={props.onClose}>
                <div className="flex flex-wrap items-center gap-2">
                    <span>Обмін з 1С</span>
                    {log && (
                        <>
                            <Badge variant={log.status === 'SUCCESS' ? 'success' : 'destructive'}>
                                {INTEGRATION_LOG_STATUS_LABELS[log.status]}
                            </Badge>
                            {log.order && (
                                <span className="font-mono text-xs text-muted-foreground">
                                    № {log.order.orderNumber}
                                </span>
                            )}
                            <span className="text-xs font-normal text-muted-foreground">
                                {formatLogDateTime(log.createdAt)}
                            </span>
                        </>
                    )}
                </div>
            </Modal.Title>

            <Modal.Body className="gap-4">
                {log && (
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                        <span>
                            Замовлення:{' '}
                            <span className="text-foreground">
                                {log.order ? log.order.name || `№ ${log.order.orderNumber}` : '—'}
                            </span>
                        </span>
                        <span>
                            Користувач: <span className="text-foreground">{log.user?.name ?? '—'}</span>
                        </span>
                        <span>
                            Код відповіді: <span className="text-foreground">{log.httpStatus ?? '—'}</span>
                        </span>
                        <span>
                            Тривалість:{' '}
                            <span className="text-foreground">{formatLogDuration(log.durationMs)}</span>
                        </span>
                    </div>
                )}

                {/* Помилка — найважливіше в записі, тому над табами, а не всередині */}
                {log?.error && (
                    <div className="rounded-md border border-destructive/40 bg-destructive/10 p-3">
                        <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">
                            Помилка
                        </p>
                        <p className="whitespace-pre-wrap break-words text-sm text-foreground">
                            {log.error}
                        </p>
                    </div>
                )}

                <div className="flex items-center justify-between gap-3">
                    <div className="flex gap-1 rounded-md border border-input p-1">
                        {(['payload', 'response'] as Tab[]).map(value => (
                            <button
                                key={value}
                                type="button"
                                onClick={() => setTab(value)}
                                className={cn(
                                    'cursor-pointer rounded px-3 py-1 text-sm transition-colors',
                                    tab === value
                                        ? 'bg-secondary text-foreground'
                                        : 'text-muted-foreground hover:text-foreground',
                                )}
                            >
                                {value === 'payload' ? 'Пакет до 1С' : 'Відповідь 1С'}
                            </button>
                        ))}
                    </div>

                    <Button
                        color="transparent"
                        className="mx-0 h-9 w-auto"
                        onClick={() => copy(activeText)}
                        disabled={!activeText}
                    >
                        Скопіювати
                    </Button>
                </div>

                <div className="max-h-[50vh] overflow-auto rounded-md border border-input bg-background p-3">
                    {isPending && (
                        <div className="flex h-6 w-full animate-spin justify-center">
                            <img src={refreshIcon} alt="оновлення" />
                        </div>
                    )}

                    {isError && (
                        <p className="text-sm text-destructive-foreground">
                            Не вдалося завантажити запис журналу
                        </p>
                    )}

                    {!isPending && !isError && (
                        <pre className="whitespace-pre-wrap break-words font-mono text-xs leading-relaxed text-foreground">
                            {activeText || (tab === 'response'
                                ? 'Відповіді немає: до 1С не дійшло або відправка вимкнена'
                                : 'Пакет не збережено')}
                        </pre>
                    )}
                </div>
            </Modal.Body>
        </Modal>
    );
};

export default IntegrationLogModal;
