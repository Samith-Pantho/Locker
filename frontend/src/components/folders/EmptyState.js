const e = React.createElement;

export function EmptyState({ onAction }) {
    return e('div', { className: 'view-container', style: { display: 'flex', alignItems: 'center', justifyContent: 'center' } },
        e('div', { className: 'section-card', style: { textAlign: 'center', padding: '80px', maxWidth: '500px' } },
            e('div', { style: { fontSize: '64px', marginBottom: '24px', color: '#cbd5e1' } }, e('i', { className: 'fas fa-folder' })),
            e('h2', { className: 'view-title' }, 'No Folders Protected'),
            e('p', { className: 'view-subtitle', style: { marginBottom: '32px' } }, 
                'Start securing your confidential data by adding your first folder to the vault.'
            ),
            e('button', { className: 'btn btn-primary', onClick: onAction }, '+ Add Folder to Secure')
        )
    );
}
