import React, { useCallback, useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/ui/shadcn/button";
import { ICncProgramTemplate } from "@/screens/profile-system/types/cnc/ICncProgramTemplate";

export interface CncTemplateEditorProps {
    template: ICncProgramTemplate;
    onSave: (id: number, dto: { name?: string; templateContent?: string }) => void;
    pending: boolean;
}

const PLACEHOLDER_RE = /(\{\{[^}]+\}\})/g;

/**
 * Колір підстановок — той самий, що токен `chart-2` у tailwind.config.
 *
 * Тут він літералом, бо клас Tailwind до вмісту `contenteditable` не
 * застосуєш: розмітку всередині збирає `textToHtml` рядком, і Tailwind її
 * не бачить під час збірки. CSS-змінних тема не експонує.
 */
const TOKEN_COLOR = '#00BC7D';

function parseSegments(raw: string): Array<{ type: "text" | "token"; value: string }> {
    // split зі захопленням лишає роздільники в масиві — так текст і підстановки
    // йдуть у тому ж порядку, що в програмі
    return raw.split(PLACEHOLDER_RE).map(p => ({
        type: /^\{\{[^}]+\}\}$/.test(p) ? "token" : "text",
        value: p,
    }));
}

function domToText(el: HTMLElement): string {
    let result = "";
    el.childNodes.forEach(node => {
        if (node.nodeType === Node.TEXT_NODE) {
            result += node.textContent ?? "";
        } else if (node instanceof HTMLElement) {
            if (node.dataset.token) {
                result += node.dataset.token;
            } else if (node.tagName === "BR") {
                result += "\n";
            } else {
                result += node.textContent ?? "";
            }
        }
    });
    return result;
}

function textToHtml(raw: string): string {
    return parseSegments(raw)
        .map(seg => {
            if (seg.type === "token") {
                const inner = seg.value.slice(2, -2); // прибираємо {{ }}
                return `<span contenteditable="false" data-token="${seg.value}" class="cnc-token">${inner}</span>`;
            }
            return seg.value
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/\n/g, "<br>");
        })
        .join("");
}

/**
 * Редактор програми CNC.
 *
 * Поле редагування відкрите одразу. Раніше спершу показувався той самий текст
 * у режимі «тільки читання», і щоб щось змінити, треба було ще натиснути
 * «Редагувати» — два кроки й два однакові на вигляд екрани заради одного.
 *
 * Кнопка збереження при цьому лишилася явною, на відміну від решти полів
 * сторінки: це керуюча програма верстата, і відправляти її на сервер на кожен
 * натиск клавіші — не те саме, що зберегти зміщення отвору.
 */
const CncTemplateEditor: React.FC<CncTemplateEditorProps> = ({ template, onSave, pending }) => {
    const [isDirty, setIsDirty] = useState(false);
    const editorRef = useRef<HTMLDivElement>(null);

    /*
     * Розмітку кладемо руками, а не через JSX.
     *
     * Вміст `contenteditable` React перемальовувати не може: він не знає про
     * правки користувача й на кожному рендері затирав би набране. Тому
     * записуємо innerHTML один раз на кожну нову версію з сервера.
     */
    useEffect(() => {
        if (!editorRef.current) return;
        editorRef.current.innerHTML = textToHtml(template.templateContent);
        setIsDirty(false);
    }, [template.templateContent]);

    const handleSave = useCallback(() => {
        if (!editorRef.current) return;
        onSave(template.id, { templateContent: domToText(editorRef.current) });
        setIsDirty(false);
    }, [onSave, template.id]);

    const handleReset = useCallback(() => {
        if (!editorRef.current) return;
        editorRef.current.innerHTML = textToHtml(template.templateContent);
        setIsDirty(false);
    }, [template.templateContent]);

    const handlePaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
        e.preventDefault();
        const text = e.clipboardData.getData("text/plain");
        document.execCommand("insertHTML", false, textToHtml(text));
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        const sel = window.getSelection();
        if (!sel || sel.rangeCount === 0) return;

        const node = sel.getRangeAt(0).startContainer;
        const parent = node instanceof HTMLElement ? node : node.parentElement;

        // Підстановку не можна правити руками — її значення підставляє генератор
        if (parent?.dataset.token) e.preventDefault();
    };

    return (
        <>
            <style>{`
                .cnc-token {
                    display: inline-block;
                    font-family: ui-monospace, monospace;
                    font-size: 0.7rem;
                    line-height: 1.4;
                    background: ${TOKEN_COLOR}26;
                    color: ${TOKEN_COLOR};
                    border: 1px solid ${TOKEN_COLOR}66;
                    border-radius: 4px;
                    padding: 0 5px;
                    margin: 0 1px;
                    cursor: not-allowed;
                    user-select: none;
                }
                .cnc-surface {
                    font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
                    font-size: 0.72rem;
                    line-height: 1.7;
                    white-space: pre-wrap;
                    word-break: break-all;
                }
            `}</style>

            <div className="flex flex-col gap-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex min-w-0 items-center gap-2">
                        <span className="text-[11px] uppercase tracking-wide text-muted-foreground">
                            Назва
                        </span>
                        <span className="truncate font-mono text-sm text-foreground">
                            {template.name ?? <span className="italic text-muted-foreground">без назви</span>}
                        </span>
                    </div>

                    <p className="text-xs text-muted-foreground">
                        Виділені <span className="cnc-token" style={{ cursor: "default" }}>змінні</span>{" "}
                        підставляє генератор
                    </p>
                </div>

                <div
                    ref={editorRef}
                    contentEditable
                    suppressContentEditableWarning
                    spellCheck={false}
                    onInput={() => setIsDirty(true)}
                    onPaste={handlePaste}
                    onKeyDown={handleKeyDown}
                    className={[
                        'cnc-surface max-h-[480px] min-h-[280px] overflow-y-auto rounded-md',
                        'border border-input bg-background p-3 text-foreground outline-none',
                        'focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50',
                    ].join(' ')}
                />

                {/* Кнопки з'являються, тільки коли є що зберігати */}
                {isDirty && (
                    <div className="flex gap-2">
                        <Button type="button" onClick={handleSave} disabled={pending} className="w-[140px]">
                            {pending ? (
                                <><Loader2 size={14} className="animate-spin" /> Зберігаємо…</>
                            ) : 'Зберегти'}
                        </Button>
                        <Button type="button" variant="secondary" onClick={handleReset} disabled={pending}>
                            Скасувати зміни
                        </Button>
                    </div>
                )}
            </div>
        </>
    );
};

export default CncTemplateEditor;
