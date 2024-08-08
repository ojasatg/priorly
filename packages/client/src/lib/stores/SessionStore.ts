import { get, writable } from "svelte/store";

const useSessionStore = () => {
    const csrfToken = writable("");

    function setCSRFToken(token: string) {
        csrfToken.set(token);
    }

    function getCSRFToken() {
        return get(csrfToken);
    }

    return {
        setCSRFToken,
        getCSRFToken,
    };
};

const sessionStore = useSessionStore();

export default sessionStore;
