import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, DataTable, PageHeader, SectionCard, SearchableSelect } from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";

type AttributeField = {
    id: string;
    name: string;
    value: string;
};

function createAttributeField(name = "", value = ""): AttributeField {
    return {
        id: `attribute-${crypto.randomUUID()}`,
        name,
        value,
    };
}

function getFormTextValue(formData: FormData, fieldName: string) {
    const value = formData.get(fieldName);
    return typeof value === "string" ? value : "";
}

function updateAttributeName(attributes: AttributeField[], attributeId: string, name: string) {
    return attributes.map((entry) => entry.id === attributeId ? { ...entry, name } : entry);
}

function updateAttributeValue(attributes: AttributeField[], attributeId: string, value: string) {
    return attributes.map((entry) => entry.id === attributeId ? { ...entry, value } : entry);
}

function removeAttribute(attributes: AttributeField[], attributeId: string) {
    return attributes.filter((entry) => entry.id !== attributeId);
}

export function SuppliersListPage() {
    const navigate = useNavigate();
    const { activeWorkspaceData } = useMockApp();

    if (!activeWorkspaceData) {
        return null;
    }

    const suppliers = activeWorkspaceData.businessParties.filter(
        (party) => party.partyType === "supplier"
    );

    return (
        <div className="page-shell">
            <PageHeader
                breadcrumbs={<span>Dashboard &gt; Pemasok</span>}
                description="Daftar pemasok atau principal sumber stok Anda."
                title="Daftar Pemasok"
                actions={<Button onClick={() => navigate("/suppliers/create")}>Tambah Pemasok</Button>}
            />

            <SectionCard title="Data Pemasok" description="Mockup read-only yang menampilkan entri rekanan supplier Anda.">
                <DataTable
                    columns={[
                        {
                            header: "Nama Pemasok",
                            render: (party) => (
                                <div className="field-stack">
                                    <strong>{party.name}</strong>
                                    <span className="muted">{party.code}</span>
                                </div>
                            ),
                        },
                        {
                            header: "Tipe",
                            render: (party) => <Badge tone="info">Supplier</Badge>,
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
                                    <Button onClick={() => navigate(`/suppliers/${party.id}/edit`)} variant="secondary">
                                        Detail
                                    </Button>
                                </div>
                            ),
                        },
                    ]}
                    rowKey={(party) => party.id}
                    rows={suppliers}
                />
            </SectionCard>
        </div>
    );
}

export function SupplierFormPage() {
    const navigate = useNavigate();
    const { partyId } = useParams();
    const { activeWorkspaceData, saveBusinessParty } = useMockApp();

    const existing = activeWorkspaceData?.businessParties.find((party) => party.id === partyId);

    const [attributes, setAttributes] = useState<AttributeField[]>(() => {
        if (!existing?.attributes) return [];
        return Object.entries(existing.attributes).map(([name, value]) => createAttributeField(name, value));
    });

    if (!activeWorkspaceData) {
        return null;
    }

    const handleAttributeNameChange = (attributeId: string, name: string) => {
        setAttributes((current) => updateAttributeName(current, attributeId, name));
    };

    const handleAttributeValueChange = (attributeId: string, value: string) => {
        setAttributes((current) => updateAttributeValue(current, attributeId, value));
    };

    const handleAttributeRemove = (attributeId: string) => {
        setAttributes((current) => removeAttribute(current, attributeId));
    };

    const suggestedOptions = Array.from(new Set(
        activeWorkspaceData.businessParties
            .filter(p => p.partyType === "supplier" && p.attributes)
            .flatMap(p => Object.keys(p.attributes!))
    )).map(key => ({ label: key, value: key }));

    return (
        <div className="page-shell">
            <PageHeader
                breadcrumbs={<span>Dashboard &gt; Pemasok &gt; {existing ? "Edit" : "Tambah"}</span>}
                description="Mencatat mitra pengadaan dan partner stok operasional."
                title={existing ? "Edit Pemasok" : "Tambah Pemasok"}
                actions={
                    <Button onClick={() => navigate(-1)} variant="ghost">
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
                        partyType: "supplier",
                        code: getFormTextValue(formData, "code"),
                        name: getFormTextValue(formData, "name"),
                        phone: getFormTextValue(formData, "phone"),
                        email: getFormTextValue(formData, "email"),
                        address: getFormTextValue(formData, "address"),
                        notes: getFormTextValue(formData, "notes"),
                        attributes: attrsRecord,
                    });

                    navigate("/suppliers");
                }}
            >
                <SectionCard title="Profil Kontak" description="Informasi identifikasi utama">
                    <div className="form-grid">
                        <div className="field">
                            <label htmlFor="code">ID / Kode Pemasok</label>
                            <input className="input" defaultValue={existing?.code ?? `SUPP-${Math.floor(Math.random() * 9000 + 1000)}`} id="code" name="code" required />
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

                <SectionCard title="Informasi Tambahan" description="Catat data spesifik pemasok seperti NPWP, detail bank pencairan, nama PIC, dsb.">
                    <div className="list-stack">
                        {attributes.map((attr) => (
                            <div key={attr.id} className="split-layout" style={{ alignItems: "flex-end", gap: "12px", borderBottom: "1px dashed var(--border-subtle)", paddingBottom: "12px" }}>
                                <div className="field">
                                    <label htmlFor={`supplier-attribute-name-${attr.id}`}>Nama Informasi (Contoh: NPWP, Rekening)</label>
                                    <SearchableSelect
                                        id={`supplier-attribute-name-${attr.id}`}
                                        options={suggestedOptions}
                                        value={attr.name}
                                        onChange={(val) => handleAttributeNameChange(attr.id, val)}
                                        placeholder="Pilih atau ketik..."
                                        allowCreate={true}
                                    />
                                </div>
                                <div className="field">
                                    <label htmlFor={`supplier-attribute-value-${attr.id}`}>Keterangan</label>
                                    <div style={{ display: "flex", gap: "8px" }}>
                                        <input className="input" id={`supplier-attribute-value-${attr.id}`} style={{ flex: 1 }} value={attr.value} onChange={(e) => handleAttributeValueChange(attr.id, e.target.value)} placeholder="Isi detail informasi" />
                                        <Button type="button" variant="ghost" onClick={() => handleAttributeRemove(attr.id)} style={{ color: "var(--color-danger)" }}>Hapus</Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div>
                            <Button type="button" variant="secondary" onClick={() => setAttributes((current) => [...current, createAttributeField()])}>
                                + Tambah Informasi Baru
                            </Button>
                        </div>
                    </div>
                </SectionCard>

                <div className="form-actions">
                    <Button onClick={() => navigate("/suppliers")} variant="secondary">Batal</Button>
                    <Button type="submit">Simpan Data Pemasok</Button>
                </div>
            </form>
        </div>
    );
}
