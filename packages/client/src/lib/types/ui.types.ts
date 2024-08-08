export type TComponentType = "success" | "info" | "warn" | "error";

export type TAlert = {
    id: string;
    visible: boolean;
    type: TComponentType;
    message?: string;
    buttonText?: string;
    duration?: number;
};

export interface IDropdownItem<TKeyString, TObjectProperties = null> {
    key: TKeyString;
    icon?: string;
    label: string;
    children?: IDropdownItem<TKeyString, TObjectProperties>[];
    onClick?: () => void;
}
