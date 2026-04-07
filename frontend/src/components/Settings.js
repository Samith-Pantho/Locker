const { useState, useEffect } = React;
const e = React.createElement;

export function Settings() {
    const [settings, setSettings] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.pywebview.api.get_settings().then(res => {
            setSettings(res);
            setLoading(false);
        });
    }, []);

    const updateSetting = (key, value) => {
        const newSettings = { ...settings, [key]: value };
        setSettings(newSettings);
        window.pywebview.api.update_settings(newSettings);
    };

    if (loading) return e('div', null, 'Loading Settings...');

    return e('div', { className: 'view-container' },
        e('div', { className: 'view-header' },
            e('h1', { className: 'view-title' }, 'Settings'),
            e('p', { className: 'view-subtitle' }, 'Manage your security preferences and application appearance.')
        ),

        e('div', { className: 'settings-section' },
            e('div', { className: 'section-title' }, 'Security'),
            e('div', { className: 'section-card' },
                e('div', { className: 'setting-row' },
                    e('div', { className: 'setting-info' },
                        e('h4', null, 'Auto-lock Timer'),
                        e('p', null, 'Automatically lock all folders after inactivity.')
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
                        e('p', null, 'Lock folders when device enters sleep or hibernate mode.')
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
        )

    );
}
