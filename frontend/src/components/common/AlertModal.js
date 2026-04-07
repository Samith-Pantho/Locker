const e = React.createElement;

export function AlertModal(props) {
    if (!props.alert) return null;

    return e('div', { className: 'modal-overlay' },
        e('div', { className: 'modal-content alert-modal' },
            e('div', { className: `alert-icon ${props.alert.type === 'error' ? 'alert-icon-error' : 'alert-icon-success'}` },
                e('i', { className: `fas ${props.alert.type === 'error' ? 'fa-times-circle' : 'fa-check-circle'}` })
            ),
            e('div', { className: 'alert-title' }, props.alert.title),
            e('div', { className: 'alert-text' }, props.alert.text),
            e('div', { style: { display: 'flex', gap: '12px', justifyContent: 'space-between' } },
                e('button', { className: 'btn btn-round', onClick: props.onClose }, 'Cancel'),
                e('button', { className: 'btn btn-primary', onClick: props.onClose }, props.alert.type === 'error' ? 'Retry' : 'OK')
            )
        )
    );
}
