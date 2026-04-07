const e = React.createElement;
import { OTPInput } from '/src/components/common/OTPInput.js';

export function RegisterCard(props) {
    return e('div', null,
        e('div', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '8px' } },
            e('h2', { className: 'view-title', style: { margin: 0 } }, 'Registration'),
            e('i', {
                className: 'fas fa-info-circle',
                style: { color: 'var(--primary-color)', cursor: 'pointer', fontSize: '18px' },
                onClick: props.onInfo
            })
        ),
        !props.qr ? e('div', null,
            e('p', { className: 'view-subtitle', style: { marginBottom: '24px' } }, 'Set your recovery details and authenticator.'),
            e('div', { className: 'form-group' },
                e('input', {
                    type: 'email', placeholder: 'Recovery Email', className: 'form-input',
                    value: props.email, onChange: (evt) => props.setEmail(evt.target.value)
                })
            ),
            e('div', { className: 'form-group' },
                e('input', {
                    type: 'password', placeholder: 'Create Master PIN', className: 'form-input',
                    value: props.pin, onChange: (evt) => props.setPin(evt.target.value)
                })
            ),
            props.error && e('p', { style: { color: 'var(--danger)', fontSize: '13px', marginBottom: '12px' } }, props.error),
            e('button', { className: 'btn btn-primary', style: { width: '100%', marginTop: '12px' }, onClick: props.onStart }, 'Continue'),
            props.onBack && e('button', {
                className: 'btn btn-ghost', style: { width: '100%', marginTop: '12px' },
                onClick: props.onBack
            }, 'Back to Login')
        ) : e('div', null,
            e('div', { style: { background: 'white', padding: '16px', borderRadius: '12px', display: 'inline-block', marginBottom: '20px', border: '1px solid var(--border-color)' } },
                e('img', { src: `data:image/png;base64,${props.qr}`, alt: 'QR Code', style: { width: '180px' } })
            ),
            e('p', { className: 'view-subtitle', style: { marginBottom: '24px' } }, 'Scan the QR code to setup TOTP.'),
            e(OTPInput, { onComplete: props.onOTPComplete }),
            props.error && e('p', { style: { color: 'var(--danger)', marginTop: '12px' } }, props.error)
        )
    );
}
