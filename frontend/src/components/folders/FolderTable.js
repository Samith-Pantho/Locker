const e = React.createElement;

export function FolderTable({ folders, onUnlock, onRevoke, onRelock }) {
    return e('table', { className: 'folder-table' },
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
                    e('div', { className: 'folder-name-cell', style: { display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' } },
                        e('span', { className: 'folder-icon-bg', style: { flexShrink: 0, width: '40px', height: '40px', background: '#f1f5f9', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', color: f.status === 'Locked' ? 'var(--primary-color)' : '#94a3b8' } }, 
                           e('i', { className: `fas ${f.status === 'Locked' ? 'fa-lock' : 'fa-folder'}` })
                        ),
                        e('div', { style: { minWidth: '100px', wordBreak: 'break-all' } },
                            e('div', { style: { fontWeight: '600' } }, f.name),
                            e('div', { style: { fontSize: '11px', color: 'var(--text-muted)' } }, '12.4 MB')
                        )
                    )
                ),
                e('td', { style: { color: 'var(--text-muted)', fontSize: '13px' } }, f.path),
                e('td', null, e('span', { className: `status-badge ${f.status === 'Locked' ? 'status-locked' : 'status-unlocked'}` }, f.status)),
                e('td', { style: { color: 'var(--text-muted)', fontSize: '13px' } }, 'Today, 10:24 AM'),
                e('td', null, 
                    e('div', { style: { display: 'flex', gap: '8px' } },
                        f.status === 'Locked' 
                            ? e('button', { 
                                className: 'btn btn-primary', 
                                title: 'Unlock Folder',
                                style: { padding: '6px 12px', fontSize: '13px' },
                                onClick: () => onUnlock(f) 
                              }, e('i', { className: 'fas fa-lock', style: { marginRight: '6px' } }), 'Locked')
                            : e('button', { 
                                className: 'btn btn-success', 
                                title: 'Lock Folder',
                                style: { padding: '6px 12px', fontSize: '13px', backgroundColor: 'var(--success)', color: '#fff', border: 'none' },
                                onClick: () => onRelock(f) 
                              }, e('i', { className: 'fas fa-lock-open', style: { marginRight: '6px' } }), 'Unlocked'),
                        e('button', { 
                            className: 'btn btn-ghost', 
                            title: f.status === 'Unlocked' ? 'Revoke Protection' : 'Unlock folder to revoke protection',
                            disabled: f.status !== 'Unlocked',
                            style: { padding: '6px', color: 'var(--danger)', opacity: f.status === 'Unlocked' ? 1 : 0.4, cursor: f.status === 'Unlocked' ? 'pointer' : 'not-allowed' },
                            onClick: () => onRevoke(f)
                        }, e('i', { className: 'fas fa-trash-can' }))
                    )
                )
            ))
        )
    );
}
