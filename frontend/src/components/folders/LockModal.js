const { useState, useEffect } = React;
const e = React.createElement;

export function LockModal({ path, settings, onLock, onCancel, onChangeFolder }) {
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [hint, setHint] = useState('');
    const [showPass, setShowPass] = useState(false);

    // Validation logic
    const reqs = [];
    const minLen = settings?.minPasswordLength || 8;
    reqs.push({ id: 'len', label: `At least ${minLen} characters long`, test: p => p.length >= minLen });
    
    if (settings?.requireUppercase) {
        reqs.push({ id: 'upper', label: 'Include at least one uppercase letter', test: p => /[A-Z]/.test(p) });
    }
    if (settings?.requireNumbers !== false) {
        reqs.push({ id: 'num', label: 'Include at least one number (0-9)', test: p => /[0-9]/.test(p) });
    }
    if (settings?.requireSymbols !== false) {
        reqs.push({ id: 'special', label: 'Include at least one special character (!@#$)', test: p => /[!@#$%^&*(),.?":{}|<>]/.test(p) });
    }

    const match = password === confirm && password.length > 0;
    const isValid = reqs.every(r => r.test(password)) && match;

    const getStrength = (p) => {
        if (!p) return { label: 'None', color: '#e2e8f0', width: '0%' };
        const score = reqs.filter(r => r.test(p)).length;
        const ratio = score / Math.max(reqs.length, 1);
        if (ratio <= 0.3) return { label: 'Weak', color: '#ef4444', width: '25%' };
        if (ratio <= 0.75) return { label: 'Medium', color: '#f59e0b', width: '60%' };
        return { label: 'Strong', color: '#10b981', width: '100%' };
    };

    const strength = getStrength(password);

    return e('div', { className: 'modal-overlay' },
        e('div', { className: 'modal-content', style: { width: '90vw', maxWidth: '500px' } },
            e('div', { className: 'modal-header' },
                e('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    e('span', { className: 'alert-icon-success', style: { width: '24px', height: '24px', fontSize: '12px' } }, e('i', { className: 'fas fa-lock' })),
                    e('h3', { style: { margin: 0 } }, 'Lock Folder')
                ),
                e('button', { className: 'btn-round', onClick: onCancel }, e('i', { className: 'fas fa-times' }))
            ),
            e('div', { className: 'modal-body' },
                e('div', { className: 'form-group' },
                    e('label', { className: 'form-label' }, 'Selected Folder'),
                    e('div', { className: 'path-preview', style: { justifyContent: 'space-between' } },
                        e('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' } },
                            e('i', { className: 'fas fa-folder', style: { color: 'var(--primary-color)' } }),
                            e('span', { style: { whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' } }, path)
                        ),
                        e('button', { className: 'btn btn-ghost', style: { padding: '4px 12px', fontSize: '12px', border: '1px solid #e2e8f0' }, onClick: onChangeFolder }, 'Change')
                    )
                ),

                e('div', { className: 'form-group' },
                    e('label', { className: 'form-label' }, 'Set Folder Password'),
                    e('div', { className: 'input-container' },
                        e('input', {
                            type: showPass ? 'text' : 'password',
                            className: 'form-input',
                            style: { borderColor: (password && strength.label === 'Weak') ? 'var(--danger)' : '' },
                            value: password, onChange: e => setPassword(e.target.value)
                        }),
                        e('span', {
                            style: { position: 'absolute', right: '12px', cursor: 'pointer', opacity: 0.5 },
                            onClick: () => setShowPass(!showPass)
                        }, e('i', { className: `fas ${showPass ? 'fa-eye' : 'fa-eye-slash'}` }))
                    ),
                    e('div', { style: { marginTop: '12px' } },
                        e('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '8px', textTransform: 'uppercase' } },
                            e('span', null, 'Password Strength'),
                            e('span', { style: { color: strength.color } }, strength.label)
                        ),
                        e('div', { style: { height: '4px', background: '#f1f5f9', borderRadius: '2px', overflow: 'hidden' } },
                            e('div', { style: { height: '100%', width: strength.width, background: strength.color, transition: 'all 0.3s' } })
                        )
                    )
                ),

                e('div', { className: 'form-group' },
                    e('label', { className: 'form-label' }, 'Confirm Password'),
                    e('input', {
                        type: 'password',
                        className: 'form-input',
                        style: { borderColor: (confirm && !match) ? 'var(--danger)' : '' },
                        value: confirm, onChange: e => setConfirm(e.target.value)
                    }),
                    confirm && !match && e('p', { style: { color: 'var(--danger)', fontSize: '12px', marginTop: '4px' } }, '⚠ Passwords do not match.')
                ),

                e('div', { className: 'form-group' },
                    e('label', { className: 'form-label' }, 'Security Requirements'),
                    e('div', { style: { display: 'grid', gap: '8px' } },
                        reqs.map(r => e('div', {
                            key: r.id,
                            style: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: r.test(password) ? 'var(--text-main)' : 'var(--text-muted)' }
                        },
                            e('i', {
                                className: `fas ${r.test(password) ? 'fa-check' : 'fa-circle-exclamation'}`,
                                style: { color: r.test(password) ? 'var(--success)' : 'var(--danger)', fontSize: '12px' }
                            }),
                            r.label
                        ))
                    )
                )
            ),
            e('div', { className: 'modal-footer', style: { display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: '8px' } },
                e('div', { style: { fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' } },
                    !isValid && e('span', null, 'ⓘ Fix errors to enable locking')
                ),
                e('div', { style: { display: 'flex', gap: '12px' } },
                    e('button', { className: 'btn btn-ghost', onClick: onCancel }, 'Cancel'),
                    e('button', {
                        className: 'btn btn-primary',
                        disabled: !isValid,
                        style: { opacity: isValid ? 1 : 0.5 },
                        onClick: () => onLock(password)
                    }, 'Lock Folder')
                )
            )
        )
    );
}
