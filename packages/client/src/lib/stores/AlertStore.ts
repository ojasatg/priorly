import type { TAlert, TComponentType } from "$lib/types/ui.types";
import { generateRandomDOMId } from "$lib/utils";
import { derived, writable } from "svelte/store";

interface IShowAlertParams {
    type: TComponentType;
    message?: string;
    buttonText?: string;
    duration?: number;
}

const useAlertStore = () => {
    const _alerts = writable<TAlert[]>([]);

    function showAlert(params: IShowAlertParams) {
        if (params.message) {
            const newAlert: TAlert = {
                id: generateRandomDOMId(),
                visible: true,
                type: params.type,
                message: params.message,
                buttonText: params.buttonText,
                duration: params.duration ?? 5000,
            };

            _alerts.update((prev) => [...prev, newAlert]);
        }
    }

    const alerts = derived(_alerts, ($_alerts, set) => {
        set($_alerts);
        if ($_alerts.length > 0) {
            const timer = setTimeout(() => {
                _alerts.update((state) => {
                    state.shift();
                    return state;
                });
            }, $_alerts[0].duration);
            return () => {
                clearTimeout(timer);
            };
        }
    });
    const { subscribe } = alerts;

    return {
        subscribe,
        showAlert,

        success: (message?: string, duration?: number) =>
            showAlert({ type: "success", message, duration }),
        info: (message?: string, duration?: number) =>
            showAlert({ type: "info", message, duration }),
        warning: (message?: string, duration?: number) =>
            showAlert({ type: "warn", message, duration }),
        error: (message?: string, duration?: number) =>
            showAlert({ type: "error", message, duration }),
    };
};

export const alerts = useAlertStore();
