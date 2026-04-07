const e = React.createElement;

export function Sidebar(props) {
    const filters = [
        { id: 'all', label: 'All Folders', icon: 'fa-folder' },
        { id: 'locked', label: 'Locked', icon: 'fa-lock' },
        { id: 'unlocked', label: 'Unlocked', icon: 'fa-lock-open' },
        { id: 'recent', label: 'Recent', icon: 'fa-clock-rotate-left' }
    ];

    return e('div', { className: 'sidebar' },
        e('div', { className: 'sidebar-header' },
            e('div', { className: 'sidebar-logo' }, 'L'),
            e('h3', { className: 'sidebar-title', style: { margin: 0, color: 'var(--primary-color)' } }, 'Locker')
        ),
        
        e('div', { style: { padding: '0 24px 8px', fontSize: '11px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' } },
            e('span', { className: 'nav-item-label' }, 'Filters')
        ),
        
        filters.map(f => e('div', {
            key: f.id,
            className: `nav-item ${props.currentView === f.id ? 'active' : ''}`,
            onClick: () => props.onViewChange(f.id),
            title: f.label
        }, 
            e('i', { className: `fas ${f.icon}`, style: { marginRight: '12px', width: '20px' } }),
            e('span', { className: 'nav-item-label' }, f.label)
        )),
        
        e('div', { className: 'sidebar-footer' },
            e('div', { className: 'user-profile-badge', onClick: () => props.onViewChange('profile'), style: { cursor: 'pointer', marginBottom: '16px' } },
                e('div', { className: 'user-avatar', title: props.user?.email || 'User' }),
                e('div', { className: 'profile-info' },
                    e('h4', null, props.user?.email?.split('@')[0] || 'Premium User'),
                    e('p', null, 'v2.4.0-stable')
                )
            ),
            e('button', { 
                className: 'btn btn-ghost', 
                title: 'Sign Out',
                style: { width: '100%', display: 'flex', alignItems: 'center', gap: '12px', fontSize: '13px', padding: '10px' },
                onClick: props.onLogout 
            }, 
                e('i', { className: 'fas fa-right-from-bracket' }),
                e('span', { className: 'nav-item-label' }, 'Sign Out')
            )
        )
    );
}
