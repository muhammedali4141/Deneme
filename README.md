# IT Envanter, Zimmet ve Arıza Takip Web App (MVP)

Bu proje artık masaüstü EXE yerine **web uygulaması** olarak çalışır.

## İçerik

- Envanter ve stok yönetimi (`assets`)
- Zimmet logları (`assignments`)
- Arıza/bakım ticket akışı (`tickets` + `ticket_events`)
- Tek sayfa dark-mode web arayüzü (`/`)

## Teknoloji

- FastAPI
- PostgreSQL (SQLAlchemy üzerinden)
- Pydantic doğrulama

## Çalıştırma

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
export DATABASE_URL='postgresql+psycopg://postgres:postgres@localhost:5432/it_inventory'
uvicorn app.main:app --reload
```

## Ekranlar

- Web app ana ekranı: `http://127.0.0.1:8000/`
- Swagger: `http://127.0.0.1:8000/docs`
- Health: `http://127.0.0.1:8000/health`

## API Özeti

- `POST /users`, `GET /users`
- `POST /assets`, `GET /assets`
- `POST /assignments`, `GET /assignments`, `POST /assignments/{assignment_id}/return`
- `POST /tickets`, `POST /tickets/{ticket_id}/status`, `GET /tickets`

## Tasarım Notları

- Asset durumu otomatik güncellenir:
  - Zimmette -> `assigned`
  - Ticket açılınca -> `faulty`
  - Zimmet iadesinde -> `in_stock`
- Ticket olayları `ticket_events` tablosunda tutulur.
- MVP’de `create_all` kullanılmıştır; üretim için Alembic migration önerilir.
