const { useState, useEffect } = React;
const e = React.createElement;

import { api } from '/src/services/api.js';
import { LoginCard } from './auth/LoginCard.js';
import { RegisterCard } from './auth/RegisterCard.js';
import { RecoveryCard } from './auth/RecoveryCard.js';

export function Login(props) {
    const [qr, setQr] = useState(null);
    const [error, setError] = useState('');
    const [isRegistered, setIsRegistered] = useState(false);
    const [loading, setLoading] = useState(true);
    const [view, setView] = useState('login'); // login, register, recovery
    const [feedbackModal, setFeedbackModal] = useState(null); // { type: 'success'|'error', title, message }

    const [email, setEmail] = useState('');
    const [pin, setPin] = useState('');

    useEffect(() => {
        api.is_registered().then(res => {
            const registered = res.registered;
            setIsRegistered(registered);
            if (!registered) setView('register');
            setLoading(false);
        });
    }, []);

    const handleRegisterStart = async () => {
        if (!email || pin.length < 6) {
            setError('Provide a valid email and 6+ digit PIN');
            return;
        }
        const res = await api.setup_auth(email, pin);
        setQr(res.qr);
        setError('');
    };

    const handleOTPComplete = async (code) => {
        const res = await api.login(code);
        if (res.success) props.onLogin();
        else setError('Invalid authentication code');
    };

    const handleSendRecoveryEmail = async (em) => {
        if (!em) {
            setError('Please enter your email');
            return;
        }
        const res = await api.send_master_pin_email(em);
        if (res.success) {
            setError('');
            setFeedbackModal({
                type: 'success',
                title: 'PIN Sent',
                message: 'Your Master PIN has been sent successfully to your registered email address.'
            });
        } else {
            setFeedbackModal({
                type: 'error',
                title: 'Request Failed',
                message: res.error
            });
        }
    };

    const handleRecoverySubmit = async (em, p) => {
        const res = await api.verify_recovery(em, p);
        if (res.success) props.onLogin();
        else setError(res.error);
    };

    const handleShowInfo = (cardType) => {
        const info = {
            login: {
                title: 'Sign Steps',
                message: '1. Open your mobile Authenticator App.\n2. Locate your "Locker Dash" entry.\n3. Enter the current 6-digit code.\n4. You will be automatically redirected to your vault.'
            },
            register: {
                title: 'Safe Registration',
                message: '1. Enter your recovery email.\n2. Create a secure 6+ digit Master PIN.\n3. Click "Start Setup" to see your QR code.\n4. Scan the QR code with your mobile app.\n5. Verify with your first 6-digit code.'
            },
            recovery: {
                title: 'Account Recovery',
                message: '1. Enter your registered email.\n2. Click "Send PIN" for email delivery.\n3. Check your inbox for the Master PIN.\n4. Enter the PIN and click "Verify & Sign In".'
            }
        };
        const active = info[cardType];
        setFeedbackModal({ type: 'info', title: active.title, message: active.message });
    };

    if (loading) return e('div', { className: 'loading-container' }, 
        e('div', { className: 'spinner' }),
        e('div', { className: 'loading-text' }, 'Initializing Backend...')
    );

    const renderWrapper = (content) => e('div', { 
        style: { 
            height: '100vh', width: '100vw', 
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            background: 'radial-gradient(circle at top right, var(--bg-main), var(--bg-sidebar))'
        } 
    },
        e('div', {
            className: 'section-card',
            style: { width: '90vw', maxWidth: '440px', padding: '40px', textAlign: 'center', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)' }
        },
            e('div', { className: 'sidebar-logo', style: { margin: '0 auto 24px', width: '48px', height: '48px', fontSize: '24px' } }, 'L'),
            content,

            // Refined Feedback Modal
            feedbackModal && e('div', { className: 'modal-overlay' },
                e('div', { className: 'modal-content', style: { padding: '32px', width: '360px' } },
                    e('div', { className: `alert-icon-${feedbackModal.type}`, style: { margin: '0 auto 16px' } },
                        e('i', {
                            className: `fas ${feedbackModal.type === 'success' ? 'fa-check-circle' :
                                    feedbackModal.type === 'info' ? 'fa-info-circle' : 'fa-times-circle'
                                }`
                        })
                    ),
                    e('h3', null, feedbackModal.title),
                    e('p', { style: { fontSize: '13px', color: 'var(--text-muted)', margin: '12px 0 24px', whiteSpace: 'pre-wrap' } }, feedbackModal.message),
                    e('button', { className: 'btn btn-primary', style: { width: '100%' }, onClick: () => setFeedbackModal(null) }, 'Close')
                )
            )
        )
    );

    let content;
    if (view === 'register') {
        content = e(RegisterCard, {
            qr, error, email, setEmail, pin, setPin,
            onStart: handleRegisterStart,
            onOTPComplete: handleOTPComplete,
            onBack: isRegistered ? () => setView('login') : null,
            onInfo: () => handleShowInfo('register')
        });
    } else if (view === 'recovery') {
        content = e(RecoveryCard, {
            initialEmail: email,
            error,
            onSendPin: handleSendRecoveryEmail,
            onSubmitPin: handleRecoverySubmit,
            onBack: () => setView('login'),
            onInfo: () => handleShowInfo('recovery')
        });
    } else {
        content = e(LoginCard, {
            error,
            onOTPComplete: handleOTPComplete,
            onForgot: () => setView('recovery'),
            onRegisterSwitch: () => setView('register'),
            onInfo: () => handleShowInfo('login')
        });
    }

    return renderWrapper(content);
}
