export function UserInfo(props) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [verifyMode, setVerifyMode] = useState(false);
    const [code, setCode] = useState('');

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
            props.showAlert({ type: 'success', title: 'Code Sent', text: 'Verification code sent to your email.' });
        } else props.showAlert({ type: 'error', title: 'Failed', text: res.error });
    };

    const handleVerify = async () => {
        const res = await window.pywebview.api.verify_email(code);
        if (res.success) {
            setVerifyMode(false);
            props.showAlert({ type: 'success', title: 'Verified', text: 'Email verified successfully!' });
            loadUser();
        } else props.showAlert({ type: 'error', title: 'Invalid Code', text: 'Please check the code and try again.' });
    };

    const handleSendPin = async () => {
        const res = await window.pywebview.api.send_master_pin_email();
        if (res.success) props.showAlert({ type: 'success', title: 'Sent', text: 'Master PIN sent successfully!' });
        else props.showAlert({ type: 'error', title: 'Failed', text: res.error });
    };

    if (loading) return e('div', { style: { display: 'flex', height: '100%', alignItems: 'center', justifyContent: 'center' } }, 'Loading User Info...');

    return e('div', { className: 'view-container', style: { display: 'flex', justifyContent: 'center' } },
        e('div', { className: 'section-card', style: { width: '100%', maxWidth: '600px', padding: '48px', textAlign: 'center' } },
            e('h2', { className: 'view-title', style: { marginBottom: '32px' } }, 'User Profile'),
            e('div', { style: { marginBottom: '40px' } },
                e('div', {
                    className: 'status-badge ' + (user.verified ? 'status-locked' : 'status-unlocked'),
                    style: { display: 'inline-block', marginBottom: '16px', padding: '6px 16px' }
                }, user.verified ? '✓ Verified Account' : '⚠ Email Unverified'),
                e('p', { style: { fontSize: '20px', fontWeight: '700', margin: 0 } }, user.email)
            ),

            !user.verified && !verifyMode && e('button', {
                className: 'btn btn-primary',
                style: { width: '100%', padding: '12px' },
                onClick: handleSendCode
            }, 'Send Verification Code'),

            verifyMode && e('div', { style: { background: '#f8fafc', padding: '24px', borderRadius: '12px' } },
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
                e('button', { className: 'btn btn-ghost', style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', minWidth: '100px' } },
                    e('span', { style: { fontSize: '20px' } }, '👁'), e('span', { style: { fontSize: '12px', fontWeight: '600' } }, 'View PIN')
                ),
                e('button', { className: 'btn btn-ghost', style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', minWidth: '100px' } },
                    e('span', { style: { fontSize: '20px' } }, '✎'), e('span', { style: { fontSize: '12px', fontWeight: '600' } }, 'Edit PIN')
                ),
                e('button', {
                    className: 'btn btn-ghost',
                    onClick: handleSendPin,
                    style: { display: 'flex', flexDirection: 'column', gap: '8px', padding: '20px', minWidth: '100px' }
                },
                    e('span', { style: { fontSize: '20px' } }, '✉'), e('span', { style: { fontSize: '12px', fontWeight: '600' } }, 'Email PIN')
                )
            )
        )
    );
}
