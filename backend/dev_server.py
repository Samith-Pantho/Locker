from fastapi import FastAPI, Request
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from backend.api.bridge import API
import os
try:
    import tkinter as tk
    from tkinter import filedialog
    HAS_TK = True
except ImportError:
    HAS_TK = False

app = FastAPI()
api = API()

class MockWindow:
    def create_file_dialog(self, mode):
        if HAS_TK:
            try:
                root = tk.Tk()
                root.withdraw()
                root.attributes('-topmost', True)
                folder = filedialog.askdirectory()
                root.destroy()
                if folder:
                    return [folder]
            except Exception:
                pass
        
        # Headless/Docker Fallback
        return ["/app/vault_data"]

api.set_window(MockWindow())

# API Mapping
@app.get("/api/is_registered")
async def is_registered(): return api.is_registered()

@app.get("/api/user_info")
async def user_info(): return api.get_user_info()

@app.post("/api/send_verification")
async def send_v(data: dict): return api.send_verification(data.get("email"))

@app.post("/api/verify_email")
async def verify_e(data: dict): return api.verify_email(data.get("code"))

@app.post("/api/send_master_pin_email")
async def send_pin_e(data: dict): return api.send_master_pin_email(data.get("email"))

@app.get("/api/get_settings")
async def get_s(): return api.get_settings()

@app.post("/api/update_settings")
async def update_s(data: dict): return api.update_settings(data)

@app.post("/api/setup_auth")
async def setup_auth(data: dict): return api.setup_auth(data.get("email"), data.get("pin"))

@app.post("/api/verify_recovery")
async def verify_recovery(data: dict): return api.verify_recovery(data.get("email"), data.get("pin"))

@app.post("/api/login")
async def login(data: dict): return api.login(data.get("code"))

@app.get("/api/get_folders")
async def get_folders(): return api.get_folders()

@app.post("/api/lock_folder")
async def lock_folder(data: dict): return api.lock_folder(data.get("path"), data.get("password"))

@app.post("/api/unlock_folder")
async def unlock_folder(data: dict): return api.unlock_folder(data.get("path"), data.get("password"))

@app.post("/api/relock_folder")
async def relock_folder(data: dict): return api.relock_folder(data.get("path"))

@app.post("/api/select_folder")
async def select_f(): return api.select_folder()

@app.post("/api/lock_all_folders")
async def lock_all(): return api.lock_all_folders()

@app.post("/api/revoke_protection")
async def revoke_p(data: dict): return api.revoke_protection(data.get("path"))

@app.get("/api/get_master_pin")
async def get_pin(): return api.get_master_pin()

@app.post("/api/update_master_pin")
async def update_pin(data: dict): return api.update_master_pin(data.get("pin"))

@app.post("/api/logout")
async def logout(): return api.logout()

@app.get("/", response_class=HTMLResponse)
async def get_index():
    with open("frontend/index.html", "r") as f:
        content = f.read()
        bridge_script = """
        <script>
            window.pywebview = {
                api: {
                    is_registered: () => fetch('/api/is_registered').then(r => r.json()),
                    get_user_info: () => fetch('/api/user_info').then(r => r.json()),
                    send_verification: (email) => fetch('/api/send_verification', {method: 'POST', body: JSON.stringify({email}), headers: {'Content-Type': 'application/json'}}).then(r => r.json()),
                    verify_email: (code) => fetch('/api/verify_email', {method: 'POST', body: JSON.stringify({code}), headers: {'Content-Type': 'application/json'}}).then(r => r.json()),
                    send_master_pin_email: (email) => fetch('/api/send_master_pin_email', {method: 'POST', body: JSON.stringify({email}), headers: {'Content-Type': 'application/json'}}).then(r => r.json()),
                    get_settings: () => fetch('/api/get_settings').then(r => r.json()),
                    update_settings: (s) => fetch('/api/update_settings', {method: 'POST', body: JSON.stringify(s), headers: {'Content-Type': 'application/json'}}).then(r => r.json()),
                    verify_recovery: (email, pin) => fetch('/api/verify_recovery', {method: 'POST', body: JSON.stringify({email, pin}), headers: {'Content-Type': 'application/json'}}).then(r => r.json()),
                    setup_auth: (email, pin) => fetch('/api/setup_auth', {method: 'POST', body: JSON.stringify({email, pin}), headers: {'Content-Type': 'application/json'}}).then(r => r.json()),
                    login: (code) => fetch('/api/login', {method: 'POST', body: JSON.stringify({code}), headers: {'Content-Type': 'application/json'}}).then(r => r.json()),
                    select_folder: () => fetch('/api/select_folder', {method: 'POST'}).then(r => r.json()),
                    get_folders: () => fetch('/api/get_folders').then(r => r.json()),
                    lock_folder: (path, password) => fetch('/api/lock_folder', {method: 'POST', body: JSON.stringify({path, password}), headers: {'Content-Type': 'application/json'}}).then(r => r.json()),
                    unlock_folder: (path, password) => fetch('/api/unlock_folder', {method: 'POST', body: JSON.stringify({path, password}), headers: {'Content-Type': 'application/json'}}).then(r => r.json()),
                    relock_folder: (path) => fetch('/api/relock_folder', {method: 'POST', body: JSON.stringify({path}), headers: {'Content-Type': 'application/json'}}).then(r => r.json()),
                    lock_all_folders: () => fetch('/api/lock_all_folders', {method: 'POST'}).then(r => r.json()),
                    revoke_protection: (path) => fetch('/api/revoke_protection', {method: 'POST', body: JSON.stringify({path}), headers: {'Content-Type': 'application/json'}}).then(r => r.json()),
                    get_master_pin: () => fetch('/api/get_master_pin').then(r => r.json()),
                    update_master_pin: (pin) => fetch('/api/update_master_pin', {method: 'POST', body: JSON.stringify({pin}), headers: {'Content-Type': 'application/json'}}).then(r => r.json()),
                    logout: () => fetch('/api/logout', {method: 'POST'}).then(r => r.json())
                }
            };
        </script>
        """
        return content.replace("</head>", bridge_script + "</head>")

app.mount("/", StaticFiles(directory="frontend"), name="static")
