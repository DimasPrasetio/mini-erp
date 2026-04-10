# System Flow

## 1. Tujuan Dokumen

Dokumen ini mendeskripsikan alur inti sistem mini ERP SaaS pada dua mode utama:

1. `Deep Mode` melalui web untuk operasional penuh.
2. `Quick Mode` melalui WhatsApp Owner Assistant untuk insight cepat owner.

Dokumen ini sengaja menekankan perubahan minimum agar tetap selaras dengan PRD, SYSTEM_DESIGN, dan DB_SCHEMA tanpa menambah kompleksitas yang tidak perlu.

---

## 2. Daftar Flow

| # | Flow | Mode | Actor |
|---|------|------|-------|
| 1 | Login & Tenant Selection | Web | Semua |
| 2 | Manajemen Produk | Web | Admin/Staff |
| 3 | Pembuatan Order | Web | Admin/Staff |
| 4 | Perubahan Status Order | Web | Admin/Staff |
| 5 | Penyesuaian Stok | Web | Admin |
| 6 | Owner WhatsApp Query | WhatsApp | Owner |
| 7 | Knowledge Query | WhatsApp | Owner |
| 8 | Order -> Stock Integration | System | System |
| 9 | Switch Role | Web | Semua (multi-role) |

---

## 3. Flow Detail

### 3.1 Login & Tenant Selection

```mermaid
sequenceDiagram
    participant U as User
    participant W as React Web
    participant API as NestJS API
    participant DB as MySQL

    U->>W: Submit email + password
    W->>API: POST /auth/login
    API->>DB: Validate user + memberships
    DB-->>API: User + tenant memberships + roles
    API-->>W: Access token + current user
    alt Satu tenant
        W->>W: Redirect ke dashboard
    else Multi-tenant
        W->>W: Redirect ke select-tenant
        U->>W: Pilih tenant
        W->>API: Persist active tenant context
        API-->>W: OK
        W->>W: Redirect ke dashboard
    end
```

---

### 3.2 Manajemen Produk (Create)

```mermaid
sequenceDiagram
    participant U as Admin/Staff
    participant W as React Web
    participant API as NestJS API
    participant S as Product Service
    participant DB as MySQL

    U->>W: Isi form produk
    W->>API: POST /items
    API->>S: Validate payload + tenant context
    S->>DB: Insert item
    DB-->>S: Item created
    S-->>API: DTO item
    API-->>W: 201 Created
    W-->>U: Tampilkan produk baru
```

---

### 3.3 Pembuatan Order

```mermaid
sequenceDiagram
    participant U as Admin/Staff
    participant W as React Web
    participant API as NestJS API
    participant O as Order Service
    participant DB as MySQL

    U->>W: Submit order
    W->>API: POST /orders
    API->>O: Validate tenant, item, party, status awal
    O->>DB: Insert order
    O->>DB: Insert order_items
    O->>DB: Insert order_status_history
    DB-->>O: Order saved
    O-->>API: DTO order
    API-->>W: 201 Created
    W-->>U: Tampilkan detail order
```

---

### 3.4 Perubahan Status Order

```mermaid
sequenceDiagram
    participant U as Admin/Staff
    participant W as React Web
    participant API as NestJS API
    participant O as Order Service
    participant DB as MySQL

    U->>W: Ubah status order
    W->>API: PATCH /orders/:id/status
    API->>O: Validate transition
    O->>DB: Update orders.current_status_id
    O->>DB: Insert order_status_history
    DB-->>O: Updated
    O-->>API: DTO order
    API-->>W: 200 OK
    W-->>U: Status baru tampil
```

---

### 3.5 Penyesuaian Stok

```mermaid
sequenceDiagram
    participant U as Admin
    participant W as React Web
    participant API as NestJS API
    participant S as Stock Service
    participant DB as MySQL

    U->>W: Submit stock adjustment
    W->>API: POST /stock/adjustments
    API->>S: Validate item + default location
    S->>DB: Insert inventory_movement
    S->>DB: Update inventory_balances
    DB-->>S: Updated
    S-->>API: Adjustment result
    API-->>W: 201 Created
    W-->>U: Saldo stok terbaru
```

---

### 3.6 Owner WhatsApp Query (Quick Mode)

```mermaid
sequenceDiagram
    participant O as Owner
    participant WA as Baileys Gateway
    participant API as NestJS API
    participant Auth as Auth Resolver
    participant A as Assistant Module
    participant T as Internal Tools
    participant LLM as OpenAI API
    participant DB as MySQL

    O->>WA: "Penjualan hari ini berapa?"
    WA->>API: Forward inbound message
    API->>DB: Insert conversation_messages inbound
    API->>Auth: Lookup phone -> whatsapp_authorizations
    alt Nomor terotorisasi
        Auth-->>API: Authorization context
        API->>A: Start assistant run
        A->>DB: Insert assistant_runs status=running
        A->>A: Classify intent
        alt Intent rutin dan didukung bot
            A->>T: Execute GetSalesSummary
            T-->>A: Structured data
            A->>A: Compose direct response
        else Butuh AI
            A->>T: Execute tool plan
            T-->>A: Structured data
            A->>LLM: Compose grounded response
            LLM-->>A: Final draft
        end
        A->>DB: Insert assistant_tool_executions
        A->>DB: Update assistant_runs status=completed
        A-->>API: Final answer
        API->>DB: Insert conversation_messages outbound
        API->>WA: Send reply
        WA-->>O: Reply sent
    else Nomor tidak terotorisasi
        Auth-->>API: Unauthorized
        API->>DB: Log unauthorized attempt
    end
```

---

### 3.7 Knowledge Query (Quick Mode)

```mermaid
sequenceDiagram
    participant O as Owner
    participant WA as Baileys Gateway
    participant API as NestJS API
    participant A as Assistant Module
    participant RAG as Knowledge Retriever
    participant LLM as OpenAI API
    participant DB as MySQL

    O->>WA: "Apa kebijakan retur barang kita?"
    WA->>API: Forward inbound message
    API->>A: Start assistant run
    A->>A: Detect policy_qna intent
    A->>RAG: GetPolicyAnswerReference
    RAG->>DB: Query knowledge_chunks tenant-scoped
    DB-->>RAG: Top relevant chunks
    RAG-->>A: Retrieval result
    A->>LLM: Compose grounded answer
    LLM-->>A: Final draft
    A->>DB: Update assistant_runs status=completed
    A-->>API: Final answer
    API->>WA: Send reply
```

---

### 3.8 Order -> Stock Integration

```mermaid
sequenceDiagram
    participant O as Order Service
    participant S as Stock Service
    participant DB as MySQL

    O->>O: Status order berubah ke group yang memengaruhi stok
    O->>S: Trigger stock movement policy
    S->>DB: Insert inventory_movements
    S->>DB: Update inventory_balances
    DB-->>S: Updated
    S-->>O: Success
```

---

### 3.9 Switch Role

```mermaid
sequenceDiagram
    participant U as User
    participant W as React Web
    participant API as NestJS API
    participant DB as MySQL

    U->>W: Pilih role lain
    W->>API: POST /auth/switch-role
    API->>DB: Validate membership role
    DB-->>API: Role valid
    API-->>W: Updated active role
    W->>W: Refresh permission state
    W-->>U: Menu dan halaman menyesuaikan
```

---

## 4. Flow Non-Happy Path

### 4.1 WhatsApp Gateway Disconnect

```mermaid
flowchart TD
    A[Gateway disconnected] --> B[Log system_event_logs]
    B --> C[Update whatsapp_channels.session_status = disconnected]
    C --> D[Retry reconnect dengan backoff]
    D --> E{Reconnected?}
    E -->|Ya| F[Update status = connected]
    E -->|Tidak| G[Alert admin internal]
    G --> H[Pesan baru dijawab dengan fallback operasional]
```

---

### 4.2 Assistant Tool Failure

```mermaid
flowchart TD
    A[Assistant memanggil tool] --> B{Tool berhasil?}
    B -->|Ya| C[Compose jawaban normal]
    B -->|Timeout atau Error| D[Log di assistant_tool_executions status=failed]
    D --> E{Intent masih bisa dijawab bot?}
    E -->|Ya| F[Fallback ke jalur bot]
    E -->|Tidak| G[Compose jawaban jujur dan aman]
    F --> H[Kirim ke owner via WhatsApp]
    G --> H
    H --> I[Update assistant_runs status=completed atau failed]
```

---

### 4.3 Data Ambigu / Parsial

```mermaid
flowchart TD
    A[Owner bertanya] --> B{Intent jelas?}
    B -->|Ya| C[Eksekusi tool langsung]
    B -->|Ambigu ringan| D[Jawab dengan asumsi + sebutkan asumsi]
    B -->|Ambigu tinggi| E[Minta klarifikasi maksimal 1 pertanyaan]
    C --> F{Data lengkap?}
    F -->|Ya| G[Jawab lengkap]
    F -->|Parsial| H[Jawab parsial + jelaskan keterbatasan]
    D --> G
    E --> I[Tunggu jawaban owner lalu proses ulang]
```

---

## 5. Ringkasan Referensi Silang

| Flow | API Endpoints | Tools | DB Tables |
|------|---------------|-------|-----------|
| Login | /auth/login, /auth/me | - | users, tenant_user_memberships, roles |
| Product Create | /items (POST) | - | items, item_categories |
| Order Create | /orders (POST) | - | orders, order_items, order_status_history |
| Status Change | /orders/:id/status | - | orders, order_status_history, order_status_transitions |
| Stock Adjustment | /stock/adjustments (POST) | - | inventory_movements, inventory_balances |
| WA Sales Query | - | GetSalesSummary | orders, assistant_runs, assistant_tool_executions |
| WA Knowledge Query | - | GetPolicyAnswerReference | knowledge_chunks, assistant_runs |
| Order -> Stock | Internal trigger | - | inventory_movements, inventory_balances |
