const { useState, useEffect } = React;
const e = React.createElement;

export function SettingsView({ onSettingsUpdate }) {
    const [settings, setSettings] = useState({
        autoLockTimer: 15,
        lockOnSleep: true
    });

    useEffect(() => {
        window.pywebview.api.get_settings().then(setSettings);
    }, []);

    const updateSetting = async (key, val) => {
        const newSettings = { ...settings, [key]: val };
        setSettings(newSettings);
        await window.pywebview.api.update_settings(newSettings);
        if (onSettingsUpdate) onSettingsUpdate(newSettings);
    };

    const renderHeader = () => e('div', { className: 'view-header' },
        e('h1', { className: 'view-title' }, 'Application Settings'),
        e('p', { className: 'view-subtitle' }, 'Configure your vault preferences and security policies.')
    );

    const renderSection = (title, description, children) => e('div', { className: 'settings-section' },
        e('div', { className: 'section-title', style: { marginBottom: '16px', fontWeight: '700' } }, title),
        e('div', { className: 'section-card' }, children)
    );

    return e('div', { className: 'view-container' },
        renderHeader(),



        renderSection('Security Policies', 'Configure how the vault behaves automatically.',
            e('div', null,
                e('div', { className: 'setting-row' },
                    e('div', { className: 'setting-info' },
                        e('h4', null, 'Auto-lock Timer'),
                        e('p', null, 'Lock folders after a period of inactivity.')
                    ),
                    e('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                        e('input', {
                            type: 'range', min: 1, max: 60,
                            value: settings.autoLockTimer,
                            onChange: (evt) => updateSetting('autoLockTimer', parseInt(evt.target.value))
                        }),
                        e('span', { style: { minWidth: '35px', fontWeight: '600' } }, `${settings.autoLockTimer}m`)
                    )
                ),
                e('div', { className: 'setting-row' },
                    e('div', { className: 'setting-info' },
                        e('h4', null, 'Lock on Sleep'),
                        e('p', null, 'Automatically lock when the device sleeps.')
                    ),
                    e('label', { className: 'switch' },
                        e('input', {
                            type: 'checkbox',
                            checked: settings.lockOnSleep,
                            onChange: (evt) => updateSetting('lockOnSleep', evt.target.checked)
                        }),
                        e('span', { className: 'slider' })
                    )
                )
            )
        ),

        renderSection('Password Policies', 'Define requirements for folder passwords.',
            e('div', null,
                e('div', { className: 'setting-row' },
                    e('div', { className: 'setting-info' },
                        e('h4', null, 'Minimum Length'),
                        e('p', null, 'Required number of characters (4-32).')
                    ),
                    e('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                        e('input', {
                            type: 'range', min: 4, max: 32,
                            value: settings.minPasswordLength || 8,
                            onChange: (evt) => updateSetting('minPasswordLength', parseInt(evt.target.value))
                        }),
                        e('span', { style: { minWidth: '35px', fontWeight: '600', textAlign: 'right' } }, settings.minPasswordLength || 8)
                    )
                ),
                e('div', { className: 'setting-row' },
                    e('div', { className: 'setting-info' },
                        e('h4', null, 'Require Numbers'),
                        e('p', null, 'Password must contain at least one number.')
                    ),
                    e('label', { className: 'switch' },
                        e('input', {
                            type: 'checkbox',
                            checked: settings.requireNumbers ?? true,
                            onChange: (evt) => updateSetting('requireNumbers', evt.target.checked)
                        }),
                        e('span', { className: 'slider' })
                    )
                ),
                e('div', { className: 'setting-row' },
                    e('div', { className: 'setting-info' },
                        e('h4', null, 'Require Symbols'),
                        e('p', null, 'Password must contain at least one special character.')
                    ),
                    e('label', { className: 'switch' },
                        e('input', {
                            type: 'checkbox',
                            checked: settings.requireSymbols ?? true,
                            onChange: (evt) => updateSetting('requireSymbols', evt.target.checked)
                        }),
                        e('span', { className: 'slider' })
                    )
                ),
                e('div', { className: 'setting-row', style: { borderBottom: 'none' } },
                    e('div', { className: 'setting-info' },
                        e('h4', null, 'Require Uppercase'),
                        e('p', null, 'Password must contain at least one uppercase letter.')
                    ),
                    e('label', { className: 'switch' },
                        e('input', {
                            type: 'checkbox',
                            checked: settings.requireUppercase ?? false,
                            onChange: (evt) => updateSetting('requireUppercase', evt.target.checked)
                        }),
                        e('span', { className: 'slider' })
                    )
                )
            )
        )
    );
}
