import { useMemo } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Badge, Button, DataTable, PageHeader, SearchableSelect, SectionCard } from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import { formatRoleLabel } from "../../../utils";

export function UsersListPage() {
  const navigate = useNavigate();
  const { activeCompanyData, database, setMembershipStatus, can } = useMockApp();

  const rows = useMemo(() => {
    if (!activeCompanyData) {
      return [];
    }

    return activeCompanyData.memberships.map((membership) => {
      const user = database.users.find((entry) => entry.id === membership.userId);
      const branches = database.branches.filter((branch) => membership.branchIds.includes(branch.id));
      return { membership, user, branches };
    });
  }, [activeCompanyData, database.branches, database.users]);

  if (!activeCompanyData) {
    return null;
  }

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Pengguna</span>}
        description="Kelola anggota tim, role yang dimiliki, dan cabang yang dapat mereka akses."
        title="Pengguna"
        actions={<Button onClick={() => navigate("/users/create")}>Tambah Pengguna</Button>}
      />

      <SectionCard title="Anggota Tim" description="Semua user perusahaan beserta role dan akses cabangnya.">
        <DataTable
          columns={[
            {
              header: "Nama",
              render: (row) => (
                <div className="field-stack">
                  <strong>{row.user?.fullName ?? row.membership.displayTitle}</strong>
                  <span className="muted">{row.user?.email ?? "-"}</span>
                </div>
              ),
            },
            {
              header: "Jabatan",
              render: (row) => row.membership.displayTitle,
            },
            {
              header: "Role",
              render: (row) => (
                <div className="inline-stack">
                  {row.membership.roleCodes.map((role) => (
                    <Badge key={role} tone="neutral">
                      {formatRoleLabel(role)}
                    </Badge>
                  ))}
                </div>
              ),
            },
            {
              header: "Cabang",
              render: (row) => (
                <div className="inline-stack">
                  {row.branches.map((branch) => (
                    <Badge key={branch.id} tone="info">
                      {branch.code}
                    </Badge>
                  ))}
                </div>
              ),
            },
            {
              header: "Status",
              render: (row) => (
                <div className="inline-stack">
                  <Badge tone={row.membership.status === "active" ? "success" : "warning"}>
                    {row.membership.status}
                  </Badge>
                  {can("user.archive") ? (
                    <Button
                      onClick={() =>
                        setMembershipStatus(
                          row.membership.id,
                          row.membership.status === "active" ? "inactive" : "active",
                        )
                      }
                      variant="ghost"
                    >
                      {row.membership.status === "active" ? "Nonaktifkan" : "Aktifkan"}
                    </Button>
                  ) : null}
                </div>
              ),
            },
            {
              header: "Aksi",
              render: (row) => (
                <Button onClick={() => navigate(`/users/${row.membership.id}/edit`)} variant="secondary">
                  Detail
                </Button>
              ),
            },
          ]}
          rowKey={(row) => row.membership.id}
          rows={rows}
        />
      </SectionCard>
    </div>
  );
}

export function UserFormPage() {
  const navigate = useNavigate();
  const { membershipId } = useParams();
  const { activeCompanyData, database, saveUserMembership } = useMockApp();

  if (!activeCompanyData) {
    return null;
  }

  const membership = activeCompanyData.memberships.find((entry) => entry.id === membershipId);
  const user = database.users.find((entry) => entry.id === membership?.userId);
  const roleOptions = activeCompanyData.roleDefinitions.map((role) => role.code);

  return (
    <div className="page-shell">
      <PageHeader
        breadcrumbs={<span>Dashboard &gt; Pengguna &gt; {membership ? "Edit" : "Tambah"}</span>}
        description="Atur profil user, role yang dimiliki, dan daftar cabang yang boleh diakses."
        title={membership ? "Edit Pengguna" : "Tambah Pengguna"}
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
          const roleCodes = roleOptions.filter((role) => formData.getAll("roleCodes").includes(role));
          const branchIds = database.branches
            .map((branch) => branch.id)
            .filter((branchId) => formData.getAll("branchIds").includes(branchId));

          saveUserMembership({
            id: membership?.id,
            userId: user?.id,
            fullName: String(formData.get("fullName")),
            email: String(formData.get("email")),
            username: String(formData.get("username")),
            phone: String(formData.get("phone") ?? ""),
            displayTitle: String(formData.get("displayTitle")),
            status: formData.get("status") as "active" | "inactive",
            roleCodes,
            branchIds,
          });
          navigate("/users");
        }}
      >
        <SectionCard title="Data Pengguna" description="Profil utama anggota tim.">
          <div className="form-grid">
            <div className="field">
              <label htmlFor="fullName">Nama lengkap</label>
              <input className="input" defaultValue={user?.fullName ?? ""} id="fullName" name="fullName" required />
            </div>
            <div className="field">
              <label htmlFor="displayTitle">Jabatan</label>
              <input
                className="input"
                defaultValue={membership?.displayTitle ?? ""}
                id="displayTitle"
                name="displayTitle"
                required
              />
            </div>
            <div className="field">
              <label htmlFor="email">Email</label>
              <input className="input" defaultValue={user?.email ?? ""} id="email" name="email" required type="email" />
            </div>
            <div className="field">
              <label htmlFor="username">Username</label>
              <input className="input" defaultValue={user?.username ?? ""} id="username" name="username" required />
            </div>
            <div className="field">
              <label htmlFor="phone">No. WhatsApp</label>
              <input className="input" defaultValue={user?.phone ?? ""} id="phone" name="phone" />
            </div>
            <div className="field">
              <label htmlFor="status">Status</label>
              <SearchableSelect
                defaultValue={membership?.status ?? "active"}
                id="status"
                name="status"
                options={[
                  { value: "active", label: "Aktif" },
                  { value: "inactive", label: "Nonaktif" },
                ]}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard title="Role yang Dimiliki" description="Satu user dapat memiliki lebih dari satu role aktif.">
          <div className="inline-stack">
            {activeCompanyData.roleDefinitions.map((role) => (
              <label className="pill" key={role.code}>
                <input
                  defaultChecked={membership?.roleCodes.includes(role.code) ?? role.code === "staff"}
                  name="roleCodes"
                  type="checkbox"
                  value={role.code}
                />
                <span>{role.name}</span>
              </label>
            ))}
          </div>
        </SectionCard>

        <SectionCard title="Akses Cabang" description="Pilih cabang yang boleh diakses user ini.">
          <div className="inline-stack">
            {database.branches.map((branch) => (
              <label className="pill" key={branch.id}>
                <input
                  defaultChecked={membership?.branchIds.includes(branch.id) ?? branch.isDefault === true}
                  name="branchIds"
                  type="checkbox"
                  value={branch.id}
                />
                <span>{branch.name}</span>
              </label>
            ))}
          </div>
        </SectionCard>

        <div className="form-actions">
          <Button onClick={() => navigate("/users")} variant="secondary">
            Batal
          </Button>
          <Button type="submit">{membership ? "Simpan Perubahan" : "Tambah Pengguna"}</Button>
        </div>
      </form>
    </div>
  );
}
