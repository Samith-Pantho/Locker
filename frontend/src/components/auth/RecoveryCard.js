const { useState } = React;
const e = React.createElement;

export function RecoveryCard(props) {
    const [email, setEmail] = useState(props.initialEmail || '');
    const [pin, setPin] = useState('');

    return e('div', null,
        e('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' } },
            e('h2', { className: 'view-title', style: { margin: 0 } }, 'Account Recovery'),
            e('i', { 
                className: 'fas fa-info-circle', 
                style: { color: 'var(--primary-color)', cursor: 'pointer', fontSize: '18px' },
                onClick: props.onInfo
            })
        ),
        e('p', { className: 'view-subtitle', style: { marginBottom: '24px' } }, 'Enter your email and Master PIN to sign in.'),
        
        e('div', { className: 'form-group', style: { display: 'flex', gap: '8px' } },
            e('input', { 
                type: 'email', placeholder: 'your@email.com', className: 'form-input',
                style: { flex: 1 },
                value: email, onChange: (evt) => setEmail(evt.target.value)
            }),
            e('button', { 
                className: 'btn btn-primary', 
                style: { padding: '0 16px', whiteSpace: 'nowrap', fontSize: '13px' },
                onClick: () => props.onSendPin(email) 
            }, 'Send PIN')
        ),

        e('div', { className: 'form-group' },
            e('input', { 
                type: 'password', placeholder: 'Enter Master PIN', className: 'form-input',
                value: pin, onChange: (evt) => setPin(evt.target.value) 
            })
        ),

        props.error && e('p', { style: { color: 'var(--danger)', fontSize: '13px', marginBottom: '16px' } }, props.error),
        
        e('button', { 
            className: 'btn btn-primary', style: { width: '100%', marginBottom: '12px' },
            onClick: () => props.onSubmitPin(email, pin) 
        }, 'Verify & Sign In'),
        
        e('button', { 
            className: 'btn btn-ghost', style: { width: '100%', marginBottom: '16px' },
            onClick: props.onBack 
        }, 'Back to Login')
    );
}
