import os
import webview
import random
import json
import base64
import subprocess
from cryptography.fernet import Fernet
from backend.core.auth import verify_totp, generate_totp_secret, get_totp_uri, generate_qr_base64
from backend.services.folder_service import lock_folder, unlock_folder
from backend.services.metadata_service import (
    save_metadata, load_metadata, get_tracked_folders, 
    add_tracked_folder, update_folder_status,
    save_auth_config, load_auth_config, update_auth_config,
    get_settings, save_settings
)
from backend.services.email_service import send_recovery_email, send_verification_code

class API:
    def __init__(self):
        self._window = None
        self.temp_verify_code: str | None = None
        self.user_secret: str | None = None
        self.user_email: str | None = None
        self._is_authenticated = False
        self._refresh_auth()

    def _prevent_deletion(self, path):
        if os.name == 'nt':
            try:
                subprocess.run(['icacls', path, '/deny', '*S-1-1-0:(OI)(CI)(DE,DC)'], 
                               creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0x08000000), check=False)
            except Exception:
                pass

    def _allow_deletion(self, path):
        if os.name == 'nt':
            try:
                subprocess.run(['icacls', path, '/remove:d', '*S-1-1-0', '/T'], 
                               creationflags=getattr(subprocess, 'CREATE_NO_WINDOW', 0x08000000), check=False)
            except Exception:
                pass

    def _refresh_auth(self):
        auth = load_auth_config()
        self.user_secret = auth['secret'] if auth else None
        self.user_email = auth['email'] if auth else None

    def set_window(self, window):
        self._window = window

    def is_registered(self):
        return {"registered": self.user_secret is not None}

    def get_user_info(self):
        if not self._is_authenticated: return None
        auth = load_auth_config()
        if not auth: return None
        return {"email": auth['email'], "verified": auth.get('verified', False)}

    def send_verification(self, email):
        self.temp_verify_code = str(random.randint(100000, 999999))
        success, msg = send_verification_code(email, self.temp_verify_code)
        return {"success": success, "error": msg if not success else ""}

    def verify_email(self, code):
        if not self._is_authenticated: return {"success": False, "error": "Not authenticated"}
        if self.temp_verify_code and code == self.temp_verify_code:
            update_auth_config(verified=True)
            self.temp_verify_code = None
            return {"success": True}
        return {"success": False, "error": "Invalid code"}

    def send_master_pin_email(self, email: str):
        auth = load_auth_config()
        if not auth: 
            return {"success": False, "error": "No account configuration found."}
        
        if not auth.get('verified'):
            return {"success": False, "error": "Email not verified. Please verify your email first from the User Info tab."}
            
        if auth['email'].lower() != email.lower():
            return {"success": False, "error": "Entered email does not match the registered account email."}

        success, msg = send_recovery_email(auth['email'], auth['pin_hash'])
        return {"success": success, "error": msg if not success else ""}

    def get_master_pin(self):
        if not self._is_authenticated: return {"pin": None}
        auth = load_auth_config()
        return {"pin": auth.get('pin_hash')} if auth else {"pin": None}

    def update_master_pin(self, new_pin):
        if not self._is_authenticated: return {"success": False}
        update_auth_config(pin_hash=new_pin)
        return {"success": True}

    def lock_all_folders(self):
        if not self._is_authenticated: return {"success": False}
        folders = get_tracked_folders()
        from backend.services.metadata_service import decrypt_with_path
        for f in folders:
            if f['status'] == 'Unlocked' and 'stored_password' in f:
                try:
                    password = decrypt_with_path(f['stored_password'], f['path'])
                    self.lock_folder(f['path'], password)
                except Exception:
                    pass
        return {"success": True}

    def relock_folder(self, folder_path):
        if not self._is_authenticated: return {"success": False, "error": "Not authenticated"}
        folders = get_tracked_folders()
        from backend.services.metadata_service import decrypt_with_path
        for f in folders:
            if f['path'] == folder_path and f['status'] == 'Unlocked' and 'stored_password' in f:
                try:
                    password = decrypt_with_path(f['stored_password'], f['path'])
                    return self.lock_folder(f['path'], password)
                except Exception as e:
                    return {"success": False, "error": str(e)}
        return {"success": False, "error": "Folder not found or no stored password"}

    def revoke_protection(self, folder_path):
        from backend.services.metadata_service import remove_tracked_folder, get_tracked_folders, decrypt_with_path
        
        folders = get_tracked_folders()
        target_folder = next((f for f in folders if f['path'] == folder_path), None)
        
        if not target_folder:
            return {"success": False, "error": "Folder not found in managed list."}
            
        if target_folder.get('status') != 'Unlocked':
            return {"success": False, "error": "Folder must be unlocked before revoking protection to ensure password availability for safety checks."}
        
        # New Safety Check: Ensure all files are decrypted before revoking
        if 'stored_password' in target_folder:
            try:
                password = decrypt_with_path(target_folder['stored_password'], folder_path)
                
                # Perform a safety unlock pass
                res = self.unlock_folder(folder_path, password)
                if not res.get('success'):
                    return {"success": False, "error": f"Safety decryption failed: {res.get('error')}. Please ensure the folder is fully accessible."}
            except Exception as e:
                return {"success": False, "error": f"Error during safety check: {str(e)}"}

        self._allow_deletion(folder_path)
        # 1. Remove .lockmeta if exists
        meta_path = os.path.join(folder_path, ".lockmeta")
        if os.path.exists(meta_path):
            try:
                os.remove(meta_path)
            except Exception:
                pass
        # 2. Remove from tracking
        remove_tracked_folder(folder_path)
        return {"success": True}


    def get_settings(self):
        if not self._is_authenticated: return {}
        return get_settings()

    def update_settings(self, settings):
        if not self._is_authenticated: return {"success": False}
        save_settings(settings)
        return {"success": True}

    def verify_recovery(self, email, pin):
        auth = load_auth_config()
        if not auth or auth['email'] != email:
            return {"success": False, "error": "Invalid email"}
        if auth.get('pin_hash') == pin:
            self._is_authenticated = True
            return {"success": True}
        return {"success": False, "error": "Invalid PIN"}

    def logout(self):
        self._is_authenticated = False
        self.lock_all_folders()
        return {"success": True}

    def get_folders(self):
        if not self._is_authenticated: return []
        return get_tracked_folders()

    def select_folder(self):
        result = self._window.create_file_dialog(webview.FOLDER_DIALOG)
        return result[0] if result else None

    def setup_auth(self, email, pin):
        self.user_secret = generate_totp_secret()
        self.user_email = email
        save_auth_config(self.user_secret, email, pin)
        self._refresh_auth()
        uri = get_totp_uri(self.user_secret, email)
        qr_base64 = generate_qr_base64(uri)
        return {"secret": self.user_secret, "qr": qr_base64}

    def login(self, code):
        if not self.user_secret: return {"success": False, "error": "No user setup"}
        if verify_totp(self.user_secret, code): 
            self._is_authenticated = True
            return {"success": True}
        return {"success": False, "error": "Invalid code"}

    def lock_folder(self, folder_path, password):
        if not self._is_authenticated: return {"success": False, "error": "Not authenticated"}
        if not folder_path or not password: return {"success": False, "error": "Missing path"}
        salt = os.urandom(16)
        from backend.core.encryption import derive_key
        key = derive_key(password, salt)
        success, result = lock_folder(folder_path, key)
        if success:
            f_key = base64.urlsafe_b64encode(key)
            f = Fernet(f_key)
            encrypted_mapping = f.encrypt(json.dumps(result).encode('utf-8')).decode('utf-8')
            save_metadata(folder_path, salt, b"dummy", mapping=encrypted_mapping)
            self._prevent_deletion(folder_path)
            add_tracked_folder(folder_path, os.path.basename(folder_path), "Locked")
            return {"success": True}
        return {"success": False, "error": result}

    def unlock_folder(self, folder_path, password):
        if not self._is_authenticated: return {"success": False, "error": "Not authenticated"}
        if not folder_path or not password: return {"success": False, "error": "Missing path"}
        meta = load_metadata(folder_path)
        if not meta: return {"success": False, "error": "Metadata missing"}
        from backend.core.encryption import derive_key
        
        try:
            salt = base64.b64decode(meta['salt'])
        except Exception:
            salt = meta['salt'].encode('utf-8')
            
        key = derive_key(password, salt)
        
        mapping_data = meta.get('mapping', {})
        if isinstance(mapping_data, str):
            f_key = base64.urlsafe_b64encode(key)
            f = Fernet(f_key)
            try:
                mapping = json.loads(f.decrypt(mapping_data.encode('utf-8')).decode('utf-8'))
            except Exception:
                return {"success": False, "error": "Invalid password or corrupted metadata"}
        else:
            mapping = mapping_data

        self._allow_deletion(folder_path)
        
        success, result = unlock_folder(folder_path, key, mapping)
        if success:
            # Note: We NO LONGER remove .lockmeta on unlock to allow easy re-locking.
            # Instead we just mark as Unlocked and store the decrypted password temporarily.
            update_folder_status(folder_path, "Unlocked", stored_password=password)
            return {"success": True}
        else:
            self._prevent_deletion(folder_path)
            return {"success": False, "error": result}
