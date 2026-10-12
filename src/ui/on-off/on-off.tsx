import {cn} from "@/helpers/cn";
import {ComponentProps, FC} from "react";

interface IOnOffProps extends ComponentProps<'span'> {
    isActive: boolean;
}

export const OnOff: FC<IOnOffProps> = ({className, isActive, ...props}) => {
    return (
        <span
            className={cn('duration-300', isActive ? 'text-chart-2' : 'text-destructive-foreground', className)}
            {...props}
        >
            {isActive ? 'on' : 'off'}
        </span>
    )
}