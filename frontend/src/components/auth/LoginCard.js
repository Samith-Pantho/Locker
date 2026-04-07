const e = React.createElement;
import { OTPInput } from '/src/components/common/OTPInput.js';

export function LoginCard(props) {
    return e('div', null,
        e('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' } },
            e('h2', { className: 'view-title', style: { margin: 0 } }, 'Vault Login'),
            e('i', { 
                className: 'fas fa-info-circle', 
                style: { color: 'var(--primary-color)', cursor: 'pointer', fontSize: '18px' },
                onClick: props.onInfo
            })
        ),
        e('p', { className: 'view-subtitle', style: { marginBottom: '32px' } }, 'Enter your 6-digit authentication code'),
        e(OTPInput, { onComplete: props.onOTPComplete }),
        props.error && e('p', { style: { color: 'var(--danger)', marginTop: '16px' } }, props.error),
        e('div', { style: { marginTop: '32px', display: 'flex', flexDirection: 'column', gap: '16px' } },
            e('a', { 
                href: '#', onClick: (evt) => { evt.preventDefault(); props.onForgot(); },
                style: { color: 'var(--primary-color)', fontSize: '14px', textDecoration: 'none', fontWeight: '600' }
            }, 'Forgot Authenticator?'),
            e('a', { 
                href: '#', onClick: (evt) => { evt.preventDefault(); props.onRegisterSwitch(); },
                style: { color: 'var(--text-muted)', fontSize: '14px', textDecoration: 'none' }
            }, 'Need a new vault? Register')
        )
    );
}
