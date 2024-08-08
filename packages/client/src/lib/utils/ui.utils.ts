import { twMerge } from "tailwind-merge";
import { clsx, type ClassArray } from "clsx";

export function generateRandomDOMId() {
    return "_" + Math.random().toString(36).substr(2, 9);
}

export function appendPlural(label: string, count: number) {
    if (count > 1) {
        return label + "s";
    }
    return label;
}

export function cn(...args: ClassArray) {
    return twMerge(clsx(args));
}
