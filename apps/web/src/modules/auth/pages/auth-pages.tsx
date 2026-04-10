import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Badge, Notice } from "@mini-erp/ui";
import { useMockApp } from "../../../mock/state";
import { formatRoleLabel } from "../../../utils";

const DEMO_ACCOUNTS = [
  {
    title: "Superadmin",
    username: "superadmin",
    password: "demo123",
  },
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

// embedded css for premium yet ALIGNED look
const alignedAuthCss = `
  .auth-layout-container {
    min-height: 100vh;
    display: flex;
    background-color: var(--bg-canvas);
    font-family: var(--font-sans);
  }
  .auth-aside {
    display: none;
  }
  @media (min-width: 1024px) {
    .auth-aside {
      display: flex;
      flex: 1.2;
      background: linear-gradient(135deg, var(--color-primary) 0%, #0f172a 100%);
      color: white;
      flex-direction: column;
      justify-content: center;
      padding: 64px;
      position: relative;
      overflow: hidden;
    }
  }
  
  .auth-aside::before {
    content: '';
    position: absolute;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.08) 0%, transparent 40%);
    top: -50%;
    left: -50%;
    animation: rotate 30s linear infinite;
  }

  @keyframes rotate {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .auth-main {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 32px;
    position: relative;
  }

  .auth-card-clean {
    width: 100%;
    max-width: 420px;
    background: var(--bg-surface);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-lg);
    border: 1px solid var(--border-subtle);
    padding: 40px;
    color: var(--text-body);
  }

  .auth-card-branch {
    max-width: 700px;
  }

  .auth-brand-logo {
    width: 48px;
    height: 48px;
    background: var(--color-primary);
    color: white;
    border-radius: var(--radius-md);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.25rem;
    font-weight: 700;
    margin-bottom: 24px;
    box-shadow: 0 4px 6px -1px rgba(37, 99, 235, 0.3);
  }

  .auth-title {
    font-size: 1.75rem;
    color: var(--text-strong);
    font-weight: 700;
    margin-bottom: 8px;
  }

  .auth-subtitle {
    color: var(--text-muted);
    font-size: 0.95rem;
    margin-bottom: 32px;
  }

  .auth-input-group {
    margin-bottom: 20px;
  }
  
  .auth-input-group label {
    display: block;
    font-size: 0.85rem;
    font-weight: 600;
    color: var(--text-strong);
    margin-bottom: 8px;
  }

  .auth-input {
    width: 100%;
    padding: 12px 16px;
    border: 1px solid var(--border-strong);
    border-radius: var(--radius-md);
    font-size: 0.95rem;
    color: var(--text-strong);
    background: var(--bg-surface);
    transition: all 0.2s;
    box-sizing: border-box;
  }

  .auth-input:focus {
    border-color: var(--border-focus);
    box-shadow: var(--focus-ring);
    outline: none;
  }

  .auth-btn-primary {
    width: 100%;
    padding: 12px;
    background: var(--color-primary);
    color: white;
    border: none;
    border-radius: var(--radius-md);
    font-weight: 600;
    font-size: 1rem;
    cursor: pointer;
    transition: background 0.2s;
    margin-top: 8px;
  }

  .auth-btn-primary:hover {
    background: var(--color-primary-hover);
  }

  .demo-actions-clean {
    margin-top: 32px;
    padding-top: 24px;
    border-top: 1px solid var(--border-subtle);
  }

  .demo-actions-clean p {
    font-size: 0.8rem;
    color: var(--text-muted);
    text-align: center;
    margin-bottom: 12px;
  }

  .demo-chips-clean {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .demo-chip-clean {
    background: var(--bg-neutral-soft);
    border: 1px solid var(--border-subtle);
    color: var(--text-body);
    padding: 6px 14px;
    border-radius: 999px;
    font-size: 0.75rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }

  .demo-chip-clean:hover {
    background: var(--bg-surface);
    box-shadow: var(--shadow-sm);
    border-color: var(--border-strong);
  }

  .branch-grid-clean {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 16px;
    margin-top: 24px;
  }

  .branch-card-clean {
    background: var(--bg-surface);
    border: 1px solid var(--border-subtle);
    border-radius: var(--radius-md);
    padding: 20px;
    cursor: pointer;
    transition: all 0.2s;
    text-align: left;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .branch-card-clean:hover {
    border-color: var(--color-primary);
    box-shadow: var(--shadow-md);
    background: var(--color-primary-soft);
    transform: translateY(-2px);
  }

  .branch-card-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }

  .branch-card-header h2 {
    font-size: 1.05rem;
    font-weight: 600;
    color: var(--text-strong);
    margin: 0 0 4px;
  }

  .branch-card-header p {
    font-size: 0.85rem;
    color: var(--text-muted);
    margin: 0;
  }
`;

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useMockApp();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>();

  const fromPath = (location.state as { from?: { pathname?: string } } | undefined)?.from?.pathname;

  const handleFillDemo = (username: string, pass: string) => {
    setIdentifier(username);
    setPassword(pass);
    setError(undefined);
  };

  return (
    <>
      <style>{alignedAuthCss}</style>
      <div className="auth-layout-container">
        <div className="auth-aside">
          <div style={{ position: "relative", zIndex: 10, maxWidth: 480 }}>
            <h1 style={{ fontSize: "3rem", fontWeight: 700, marginBottom: 16, lineHeight: 1.2, color: "white" }}>
              Operasional Bisnis, Kini Lebih Mudah.
            </h1>
            <p style={{ fontSize: "1.1rem", opacity: 0.9, lineHeight: 1.6 }}>
              Platform Mini ERP modern yang siap tumbuh bersama skala bisnis Anda. Kelola logistik, inventaris, dan operasional dengan presisi tinggi dan visibilitas penuh.
            </p>
          </div>
        </div>

        <div className="auth-main">
          <div className="auth-card-clean">
            <div className="auth-brand-logo">ME</div>
            <h1 className="auth-title">Welcome back</h1>
            <p className="auth-subtitle">Please enter your details to sign in.</p>

            {error ? (
              <div style={{ marginBottom: 24 }}>
                <Notice tone="danger" title="Authentication Error">
                  {error}
                </Notice>
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
                if (result.requiresBranchSelection) {
                  navigate("/select-branch", { replace: true });
                  return;
                }
                navigate(fromPath && fromPath !== "/login" ? fromPath : "/dashboard", { replace: true });
              }}
            >
              <div className="auth-input-group">
                <label htmlFor="identifier">Username or Email</label>
                <input
                  className="auth-input"
                  id="identifier"
                  onChange={(event) => setIdentifier(event.target.value)}
                  placeholder="Enter your username"
                  type="text"
                  value={identifier}
                  required
                />
              </div>
              <div className="auth-input-group" style={{ marginBottom: 28 }}>
                <label htmlFor="password">Password</label>
                <input
                  className="auth-input"
                  id="password"
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="••••••••"
                  type="password"
                  value={password}
                  required
                />
              </div>

              <button className="auth-btn-primary" type="submit">
                Sign In
              </button>
            </form>

            <div className="demo-actions-clean">
              <p>Demo Accounts Shortcut</p>
              <div className="demo-chips-clean">
                {DEMO_ACCOUNTS.map(acc => (
                  <button
                    key={acc.username}
                    type="button"
                    className="demo-chip-clean"
                    onClick={() => handleFillDemo(acc.username, acc.password)}
                  >
                    {acc.title}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export function BranchSelectorPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCompany, accessibleBranches, selectBranch } = useMockApp();

  const fromPath = (location.state as { from?: string } | undefined)?.from;

  return (
    <>
      <style>{alignedAuthCss}</style>
      <div className="auth-layout-container">
        <div className="auth-main" style={{ padding: "40px" }}>
          <div className="auth-card-clean auth-card-branch">
            <div style={{ textAlign: "center", marginBottom: 32 }}>
              <div className="auth-brand-logo" style={{ margin: "0 auto 16px" }}>ME</div>
              <h1 className="auth-title">Select Branch</h1>
              <p className="auth-subtitle" style={{ margin: "0 auto", maxWidth: 500 }}>
                {activeCompany
                  ? `${activeCompany.name} has multiple branches available for your account. Please select one to proceed.`
                  : "Please select an active branch to continue."}
              </p>
            </div>

            <div className="branch-grid-clean">
              {accessibleBranches.map((entry) => (
                <button
                  key={entry.branch.id}
                  className="branch-card-clean"
                  onClick={() => {
                    selectBranch(entry.branch.id);
                    navigate(fromPath || "/dashboard", { replace: true });
                  }}
                  type="button"
                >
                  <div className="branch-card-header">
                    <div>
                      <h2>{entry.branch.name}</h2>
                      <p>{entry.branch.city}</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: 4, alignItems: "flex-end" }}>
                      <Badge tone="info">{entry.branch.code}</Badge>
                      {entry.isDefaultBranch ? <Badge tone="accent">Default</Badge> : null}
                    </div>
                  </div>

                  <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--border-subtle)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ textAlign: "left" }}>
                      <span style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "block" }}>Access Profile</span>
                      <strong style={{ fontSize: "0.85rem", color: "var(--text-strong)" }}>{entry.displayTitle}</strong>
                    </div>
                    <div style={{ display: "flex", gap: 4, flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {entry.availableRoles.map((role) => (
                        <Badge key={role} tone="neutral">
                          {formatRoleLabel(role)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
