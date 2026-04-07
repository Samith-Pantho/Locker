const { useState } = React;
const e = React.createElement;
import { OTPInput } from '/src/components/common/OTPInput.js';

export function UnlockModal({ folder, onUnlock, onCancel }) {
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    return e('div', { className: 'modal-overlay' },
        e('div', { className: 'modal-content', style: { width: '90vw', maxWidth: '440px', background: 'var(--bg-card)', border: '1px solid var(--border-color)', backdropFilter: 'none' } },
            e('div', { className: 'modal-header' },
                e('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    e('span', { className: 'alert-icon-success', style: { width: '24px', height: '24px', fontSize: '12px', background: '#dbeafe', color: '#1d4ed8' } }, e('i', { className: 'fas fa-lock-open' })),
                    e('h3', { style: { margin: 0 } }, 'Unlock Folder')
                ),
                e('button', { className: 'btn-round', onClick: onCancel }, e('i', { className: 'fas fa-times' }))
            ),
            e('div', { className: 'modal-body', style: { padding: '32px' } },
                e('div', { className: 'form-group', style: { textAlign: 'center', marginBottom: '32px' } },
                    e('div', { style: { fontSize: '48px', marginBottom: '16px', color: '#94a3b8' } }, e('i', { className: 'fas fa-box-archive' })),
                    e('h4', { style: { margin: '0 0 8px' } }, folder.name),
                    e('p', { className: 'view-subtitle', style: { fontSize: '12px' } }, folder.path)
                ),
                e('div', { className: 'form-group' },
                    e('label', { className: 'form-label' }, 'Folder Password'),
                    e('input', {
                        type: 'password',
                        className: 'form-input',
                        placeholder: 'Enter folder password',
                        value: password,
                        onChange: e => setPassword(e.target.value),
                        onKeyDown: e => e.key === 'Enter' && onUnlock(password)
                    })
                )
            ),
            e('div', { className: 'modal-footer' },
                e('button', { className: 'btn btn-ghost', onClick: onCancel }, 'Cancel'),
                e('button', {
                    className: 'btn btn-primary',
                    onClick: () => onUnlock(password)
                }, 'Unlock Folder')
            )
        )
    );
}
