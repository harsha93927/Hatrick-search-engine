import os
import subprocess
import platform
import shutil
import psutil
import time
from pathlib import Path
from typing import Optional, Dict, Any, List
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

# Try to import optional GUI/System libraries
try:
    import mss
except ImportError:
    mss = None

try:
    import screen_brightness_control as sbc
except ImportError:
    sbc = None

app = FastAPI(title="JARVIS OS Controller - Master")

class IntentRequest(BaseModel):
    intent: str
    target: Optional[str] = None
    path: Optional[str] = None
    query: Optional[str] = None
    new_name: Optional[str] = None
    content: Optional[str] = None
    params: Optional[Dict[str, Any]] = None

@app.get("/")
async def root():
    return {
        "status": "online",
        "system": platform.system(),
        "release": platform.release(),
        "machine": platform.machine()
    }

@app.post("/execute")
async def execute_intent(request: IntentRequest):
    intent = request.intent

    # --- File/Folder Operations ---
    if intent == "open_app":
        return await open_app(request.target)
    elif intent == "open_folder":
        return await open_folder(request.path or request.target)
    elif intent == "create_file":
        return await create_file(request.path, request.content)
    elif intent == "delete_file":
        return await delete_file(request.path)
    elif intent == "rename_file":
        return await rename_file(request.path, request.new_name)
    elif intent == "list_dir":
        return await list_dir(request.path)
    elif intent == "search_file":
        return await search_file(request.query or request.target)

    # --- System Operations ---
    elif intent == "screenshot":
        return await take_screenshot()
    elif intent == "get_system_info":
        return await get_system_info()
    elif intent == "get_processes":
        return await get_processes()
    elif intent == "kill_process":
        return await kill_process(request.target)
    elif intent == "set_brightness":
        return await set_brightness(request.params.get("level") if request.params else None)

    else:
        raise HTTPException(status_code=400, detail=f"Unknown intent: {intent}")

# --- Implementation Functions ---

async def open_app(app_name: str):
    if not app_name: return {"status": "error", "message": "App name required"}
    try:
        if platform.system() == "Darwin": subprocess.Popen(["open", "-a", app_name])
        elif platform.system() == "Windows": subprocess.Popen(["start", app_name], shell=True)
        else: subprocess.Popen([app_name.lower()], start_new_session=True)
        return {"status": "success", "message": f"Opened {app_name}"}
    except Exception as e: return {"status": "error", "message": str(e)}

async def open_folder(path: str):
    path = os.path.expanduser(path or "~")
    try:
        if platform.system() == "Darwin": subprocess.Popen(["open", path])
        elif platform.system() == "Windows": os.startfile(path)
        else: subprocess.Popen(["xdg-open", path])
        return {"status": "success", "message": f"Opened {path}"}
    except Exception as e: return {"status": "error", "message": str(e)}

async def create_file(path: str, content: str = ""):
    if not path: return {"status": "error", "message": "Path required"}
    try:
        full_path = Path(os.path.expanduser(path))
        full_path.parent.mkdir(parents=True, exist_ok=True)
        with open(full_path, "w") as f:
            f.write(content or "")
        return {"status": "success", "message": f"Created file at {path}"}
    except Exception as e: return {"status": "error", "message": str(e)}

async def delete_file(path: str):
    if not path: return {"status": "error", "message": "Path required"}
    try:
        full_path = Path(os.path.expanduser(path))
        if full_path.is_dir(): shutil.rmtree(full_path)
        else: os.remove(full_path)
        return {"status": "success", "message": f"Deleted {path}"}
    except Exception as e: return {"status": "error", "message": str(e)}

async def rename_file(path: str, new_name: str):
    if not path or not new_name: return {"status": "error", "message": "Path and new name required"}
    try:
        old_path = Path(os.path.expanduser(path))
        new_path = old_path.parent / new_name
        os.rename(old_path, new_path)
        return {"status": "success", "message": f"Renamed {path} to {new_name}"}
    except Exception as e: return {"status": "error", "message": str(e)}

async def list_dir(path: str):
    path = os.path.expanduser(path or ".")
    try:
        items = os.listdir(path)
        details = []
        for item in items:
            p = Path(path) / item
            details.append({
                "name": item,
                "is_dir": p.is_dir(),
                "size": p.stat().st_size if p.is_file() else 0
            })
        return {"status": "success", "items": details}
    except Exception as e: return {"status": "error", "message": str(e)}

async def search_file(query: str):
    try:
        results = []
        for path in Path.home().rglob(f"*{query}*"):
            if len(results) >= 20: break
            results.append({"name": path.name, "path": str(path)})
        return {"status": "success", "results": results}
    except Exception as e: return {"status": "error", "message": str(e)}

async def take_screenshot():
    if not mss: return {"status": "error", "message": "mss library not installed"}
    try:
        Path("screenshots").mkdir(exist_ok=True)
        filename = f"screenshots/jarvis_snap_{int(time.time())}.png"
        with mss.mss() as sct:
            sct.shot(output=filename)
        return {"status": "success", "filepath": str(Path(filename).absolute())}
    except Exception as e: return {"status": "error", "message": str(e)}

async def get_system_info():
    return {
        "status": "success",
        "cpu_usage": psutil.cpu_percent(interval=1),
        "ram": psutil.virtual_memory()._asdict(),
        "disk": psutil.disk_usage('/')._asdict(),
        "battery": psutil.sensors_battery()._asdict() if psutil.sensors_battery() else "N/A"
    }

async def get_processes():
    procs = []
    for proc in psutil.process_iter(['pid', 'name', 'username']):
        procs.append(proc.info)
        if len(procs) >= 50: break
    return {"status": "success", "processes": procs}

async def kill_process(target: str):
    try:
        # target can be PID or name
        if target.isdigit():
            p = psutil.Process(int(target))
            p.terminate()
        else:
            for proc in psutil.process_iter(['name']):
                if target.lower() in proc.info['name'].lower():
                    proc.terminate()
        return {"status": "success", "message": f"Terminated {target}"}
    except Exception as e: return {"status": "error", "message": str(e)}

async def set_brightness(level: int):
    if sbc is None: return {"status": "error", "message": "Brightness control not supported"}
    try:
        sbc.set_brightness(level or 50)
        return {"status": "success", "message": f"Brightness set to {level}%"}
    except Exception as e: return {"status": "error", "message": str(e)}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
