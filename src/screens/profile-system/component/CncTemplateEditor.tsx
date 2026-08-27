import React, { useCallback, useEffect, useRef, useState } from "react";
import { ICncProgramTemplate } from "@/screens/profile-system/types/cnc/ICncProgramTemplate";

export interface CncTemplateEditorProps {
    template: ICncProgramTemplate;
    onSave: (id: number, dto: { name?: string; templateContent?: string }) => void;
    pending: boolean;
}

const PLACEHOLDER_RE = /(\{\{[^}]+\}\})/g;

function parseSegments(raw: string): Array<{ type: "text" | "token"; value: string }> {
    const parts = raw.split(PLACEHOLDER_RE);
    return parts.map(p => ({
        type: PLACEHOLDER_RE.test(p) ? "token" : "text",
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
                const inner = seg.value.slice(2, -2); // strip {{ }}
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

const CncTemplateEditor: React.FC<CncTemplateEditorProps> = ({ template, onSave, pending }) => {
    const [editingContent, setEditingContent] = useState(false);

    const editorRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (editingContent && editorRef.current) {
            editorRef.current.innerHTML = textToHtml(template.templateContent);
            const range = document.createRange();
            range.selectNodeContents(editorRef.current);
            range.collapse(false);
            const sel = window.getSelection();
            sel?.removeAllRanges();
            sel?.addRange(range);
        }
    }, [editingContent, template.templateContent]);

    const handleSaveContent = useCallback(() => {
        if (!editorRef.current) return;
        onSave(template.id, { templateContent: domToText(editorRef.current) });
        setEditingContent(false);
    }, [onSave, template.id]);

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
        if (parent?.dataset.token) {
            e.preventDefault();
        }
    };

    return (
        <>
            <style>{`
                .cnc-token {
                    display: inline-block;
                    font-family: ui-monospace, monospace;
                    font-size: 0.7rem;
                    line-height: 1.4;
                    background: #166534;
                    color: #bbf7d0;
                    border: 1px solid #15803d;
                    border-radius: 4px;
                    padding: 0 5px;
                    margin: 0 1px;
                    cursor: not-allowed;
                    user-select: none;
                }
                .cnc-editor {
                    font-family: ui-monospace, 'Cascadia Code', 'Fira Code', monospace;
                    font-size: 0.72rem;
                    line-height: 1.7;
                    background: #030712;
                    color: #4ade80;
                    border: 1px solid #374151;
                    border-radius: 6px;
                    padding: 10px 12px;
                    min-height: 280px;
                    max-height: 480px;
                    overflow-y: auto;
                    outline: none;
                    white-space: pre-wrap;
                    word-break: break-all;
                }
                .cnc-editor:focus {
                    border-color: #16a34a;
                    box-shadow: 0 0 0 2px rgba(22,163,74,0.25);
                }
            `}</style>

            <div className="space-y-3">
                <div className="flex flex-row items-center gap-2">
                    <span className="text-xs text-gray-400 uppercase">Назва шаблону</span>
                    <span className="text-sm font-mono font-medium">
                        {template.name ?? <span className="text-gray-400 italic">Без назви</span>}
                    </span>
                </div>

                <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                        <span className="text-xs text-gray-400 uppercase">CNC Програма</span>
                        {!editingContent && (
                            <button
                                onClick={() => setEditingContent(true)}
                                className="text-xs text-green-600 hover:text-green-700 underline"
                            >
                                Редагувати
                            </button>
                        )}
                    </div>

                    {editingContent ? (
                        <div className="flex flex-col gap-2">
                            <p className="text-xs text-gray-400">
                                Елементи{" "}
                                <span className="cnc-token" style={{ cursor: "default" }}>змінна</span>
                                {" "}є динамічною — їх не можна редагувати вручну.
                            </p>
                            <div
                                ref={editorRef}
                                contentEditable
                                suppressContentEditableWarning
                                spellCheck={false}
                                className="cnc-editor"
                                onPaste={handlePaste}
                                onKeyDown={handleKeyDown}
                            />
                            <div className="flex gap-2">
                                <button
                                    disabled={pending}
                                    onClick={handleSaveContent}
                                    className="text-xs px-3 py-1.5 bg-emerald/500 font-bold text-white rounded hover:bg-emerald/600 disabled:opacity-50"
                                >
                                    Зберегти
                                </button>
                                <button
                                    onClick={() => setEditingContent(false)}
                                    className="text-xs px-3 py-1.5 bg-red/600 font-bold rounded hover:bg-red/500"
                                >
                                    Скасувати
                                </button>
                            </div>
                        </div>
                    ) : (
                        <pre className="font-mono text-xs bg-gray-950 text-green-400 rounded p-3 overflow-x-auto max-h-48 border border-gray-700 whitespace-pre-wrap">
                            {parseSegments(template.templateContent).map((seg, i) =>
                                seg.type === "token" ? (
                                    <span key={i} className="cnc-token" style={{ cursor: "default" }}>
                                        {seg.value.slice(2, -2)}
                                    </span>
                                ) : (
                                    <React.Fragment key={i}>{seg.value}</React.Fragment>
                                )
                            )}
                        </pre>
                    )}
                </div>
            </div>
        </>
    );
};

export default CncTemplateEditor;