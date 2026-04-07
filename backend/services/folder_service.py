import os
import secrets
import string
import ctypes
import shutil
from backend.core.encryption import encrypt_file, decrypt_file

def _hide_file(path):
    if os.name == 'nt':
        try:
            ctypes.windll.kernel32.SetFileAttributesW(str(path), 0x02) # FILE_ATTRIBUTE_HIDDEN
        except Exception:
            pass

def generate_random_name(length=12):
    # Safe character set for Windows filenames (excludes \ / : * ? " < > |)
    # Also removing & and % to avoid potential issues in shell/scripts
    alphabet = string.ascii_letters + string.digits + "!@#$^()-_=+[]{}.;,"
    return ''.join(secrets.choice(alphabet) for _ in range(length))

def _rollback_failed_lock(folder_path, key, mapping, last_obf_path=None):
    """Best-effort restoration of original files on failure."""
    if last_obf_path and os.path.exists(last_obf_path):
        try: os.remove(last_obf_path)
        except: pass
        
    for obfuscated_name, info in mapping.items():
        obfuscated_path = os.path.join(folder_path, obfuscated_name)
        if not os.path.exists(obfuscated_path):
            continue
            
        try:
            original_name = info.get("n", "")
            rel_dir = info.get("d", "")
            target_dir = os.path.join(folder_path, rel_dir) if rel_dir else folder_path
            os.makedirs(target_dir, exist_ok=True)
            original_path = os.path.join(target_dir, original_name)
            
            # Restore if original was deleted
            if not os.path.exists(original_path):
                decrypt_file(obfuscated_path, original_path, key)
            
            os.remove(obfuscated_path)
        except Exception:
            pass # Keep going if some fail

def lock_folder(folder_path, key):
    mapping = {}
    current_obf_path = None
    try:
        # Walk recursively, bottom-up to handle file removal and empty dir cleanup
        for root, dirs, files in os.walk(folder_path, topdown=False):
            # Skip metadata file itself
            if ".lockmeta" in files:
                files.remove(".lockmeta")
                
            for original_name in files:
                file_path = os.path.join(root, original_name)
                
                # Obfuscate name
                new_name = generate_random_name()
                while new_name in mapping:
                    new_name = generate_random_name()
                
                new_path = os.path.join(folder_path, new_name)
                current_obf_path = new_path
                
                # Encrypt and stream
                encrypt_file(file_path, new_path, key)
                _hide_file(new_path)
                
                # Store relative directory and original name to reconstruct structure
                rel_dir = os.path.relpath(root, folder_path)
                mapping[new_name] = {
                    "n": original_name,
                    "d": rel_dir if rel_dir != "." else ""
                }
                
                # Now that metadata is stored, remove source
                os.remove(file_path)
                current_obf_path = None
            
            # Clean up empty subdirectories after processing their files
            for d in dirs:
                dir_path = os.path.join(root, d)
                try:
                    if not os.listdir(dir_path):
                        os.rmdir(dir_path)
                except Exception:
                    pass
                        
        return True, mapping
    except Exception as e:
        _rollback_failed_lock(folder_path, key, mapping, current_obf_path)
        return False, str(e)

def unlock_folder(folder_path, key, mapping):
    try:
        # Sort keys to ensure deterministic behavior if needed (optional)
        for obfuscated_name, info in mapping.items():
            obfuscated_path = os.path.join(folder_path, obfuscated_name)
            if not os.path.exists(obfuscated_path):
                continue
                
            if isinstance(info, dict):
                original_name = info.get("n", "")
                rel_dir = info.get("d", "")
            else:
                # Backward compatibility with old mapping (just name string)
                original_name = info
                rel_dir = ""
                
            # Reconstruct the directory structure
            target_dir = os.path.join(folder_path, rel_dir) if rel_dir else folder_path
            os.makedirs(target_dir, exist_ok=True)
            
            original_path = os.path.join(target_dir, original_name)
            
            # Decrypt and stream (fallback is handled internally in decrypt_file)
            decrypt_file(obfuscated_path, original_path, key)
            
            os.remove(obfuscated_path)
            
        return True, folder_path
    except Exception as e:
        return False, str(e)
