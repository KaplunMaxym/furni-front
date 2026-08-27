import { RefreshCw } from 'lucide-react';
import { useOrderRecalculateMutation } from "@/screens/order/hooks/order/useOrderRecalculateMutation";
import React from "react";
import Button from "@/ui/button/Button";

interface RecalculateButtonProps {
    orderId: number;
}

const RecalculateButton: React.FC<RecalculateButtonProps> = ({ orderId }) => {
    const { mutate, isPending } = useOrderRecalculateMutation(orderId);

    return (
        <Button
            color="grayGreen"
            isPending={isPending}
            className="w-auto mx-0 py-0 h-[40px]"
            onClick={() => mutate()}
        >
            <RefreshCw size={15} />
            Перерахувати вартість
        </Button>
    );
};

export default RecalculateButton;