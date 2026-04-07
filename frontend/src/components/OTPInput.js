const e = React.createElement;
const { useState, useEffect, useRef } = React;

export function OTPInput({ length = 6, onComplete }) {
    const [code, setCode] = useState(new Array(length).fill(''));
    const inputs = useRef([]);

    const handleChange = (val, i) => {
        if (isNaN(val)) return;
        const newCode = [...code];
        newCode[i] = val.slice(-1);
        setCode(newCode);

        if (val && i < length - 1) {
            inputs.current[i + 1].focus();
        }

        if (newCode.every(v => v !== '')) {
            onComplete(newCode.join(''));
        }
    };

    const handleKeyDown = (e, i) => {
        if (e.key === 'Backspace' && !code[i] && i > 0) {
            inputs.current[i - 1].focus();
        }
    };

    return e('div', { className: 'otp-container' },
        code.map((digit, i) => e('input', {
            key: i,
            ref: el => inputs.current[i] = el,
            type: 'text',
            maxLength: 1,
            value: digit,
            onChange: (evt) => handleChange(evt.target.value, i),
            onKeyDown: (evt) => handleKeyDown(evt, i),
            className: 'otp-box'
        }))
    );
}
