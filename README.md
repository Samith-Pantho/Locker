# Folder Locking System

A secure desktop application to lock and encrypt folders using AES-256 and TOTP Multi-Factor Authentication.

## Features
- **AES-256 Encryption**: Securely encrypts folder contents using industrial-grade Fernet.
- **TOTP Authentication**: Integrated Multi-Factor Authentication via QR Code.
- **Account Recovery**: Secure Master PIN recovery via registered email.
- **Universal Themes**: High-contrast Dark mode with persistent settings.
- **Step-by-Step Info**: Onboarding and usage guides built directly into the UI.
- **Stateful Security**: Backend-enforced session guards and secure logout.
- **Desktop Ready**: Built with `pywebview` for a native application feel.

## Project Structure
```
Locker/
├── backend/                # Python Backend (API, Core Logic, Services)
├── frontend/               # React Frontend (UI Components, Styles)
├── build.py                # Standalone EXE build script
├── Dockerfile              # Container definition for developers
├── docker-compose.yml      # Dev environment orchestration
└── README.md               # You are here
```

## Usage Instructions

### Local Development (Desktop)
1. Install dependencies:
   ```bash
   pip install pywebview cryptography pyotp qrcode[pil] fastapi uvicorn[standard] python-multipart
   ```
2. Run the application:
   ```bash
   python backend/main.py
   ```

### Docker Development (Web)
1. Start the dev environment:
   ```bash
   docker-compose up
   ```
2. Access the UI at `http://localhost:8456`.

## Production Packaging (.EXE)

To create a standalone Windows executable that includes all dependencies and assets:

1. **Install PyInstaller**:
   ```bash
   pip install pyinstaller
   ```
2. **Run Build Script**:
   ```bash
   python build.py
   ```
3. **Distribution**:
   The final executable will be in the `/dist` folder. This `.exe` is standalone and can be sent to other users—it includes the app, all libraries, and the frontend assets.

> [!TIP]
> To create a professional installer (with desktop shortcuts and an uninstaller), we recommend using **Inno Setup** to wrap the generated `/dist/Locker` folder.

## API Details (PyWebView Bridge)

The frontend communicates with the Python backend via `window.pywebview.api`. All methods return JSON-compatible dictionaries.

### Identity & Authentication
- `is_registered()`: Returns `{"registered": bool}` indicating if the vault has been setup.
- `setup_auth(email, pin)`: Initializes the vault. Returns `{secret, qr}` (base64 QR code for authenticator).
- `login(code)`: Validates a 6-digit TOTP code and creates a session.
- `logout()`: Clears the session and automatically locks all open folders.
- `get_user_info()`: Returns `{"email", "verified"}` for the current session.

### Account Recovery
- `send_master_pin_email(email)`: Delivers the registered Master PIN to the user's inbox.
- `verify_recovery(email, pin)`: Bypasses TOTP using the Master PIN for high-security access.
- `send_verification(email)`: Sends a secondary verification code to link an email.
- `verify_email(code)`: Completes the email verification process.

### Folder Management
- `get_folders()`: Returns a list of all tracked folders with their `status` (Locked/Unlocked).
- `select_folder()`: Triggers a native system directory selection dialog.
- `lock_folder(path, password)`: Encrypts the directory and its metadata.
- `unlock_folder(path, password)`: Decrypts the directory and restores access.
- `lock_all_folders()`: Batch locks all currently open folders.
- `revoke_protection(path)`: Permanently removes encryption and tracking from a folder.

### System & Settings
- `get_settings()`: Retrieves app preferences (Theme, Timers).
- `update_settings(settings)`: Persists new user preferences.
- `get_master_pin()`: Retrieves the current Master PIN hash (requires auth).
- `update_master_pin(pin)`: Changes the vault's Master PIN.
