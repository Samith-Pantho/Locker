const { useState, useEffect } = React;
const e = React.createElement;

export function Home(props) {

    const [folders, setFolders] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showLockModal, setShowLockModal] = useState(false);
    const [showUnlockModal, setShowUnlockModal] = useState(null);
    const [path, setPath] = useState('');
    const [password, setPassword] = useState('');

    useEffect(() => {
        window.pywebview.api.get_folders().then(setFolders);
    }, []);

    const handleSelectFolder = async () => {
        const res = await window.pywebview.api.select_folder();
        if (res) {
            setPath(res);
            setShowLockModal(true);
        }
    };

    const handleLock = async () => {
        setLoading(true);
        const res = await window.pywebview.api.lock_folder(path, password);
        setLoading(false);
        if (res.success) {
            props.showAlert({ type: 'success', title: 'Folder Secured', text: 'You have successfully encrypted the folder.' });
            setShowLockModal(false);
            setPath('');
            setPassword('');
            window.pywebview.api.get_folders().then(setFolders);
        } else props.showAlert({ type: 'error', title: 'Lock Failed', text: res.error });
    };

    const handleUnlock = async () => {
        setLoading(true);
        const res = await window.pywebview.api.unlock_folder(showUnlockModal.path, password);
        setLoading(false);
        if (res.success) {
            props.showAlert({ type: 'success', title: 'Folder Unlocked', text: 'Files have been restored to their original state.' });
            setShowUnlockModal(null);
            setPassword('');
            window.pywebview.api.get_folders().then(setFolders);
        } else props.showAlert({ type: 'error', title: 'Unlock Failed', text: res.error });
    };


    const renderTable = () => e('table', { className: 'folder-table' },
        e('thead', null,
            e('tr', null,
                e('th', null, 'Name & Size'),
                e('th', null, 'System Path'),
                e('th', null, 'Status'),
                e('th', null, 'Last Activity'),
                e('th', null, 'Actions')
            )
        ),
        e('tbody', null,
            folders.map(f => e('tr', { key: f.path },
                e('td', null,
                    e('div', { style: { display: 'flex', alignItems: 'center', gap: '12px' } },
                        e('span', { style: { fontSize: '24px' } }, '📁'),
                        e('div', null,
                            e('div', { style: { fontWeight: '600' } }, f.name),
                            e('div', { style: { fontSize: '12px', color: 'var(--text-muted)' } }, '12.4 MB')
                        )
                    )
                ),
                e('td', { style: { color: 'var(--text-muted)', fontSize: '13px' } }, f.path),
                e('td', null, e('span', { className: `status-badge ${f.status === 'Locked' ? 'status-locked' : 'status-unlocked'}` }, f.status)),
                e('td', { style: { color: 'var(--text-muted)', fontSize: '13px' } }, 'Today, 10:24 AM'),
                e('td', null,
                    e('button', {
                        className: 'btn btn-round',
                        onClick: () => setShowUnlockModal(f)
                    }, f.status === 'Locked' ? '🔓' : '⚙️')
                )
            ))
        )
    );

    const renderModal = (isLock) => e('div', { className: 'modal-overlay' },
        e('div', { className: 'modal-content' },
            e('div', { className: 'modal-header' },
                e('h3', null, (isLock ? 'Lock' : 'Unlock') + ' Folder'),
                e('button', { className: 'btn-round', onClick: () => isLock ? setShowLockModal(false) : setShowUnlockModal(null) }, '✕')
            ),
            e('div', { className: 'modal-body' },
                e('div', { className: 'form-group' },
                    e('label', { className: 'form-label' }, 'Selected Directory'),
                    e('div', { className: 'path-preview' },
                        e('span', null, '📁'),
                        e('span', null, isLock ? path : showUnlockModal.path)
                    )
                ),
                e('div', { className: 'form-group' },
                    e('label', { className: 'form-label' }, 'Master Password'),
                    e('input', {
                        type: 'password',
                        className: 'form-input',
                        placeholder: 'Enter password',
                        value: password,
                        onChange: (evt) => setPassword(evt.target.value)
                    })
                ),
                isLock && e('div', { style: { background: '#f8fafc', padding: '16px', borderRadius: '8px', marginTop: '16px' } },
                    e('div', { style: { display: 'flex', justifyContent: 'space-between', fontSize: '11px', fontWeight: '700', color: '#64748b', marginBottom: '12px', textTransform: 'uppercase' } },
                        e('span', null, 'Password Strength'),
                        e('span', { style: { color: 'var(--success)' } }, 'Strong')
                    ),
                    e('div', { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '12px' } },
                        e('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' } }, '✓ 8+ characters'),
                        e('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' } }, '✓ Includes number'),
                        e('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' } }, '✓ Special symbol'),
                        e('div', { style: { display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--success)' } }, '✓ Mixed case')
                    )
                )
            ),

            e('div', { className: 'modal-footer' },
                e('button', { className: 'btn btn-ghost', onClick: () => isLock ? setShowLockModal(false) : setShowUnlockModal(null) }, 'Cancel'),
                e('button', {
                    className: 'btn btn-primary',
                    onClick: isLock ? handleLock : handleUnlock
                }, loading ? 'Processing...' : (isLock ? 'Lock Folder' : 'Unlock Folder'))
            )
        )
    );

    return e('div', { className: 'view-container' },
        e('div', { className: 'view-header', style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' } },
            e('div', null,
                e('h1', { className: 'view-title' }, 'Managed Folders'),
                e('p', { className: 'view-subtitle' }, 'View and manage your secured directories.')
            ),
            e('button', { className: 'btn btn-primary', onClick: handleSelectFolder }, '+ Lock Folder')
        ),

        folders.length > 0 ? renderTable() : e('div', { className: 'empty-state card', style: { textAlign: 'center', padding: '80px' } },
            e('div', { style: { fontSize: '48px', marginBottom: '16px' } }, '📁'),
            e('h3', null, 'No Folders Protected'),
            e('p', { style: { color: 'var(--text-muted)' } }, 'Click the button above to secure your first folder.'),
            e('button', { className: 'btn btn-primary', style: { marginTop: '24px' }, onClick: handleSelectFolder }, '+ Add Folder')
        ),

        showLockModal && renderModal(true),
        showUnlockModal && renderModal(false)
    );
}
