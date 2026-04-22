import os
import signal
import subprocess
import sys
import threading
import tkinter as tk
from tkinter import messagebox
import webbrowser


class BackendLauncherApp:
    def __init__(self, root: tk.Tk):
        self.root = root
        self.root.title("IT Envanter Desktop Launcher")
        self.root.geometry("560x320")
        self.process: subprocess.Popen | None = None

        self.status_var = tk.StringVar(value="Durum: Durduruldu")
        self.log_var = tk.StringVar(value="Hazır")

        frame = tk.Frame(root, padx=20, pady=20)
        frame.pack(fill=tk.BOTH, expand=True)

        tk.Label(frame, text="IT Envanter & Ticketing", font=("Segoe UI", 16, "bold")).pack(anchor="w")
        tk.Label(frame, text="Windows EXE içinden backend başlatma arayüzü", fg="#666").pack(anchor="w", pady=(0, 16))

        tk.Label(frame, textvariable=self.status_var, font=("Segoe UI", 11)).pack(anchor="w", pady=(0, 12))

        row = tk.Frame(frame)
        row.pack(anchor="w", pady=(0, 10))

        self.start_btn = tk.Button(row, text="Backend Başlat", width=18, command=self.start_backend)
        self.start_btn.pack(side=tk.LEFT, padx=(0, 8))

        self.stop_btn = tk.Button(row, text="Backend Durdur", width=18, command=self.stop_backend, state=tk.DISABLED)
        self.stop_btn.pack(side=tk.LEFT)

        row2 = tk.Frame(frame)
        row2.pack(anchor="w", pady=(0, 10))

        tk.Button(row2, text="Swagger Aç", width=18, command=lambda: self.open_url("http://127.0.0.1:8000/docs")).pack(side=tk.LEFT, padx=(0, 8))
        tk.Button(row2, text="Health Aç", width=18, command=lambda: self.open_url("http://127.0.0.1:8000/health")).pack(side=tk.LEFT)

        tk.Label(frame, textvariable=self.log_var, fg="#0a7", wraplength=500, justify="left").pack(anchor="w", pady=(18, 0))

        self.root.protocol("WM_DELETE_WINDOW", self.on_close)

    def backend_workdir(self) -> str:
        return os.path.join(os.path.dirname(os.path.abspath(__file__)), "backend")

    def start_backend(self):
        if self.process and self.process.poll() is None:
            self.log_var.set("Backend zaten çalışıyor.")
            return

        workdir = self.backend_workdir()
        if not os.path.isdir(workdir):
            messagebox.showerror("Hata", f"backend klasörü bulunamadı: {workdir}")
            return

        cmd = [sys.executable, "-m", "uvicorn", "app.main:app", "--host", "127.0.0.1", "--port", "8000"]

        try:
            self.process = subprocess.Popen(
                cmd,
                cwd=workdir,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
            )
        except Exception as exc:
            messagebox.showerror("Başlatma Hatası", str(exc))
            return

        self.status_var.set(f"Durum: Çalışıyor (PID: {self.process.pid})")
        self.log_var.set("Backend başlatıldı. Swagger için 'Swagger Aç' butonuna basın.")
        self.start_btn.configure(state=tk.DISABLED)
        self.stop_btn.configure(state=tk.NORMAL)

        threading.Thread(target=self.consume_logs, daemon=True).start()

    def consume_logs(self):
        if not self.process or not self.process.stdout:
            return
        for line in self.process.stdout:
            line = line.strip()
            if line:
                self.log_var.set(line)
        if self.process and self.process.poll() is not None:
            self.root.after(0, self._set_stopped_ui)

    def stop_backend(self):
        if not self.process or self.process.poll() is not None:
            self._set_stopped_ui()
            return

        try:
            if os.name == "nt":
                self.process.terminate()
            else:
                os.kill(self.process.pid, signal.SIGTERM)
            self.process.wait(timeout=5)
        except Exception:
            self.process.kill()
        finally:
            self._set_stopped_ui()

    def _set_stopped_ui(self):
        self.status_var.set("Durum: Durduruldu")
        self.log_var.set("Backend durduruldu.")
        self.start_btn.configure(state=tk.NORMAL)
        self.stop_btn.configure(state=tk.DISABLED)

    def open_url(self, url: str):
        webbrowser.open(url)

    def on_close(self):
        self.stop_backend()
        self.root.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    app = BackendLauncherApp(root)
    root.mainloop()
