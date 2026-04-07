# Locker Backend Main
import webview
import os
import sys

from backend.api.bridge import API


def get_resource_path(relative_path):
    """ Get absolute path to resource, works for dev and for PyInstaller """
    if hasattr(sys, '_MEIPASS'):
        return os.path.join(sys._MEIPASS, relative_path)
    # Dev: main.py is in 'backend/', so 'frontend' is in '../frontend'
    return os.path.abspath(os.path.join(os.path.dirname(__file__), '..', relative_path))

def main():
    api = API()
    frontend_path = get_resource_path('frontend/index.html')
    
    if not os.path.exists(frontend_path):
        # Fallback for some PyInstaller configurations or dev environments
        alt_path = os.path.abspath(os.path.join(os.getcwd(), 'frontend', 'index.html'))
        if os.path.exists(alt_path):
            frontend_path = alt_path
        else:
            print(f"CRITICAL: Frontend index not found at {frontend_path}")

    window = webview.create_window('Locker', frontend_path, js_api=api, width=1200, height=800)
    api.set_window(window)
    webview.start(debug=False)

if __name__ == "__main__":
    main()
