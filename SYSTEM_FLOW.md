# System Flow

## 1. Tujuan Dokumen

Dokumen ini menjelaskan alur inti sistem untuk model:

1. satu perusahaan,
2. banyak cabang,
3. web sebagai primary system,
4. WhatsApp sebagai secondary interface owner.

---

## 2. Daftar Flow

| # | Flow | Mode | Actor |
|---|------|------|-------|
| 1 | Login & Branch Selection | Web | Semua |
| 2 | Product Management | Web | Admin/Staff |
| 3 | Order Create | Web | Admin/Staff |
| 4 | Order Status Change | Web | Admin/Staff |
| 5 | Stock Adjustment | Web | Admin |
| 6 | Branch Switch | Web | Semua |
| 7 | Owner WhatsApp Query | WhatsApp | Owner |
| 8 | Knowledge Query | WhatsApp | Owner |
| 9 | Order -> Stock Integration | System | System |

---

## 3. Flow Detail

### 3.1 Login & Branch Selection

```mermaid
sequenceDiagram
    participant U as User
    participant W as React Web
    participant API as NestJS API
    participant DB as MySQL

    U->>W: Submit email/username + password
    W->>API: POST /auth/login
    API->>DB: Validate user + membership + branch access
    DB-->>API: User + roles + branches
    API-->>W: Access token + current user
    alt Satu cabang
        W->>W: Set active branch otomatis
        W->>W: Redirect ke dashboard
    else Banyak cabang
        W->>W: Redirect ke select-branch
        U->>W: Pilih cabang
        W->>API: POST /auth/switch-branch
        API-->>W: OK
        W->>W: Redirect ke dashboard
    end
```

### 3.2 Manajemen Produk

```mermaid
sequenceDiagram
    participant U as Admin/Staff
    participant W as React Web
    participant API as NestJS API
    participant S as Product Service
    participant DB as MySQL

    U->>W: Isi form produk
    W->>API: POST /items
    API->>S: Validate payload + permission
    S->>DB: Insert item company-scoped
    DB-->>S: Item created
    S-->>API: DTO item
    API-->>W: 201 Created
```

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
    API->>O: Validate branch context, item, party, status awal
    O->>DB: Insert order with active_branch_id
    O->>DB: Insert order_items
    O->>DB: Insert order_status_history
    DB-->>O: Order saved
    O-->>API: DTO order
    API-->>W: 201 Created
```

### 3.4 Perubahan Status Order

```mermaid
sequenceDiagram
    participant U as Admin/Staff
    participant W as React Web
    participant API as NestJS API
    participant O as Order Service
    participant DB as MySQL

    U->>W: Ubah status order
    W->>API: POST /orders/:id/status
    API->>O: Validate branch access + transition
    O->>DB: Update order status
    O->>DB: Insert order_status_history
    DB-->>O: Updated
    O-->>API: DTO order
    API-->>W: 200 OK
```

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
    API->>S: Validate item + active branch + default location
    S->>DB: Insert inventory_movements
    S->>DB: Update inventory_balances
    DB-->>S: Updated
    S-->>API: Adjustment result
    API-->>W: 201 Created
```

### 3.6 Branch Switch

```mermaid
sequenceDiagram
    participant U as User
    participant W as React Web
    participant API as NestJS API
    participant DB as MySQL

    U->>W: Pilih cabang lain
    W->>API: POST /auth/switch-branch
    API->>DB: Validate branch access
    DB-->>API: Branch valid
    API-->>W: Updated active branch
    W->>W: Refresh data halaman
```

### 3.7 Owner WhatsApp Query

```mermaid
sequenceDiagram
    participant O as Owner
    participant WA as Baileys Gateway
    participant API as NestJS API
    participant Auth as Authorization Resolver
    participant A as Assistant Module
    participant T as Internal Tools
    participant LLM as OpenAI API
    participant DB as MySQL

    O->>WA: Penjualan hari ini berapa?
    WA->>API: Forward inbound message
    API->>Auth: Validate phone -> company
    Auth-->>API: Authorization context
    API->>A: Start assistant run
    alt Intent rutin
        A->>T: Execute GetSalesSummary(company_id, branch optional)
        T-->>A: Structured data
        A->>A: Compose direct response
    else Butuh AI
        A->>T: Execute tool plan
        T-->>A: Structured data
        A->>LLM: Compose grounded response
        LLM-->>A: Final draft
    end
    A-->>API: Final answer
    API->>WA: Send reply
```

### 3.8 Knowledge Query

```mermaid
sequenceDiagram
    participant O as Owner
    participant WA as Baileys Gateway
    participant API as NestJS API
    participant A as Assistant Module
    participant RAG as Knowledge Retriever
    participant LLM as OpenAI API
    participant DB as MySQL

    O->>WA: Apa SOP retur barang?
    WA->>API: Forward inbound message
    API->>A: Start assistant run
    A->>RAG: GetPolicyAnswerReference(company_id)
    RAG->>DB: Query knowledge company-scoped
    DB-->>RAG: Relevant chunks
    RAG-->>A: Retrieval result
    A->>LLM: Compose grounded answer
    LLM-->>A: Final draft
```

### 3.9 Order -> Stock Integration

```mermaid
sequenceDiagram
    participant O as Order Service
    participant S as Stock Service
    participant DB as MySQL

    O->>S: Trigger stock movement policy
    S->>DB: Insert inventory_movements for branch
    S->>DB: Update inventory_balances for branch
    DB-->>S: Updated
```

---

## 4. Non-Happy Path

### 4.1 Assistant Tool Failure

```mermaid
flowchart TD
    A[Assistant memanggil tool] --> B{Berhasil?}
    B -->|Ya| C[Compose jawaban normal]
    B -->|Tidak| D[Log tool failure]
    D --> E[Jawab jujur bahwa data tidak bisa diambil]
```

### 4.2 Branch Access Invalid

```mermaid
flowchart TD
    A[User request data] --> B{Cabang aktif valid?}
    B -->|Ya| C[Lanjut proses]
    B -->|Tidak| D[Return 403 atau paksa pilih cabang]
```

---

## 5. Ringkasan Referensi Silang

| Flow | Endpoint / Tool | Tabel Utama |
|------|------------------|-------------|
| Login | `/auth/login` | users, company_user_memberships, membership_branch_accesses |
| Branch switch | `/auth/switch-branch` | user_sessions, membership_branch_accesses |
| Product create | `/items` | items |
| Order create | `/orders` | orders, order_items, order_status_history |
| Status change | `/orders/:id/status` | orders, order_status_history |
| Stock adjustment | `/stock/adjustments` | inventory_movements, inventory_balances |
| WA query | tool calls | assistant_runs, assistant_tool_executions |
| Knowledge query | GetPolicyAnswerReference | knowledge_chunks |
