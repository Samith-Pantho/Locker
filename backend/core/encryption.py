import base64
import os
import hmac
import hashlib
from cryptography.hazmat.primitives import hashes
from cryptography.hazmat.primitives.kdf.pbkdf2 import PBKDF2HMAC
from cryptography.fernet import Fernet
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend

CHUNK_SIZE = 1024 * 64 # 64KB chunks
MAGIC_HEADER = b"LCK1"

def derive_key(password: str, salt: bytes) -> bytes:
    kdf = PBKDF2HMAC(
        algorithm=hashes.SHA256(),
        length=32,
        salt=salt,
        iterations=100000,
    )
    # Return raw 32 bytes for the new engine
    return kdf.derive(password.encode())

def encrypt_file(in_path: str, out_path: str, key: bytes):
    """Encrypts a file using streaming AES-CTR + HMAC-SHA256 (LCK1 format)."""
    nonce = os.urandom(16)
    cipher = Cipher(algorithms.AES(key), modes.CTR(nonce), backend=default_backend())
    encryptor = cipher.encryptor()
    digest = hmac.new(key, b'', hashlib.sha256)
    
    with open(in_path, 'rb') as f_in, open(out_path, 'wb') as f_out:
        f_out.write(MAGIC_HEADER)
        f_out.write(nonce)
        # Placeholder for HMAC (32 bytes)
        f_out.write(b'\x00' * 32)
        
        while True:
            chunk = f_in.read(CHUNK_SIZE)
            if not chunk:
                break
            encrypted = encryptor.update(chunk)
            f_out.write(encrypted)
            digest.update(encrypted)
        
        f_out.write(encryptor.finalize())
        
        # Write actual HMAC tag
        tag = digest.digest()
        f_out.seek(len(MAGIC_HEADER) + 16)
        f_out.write(tag)

def decrypt_file(in_path: str, out_path: str, key: bytes):
    """Decrypts a file with support for LCK1 streaming format and legacy Fernet fallback."""
    with open(in_path, 'rb') as f_in:
        header = f_in.read(len(MAGIC_HEADER))
        
        if header != MAGIC_HEADER:
            # Fallback to legacy Fernet
            f_in.seek(0)
            try:
                data = f_in.read()
                # Fernet requires urlsafe-b64-encoded key
                f_key = base64.urlsafe_b64encode(key)
                fernet = Fernet(f_key)
                decrypted = fernet.decrypt(data)
                with open(out_path, 'wb') as f_out:
                    f_out.write(decrypted)
                return
            except Exception:
                raise ValueError("Format unrecognized or legacy decryption failed")

        nonce = f_in.read(16)
        stored_tag = f_in.read(32)
        
        cipher = Cipher(algorithms.AES(key), modes.CTR(nonce), backend=default_backend())
        decryptor = cipher.decryptor()
        digest = hmac.new(key, b'', hashlib.sha256)
        
        temp_out = out_path + ".tmp"
        try:
            with open(temp_out, 'wb') as f_out:
                while True:
                    chunk = f_in.read(CHUNK_SIZE)
                    if not chunk:
                        break
                    digest.update(chunk)
                    decrypted = decryptor.update(chunk)
                    f_out.write(decrypted)
                
                f_out.write(decryptor.finalize())
                
            if hmac.compare_digest(digest.digest(), stored_tag):
                if os.path.exists(out_path):
                    os.remove(out_path)
                os.rename(temp_out, out_path)
            else:
                if os.path.exists(temp_out):
                    os.remove(temp_out)
                raise ValueError("Integrity check failed: invalid password or corrupted file")
        except Exception as e:
            if os.path.exists(temp_out):
                os.remove(temp_out)
            raise e

