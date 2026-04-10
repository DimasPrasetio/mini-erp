import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge, Button, Notice } from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import { formatRoleLabel } from "../../../utils";

const DEMO_ACCOUNTS = [
  {
    title: "Owner",
    username: "dimas",
    password: "demo123",
  },
  {
    title: "Admin",
    username: "rani",
    password: "demo123",
  },
  {
    title: "Staff",
    username: "bayu",
    password: "demo123",
  },
];

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useMockApp();
  const [identifier, setIdentifier] = useState("dimas");
  const [password, setPassword] = useState("demo123");
  const [error, setError] = useState<string>();

  const fromPath = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname;

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div className="brand-mark" style={{ margin: "0 auto 16px", width: 56, height: 56, fontSize: "1.2rem" }}>ME</div>
          <h1 style={{ fontSize: "2rem", color: "white" }}>Mini ERP</h1>
          <p style={{ marginTop: 8 }}>Silakan Masuk ke Akun Anda</p>
        </div>

        <div className="inline-stack" style={{ justifyContent: "center", marginBottom: 24 }}>
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.username}
              onClick={() => {
                setIdentifier(account.username);
                setPassword(account.password);
                setError(undefined);
              }}
              style={{
                background: "rgba(255,255,255,0.05)",
                border: identifier === account.username ? "1px solid #3b82f6" : "1px solid rgba(255,255,255,0.1)",
                color: "white", padding: "8px 16px", borderRadius: 99,
                cursor: "pointer", transition: "all 0.2s"
              }}
            >
              Log in as {account.title}
            </button>
          ))}
        </div>

        {error ? (
          <div style={{ marginBottom: 24 }}>
            <Notice tone="danger" title="Gagal Masuk">{error}</Notice>
          </div>
        ) : null}

        <form
          onSubmit={(event) => {
            event.preventDefault();
            const result = login(identifier, password);
            if (!result.ok) {
              setError(result.error);
              return;
            }
            if (result.requiresTenantSelection) {
              navigate("/select-tenant", { replace: true });
              return;
            }
            navigate(fromPath && fromPath !== "/login" ? fromPath : "/dashboard", { replace: true });
          }}
        >
          <div className="field" style={{ marginBottom: 16 }}>
            <label htmlFor="identifier">Username atau Email</label>
            <input
              className="input"
              id="identifier"
              onChange={(event) => setIdentifier(event.target.value)}
              placeholder="Masukkan username Anda"
              value={identifier}
            />
          </div>
          <div className="field" style={{ marginBottom: 24 }}>
            <label htmlFor="password">Kata Sandi</label>
            <input
              className="input"
              id="password"
              onChange={(event) => setPassword(event.target.value)}
              placeholder="******"
              type="password"
              value={password}
            />
          </div>

          <Button type="submit" className="button-primary" style={{ width: "100%" }}>
            Masuk
          </Button>
        </form>
      </div>
    </div>
  );
}

export function TenantSelectorPage() {
  const navigate = useNavigate();
  const { availableTenants, selectTenant } = useMockApp();

  return (
    <div className="auth-container">
      <div className="auth-card auth-tenant-container">
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <h1 style={{ fontSize: "2rem", color: "white" }}>Pilih Bisnis</h1>
          <p style={{ marginTop: 8 }}>Anda memiliki akses ke beberapa bisnis, silakan pilih untuk melanjutkan.</p>
        </div>

        <div className="tenant-grid">
          {availableTenants.map((entry) => (
            <button
              className="tenant-card"
              key={entry.tenant.id}
              onClick={() => {
                selectTenant(entry.tenant.id);
                navigate("/dashboard", { replace: true });
              }}
              type="button"
            >
              <div className="inline-stack" style={{ marginBottom: 12 }}>
                <Badge tone="info">{entry.tenant.code}</Badge>
                {entry.isDefaultTenant ? <Badge tone="accent">Default</Badge> : null}
              </div>
              <h2 style={{ fontSize: "1.4rem", color: "white" }}>{entry.tenant.name}</h2>
              <p>{entry.displayTitle}</p>
              <div className="inline-stack">
                {entry.availableRoles.map((role) => (
                  <Badge key={role} tone="neutral">
                    {formatRoleLabel(role)}
                  </Badge>
                ))}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
