const { useState, useEffect, useRef } = React;
const e = React.createElement;

export function OTPInput({ onComplete }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const inputs = useRef([]);

    const handleChange = (index, value) => {
        if (!/^\d*$/.test(value)) return;
        const newOtp = [...otp];
        newOtp[index] = value.slice(-1);
        setOtp(newOtp);

        if (value && index < 5) {
            inputs.current[index + 1].focus();
        }
        
        if (newOtp.every(v => v !== '')) {
            onComplete(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputs.current[index - 1].focus();
        }
    };

    return e('div', { className: 'otp-container', style: { display: 'flex', gap: '8px', justifyContent: 'center' } },
        otp.map((digit, i) => e('input', {
            key: i,
            ref: el => inputs.current[i] = el,
            type: 'text',
            className: 'otp-input',
            style: { },
            value: digit,
            onChange: (e) => handleChange(i, e.target.value),
            onKeyDown: (e) => handleKeyDown(i, e)
        }))
    );
}
