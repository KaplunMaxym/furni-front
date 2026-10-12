import {ModalProps} from "@/hooks/useModal/useModal";
import Modal from "@/ui/Modal/Modal";

import {FC} from "react";
import Button from "../ui/button/Button";
import {cn} from "@/helpers/cn";

interface IConfirmActionModal extends ModalProps {
    isPending: boolean
    onClick: () => Promise<void>
    title?: string
    btnLeft?: string
    btnRight?: string
}

const ConfirmActionModal: FC<IConfirmActionModal> = (
    {
        isPending,
        onClick,
        title = 'Delete confirmation',
        btnLeft = 'Confirm',
        btnRight = 'Cancel',
        ...props
    }) => {
    return (
        <Modal {...props} className={cn('max-w-[420px]',)}>
            <Modal.Title className={'gap-1'} onClose={props.onClose}>{title}</Modal.Title>
            <Modal.Footer className={'gap-5 grid grid-cols-2'}>
                <Button
                    isPending={isPending}
                    onClick={() => onClick().then(props.onClose)}
                >
                    {btnLeft}
                </Button>
                <Button
                    onClick={props.onClose}
                    isDisable={isPending}
                    color={'gray'}
                >
                    {btnRight}
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default ConfirmActionModal;