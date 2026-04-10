import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cloneDatabase, INITIAL_SESSION } from "./initial-data";
import { getDefaultRole, getRolePermissions, hasPermission } from "./permissions";
import type {
  AuditLog,
  Branch,
  BranchData,
  BusinessParty,
  Company,
  CompanyData,
  DemoUser,
  Item,
  KnowledgeDocument,
  MembershipRecord,
  MockDatabase,
  MockSession,
  MovementType,
  Order,
  PermissionCode,
  RoleCode,
  RoleDefinition,
  StatusDefinition,
  StatusTransition,
  ToastMessage,
  WhatsappAuthorization,
} from "../types";

type ItemInput = Omit<Item, "id"> & { id?: string };
type MembershipFormInput = {
  id?: string;
  userId?: string;
  fullName: string;
  email: string;
  username: string;
  phone?: string;
  displayTitle: string;
  status: "active" | "inactive";
  roleCodes: RoleCode[];
  branchIds: string[];
};
type OrderInput = Omit<
  Order,
  "id" | "history" | "subtotalAmount" | "discountAmount" | "totalAmount"
> & { id?: string };
type StockAdjustmentInput = {
  itemId: string;
  movementType: MovementType;
  quantity: number;
  reasonText: string;
};
type StatusInput = Omit<StatusDefinition, "id"> & { id?: string };
type TransitionInput = Omit<StatusTransition, "id"> & { id?: string };
type PartyInput = Omit<BusinessParty, "id"> & { id?: string };
type KnowledgeInput = Omit<KnowledgeDocument, "id" | "uploadedAt"> & { id?: string };
type WhatsappInput = Omit<WhatsappAuthorization, "id"> & { id?: string };
type CategoryInput = {
  id?: string;
  name: string;
  code: string;
  parentCategoryId?: string;
};
type RoleDefinitionInput = {
  code?: RoleCode;
  name: string;
  description: string;
  isSystem?: boolean;
};

type AccessibleBranch = {
  branch: Branch;
  displayTitle: string;
  availableRoles: RoleCode[];
  isDefaultBranch?: boolean;
};

type WorkspaceData = CompanyData & BranchData;

type MockAppContextValue = {
  database: MockDatabase;
  session: MockSession;
  activeUser?: DemoUser;
  activeCompany?: Company;
  activeCompanyData?: CompanyData;
  activeBranch?: Branch;
  activeBranchData?: BranchData;
  activeWorkspaceData?: WorkspaceData;
  activeRoleCode?: RoleCode;
  permissions: PermissionCode[];
  accessibleBranches: AccessibleBranch[];
  activeBranchMemberships: MembershipRecord[];
  availableRoles: RoleCode[];
  isAuthenticated: boolean;
  toasts: ToastMessage[];
  login: (identifier: string, password: string) => {
    ok: boolean;
    error?: string;
    requiresBranchSelection: boolean;
  };
  logout: () => void;
  selectBranch: (branchId: string) => void;
  switchRole: (roleCode: RoleCode) => boolean;
  can: (permission?: PermissionCode) => boolean;
  findUserById: (userId?: string) => DemoUser | undefined;
  findMembershipName: (membershipId?: string) => string;
  findItemName: (itemId?: string) => string;
  notify: (title: string, description?: string, tone?: ToastMessage["tone"]) => void;
  saveItem: (input: ItemInput) => string;
  archiveItem: (itemId: string) => void;
  saveOrder: (input: OrderInput) => string;
  updateOrderStatus: (orderId: string, toStatusId: string, changeReason?: string) => void;
  saveStockAdjustment: (input: StockAdjustmentInput) => void;
  saveUserMembership: (input: MembershipFormInput) => void;
  setMembershipStatus: (membershipId: string, status: "active" | "inactive") => void;
  saveBusinessParty: (input: PartyInput) => string;
  saveSettings: (settings: CompanyData["settings"]) => void;
  saveStatusDefinition: (input: StatusInput) => void;
  saveStatusTransition: (input: TransitionInput) => void;
  saveKnowledgeDocument: (input: KnowledgeInput) => void;
  archiveKnowledgeDocument: (documentId: string) => void;
  saveWhatsappAuthorization: (input: WhatsappInput) => void;
  revokeWhatsappAuthorization: (authorizationId: string) => void;
  saveRoleDefinition: (input: RoleDefinitionInput) => void;
  deleteRoleDefinition: (roleCode: RoleCode) => void;
  saveRolePermissions: (roleCode: RoleCode, permissions: PermissionCode[]) => void;
  saveItemCategory: (input: CategoryInput) => void;
  saveBranch: (input: Partial<Branch> & { name: string; code: string; city: string; address: string; defaultStockLocationLabel: string }) => void;
  updateCompanyData: (mutator: (companyData: CompanyData) => CompanyData) => void;
  updateBranchData: (mutator: (branchData: BranchData) => BranchData) => void;
  updateWorkspaceData: (mutator: (workspaceData: WorkspaceData) => WorkspaceData) => void;
};

const MockAppContext = createContext<MockAppContextValue | undefined>(undefined);

const STORAGE_KEY = "mini-erp-phase0-b2-state";

function findMembershipId(companyData: CompanyData, userId?: string) {
  return companyData.memberships.find((membership) => membership.userId === userId)?.id;
}

function resolveActiveRoleCode(sessionRoleCode: RoleCode | undefined, availableRoles: RoleCode[]) {
  if (sessionRoleCode && availableRoles.includes(sessionRoleCode)) {
    return sessionRoleCode;
  }

  if (availableRoles.length > 0) {
    return getDefaultRole(availableRoles);
  }

  return undefined;
}

function updateUserCompanyMembership(
  memberships: DemoUser["memberships"],
  companyId: string,
  displayTitle: string,
  availableRoles: RoleCode[],
  branchIds: string[],
  defaultBranchId: string | undefined,
) {
  return memberships.map((membership) =>
    membership.companyId === companyId
      ? {
          ...membership,
          displayTitle,
          availableRoles,
          branchIds,
          defaultBranchId,
        }
      : membership,
  );
}

function loadState() {
  if (globalThis.window === undefined) {
    return { database: cloneDatabase(), session: INITIAL_SESSION };
  }

  const raw = globalThis.localStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return { database: cloneDatabase(), session: INITIAL_SESSION };
  }

  try {
    const parsed = JSON.parse(raw) as { database: MockDatabase; session: MockSession };
    if (!parsed.database.company || !parsed.database.companyData || !parsed.database.branchData) {
      throw new Error("stale-state");
    }
    return parsed;
  } catch {
    return { database: cloneDatabase(), session: INITIAL_SESSION };
  }
}

function sumOrderTotal(order: OrderInput, items: Item[]) {
  const subtotal = order.items.reduce((total, line) => {
    const catalogItem = items.find((entry) => entry.id === line.itemId);
    const fallbackPrice = catalogItem?.standardPrice ?? 0;
    return total + line.quantity * (line.unitPrice || fallbackPrice);
  }, 0);

  return {
    subtotalAmount: subtotal,
    discountAmount: 0,
    totalAmount: subtotal,
  };
}

function nowIso() {
  return new Date().toISOString();
}

function makeId(prefix: string) {
  return `${prefix}-${crypto.randomUUID()}`;
}

function makeRoleCode(name: string) {
  return name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "_")
    .replaceAll(/^_+|_+$/g, "");
}

function makeOrderNumber(branchCode: string) {
  const dateCode = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const serial = Math.floor(Math.random() * 900 + 100);
  return `${branchCode}-ORD-${dateCode}-${serial}`;
}

export function MockAppProvider({ children }: Readonly<{ children: ReactNode }>) {
  const loaded = loadState();
  const [database, setDatabase] = useState<MockDatabase>(loaded.database);
  const [session, setSession] = useState<MockSession>(loaded.session);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    globalThis.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        database,
        session,
      }),
    );
  }, [database, session]);

  useEffect(() => {
    return () => {
      Object.values(toastTimers.current).forEach((timer) => globalThis.clearTimeout(timer));
    };
  }, []);

  const activeUser = database.users.find((user) => user.id === session.userId);
  const activeCompany = activeUser ? database.company : undefined;
  const activeMembership = activeUser?.memberships.find(
    (membership) => membership.companyId === database.company.id,
  );
  const accessibleBranches: AccessibleBranch[] =
    activeMembership?.branchIds.flatMap((branchId) => {
      const branch = database.branches.find((entry) => entry.id === branchId);
      if (!branch) {
        return [];
      }

      return [
        {
          branch,
          displayTitle: activeMembership.displayTitle,
          availableRoles: activeMembership.availableRoles,
          isDefaultBranch: activeMembership.defaultBranchId === branch.id,
        },
      ];
    }) ?? [];
  const activeBranch =
    database.branches.find((branch) => branch.id === session.activeBranchId) ??
    (accessibleBranches.length === 1 ? accessibleBranches[0]?.branch : undefined);
  const availableRoles = activeMembership?.availableRoles ?? [];
  const activeRoleCode = resolveActiveRoleCode(session.activeRoleCode, availableRoles);
  const activeCompanyData = activeCompany ? database.companyData : undefined;
  const activeBranchData = activeBranch ? database.branchData[activeBranch.id] : undefined;
  const activeWorkspaceData =
    activeCompanyData && activeBranchData
      ? ({
          ...activeCompanyData,
          ...activeBranchData,
        } as WorkspaceData)
      : undefined;
  const permissions = getRolePermissions(activeRoleCode, activeCompanyData?.rolePermissions);
  const activeBranchMemberships =
    activeCompanyData && activeBranch
      ? activeCompanyData.memberships.filter(
          (membership) =>
            membership.status === "active" && membership.branchIds.includes(activeBranch.id),
        )
      : [];

  function notify(title: string, description?: string, tone: ToastMessage["tone"] = "info") {
    const id = makeId("toast");
    setToasts((current) => [...current, { id, title, description, tone }]);
    toastTimers.current[id] = globalThis.setTimeout(() => {
      dismissToast(id);
    }, 3400);
  }

  function dismissToast(id: string) {
    setToasts((current) => current.filter((toast) => toast.id !== id));
    delete toastTimers.current[id];
  }

  function findUserById(userId?: string) {
    return database.users.find((user) => user.id === userId);
  }

  function findMembershipName(membershipId?: string) {
    if (!membershipId || !activeCompanyData) {
      return "-";
    }

    const membership = activeCompanyData.memberships.find((entry) => entry.id === membershipId);
    const user = findUserById(membership?.userId);
    return user?.fullName ?? membership?.displayTitle ?? "-";
  }

  function findItemName(itemId?: string) {
    if (!itemId || !activeCompanyData) {
      return "-";
    }

    return activeCompanyData.items.find((item) => item.id === itemId)?.itemName ?? "-";
  }

  function can(permission?: PermissionCode) {
    return hasPermission(activeRoleCode, permission, activeCompanyData?.rolePermissions);
  }

  function login(identifier: string, password: string) {
    const normalized = identifier.trim().toLowerCase();
    const user = database.users.find(
      (entry) =>
        entry.username.toLowerCase() === normalized || entry.email.toLowerCase() === normalized,
    );

    if (user?.password !== password) {
      return {
        ok: false,
        error: "Username, email, atau password tidak cocok.",
        requiresBranchSelection: false,
      };
    }

    const membership = user.memberships.find((entry) => entry.companyId === database.company.id);
    if (!membership) {
      return {
        ok: false,
        error: "Akun ini belum punya akses perusahaan.",
        requiresBranchSelection: false,
      };
    }

    const requiresBranchSelection = membership.branchIds.length > 1;
    setSession({
      userId: user.id,
      activeBranchId: requiresBranchSelection
        ? undefined
        : membership.defaultBranchId ?? membership.branchIds[0],
      activeRoleCode: getDefaultRole(membership.availableRoles),
    });

    return {
      ok: true,
      requiresBranchSelection,
    };
  }

  function logout() {
    setSession({});
    notify("Logout berhasil", "Sesi mockup dibersihkan.", "success");
  }

  function selectBranch(branchId: string) {
    const hasAccess = accessibleBranches.some((entry) => entry.branch.id === branchId);
    if (!hasAccess) {
      notify("Cabang tidak tersedia", "Anda tidak memiliki akses ke cabang tersebut.", "danger");
      return;
    }

    setSession((current) => ({
      ...current,
      activeBranchId: branchId,
      activeRoleCode:
        current.activeRoleCode ?? (availableRoles.length > 0 ? getDefaultRole(availableRoles) : undefined),
    }));
    notify("Cabang aktif diperbarui", "Semua data operasional sekarang mengikuti cabang terpilih.", "success");
  }

  function switchRole(roleCode: RoleCode) {
    if (!availableRoles.includes(roleCode)) {
      notify("Role tidak tersedia", "Role ini tidak terdaftar pada akses Anda.", "danger");
      return false;
    }

    setSession((current) => ({
      ...current,
      activeRoleCode: roleCode,
    }));
    notify("Role aktif diperbarui", `Tampilan sekarang mengikuti akses ${roleCode}.`, "success");
    return true;
  }

  function updateCompanyData(mutator: (companyData: CompanyData) => CompanyData) {
    setDatabase((current) => ({
      ...current,
      companyData: mutator(current.companyData),
    }));
  }

  function updateBranchData(mutator: (branchData: BranchData) => BranchData) {
    if (!activeBranch) {
      return;
    }

    setDatabase((current) => ({
      ...current,
      branchData: {
        ...current.branchData,
        [activeBranch.id]: mutator(current.branchData[activeBranch.id]),
      },
    }));
  }

  function updateWorkspaceData(mutator: (workspaceData: WorkspaceData) => WorkspaceData) {
    if (!activeCompanyData || !activeBranchData || !activeBranch) {
      return;
    }

    const nextWorkspace = mutator({
      ...activeCompanyData,
      ...activeBranchData,
    });

    setDatabase((current) => ({
      ...current,
      companyData: {
        memberships: nextWorkspace.memberships,
        roleDefinitions: nextWorkspace.roleDefinitions,
        rolePermissions: nextWorkspace.rolePermissions,
        itemCategories: nextWorkspace.itemCategories,
        items: nextWorkspace.items,
        businessParties: nextWorkspace.businessParties,
        statusDefinitions: nextWorkspace.statusDefinitions,
        statusTransitions: nextWorkspace.statusTransitions,
        knowledgeDocuments: nextWorkspace.knowledgeDocuments,
        whatsappAuthorizations: nextWorkspace.whatsappAuthorizations,
        auditLogs: nextWorkspace.auditLogs,
        settings: nextWorkspace.settings,
        whatsappChannelStatus: nextWorkspace.whatsappChannelStatus,
      },
      branchData: {
        ...current.branchData,
        [activeBranch.id]: {
          orders: nextWorkspace.orders,
          stockBalances: nextWorkspace.stockBalances,
          stockMovements: nextWorkspace.stockMovements,
        },
      },
    }));
  }

  function appendAuditLog(
    companyData: CompanyData,
    actionKey: string,
    entityType: string,
    entityLabel: string,
    description: string,
    branchAware = false,
  ): AuditLog[] {
    return [
      {
        id: makeId("audit"),
        happenedAt: nowIso(),
        actorName: activeUser?.fullName ?? "System",
        actorType: activeUser ? ("user" as const) : ("system" as const),
        actionKey,
        entityType,
        entityLabel,
        description,
        branchId: branchAware ? activeBranch?.id : undefined,
        branchName: branchAware ? activeBranch?.name : undefined,
      },
      ...companyData.auditLogs,
    ];
  }

  function saveItem(input: ItemInput) {
    const itemId = input.id ?? makeId("item");

    updateCompanyData((companyData) => {
      const nextItem = {
        ...input,
        id: itemId,
      };

      return {
        ...companyData,
        items: input.id
          ? companyData.items.map((item) => (item.id === input.id ? nextItem : item))
          : [nextItem, ...companyData.items],
        auditLogs: appendAuditLog(
          companyData,
          input.id ? "product.update" : "product.create",
          "product",
          nextItem.itemName,
          input.id ? "Produk diperbarui dari mock form." : "Produk baru ditambahkan dari mock form.",
        ),
      };
    });

    notify(
      input.id ? "Produk diperbarui" : "Produk ditambahkan",
      "Perubahan tersimpan di data perusahaan aktif.",
      "success",
    );

    return itemId;
  }

  function archiveItem(itemId: string) {
    updateCompanyData((companyData) => {
      const item = companyData.items.find((entry) => entry.id === itemId);
      return {
        ...companyData,
        items: companyData.items.map((entry) =>
          entry.id === itemId ? { ...entry, status: "inactive" } : entry,
        ),
        auditLogs: appendAuditLog(
          companyData,
          "product.archive",
          "product",
          item?.itemName ?? "Produk",
          "Produk diarsipkan dari halaman detail.",
        ),
      };
    });
    notify("Produk diarsipkan", "Produk disembunyikan dari daftar aktif.", "warning");
  }

  function saveOrder(input: OrderInput) {
    if (!activeBranchData || !activeCompanyData || !activeUser || !activeBranch) {
      return "";
    }

    const orderId = input.id ?? makeId("order");
    const orderNumber = input.orderNumber || makeOrderNumber(activeBranch.code);
    const totals = sumOrderTotal(input, activeCompanyData.items);
    const initialStatus =
      input.currentStatusId ||
      activeCompanyData.statusDefinitions.find((status) => status.isInitial)?.id ||
      activeCompanyData.statusDefinitions[0]?.id;

    updateBranchData((branchData) => ({
      ...branchData,
      orders: input.id
        ? branchData.orders.map((entry) =>
            entry.id === input.id
              ? {
                  ...input,
                  id: orderId,
                  orderNumber,
                  currentStatusId: initialStatus,
                  ...totals,
                  history: entry.history,
                }
              : entry,
          )
        : [
            {
              ...input,
              id: orderId,
              orderNumber,
              currentStatusId: initialStatus,
              ...totals,
              history: [
                {
                  id: makeId("history"),
                  toStatusId: initialStatus,
                  changedAt: nowIso(),
                  changedByMembershipId:
                    activeCompanyData.memberships.find((membership) => membership.userId === activeUser.id)
                      ?.id,
                  changeReason: "Order dibuat dari mock form.",
                },
              ],
            },
            ...branchData.orders,
          ],
    }));

    updateCompanyData((companyData) => ({
      ...companyData,
      auditLogs: appendAuditLog(
        companyData,
        input.id ? "order.update" : "order.create",
        "order",
        orderNumber,
        input.id ? "Order diperbarui dari mock form." : "Order baru dibuat dari mock form.",
        true,
      ),
    }));

    notify("Order tersimpan", "Data order telah disimpan pada cabang aktif.", "success");
    return orderId;
  }

  function updateOrderStatus(orderId: string, toStatusId: string, changeReason?: string) {
    if (!activeBranchData || !activeCompanyData) {
      return;
    }

    const order = activeBranchData.orders.find((entry) => entry.id === orderId);
    const nextStatus = activeCompanyData.statusDefinitions.find((status) => status.id === toStatusId);
    if (!order || !nextStatus) {
      return;
    }

    updateBranchData((branchData) => ({
      ...branchData,
      orders: branchData.orders.map((entry) =>
        entry.id === orderId
          ? {
              ...entry,
              currentStatusId: toStatusId,
              history: [
                {
                  id: makeId("history"),
                  fromStatusId: entry.currentStatusId,
                  toStatusId,
                  changedAt: nowIso(),
                  changedByMembershipId: findMembershipId(activeCompanyData, activeUser?.id),
                  changeReason,
                },
                ...entry.history,
              ],
            }
          : entry,
      ),
    }));

    updateCompanyData((companyData) => ({
      ...companyData,
      auditLogs: appendAuditLog(
        companyData,
        "order.update",
        "order",
        order.orderNumber,
        `Status order diubah ke ${nextStatus.label}.`,
        true,
      ),
    }));

    notify("Status order diperbarui", "Riwayat status langsung ter-refresh.", "success");
  }

  function saveStockAdjustment(input: StockAdjustmentInput) {
    if (!activeBranchData || !activeCompanyData) {
      return;
    }

    updateBranchData((branchData) => {
      const balance = branchData.stockBalances.find((entry) => entry.itemId === input.itemId);
      const currentOnHand = balance?.onHandQty ?? 0;
      const delta =
        input.movementType === "out" ? -Math.abs(input.quantity) : Math.abs(input.quantity);
      const nextOnHand =
        input.movementType === "adjustment" ? Math.abs(input.quantity) : currentOnHand + delta;
      const reservedQty = balance?.reservedQty ?? 0;
      const nextBalance = {
        id: balance?.id ?? makeId("balance"),
        itemId: input.itemId,
        onHandQty: nextOnHand,
        reservedQty,
        availableQty: Math.max(nextOnHand - reservedQty, 0),
        updatedAt: nowIso(),
      };
      const movement = {
        id: makeId("movement"),
        itemId: input.itemId,
        movementType: input.movementType,
        quantity: Math.abs(input.quantity),
        balanceBefore: currentOnHand,
        balanceAfter: nextOnHand,
        referenceType: "manual_adjustment" as const,
        reasonText: input.reasonText,
        movedByMembershipId: findMembershipId(activeCompanyData, activeUser?.id),
        movedAt: nowIso(),
      };

      return {
        ...branchData,
        stockBalances: balance
          ? branchData.stockBalances.map((entry) =>
              entry.itemId === input.itemId ? nextBalance : entry,
            )
          : [nextBalance, ...branchData.stockBalances],
        stockMovements: [movement, ...branchData.stockMovements],
      };
    });

    updateCompanyData((companyData) => ({
      ...companyData,
      auditLogs: appendAuditLog(
        companyData,
        "stock.adjust",
        "stock",
        findItemName(input.itemId),
        `Stok disesuaikan melalui form mock (${input.movementType}).`,
        true,
      ),
    }));

    notify("Penyesuaian stok tersimpan", "Saldo item diperbarui pada cabang aktif.", "success");
  }

  function saveUserMembership(input: MembershipFormInput) {
    if (!activeCompanyData) {
      return;
    }

    setDatabase((current) => {
      const membershipId = input.id ?? makeId("membership");
      const roleCodes = input.roleCodes.length > 0 ? input.roleCodes : ["staff"];
      const branchIds = input.branchIds.length > 0 ? input.branchIds : current.branches.map((branch) => branch.id);
      const defaultBranchId = branchIds[0];
      const userId = input.userId ?? makeId("user");

      const users = input.userId
        ? current.users.map((user) =>
            user.id === input.userId
              ? {
                  ...user,
                  fullName: input.fullName,
                  email: input.email,
                  username: input.username,
                  phone: input.phone ?? user.phone,
                  memberships: updateUserCompanyMembership(
                    user.memberships,
                    current.company.id,
                    input.displayTitle,
                    roleCodes,
                    branchIds,
                    defaultBranchId,
                  ),
                }
              : user,
          )
        : [
            ...current.users,
            {
              id: userId,
              fullName: input.fullName,
              email: input.email,
              username: input.username,
              password: "demo123",
              phone: input.phone ?? "",
              memberships: [
                {
                  companyId: current.company.id,
                  displayTitle: input.displayTitle,
                  availableRoles: roleCodes,
                  branchIds,
                  defaultBranchId,
                },
              ],
            },
          ];

      return {
        ...current,
        users,
        companyData: {
          ...current.companyData,
          memberships: input.id
            ? current.companyData.memberships.map((membership) =>
                membership.id === input.id
                  ? {
                      id: membershipId,
                      userId,
                      displayTitle: input.displayTitle,
                      status: input.status,
                      roleCodes,
                      branchIds,
                    }
                  : membership,
              )
            : [
                {
                  id: membershipId,
                  userId,
                  displayTitle: input.displayTitle,
                  status: input.status,
                  roleCodes,
                  branchIds,
                },
                ...current.companyData.memberships,
              ],
          auditLogs: appendAuditLog(
            current.companyData,
            input.id ? "user.update" : "user.create",
            "user",
            input.fullName,
            input.id ? "Data pengguna diperbarui." : "Pengguna baru ditambahkan ke perusahaan.",
          ),
        },
      };
    });

    notify("Data pengguna tersimpan", "Akses role dan cabang berhasil diperbarui.", "success");
  }

  function setMembershipStatus(membershipId: string, status: "active" | "inactive") {
    updateCompanyData((companyData) => {
      const membership = companyData.memberships.find((entry) => entry.id === membershipId);
      return {
        ...companyData,
        memberships: companyData.memberships.map((entry) =>
          entry.id === membershipId ? { ...entry, status } : entry,
        ),
        auditLogs: appendAuditLog(
          companyData,
          "user.update",
          "user",
          findUserById(membership?.userId)?.fullName ?? "Pengguna",
          `Status membership diubah menjadi ${status}.`,
        ),
      };
    });
    notify("Status pengguna diperbarui", "Daftar anggota perusahaan langsung ter-refresh.", "success");
  }

  function saveBusinessParty(input: PartyInput) {
    const partyId = input.id ?? makeId("party");

    updateCompanyData((companyData) => {
      const nextParty = { ...input, id: partyId };
      return {
        ...companyData,
        businessParties: input.id
          ? companyData.businessParties.map((party) => (party.id === input.id ? nextParty : party))
          : [nextParty, ...companyData.businessParties],
        auditLogs: appendAuditLog(
          companyData,
          input.id ? "business_party.update" : "business_party.create",
          "business_party",
          nextParty.name,
          input.id ? "Data entitas bisnis diperbarui." : "Entitas bisnis baru ditambahkan.",
        ),
      };
    });

    notify(
      input.id ? "Kontak diperbarui" : "Kontak ditambahkan",
      "Perubahan tersimpan di data perusahaan aktif.",
      "success",
    );

    return partyId;
  }

  function saveSettings(settings: CompanyData["settings"]) {
    updateCompanyData((companyData) => ({
      ...companyData,
      settings,
      auditLogs: appendAuditLog(
        companyData,
        "company_config.manage",
        "company_settings",
        activeCompany?.name ?? "Perusahaan",
        "Konfigurasi perusahaan diperbarui dari halaman settings.",
      ),
    }));
    notify("Pengaturan diperbarui", "Konfigurasi perusahaan tersimpan di state lokal.", "success");
  }

  function saveItemCategory(input: CategoryInput) {
    updateWorkspaceData((ws) => {
      const categoryId = input.id ?? makeId("category");
      const nextCategory = {
        id: categoryId,
        code: input.code,
        name: input.name,
        parentCategoryId: input.parentCategoryId || undefined,
        sortOrder: input.id
          ? (ws.itemCategories.find((c) => c.id === input.id)?.sortOrder ?? ws.itemCategories.length + 1)
          : ws.itemCategories.length + 1,
      };
      return {
        ...ws,
        itemCategories: input.id
          ? ws.itemCategories.map((c) => (c.id === input.id ? nextCategory : c))
          : [...ws.itemCategories, nextCategory],
      };
    });
    notify(
      input.id ? "Kategori diperbarui" : "Kategori ditambahkan",
      `Kategori "${input.name}" berhasil disimpan.`,
      "success",
    );
  }

  function saveBranch(input: Partial<Branch> & { name: string; code: string; city: string; address: string; defaultStockLocationLabel: string }) {
    const branchId = input.id ?? makeId("branch");
    const nextBranch: Branch = {
      id: branchId,
      code: input.code,
      name: input.name,
      city: input.city,
      address: input.address,
      defaultStockLocationLabel: input.defaultStockLocationLabel,
      isDefault: input.isDefault ?? false,
    };

    setDatabase((current) => ({
      ...current,
      branches: input.id
        ? current.branches.map((branch) => (branch.id === input.id ? nextBranch : branch))
        : [...current.branches, nextBranch],
      branchData: input.id
        ? current.branchData
        : {
            ...current.branchData,
            [branchId]: {
              orders: [],
              stockBalances: [],
              stockMovements: [],
            },
          },
    }));

    notify(
      input.id ? "Cabang diperbarui" : "Cabang ditambahkan",
      `Cabang ${nextBranch.name} berhasil ${input.id ? "diperbarui" : "ditambahkan"}.`,
      "success",
    );
  }

  function saveStatusDefinition(input: StatusInput) {
    updateCompanyData((companyData) => {
      const statusId = input.id ?? makeId("status");
      const nextStatus = { ...input, id: statusId };
      return {
        ...companyData,
        statusDefinitions: input.id
          ? companyData.statusDefinitions.map((status) =>
              status.id === input.id ? nextStatus : status,
            )
          : [...companyData.statusDefinitions, nextStatus].sort(
              (left, right) => left.sortOrder - right.sortOrder,
            ),
        auditLogs: appendAuditLog(
          companyData,
          "company_config.manage",
          "order_status_definition",
          nextStatus.label,
          input.id ? "Status order diperbarui." : "Status order baru ditambahkan.",
        ),
      };
    });
    notify("Status order disimpan", "Daftar status perusahaan sudah diperbarui.", "success");
  }

  function saveStatusTransition(input: TransitionInput) {
    updateCompanyData((companyData) => {
      const transitionId = input.id ?? makeId("transition");
      const nextTransition = { ...input, id: transitionId };
      return {
        ...companyData,
        statusTransitions: input.id
          ? companyData.statusTransitions.map((transition) =>
              transition.id === input.id ? nextTransition : transition,
            )
          : [...companyData.statusTransitions, nextTransition],
        auditLogs: appendAuditLog(
          companyData,
          "company_config.manage",
          "order_status_transition",
          nextTransition.transitionLabel,
          input.id ? "Transisi status diperbarui." : "Transisi status baru dibuat.",
        ),
      };
    });
    notify("Transisi status disimpan", "Aturan perpindahan status ikut diperbarui.", "success");
  }

  function saveKnowledgeDocument(input: KnowledgeInput) {
    updateCompanyData((companyData) => {
      const documentId = input.id ?? makeId("knowledge");
      const nextDocument = {
        ...input,
        id: documentId,
        uploadedAt: input.id
          ? companyData.knowledgeDocuments.find((document) => document.id === input.id)?.uploadedAt ??
            nowIso()
          : nowIso(),
      };
      return {
        ...companyData,
        knowledgeDocuments: input.id
          ? companyData.knowledgeDocuments.map((document) =>
              document.id === input.id ? nextDocument : document,
            )
          : [nextDocument, ...companyData.knowledgeDocuments],
        auditLogs: appendAuditLog(
          companyData,
          input.id ? "knowledge.update" : "knowledge.create",
          "knowledge_document",
          nextDocument.title,
          input.id ? "Dokumen knowledge diperbarui." : "Dokumen knowledge baru diunggah.",
        ),
      };
    });
    notify(
      input.id ? "Dokumen diperbarui" : "Dokumen diupload",
      "Status dokumen masuk ke pipeline knowledge mock.",
      "success",
    );
  }

  function archiveKnowledgeDocument(documentId: string) {
    updateCompanyData((companyData) => {
      const document = companyData.knowledgeDocuments.find((entry) => entry.id === documentId);
      return {
        ...companyData,
        knowledgeDocuments: companyData.knowledgeDocuments.map((entry) =>
          entry.id === documentId ? { ...entry, status: "archived" } : entry,
        ),
        auditLogs: appendAuditLog(
          companyData,
          "knowledge.archive",
          "knowledge_document",
          document?.title ?? "Dokumen",
          "Dokumen diarsipkan dari daftar knowledge.",
        ),
      };
    });
    notify("Dokumen diarsipkan", "Daftar knowledge langsung disegarkan.", "warning");
  }

  function saveWhatsappAuthorization(input: WhatsappInput) {
    updateCompanyData((companyData) => {
      const authId = input.id ?? makeId("wa-auth");
      const nextAuthorization = { ...input, id: authId };
      return {
        ...companyData,
        whatsappAuthorizations: input.id
          ? companyData.whatsappAuthorizations.map((authorization) =>
              authorization.id === input.id ? nextAuthorization : authorization,
            )
          : [nextAuthorization, ...companyData.whatsappAuthorizations],
        auditLogs: appendAuditLog(
          companyData,
          "whatsapp.manage",
          "whatsapp_authorization",
          nextAuthorization.userName,
          input.id ? "Otorisasi WhatsApp diperbarui." : "Nomor WhatsApp baru diotorisasi.",
        ),
      };
    });
    notify("Nomor WhatsApp tersimpan", "Daftar otorisasi perusahaan berhasil diperbarui.", "success");
  }

  function revokeWhatsappAuthorization(authorizationId: string) {
    updateCompanyData((companyData) => {
      const authorization = companyData.whatsappAuthorizations.find(
        (entry) => entry.id === authorizationId,
      );
      return {
        ...companyData,
        whatsappAuthorizations: companyData.whatsappAuthorizations.map((entry) =>
          entry.id === authorizationId ? { ...entry, status: "revoked" } : entry,
        ),
        auditLogs: appendAuditLog(
          companyData,
          "whatsapp.manage",
          "whatsapp_authorization",
          authorization?.userName ?? "Nomor",
          "Akses WhatsApp dicabut oleh admin mockup.",
        ),
      };
    });
    notify("Akses dicabut", "Nomor tersebut tidak lagi aktif untuk Quick Mode.", "warning");
  }

  function saveRoleDefinition(input: RoleDefinitionInput) {
    const roleCode = input.code || makeRoleCode(input.name);
    if (!roleCode) {
      return;
    }

    updateCompanyData((companyData) => {
      const exists = companyData.roleDefinitions.some((role) => role.code === roleCode);
      const nextRole: RoleDefinition = {
        code: roleCode,
        name: input.name,
        description: input.description,
        isSystem:
          input.isSystem ??
          companyData.roleDefinitions.find((role) => role.code === roleCode)?.isSystem ??
          false,
      };

      return {
        ...companyData,
        roleDefinitions: exists
          ? companyData.roleDefinitions.map((role) => (role.code === roleCode ? nextRole : role))
          : [...companyData.roleDefinitions, nextRole],
        rolePermissions: companyData.rolePermissions[roleCode]
          ? companyData.rolePermissions
          : {
              ...companyData.rolePermissions,
              [roleCode]: [],
            },
        auditLogs: appendAuditLog(
          companyData,
          "role.manage",
          "role",
          nextRole.name,
          exists ? "Role diperbarui dari halaman role." : "Role baru ditambahkan.",
        ),
      };
    });

    notify("Role disimpan", "Daftar role perusahaan telah diperbarui.", "success");
  }

  function deleteRoleDefinition(roleCode: RoleCode) {
    if (!activeCompanyData) {
      return;
    }

    const role = activeCompanyData.roleDefinitions.find((entry) => entry.code === roleCode);
    const isUsed = activeCompanyData.memberships.some((membership) =>
      membership.roleCodes.includes(roleCode),
    );

    if (!role || role.isSystem || isUsed) {
      notify(
        "Role tidak dapat dihapus",
        isUsed
          ? "Role ini masih dipakai oleh anggota tim."
          : "Role bawaan sistem tidak bisa dihapus.",
        "warning",
      );
      return;
    }

    updateCompanyData((companyData) => {
      const nextPermissions = { ...companyData.rolePermissions };
      delete nextPermissions[roleCode];
      return {
        ...companyData,
        roleDefinitions: companyData.roleDefinitions.filter((entry) => entry.code !== roleCode),
        rolePermissions: nextPermissions,
        auditLogs: appendAuditLog(
          companyData,
          "role.manage",
          "role",
          role.name,
          "Role kustom dihapus dari perusahaan.",
        ),
      };
    });

    notify("Role dihapus", "Role kustom tersebut tidak lagi tersedia.", "warning");
  }

  function saveRolePermissions(roleCode: RoleCode, nextPermissions: PermissionCode[]) {
    updateCompanyData((companyData) => ({
      ...companyData,
      rolePermissions: {
        ...companyData.rolePermissions,
        [roleCode]: nextPermissions,
      },
      auditLogs: appendAuditLog(
        companyData,
        "role.manage",
        "role_permission",
        String(roleCode),
        "Matriks permission role diperbarui.",
      ),
    }));
    notify("Hak akses diperbarui", "Matriks permission role berhasil disimpan.", "success");
  }

  const value: MockAppContextValue = useMemo(
    () => ({
      database,
      session,
      activeUser,
      activeCompany,
      activeCompanyData,
      activeBranch,
      activeBranchData,
      activeWorkspaceData,
      activeRoleCode,
      permissions,
      accessibleBranches,
      activeBranchMemberships,
      availableRoles,
      isAuthenticated: Boolean(activeUser),
      toasts,
      login,
      logout,
      selectBranch,
      switchRole,
      can,
      findUserById,
      findMembershipName,
      findItemName,
      notify,
      saveItem,
      archiveItem,
      saveOrder,
      updateOrderStatus,
      saveStockAdjustment,
      saveUserMembership,
      setMembershipStatus,
      saveBusinessParty,
      saveSettings,
      saveStatusDefinition,
      saveStatusTransition,
      saveKnowledgeDocument,
      archiveKnowledgeDocument,
      saveWhatsappAuthorization,
      revokeWhatsappAuthorization,
      saveRoleDefinition,
      deleteRoleDefinition,
      saveRolePermissions,
      saveItemCategory,
      saveBranch,
      updateCompanyData,
      updateBranchData,
      updateWorkspaceData,
    }),
    [
      database,
      session,
      activeUser,
      activeCompany,
      activeCompanyData,
      activeBranch,
      activeBranchData,
      activeWorkspaceData,
      activeRoleCode,
      permissions,
      accessibleBranches,
      activeBranchMemberships,
      availableRoles,
      toasts,
    ],
  );

  return <MockAppContext.Provider value={value}>{children}</MockAppContext.Provider>;
}

export function useMockApp() {
  const value = useContext(MockAppContext);
  if (!value) {
    throw new Error("useMockApp harus dipakai di dalam MockAppProvider.");
  }

  return value;
}
