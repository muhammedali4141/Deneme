@echo off
setlocal

REM Bu script Windows'ta .exe üretir.
REM Gereksinim: pyinstaller kurulmuş olmalı.

python -m pip install --upgrade pip
python -m pip install pyinstaller
pyinstaller --noconfirm --onefile --windowed --name ITEnvanterDesktop desktop_launcher.py

echo EXE olustu: dist\ITEnvanterDesktop.exe
endlocal
