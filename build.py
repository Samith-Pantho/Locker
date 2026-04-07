import os
import shutil
import sys
import PyInstaller.__main__

def build():
    # Application Name
    APP_NAME = "Locker.exe" if sys.platform == "win32" else "Locker"
    
    if sys.platform != "win32":
        print("WARNING: You are building on a non-Windows system.")
        print("To create a Windows .exe, you MUST run this script from a Windows Command Prompt or PowerShell.")
        print("-" * 50)
    
    # Entry Point
    ENTRY_FILE = "backend/main.py"
    
    # Assets to bundle
    # Format: (Source, Destination_in_EXE)
    DATA_PATHS = [
        ("frontend", "frontend"),
    ]
    
    print(f"--- Starting Build for {APP_NAME} ---")
    
    # Cleanup previous builds
    if os.path.exists("build"): shutil.rmtree("build")
    if os.path.exists("dist"): shutil.rmtree("dist")
    
    # Build arguments
    args = [
        ENTRY_FILE,
        "--name", APP_NAME,
        "--onefile",             # Package everything into a single .exe
        "--windowed",            # GUI app (no console window)
        "--clean",
    ]
    
    # Add data folders
    for src, dest in DATA_PATHS:
        # On Windows, path separator is ; but on Unix it's : for PyInstaller
        # Since the user is on Windows, we use ;
        args.extend(["--add-data", f"{src}{os.pathsep}{dest}"])
    
    # Run PyInstaller
    PyInstaller.__main__.run(args)
    
    print(f"\n--- Build Complete! ---")
    print(f"Executable is located in: {os.path.abspath('dist')}")

if __name__ == "__main__":
    build()
