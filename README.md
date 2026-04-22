# IT Envanter, Zimmet ve Arıza Takip MVP

Bu depo, istenen MVP kapsamı için çalışır bir backend iskeleti içerir:

- Envanter ve stok yönetimi (`assets`)
- Zimmet logları (`assignments`)
- Arıza/bakım ticket akışı (`tickets` + `ticket_events`)
- Kullanıcı yönetimi (`users`)

## Teknoloji

- FastAPI
- PostgreSQL (SQLAlchemy üzerinden)
- Pydantic doğrulama

## Hızlı Başlangıç

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='postgresql+psycopg://postgres:postgres@localhost:5432/it_inventory'
uvicorn app.main:app --reload
```

Swagger: `http://127.0.0.1:8000/docs`

## API Özeti

- `POST /users`, `GET /users`
- `POST /assets`, `GET /assets`
- `POST /assignments`, `POST /assignments/{assignment_id}/return`
- `POST /tickets`, `POST /tickets/{ticket_id}/status`, `GET /tickets`

## Tasarım Notları

- Asset durumu otomatik güncellenir:
  - Zimmette -> `assigned`
  - Ticket açılınca -> `faulty`
  - Zimmet iadesinde -> `in_stock`
- Ticket olayları `ticket_events` tablosunda tutulur.
- MVP’de `create_all` kullanılmıştır; üretim için Alembic migration önerilir.

## Masaüstü EXE (Windows)

"Normal exe" kullanım için `desktop_launcher.py` eklendi. Bu arayüz backend'i başlatıp/durdurur ve Swagger sayfasını açar.

### Geliştirme ortamında çalıştırma

```bash
python desktop_launcher.py
```

### EXE üretme

Windows üzerinde:

```bat
build_exe.bat
```

Bu komut sonunda `dist/ITEnvanterDesktop.exe` oluşur.

> Not: EXE çalışırken `backend` klasörü aynı dizinde olmalıdır (launcher bu klasörden API'yi başlatır).
