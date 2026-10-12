import React from 'react';

import { ModalProps } from '@/hooks/useModal/useModal';
import Modal from '@/ui/Modal/Modal';
import CncTemplateEditor from '@/screens/profile-system/component/CncTemplateEditor';
import { ICncProgramTemplate } from '@/screens/profile-system/types/cnc/ICncProgramTemplate';

type Props = ModalProps & {
    template: ICncProgramTemplate | null;
    onSave: (id: number, dto: { name?: string; templateContent?: string }) => void;
    pending: boolean;
};

/**
 * Програма CNC у модалці.
 *
 * Розгортання просто в картці операції не годилося: програма — це триста
 * рядків моноширинного тексту, і вона розсувала картку так, що решта операцій
 * їхала за межі екрана. Модалка дає їй усю ширину вікна й не чіпає сторінку
 * під собою.
 */
const CncTemplateModal: React.FC<Props> = ({ template, onSave, pending, ...props }) => (
    <Modal {...props} className="max-w-[820px]">
        <Modal.Title onClose={props.onClose}>
            Програма CNC
        </Modal.Title>

        <Modal.Body className="flex flex-col">
            {template && (
                <CncTemplateEditor
                    // Ключ по id: при переході на інший шаблон редактор має
                    // змонтуватися заново, інакше в полі лишиться попередній текст
                    key={template.id}
                    template={template}
                    onSave={onSave}
                    pending={pending}
                />
            )}
        </Modal.Body>
    </Modal>
);

export default CncTemplateModal;
