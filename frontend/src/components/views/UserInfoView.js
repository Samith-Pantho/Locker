const { useState, useEffect } = React;
const e = React.createElement;

export function UserInfoView({ showAlert }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifyMode, setVerifyMode] = useState(false);
    const [code, setCode] = useState('');
    const [showViewPin, setShowViewPin] = useState(false);
    const [showEditPin, setShowEditPin] = useState(false);
    const [showEmailModal, setShowEmailModal] = useState(false);
    const [confirmEmail, setConfirmEmail] = useState('');
    const [masterPin, setMasterPin] = useState('');
    const [newPin, setNewPin] = useState('');

    useEffect(() => {
        loadUser();
    }, []);

    const loadUser = () => {
        window.pywebview.api.get_user_info().then(res => {
            setUser(res);
            setLoading(false);
        });
    };

    const handleSendCode = async () => {
        const res = await window.pywebview.api.send_verification(user.email);
        if (res.success) {
            setVerifyMode(true);
            showAlert({ type: 'success', title: 'Code Sent', text: 'Verification code sent to your email.' });
        } else showAlert({ type: 'error', title: 'Failed', text: res.error });
    };

    const handleVerify = async () => {
        const res = await window.pywebview.api.verify_email(code);
        if (res.success) {
            setVerifyMode(false);
            showAlert({ type: 'success', title: 'Verified', text: 'Email verified successfully!' });
            loadUser();
        } else showAlert({ type: 'error', title: 'Invalid Code', text: 'Please check the code and try again.' });
    };

    const handleSendPin = async () => {
        const res = await window.pywebview.api.send_master_pin_email(confirmEmail);
        if (res.success) {
            setShowEmailModal(false);
            showAlert({ type: 'success', title: 'PIN Dispatched', text: 'Your Master PIN has been sent successfully.' });
        } else showAlert({ type: 'error', title: 'Failed', text: res.error });
    };

    const handleUpdatePin = async () => {
        if (!newPin || newPin.length < 4) {
            alert('PIN must be at least 4 characters.');
            return;
        }
        await window.pywebview.api.update_master_pin(newPin);
        setShowEditPin(false);
        showAlert({ type: 'success', title: 'PIN Updated', text: 'Master PIN changed successfully.' });
    };

    const handleViewPinReq = async () => {
        const res = await window.pywebview.api.get_master_pin();
        setMasterPin(res.pin);
        setShowViewPin(true);
    };

    if (loading) return e('div', { className: 'loading-container' },
        e('div', { className: 'spinner' }),
        e('div', { className: 'loading-text' }, 'Loading User Profile...')
    );

    return e('div', { className: 'view-container', style: { display: 'flex', justifyContent: 'center' } },
        e('div', { className: 'section-card', style: { width: '100%', maxWidth: '600px', padding: '48px', textAlign: 'center' } },
            e('h2', { className: 'view-title', style: { marginBottom: '32px' } }, 'User Profile'),
            e('div', { style: { marginBottom: '40px' } },
                e('div', {
                    className: 'status-badge ' + (user.verified ? 'status-locked' : 'status-unlocked'),
                    style: { display: 'inline-block', marginBottom: '16px', padding: '6px 16px' }
                },
                    e('i', { className: `fas ${user.verified ? 'fa-check-circle' : 'fa-circle-exclamation'}`, style: { marginRight: '8px' } }),
                    user.verified ? 'Verified Account' : 'Email Unverified'
                ),
                e('p', { style: { fontSize: '20px', fontWeight: '700', margin: 0 } }, user.email)
            ),

            !user.verified && !verifyMode && e('button', {
                className: 'btn btn-primary',
                style: { width: '100%', padding: '12px' },
                onClick: handleSendCode
            }, 'Send Verification Code'),

            verifyMode && e('div', { style: { background: 'var(--bg-main)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border-color)' } },
                e('p', { style: { fontSize: '14px', color: 'var(--text-muted)', marginBottom: '16px' } }, 'Enter the 6-digit code sent to your email'),
                e('input', {
                    className: 'form-input',
                    style: { textAlign: 'center', letterSpacing: '8px', fontSize: '24px', maxWidth: '240px' },
                    maxLength: 6,
                    value: code,
                    onChange: (evt) => setCode(evt.target.value)
                }),
                e('div', { style: { marginTop: '20px', display: 'flex', gap: '12px', justifyContent: 'center' } },
                    e('button', { className: 'btn btn-primary', onClick: handleVerify }, 'Verify Code'),
                    e('button', { className: 'btn btn-ghost', onClick: () => setVerifyMode(false) }, 'Cancel')
                )
            ),

            e('hr', { style: { margin: '48px 0', border: 0, borderTop: '1px solid var(--border-color)' } }),

            e('h3', { style: { fontSize: '18px', fontWeight: '700', marginBottom: '8px' } }, 'Master Recovery PIN'),
            e('p', { style: { color: 'var(--text-muted)', fontSize: '14px', marginBottom: '32px' } }, 'Used to recover your account if you lose your authenticator.'),

            e('div', { style: { display: 'flex', gap: '12px', justifyContent: 'center' } },
                e('button', {
                    className: 'btn btn-ghost',
                    onClick: handleViewPinReq,
                    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', minWidth: '100px' }
                },
                    e('span', { style: { fontSize: '20px' } }, e('i', { className: 'far fa-eye' })), e('span', { style: { fontSize: '12px', fontWeight: '600' } }, 'View PIN')
                ),
                e('button', {
                    className: 'btn btn-ghost',
                    onClick: () => setShowEditPin(true),
                    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', minWidth: '100px' }
                },
                    e('span', { style: { fontSize: '20px' } }, e('i', { className: 'fas fa-pen-to-square' })), e('span', { style: { fontSize: '12px', fontWeight: '600' } }, 'Edit PIN')
                ),
                e('button', {
                    className: 'btn btn-ghost',
                    onClick: () => {
                        if (!user.verified) {
                            showAlert({ type: 'error', title: 'Unverified', text: 'Please verify your email first.' });
                        } else setShowEmailModal(true);
                    },
                    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', minWidth: '100px' }
                },
                    e('span', { style: { fontSize: '20px' } }, e('i', { className: 'far fa-envelope' })), e('span', { style: { fontSize: '12px', fontWeight: '600' } }, 'Email PIN')
                )
            )
        ),

        // MODALS
        showViewPin && e('div', { className: 'modal-overlay' },
            e('div', { className: 'modal-content', style: { width: '90vw', maxWidth: '400px', textAlign: 'center', padding: '32px' } },
                e('h3', null, 'Your Master PIN'),
                e('div', { style: { fontSize: '32px', fontWeight: '700', margin: '24px 0', letterSpacing: '4px', color: 'var(--primary-color)' } }, masterPin),
                e('button', { className: 'btn btn-primary', onClick: () => setShowViewPin(false) }, 'Close')
            )
        ),

        showEditPin && e('div', { className: 'modal-overlay' },
            e('div', { className: 'modal-content', style: { width: '90vw', maxWidth: '400px', padding: '32px' } },
                e('h3', { style: { textAlign: 'center' } }, 'Edit Master PIN'),
                e('div', { style: { margin: '24px 0' } },
                    e('label', { className: 'form-label' }, 'New Master PIN'),
                    e('input', {
                        className: 'form-input', type: 'password',
                        value: newPin, onChange: (evt) => setNewPin(evt.target.value)
                    })
                ),
                e('div', { style: { display: 'flex', gap: '12px' } },
                    e('button', { className: 'btn btn-primary', style: { flex: 1 }, onClick: handleUpdatePin }, 'Update PIN'),
                    e('button', { className: 'btn btn-ghost', style: { flex: 1 }, onClick: () => setShowEditPin(false) }, 'Cancel')
                )
            )
        ),

        showEmailModal && e('div', { className: 'modal-overlay' },
            e('div', { className: 'modal-content', style: { width: '90vw', maxWidth: '400px', padding: '32px' } },
                e('h3', { style: { textAlign: 'center' } }, 'Email Master PIN'),
                e('p', { style: { color: 'var(--text-muted)', fontSize: '14px', textAlign: 'center', marginBottom: '24px' } }, 'Enter your registered email address to confirm delivery.'),
                e('input', {
                    className: 'form-input', placeholder: 'your@email.com',
                    value: confirmEmail, onChange: (evt) => setConfirmEmail(evt.target.value)
                }),
                e('div', { style: { display: 'flex', gap: '12px', marginTop: '24px' } },
                    e('button', { className: 'btn btn-primary', style: { flex: 1 }, onClick: handleSendPin }, 'Send Now'),
                    e('button', { className: 'btn btn-ghost', style: { flex: 1 }, onClick: () => setShowEmailModal(false) }, 'Cancel')
                )
            )
        )
    );
}
