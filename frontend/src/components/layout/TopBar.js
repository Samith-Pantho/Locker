const e = React.createElement;

export function TopBar(props) {
    return e('div', { className: 'top-bar' },
        e('div', { className: 'search-container' },
            e('input', { 
                className: 'search-input', 
                placeholder: 'Search folders...',
                onChange: (e) => props.onSearch(e.target.value)
            })
        ),
        e('div', { className: 'top-bar-actions' },
            e('button', { className: 'btn-round', onClick: props.onSettings }, e('i', { className: 'fas fa-cog' })),
            e('div', { className: 'user-avatar', onClick: props.onProfile })
        )
    );
}
