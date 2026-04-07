const getBackend = () => {
    return new Promise((resolve) => {
        if (window.pywebview && window.pywebview.api) {
            resolve(window.pywebview.api);
        } else {
            window.addEventListener('pywebviewready', () => {
                resolve(window.pywebview.api);
            }, { once: true });
            // Fallback for cases where event might have already fired or injection is delayed
            const check = setInterval(() => {
                if (window.pywebview && window.pywebview.api) {
                    clearInterval(check);
                    resolve(window.pywebview.api);
                }
            }, 100);
        }
    });
};

export const api = {
    is_registered: async () => (await getBackend()).is_registered(),
    get_user_info: async () => (await getBackend()).get_user_info(),
    send_verification: async (email) => (await getBackend()).send_verification(email),
    verify_email: async (code) => (await getBackend()).verify_email(code),
    send_master_pin_email: async (email) => (await getBackend()).send_master_pin_email(email),
    get_master_pin: async () => (await getBackend()).get_master_pin(),
    update_master_pin: async (pin) => (await getBackend()).update_master_pin(pin),
    lock_all_folders: async () => (await getBackend()).lock_all_folders(),
    revoke_protection: async (path) => (await getBackend()).revoke_protection(path),
    get_settings: async () => (await getBackend()).get_settings(),
    update_settings: async (s) => (await getBackend()).update_settings(s),
    verify_recovery: async (email, pin) => (await getBackend()).verify_recovery(email, pin),
    select_folder: async () => (await getBackend()).select_folder(),
    setup_auth: async (email, pin) => (await getBackend()).setup_auth(email, pin),
    login: async (code) => (await getBackend()).login(code),
    get_folders: async () => (await getBackend()).get_folders(),
    lock_folder: async (path, password) => (await getBackend()).lock_folder(path, password),
    unlock_folder: async (path, password) => (await getBackend()).unlock_folder(path, password),
    logout: async () => (await getBackend()).logout(),
};
