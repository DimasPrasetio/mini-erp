import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, DataTable, PageHeader, SectionCard, SearchableSelect } from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";

export function CustomersListPage() {
    const navigate = useNavigate();
    const { activeTenantData } = useMockApp();

    if (!activeTenantData) {
        return null;
    }

    const customers = activeTenantData.businessParties.filter(
        (party) => party.partyType === "customer"
    );

    return (
        <div className="page-shell">
            <PageHeader
                breadcrumbs={<span>Dashboard &gt; Pelanggan</span>}
                description="Daftar pelanggan baik perorangan maupun korporasi / perusahaan."
                title="Daftar Pelanggan"
                actions={<Button onClick={() => navigate("/customers/create")}>Tambah Pelanggan</Button>}
            />

            <SectionCard title="Data Pelanggan" description="Mockup read-only yang menampilkan entri pelanggan Anda.">
                <DataTable
                    columns={[
                        {
                            header: "Nama",
                            render: (party) => (
                                <div className="field-stack">
                                    <strong>{party.name}</strong>
                                    <span className="muted">{party.code}</span>
                                </div>
                            ),
                        },
                        {
                            header: "Tipe",
                            render: (party) => <Badge tone="neutral">Customer</Badge>,
                        },
                        {
                            header: "Kontak",
                            render: (party) => party.phone ?? party.email ?? "-",
                        },
                        {
                            header: "Alamat",
                            render: (party) => party.address,
                        },
                        {
                            header: "Aksi",
                            render: (party) => (
                                <div className="inline-stack">
                                    <Button onClick={() => navigate(`/customers/${party.id}/edit`)} variant="secondary">
                                        Detail
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    rowKey={(party) => party.id}
                    rows={customers}
                />
            </SectionCard>
        </div>
    );
}

export function CustomerFormPage() {
    const navigate = useNavigate();
    const { partyId } = useParams();
    const { activeTenantData, saveBusinessParty } = useMockApp();

    const existing = activeTenantData?.businessParties.find((party) => party.id === partyId);

    const [attributes, setAttributes] = useState<{ name: string, value: string }[]>(() => {
        if (!existing?.attributes) return [];
        return Object.entries(existing.attributes).map(([name, value]) => ({ name, value }));
    });

    if (!activeTenantData) {
        return null;
    }

    const suggestedOptions = Array.from(new Set(
        activeTenantData.businessParties
            .filter(p => p.partyType === "customer" && p.attributes)
            .flatMap(p => Object.keys(p.attributes!))
    )).map(key => ({ label: key, value: key }));

    return (
        <div className="page-shell">
            <PageHeader
                breadcrumbs={<span>Dashboard &gt; Pelanggan &gt; {existing ? "Edit" : "Tambah"}</span>}
                description="Catat entitas penerima layanan dan penjualan Anda."
                title={existing ? "Edit Pelanggan" : "Tambah Pelanggan"}
                actions={
                    <Button onClick={() => navigate("/customers")} variant="ghost">
                        &larr; Kembali
                    </Button>
                }
            />

            <form
                className="page-shell"
                onSubmit={(event) => {
                    event.preventDefault();
                    const formData = new FormData(event.currentTarget);

                    const attrsRecord: Record<string, string> = {};
                    attributes.forEach(attr => {
                        if (attr.name.trim()) {
                            attrsRecord[attr.name.trim()] = attr.value;
                        }
                    });

                    saveBusinessParty({
                        id: existing?.id,
                        partyType: "customer",
                        code: String(formData.get("code")),
                        name: String(formData.get("name")),
                        phone: String(formData.get("phone")),
                        email: String(formData.get("email")),
                        address: String(formData.get("address")),
                        notes: String(formData.get("notes")),
                        attributes: attrsRecord,
                    });

                    navigate("/customers");
                }}
            >
                <SectionCard title="Profil Kontak" description="Informasi identifikasi utama">
                    <div className="form-grid">
                        <div className="field">
                            <label htmlFor="code">ID / Kode Pelanggan</label>
                            <input className="input" defaultValue={existing?.code ?? `CUST-${Math.floor(Math.random() * 9000 + 1000)}`} id="code" name="code" required />
                        </div>
                        <div className="field">
                            <label htmlFor="name">Nama Lengkap / Perusahaan</label>
                            <input className="input" defaultValue={existing?.name ?? ""} id="name" name="name" required />
                        </div>
                        <div className="field">
                            <label htmlFor="phone">Telepon / WhatsApp</label>
                            <input className="input" defaultValue={existing?.phone ?? ""} id="phone" name="phone" />
                        </div>
                        <div className="field">
                            <label htmlFor="email">Email</label>
                            <input className="input" defaultValue={existing?.email ?? ""} id="email" name="email" type="email" />
                        </div>
                        <div className="field form-grid-full">
                            <label htmlFor="address">Alamat Lengkap</label>
                            <textarea className="textarea" defaultValue={existing?.address ?? ""} id="address" name="address" required />
                        </div>
                        <div className="field form-grid-full">
                            <label htmlFor="notes">Catatan Tambahan (Opsional)</label>
                            <textarea className="textarea" defaultValue={existing?.notes ?? ""} id="notes" name="notes" placeholder="PIC, Syarat khusus, dll..." />
                        </div>
                    </div>
                </SectionCard>

                <SectionCard title="Informasi Tambahan" description="Catat data spesifik pelanggan seperti NPWP, detail bank, nama PIC, dsb.">
                    <div className="list-stack">
                        {attributes.map((attr, index) => (
                            <div key={index} className="split-layout" style={{ alignItems: "flex-end", gap: "12px", borderBottom: "1px dashed var(--border-subtle)", paddingBottom: "12px" }}>
                                <div className="field">
                                    <label>Nama Informasi (Contoh: NPWP)</label>
                                    <SearchableSelect
                                        options={suggestedOptions}
                                        value={attr.name}
                                        onChange={(val) => {
                                            const next = [...attributes];
                                            next[index].name = val;
                                            setAttributes(next);
                                        }}
                                        placeholder="Pilih atau ketik..."
                                        allowCreate={true}
                                    />
                                </div>
                                <div className="field">
                                    <label>Keterangan</label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input className="input" style={{ flex: 1 }} value={attr.value} onChange={(e) => {
                                            const next = [...attributes];
                                            next[index].value = e.target.value;
                                            setAttributes(next);
                                        }} placeholder="Isi detail informasi" />
                                        <Button type="button" variant="ghost" onClick={() => setAttributes(attributes.filter((_, i) => i !== index))} style={{ color: "var(--color-danger)" }}>Hapus</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div>
                            <Button type="button" variant="secondary" onClick={() => setAttributes([...attributes, { name: "", value: "" }])}>
                                + Tambah Informasi Baru
                            </Button>
                        </div>
                    </div>
                </SectionCard>

                <div className="form-actions">
                    <Button onClick={() => navigate("/customers")} variant="secondary">Batal</Button>
                    <Button type="submit">Simpan Data Pelanggan</Button>
                </div>
            </form>
        </div>
    );
}
