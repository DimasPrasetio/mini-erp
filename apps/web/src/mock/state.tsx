import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { cloneDatabase, INITIAL_SESSION } from "./initial-data";
import { getDefaultRole, hasPermission, ROLE_PERMISSIONS } from "./permissions";
import type {
  AuditLog,
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
  StatusDefinition,
  StatusTransition,
  Tenant,
  TenantData,
  ToastMessage,
  WhatsappAuthorization,
  BusinessParty,
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
};
type OrderInput = Omit<Order, "id" | "history" | "subtotalAmount" | "discountAmount" | "totalAmount"> & {
  id?: string;
};
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

type MockAppContextValue = {
  database: MockDatabase;
  session: MockSession;
  activeUser?: DemoUser;
  activeTenant?: Tenant;
  activeTenantData?: TenantData;
  activeRoleCode?: RoleCode;
  permissions: PermissionCode[];
  availableTenants: Array<{
    tenant: Tenant;
    displayTitle: string;
    availableRoles: RoleCode[];
    isDefaultTenant?: boolean;
  }>;
  availableRoles: RoleCode[];
  isAuthenticated: boolean;
  toasts: ToastMessage[];
  login: (identifier: string, password: string) => {
    ok: boolean;
    error?: string;
    requiresTenantSelection: boolean;
  };
  logout: () => void;
  selectTenant: (tenantId: string) => void;
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
  saveSettings: (settings: TenantData["settings"]) => void;
  saveStatusDefinition: (input: StatusInput) => void;
  saveStatusTransition: (input: TransitionInput) => void;
  saveKnowledgeDocument: (input: KnowledgeInput) => void;
  archiveKnowledgeDocument: (documentId: string) => void;
  saveWhatsappAuthorization: (input: WhatsappInput) => void;
  revokeWhatsappAuthorization: (authorizationId: string) => void;
  updateTenantData: (mutator: (tenantData: TenantData) => TenantData) => void;
};

const MockAppContext = createContext<MockAppContextValue | undefined>(undefined);

const STORAGE_KEY = "mini-erp-phase0-state";

function loadState() {
  if (typeof window === "undefined") {
    return {
      database: cloneDatabase(),
      session: INITIAL_SESSION,
    };
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);

  if (!raw) {
    return {
      database: cloneDatabase(),
      session: INITIAL_SESSION,
    };
  }

  try {
    return JSON.parse(raw) as { database: MockDatabase; session: MockSession };
  } catch {
    return {
      database: cloneDatabase(),
      session: INITIAL_SESSION,
    };
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

export function MockAppProvider({ children }: { children: ReactNode }) {
  const loaded = loadState();
  const [database, setDatabase] = useState<MockDatabase>(loaded.database);
  const [session, setSession] = useState<MockSession>(loaded.session);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const toastTimers = useRef<Record<string, number>>({});

  useEffect(() => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        database,
        session,
      }),
    );
  }, [database, session]);

  useEffect(() => {
    return () => {
      Object.values(toastTimers.current).forEach((timer) => window.clearTimeout(timer));
    };
  }, []);

  const activeUser = database.users.find((user) => user.id === session.userId);
  const availableTenants: MockAppContextValue["availableTenants"] =
    activeUser?.memberships.flatMap((membership) => {
      const tenant = database.tenants.find((entry) => entry.id === membership.tenantId);
      if (!tenant) {
        return [];
      }

      return [
        {
          tenant,
          displayTitle: membership.displayTitle,
          availableRoles: membership.availableRoles,
          isDefaultTenant: membership.isDefaultTenant,
        },
      ];
    }) ?? [];

  const activeTenant =
    database.tenants.find((tenant) => tenant.id === session.activeTenantId) ??
    availableTenants.find((entry) => entry.isDefaultTenant)?.tenant;

  const activeMembership = activeUser?.memberships.find(
    (membership) => membership.tenantId === activeTenant?.id,
  );
  const availableRoles = activeMembership?.availableRoles ?? [];
  const activeRoleCode =
    session.activeRoleCode && availableRoles.includes(session.activeRoleCode)
      ? session.activeRoleCode
      : availableRoles.length > 0
        ? getDefaultRole(availableRoles)
        : undefined;
  const permissions = activeRoleCode ? ROLE_PERMISSIONS[activeRoleCode] : [];
  const activeTenantData = activeTenant ? database.tenantData[activeTenant.id] : undefined;

  function notify(title: string, description?: string, tone: ToastMessage["tone"] = "info") {
    const id = makeId("toast");

    setToasts((current) => [...current, { id, title, description, tone }]);
    toastTimers.current[id] = window.setTimeout(() => {
      setToasts((current) => current.filter((toast) => toast.id !== id));
      delete toastTimers.current[id];
    }, 3400);
  }

  function findUserById(userId?: string) {
    return database.users.find((user) => user.id === userId);
  }

  function findMembershipName(membershipId?: string) {
    if (!membershipId || !activeTenantData) {
      return "-";
    }

    const membership = activeTenantData.memberships.find((entry) => entry.id === membershipId);
    const user = findUserById(membership?.userId);
    return user?.fullName ?? membership?.displayTitle ?? "-";
  }

  function findItemName(itemId?: string) {
    if (!itemId || !activeTenantData) {
      return "-";
    }

    return activeTenantData.items.find((item) => item.id === itemId)?.itemName ?? "-";
  }

  function can(permission?: PermissionCode) {
    return hasPermission(activeRoleCode, permission);
  }

  function login(identifier: string, password: string) {
    const normalized = identifier.trim().toLowerCase();
    const user = database.users.find(
      (entry) =>
        entry.username.toLowerCase() === normalized || entry.email.toLowerCase() === normalized,
    );

    if (!user || user.password !== password) {
      return {
        ok: false,
        error: "Username, email, atau password tidak cocok.",
        requiresTenantSelection: false,
      };
    }

    const defaultMembership =
      user.memberships.find((membership) => membership.isDefaultTenant) ?? user.memberships[0];
    const requiresTenantSelection = user.memberships.length > 1;

    setSession({
      userId: user.id,
      activeTenantId: requiresTenantSelection ? undefined : defaultMembership?.tenantId,
      activeRoleCode:
        requiresTenantSelection || !defaultMembership
          ? undefined
          : getDefaultRole(defaultMembership.availableRoles),
    });

    return {
      ok: true,
      requiresTenantSelection,
    };
  }

  function logout() {
    setSession({});
    notify("Logout berhasil", "Sesi mockup dibersihkan.", "success");
  }

  function selectTenant(tenantId: string) {
    const membership = activeUser?.memberships.find((entry) => entry.tenantId === tenantId);
    if (!membership) {
      return;
    }

    setSession((current) => ({
      ...current,
      activeTenantId: tenantId,
      activeRoleCode: getDefaultRole(membership.availableRoles),
    }));
  }

  function switchRole(roleCode: RoleCode) {
    if (!availableRoles.includes(roleCode)) {
      notify("Role tidak tersedia", "Role ini tidak terdaftar pada tenant aktif.", "danger");
      return false;
    }

    setSession((current) => ({
      ...current,
      activeRoleCode: roleCode,
    }));
    notify("Role aktif diperbarui", `Tampilan sekarang mengikuti akses ${roleCode}.`, "success");
    return true;
  }

  function updateTenantData(mutator: (tenantData: TenantData) => TenantData) {
    if (!activeTenant) {
      return;
    }

    setDatabase((current) => ({
      ...current,
      tenantData: {
        ...current.tenantData,
        [activeTenant.id]: mutator(current.tenantData[activeTenant.id]),
      },
    }));
  }

  function appendAuditLog(
    tenantData: TenantData,
    actionKey: string,
    entityType: string,
    entityLabel: string,
    description: string,
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
      },
      ...tenantData.auditLogs,
    ];
  }

  function saveItem(input: ItemInput) {
    const itemId = input.id ?? makeId("item");

    updateTenantData((tenantData) => {
      const nextItem = {
        ...input,
        id: itemId,
      };
      const items = input.id
        ? tenantData.items.map((item) => (item.id === input.id ? nextItem : item))
        : [nextItem, ...tenantData.items];

      return {
        ...tenantData,
        items,
        auditLogs: appendAuditLog(
          tenantData,
          input.id ? "product.update" : "product.create",
          "product",
          nextItem.itemName,
          input.id ? "Produk diperbarui dari mock form." : "Produk baru ditambahkan dari mock form.",
        ),
      };
    });

    notify(
      input.id ? "Produk diperbarui" : "Produk ditambahkan",
      "Perubahan tersimpan di data dummy tenant aktif.",
      "success",
    );

    return itemId;
  }

  function archiveItem(itemId: string) {
    updateTenantData((tenantData) => {
      const item = tenantData.items.find((entry) => entry.id === itemId);
      return {
        ...tenantData,
        items: tenantData.items.map((entry) =>
          entry.id === itemId ? { ...entry, status: "inactive" } : entry,
        ),
        auditLogs: appendAuditLog(
          tenantData,
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
    if (!activeTenantData || !activeUser) {
      return "";
    }

    const orderId = input.id ?? makeId("order");
    const totals = sumOrderTotal(input, activeTenantData.items);
    const initialStatus =
      input.currentStatusId ||
      activeTenantData.statusDefinitions.find((status) => status.isInitial)?.id ||
      activeTenantData.statusDefinitions[0]?.id;

    updateTenantData((tenantData) => {
      const order: Order = {
        ...input,
        id: orderId,
        currentStatusId: initialStatus,
        ...totals,
        history: input.id
          ? tenantData.orders.find((entry) => entry.id === input.id)?.history ?? []
          : [
            {
              id: makeId("history"),
              toStatusId: initialStatus,
              changedAt: nowIso(),
              changedByMembershipId:
                tenantData.memberships.find((membership) => membership.userId === activeUser.id)?.id,
              changeReason: "Order dibuat dari mock form.",
            },
          ],
      };

      const orders = input.id
        ? tenantData.orders.map((entry) => (entry.id === input.id ? order : entry))
        : [order, ...tenantData.orders];

      return {
        ...tenantData,
        orders,
        auditLogs: appendAuditLog(
          tenantData,
          input.id ? "order.update" : "order.create",
          "order",
          order.orderNumber,
          input.id ? "Order diperbarui dari mock form." : "Order baru dibuat dari mock form.",
        ),
      };
    });

    notify(input.id ? "Order diperbarui" : "Order dibuat", "Data mock order telah disimpan.", "success");
    return orderId;
  }

  function updateOrderStatus(orderId: string, toStatusId: string, changeReason?: string) {
    updateTenantData((tenantData) => {
      const order = tenantData.orders.find((entry) => entry.id === orderId);
      const nextStatus = tenantData.statusDefinitions.find((status) => status.id === toStatusId);
      if (!order || !nextStatus) {
        return tenantData;
      }

      const updatedOrder = {
        ...order,
        currentStatusId: toStatusId,
        history: [
          {
            id: makeId("history"),
            fromStatusId: order.currentStatusId,
            toStatusId,
            changedAt: nowIso(),
            changedByMembershipId:
              tenantData.memberships.find((membership) => membership.userId === activeUser?.id)?.id,
            changeReason,
          },
          ...order.history,
        ],
      };

      return {
        ...tenantData,
        orders: tenantData.orders.map((entry) => (entry.id === orderId ? updatedOrder : entry)),
        auditLogs: appendAuditLog(
          tenantData,
          "order.update",
          "order",
          order.orderNumber,
          `Status order diubah ke ${nextStatus.label}.`,
        ),
      };
    });
    notify("Status order diperbarui", "Riwayat status langsung ter-refresh.", "success");
  }

  function saveStockAdjustment(input: StockAdjustmentInput) {
    updateTenantData((tenantData) => {
      const balance = tenantData.stockBalances.find((entry) => entry.itemId === input.itemId);
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

      const stockBalances = balance
        ? tenantData.stockBalances.map((entry) => (entry.itemId === input.itemId ? nextBalance : entry))
        : [nextBalance, ...tenantData.stockBalances];

      const movement = {
        id: makeId("movement"),
        itemId: input.itemId,
        movementType: input.movementType,
        quantity: Math.abs(input.quantity),
        balanceBefore: currentOnHand,
        balanceAfter: nextOnHand,
        referenceType: "manual_adjustment" as const,
        reasonText: input.reasonText,
        movedByMembershipId:
          tenantData.memberships.find((membership) => membership.userId === activeUser?.id)?.id,
        movedAt: nowIso(),
      };

      return {
        ...tenantData,
        stockBalances,
        stockMovements: [movement, ...tenantData.stockMovements],
        auditLogs: appendAuditLog(
          tenantData,
          "stock.adjust",
          "stock",
          findItemName(input.itemId),
          `Stok disesuaikan melalui form mock (${input.movementType}).`,
        ),
      };
    });

    notify("Penyesuaian stok tersimpan", "Saldo item diperbarui di data dummy.", "success");
  }

  function saveUserMembership(input: MembershipFormInput) {
    if (!activeTenant) {
      return;
    }

    setDatabase((current) => {
      const tenantData = current.tenantData[activeTenant.id];
      const membershipId = input.id ?? makeId("membership");
      let userId = input.userId ?? makeId("user");
      let users = current.users;

      if (input.userId) {
        users = current.users.map((user) =>
          user.id === input.userId
            ? {
              ...user,
              fullName: input.fullName,
              email: input.email,
              username: input.username,
              phone: input.phone ?? user.phone,
              memberships: user.memberships.map((membership) =>
                membership.tenantId === activeTenant.id
                  ? {
                    ...membership,
                    displayTitle: input.displayTitle,
                    availableRoles: input.roleCodes,
                  }
                  : membership,
              ),
            }
            : user,
        );
      } else {
        users = [
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
                tenantId: activeTenant.id,
                displayTitle: input.displayTitle,
                availableRoles: input.roleCodes,
              },
            ],
          },
        ];
      }

      const nextMembership: MembershipRecord = {
        id: membershipId,
        userId,
        displayTitle: input.displayTitle,
        status: input.status,
        roleCodes: input.roleCodes,
      };

      return {
        ...current,
        users,
        tenantData: {
          ...current.tenantData,
          [activeTenant.id]: {
            ...tenantData,
            memberships: input.id
              ? tenantData.memberships.map((membership) =>
                membership.id === input.id ? nextMembership : membership,
              )
              : [nextMembership, ...tenantData.memberships],
            auditLogs: appendAuditLog(
              tenantData,
              input.id ? "user.update" : "user.create",
              "user",
              input.fullName,
              input.id ? "Data pengguna diperbarui." : "Pengguna baru ditambahkan ke tenant.",
            ),
          },
        },
      };
    });

    notify("Data pengguna tersimpan", "Perubahan anggota tenant berhasil diterapkan.", "success");
  }

  function setMembershipStatus(membershipId: string, status: "active" | "inactive") {
    updateTenantData((tenantData) => {
      const membership = tenantData.memberships.find((entry) => entry.id === membershipId);
      return {
        ...tenantData,
        memberships: tenantData.memberships.map((entry) =>
          entry.id === membershipId ? { ...entry, status } : entry,
        ),
        auditLogs: appendAuditLog(
          tenantData,
          "user.update",
          "user",
          findUserById(membership?.userId)?.fullName ?? "Pengguna",
          `Status membership diubah menjadi ${status}.`,
        ),
      };
    });
    notify("Status pengguna diperbarui", "Daftar anggota tenant langsung ter-refresh.", "success");
  }

  function saveBusinessParty(input: PartyInput) {
    const partyId = input.id ?? makeId("party");

    updateTenantData((tenantData) => {
      const nextParty = {
        ...input,
        id: partyId,
      };

      const businessParties = input.id
        ? tenantData.businessParties.map((party) => (party.id === input.id ? nextParty : party))
        : [nextParty, ...tenantData.businessParties];

      return {
        ...tenantData,
        businessParties,
        auditLogs: appendAuditLog(
          tenantData,
          input.id ? "business_party.update" : "business_party.create",
          "business_party",
          nextParty.name,
          input.id ? "Data entitas bisnis diperbarui." : "Entitas bisnis baru ditambahkan.",
        ),
      };
    });

    notify(
      input.id ? "Kontak diperbarui" : "Kontak ditambahkan",
      "Perubahan tersimpan di data mock aktif.",
      "success",
    );

    return partyId;
  }

  function saveSettings(settings: TenantData["settings"]) {
    updateTenantData((tenantData) => ({
      ...tenantData,
      settings,
      auditLogs: appendAuditLog(
        tenantData,
        "tenant_config.manage",
        "tenant_settings",
        activeTenant?.name ?? "Tenant",
        "Konfigurasi tenant diperbarui dari halaman mock settings.",
      ),
    }));
    notify("Pengaturan diperbarui", "Konfigurasi tenant tersimpan di state lokal.", "success");
  }

  function saveStatusDefinition(input: StatusInput) {
    updateTenantData((tenantData) => {
      const statusId = input.id ?? makeId("status");
      const nextStatus = { ...input, id: statusId };
      return {
        ...tenantData,
        statusDefinitions: input.id
          ? tenantData.statusDefinitions.map((status) =>
            status.id === input.id ? nextStatus : status,
          )
          : [...tenantData.statusDefinitions, nextStatus].sort(
            (left, right) => left.sortOrder - right.sortOrder,
          ),
        auditLogs: appendAuditLog(
          tenantData,
          "tenant_config.manage",
          "order_status_definition",
          nextStatus.label,
          input.id ? "Status order diperbarui." : "Status order baru ditambahkan.",
        ),
      };
    });
    notify("Status order disimpan", "Daftar status tenant sudah diperbarui.", "success");
  }

  function saveStatusTransition(input: TransitionInput) {
    updateTenantData((tenantData) => {
      const transitionId = input.id ?? makeId("transition");
      const nextTransition = { ...input, id: transitionId };
      return {
        ...tenantData,
        statusTransitions: input.id
          ? tenantData.statusTransitions.map((transition) =>
            transition.id === input.id ? nextTransition : transition,
          )
          : [...tenantData.statusTransitions, nextTransition],
        auditLogs: appendAuditLog(
          tenantData,
          "tenant_config.manage",
          "order_status_transition",
          nextTransition.transitionLabel,
          input.id ? "Transisi status diperbarui." : "Transisi status baru dibuat.",
        ),
      };
    });
    notify("Transisi status disimpan", "Aturan perpindahan status ikut diperbarui.", "success");
  }

  function saveKnowledgeDocument(input: KnowledgeInput) {
    updateTenantData((tenantData) => {
      const documentId = input.id ?? makeId("knowledge");
      const nextDocument = {
        ...input,
        id: documentId,
        uploadedAt: input.id
          ? tenantData.knowledgeDocuments.find((document) => document.id === input.id)?.uploadedAt ?? nowIso()
          : nowIso(),
      };
      return {
        ...tenantData,
        knowledgeDocuments: input.id
          ? tenantData.knowledgeDocuments.map((document) =>
            document.id === input.id ? nextDocument : document,
          )
          : [nextDocument, ...tenantData.knowledgeDocuments],
        auditLogs: appendAuditLog(
          tenantData,
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
    updateTenantData((tenantData) => {
      const document = tenantData.knowledgeDocuments.find((entry) => entry.id === documentId);
      return {
        ...tenantData,
        knowledgeDocuments: tenantData.knowledgeDocuments.map((entry) =>
          entry.id === documentId ? { ...entry, status: "archived" } : entry,
        ),
        auditLogs: appendAuditLog(
          tenantData,
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
    updateTenantData((tenantData) => {
      const authId = input.id ?? makeId("wa-auth");
      const nextAuthorization = { ...input, id: authId };
      return {
        ...tenantData,
        whatsappAuthorizations: input.id
          ? tenantData.whatsappAuthorizations.map((authorization) =>
            authorization.id === input.id ? nextAuthorization : authorization,
          )
          : [nextAuthorization, ...tenantData.whatsappAuthorizations],
        auditLogs: appendAuditLog(
          tenantData,
          input.id ? "whatsapp.manage" : "whatsapp.manage",
          "whatsapp_authorization",
          nextAuthorization.userName,
          input.id ? "Otorisasi WhatsApp diperbarui." : "Nomor WhatsApp baru diotorisasi.",
        ),
      };
    });
    notify("Nomor WhatsApp tersimpan", "Daftar otorisasi tenant berhasil diperbarui.", "success");
  }

  function revokeWhatsappAuthorization(authorizationId: string) {
    updateTenantData((tenantData) => {
      const authorization = tenantData.whatsappAuthorizations.find(
        (entry) => entry.id === authorizationId,
      );
      return {
        ...tenantData,
        whatsappAuthorizations: tenantData.whatsappAuthorizations.map((entry) =>
          entry.id === authorizationId ? { ...entry, status: "revoked" } : entry,
        ),
        auditLogs: appendAuditLog(
          tenantData,
          "whatsapp.manage",
          "whatsapp_authorization",
          authorization?.userName ?? "Nomor",
          "Akses WhatsApp dicabut oleh admin mockup.",
        ),
      };
    });
    notify("Akses dicabut", "Nomor tersebut tidak lagi aktif untuk Quick Mode.", "warning");
  }

  const value: MockAppContextValue = {
    database,
    session,
    activeUser,
    activeTenant,
    activeTenantData,
    activeRoleCode,
    permissions,
    availableTenants,
    availableRoles,
    isAuthenticated: Boolean(activeUser),
    toasts,
    login,
    logout,
    selectTenant,
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
    updateTenantData,
  };

  return <MockAppContext.Provider value={value}>{children}</MockAppContext.Provider>;
}

export function useMockApp() {
  const value = useContext(MockAppContext);
  if (!value) {
    throw new Error("useMockApp harus dipakai di dalam MockAppProvider.");
  }

  return value;
}
