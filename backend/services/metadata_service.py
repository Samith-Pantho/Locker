import os
import base64
import json
import sys
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.fernet import Fernet

def _get_app_data_dir():
    """Returns a persistent, user-writable directory for app data across all platforms."""
    if sys.platform == 'win32':
        base = os.environ.get('APPDATA', os.path.expanduser('~'))
    elif sys.platform == 'darwin':
        base = os.path.expanduser('~/Library/Application Support')
    else:
        base = os.path.expanduser('~/.config')
    path = os.path.join(base, 'Locker')
    os.makedirs(path, exist_ok=True)
    return path

APP_DATA_DIR = _get_app_data_dir()
DB_PATH = os.path.join(APP_DATA_DIR, 'folders.json')
AUTH_CONFIG_PATH = os.path.join(APP_DATA_DIR, 'auth_config.json')
SETTINGS_PATH = os.path.join(APP_DATA_DIR, 'settings.json')

def ensure_dirs():
    os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

def _get_path_cipher(path: str):
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=b'locker_stable_path_salt',
        iterations=100000,
    )
    key = base64.urlsafe_b64encode(kdf.derive(path.encode()))
    return Fernet(key)

def encrypt_with_path(text: str, path: str) -> str:
    cipher = _get_path_cipher(path)
    return cipher.encrypt(text.encode()).decode()

def decrypt_with_path(encrypted_text: str, path: str) -> str:
    cipher = _get_path_cipher(path)
    return cipher.decrypt(encrypted_text.encode()).decode()

def ensure_db():
    ensure_dirs()
    if not os.path.exists(DB_PATH):
        with open(DB_PATH, 'w') as f:
            json.dump([], f)

def get_tracked_folders():
    ensure_db()
    with open(DB_PATH, 'r') as f:
        return json.load(f)

def add_tracked_folder(path, name, status):
    folders = get_tracked_folders()
    if not any(f['path'] == path for f in folders):
        folders.append({'path': path, 'name': name, 'status': status})
        with open(DB_PATH, 'w') as f:
            json.dump(folders, f)

def update_folder_status(path, status, stored_password=None):
    folders = get_tracked_folders()
    for f in folders:
        if f['path'] == path:
            f['status'] = status
            if stored_password:
                f['stored_password'] = encrypt_with_path(stored_password, path)
            elif status == 'Locked':
                f.pop('stored_password', None)
            break
    with open(DB_PATH, 'w') as f:
        json.dump(folders, f)

def remove_tracked_folder(path):
    folders = get_tracked_folders()
    folders = [f for f in folders if f['path'] != path]
    with open(DB_PATH, 'w') as f:
        json.dump(folders, f)

def save_metadata(folder_path, salt, password_hash, mapping=None):
    meta_path = os.path.join(folder_path, ".lockmeta")
    data = {
        "salt": base64.b64encode(salt).decode('utf-8'),
        "hash": base64.b64encode(password_hash).decode('utf-8'),
        "mapping": mapping or {}
    }
    with open(meta_path, 'w') as f:
        json.dump(data, f)
        
    if os.name == 'nt':
        import ctypes
        try:
            ctypes.windll.kernel32.SetFileAttributesW(str(meta_path), 0x02)
        except Exception:
            pass

def load_metadata(folder_path):
    meta_path = os.path.join(folder_path, ".lockmeta")
    if not os.path.exists(meta_path):
        return None
    with open(meta_path, 'r') as f:
        return json.load(f)

def save_auth_config(secret, email, pin_hash):
    ensure_dirs()
    with open(AUTH_CONFIG_PATH, 'w') as f:
        json.dump({"secret": secret, "email": email, "pin_hash": pin_hash, "verified": False}, f)

def load_auth_config():
    if not os.path.exists(AUTH_CONFIG_PATH):
        return None
    with open(AUTH_CONFIG_PATH, 'r') as f:
        return json.load(f)

def update_auth_config(verified=None, email=None, pin_hash=None):
    auth = load_auth_config()
    if not auth: return
    if verified is not None: auth['verified'] = verified
    if email is not None: auth['email'] = email
    if pin_hash is not None: auth['pin_hash'] = pin_hash
    with open(AUTH_CONFIG_PATH, 'w') as f:
        json.dump(auth, f)

def get_settings():
    if not os.path.exists(SETTINGS_PATH):
        return {
            "theme": "dark",
            "autoLockTimer": 15,
            "lockOnSleep": True,
            "minPasswordLength": 8,
            "requireNumbers": True,
            "requireSymbols": True,
            "requireUppercase": False
        }
    with open(SETTINGS_PATH, 'r') as f:
        return json.load(f)

def save_settings(settings):
    ensure_dirs()
    with open(SETTINGS_PATH, 'w') as f:
        json.dump(settings, f)
