const e = React.createElement;

export function BaseModal({ title, onClose, children, footer, icon = 'fa-folder' }) {
    return e('div', { className: 'modal-overlay' },
        e('div', { className: 'modal-content', style: { width: '500px' } },
            e('div', { className: 'modal-header' },
                e('div', { style: { display: 'flex', alignItems: 'center', gap: '8px' } },
                    e('span', { className: 'alert-icon-success', style: { width: '24px', height: '24px', fontSize: '12px' } }, e('i', { className: `fas ${icon}` })),
                    e('h3', { style: { margin: 0 } }, title)
                ),
                e('button', { className: 'btn-round', onClick: onClose }, e('i', { className: 'fas fa-times' }))
            ),
            e('div', { className: 'modal-body' }, children),
            footer && e('div', { className: 'modal-footer' }, footer)
        )
    );
}
