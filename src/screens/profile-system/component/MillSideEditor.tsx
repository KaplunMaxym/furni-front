import React, {useState} from "react";
import { useForm } from "react-hook-form";
import Input from "@/ui/input/Input";
import { DrillSide, MillSideOption, MillSideParams } from "@/screens/profile-system/types/OperationDetailsType";

export interface MillSideEditorProps {
    side: DrillSide;
    params: MillSideParams | undefined;
    onSave: (side: DrillSide, field: keyof MillSideParams, value: number | MillSideOption) => void;
    pending: boolean;
}

interface MillForm {
    millLength: number;
}

const MillSideEditor: React.FC<MillSideEditorProps> = ({ side, params, onSave, pending }) => {
    const [editing, setEditing] = useState(false);

    const { control, handleSubmit, reset } = useForm<MillForm>({
        defaultValues: { millLength: params?.millLength ?? 0 },
    });

    const handleSave = handleSubmit((data) => {
        onSave(side, "millLength", data.millLength);
        setEditing(false);
    });

    const handleCancel = () => {
        reset({ millLength: params?.millLength ?? 0 });
        setEditing(false);
    };

    return (
        <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-row pt-4 items-center gap-4">
                <span className="text-xs w-auto text-gray-400 uppercase">Mill Length</span>
                {editing ? (
                    <div className="flex gap-1 items-center">
                        <Input
                            control={control}
                            name="millLength"
                            type="number"
                            classNameContainer="mb-0"
                            className="text-sm"
                            onKeyDown={(e) => {
                                if (e.key === "Enter") handleSave();
                                if (e.key === "Escape") handleCancel();
                            }}
                        />
                        <button
                            onClick={handleSave}
                            disabled={pending}
                            className="text-xs px-2 py-1 bg-emerald/500 text-white rounded hover:bg-emerald/600 disabled:opacity-50 whitespace-nowrap"
                        >
                            Зберегти
                        </button>
                        <button
                            onClick={handleCancel}
                            className="text-xs px-2 py-1 bg-red/600 font-bold rounded hover:bg-red/500 whitespace-nowrap"
                        >
                            Скасувати
                        </button>
                    </div>
                ) : (
                    <div
                        className="flex items-center gap-1 group cursor-pointer"
                        onClick={() => { reset({ millLength: params?.millLength ?? 0 }); setEditing(true); }}
                    >
                        <span className="text-sm font-medium">
                            {params?.millLength ?? <span className="text-gray-400 italic">—</span>}
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 text-xs text-green-600">✎</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MillSideEditor;