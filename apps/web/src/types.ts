export type RoleCode = "owner" | "admin" | "staff";

export type PermissionCode =
  | "dashboard.view"
  | "product.view"
  | "product.create"
  | "product.update"
  | "product.archive"
  | "order.view"
  | "order.create"
  | "order.update"
  | "order.archive"
  | "stock.view"
  | "stock.create"
  | "stock.update"
  | "reporting.view"
  | "user.view"
  | "user.create"
  | "user.update"
  | "user.archive"
  | "tenant_config.view"
  | "tenant_config.manage"
  | "knowledge.view"
  | "knowledge.create"
  | "knowledge.update"
  | "knowledge.archive"
  | "whatsapp.view"
  | "whatsapp.manage"
  | "audit_log.view";

export type ItemType = "physical" | "service" | "bundle" | "non_stock";
export type OrderKind = "transaction" | "request" | "job";
export type StatusGroup = "pending" | "active" | "completed" | "cancelled";
export type KnowledgeStatus = "processing" | "ready" | "failed" | "archived";
export type DocumentType = "sop" | "policy" | "glossary" | "guide";
export type PartyType = "customer" | "supplier" | "partner";
export type MovementType = "in" | "out" | "adjustment";
export type ToastTone = "info" | "success" | "warning" | "danger";

export type Tenant = {
  id: string;
  code: string;
  name: string;
  timezone: string;
  currencyCode: string;
  locale: string;
};

export type TenantMembershipRef = {
  tenantId: string;
  displayTitle: string;
  availableRoles: RoleCode[];
  isDefaultTenant?: boolean;
};

export type DemoUser = {
  id: string;
  fullName: string;
  email: string;
  username: string;
  password: string;
  phone: string;
  memberships: TenantMembershipRef[];
};

export type MembershipRecord = {
  id: string;
  userId: string;
  displayTitle: string;
  status: "active" | "inactive";
  roleCodes: RoleCode[];
  isDefaultTenant?: boolean;
};

export type ItemCategory = {
  id: string;
  code: string;
  name: string;
  parentCategoryId?: string;
  sortOrder: number;
};

export type Item = {
  id: string;
  categoryId?: string;
  itemCode: string;
  itemName: string;
  itemType: ItemType;
  status: "active" | "inactive";
  stockTracked: boolean;
  uom: string;
  minStockQty?: number;
  standardPrice?: number;
  attributes: Record<string, string>;
  summary: string;
};

export type BusinessParty = {
  id: string;
  partyType: PartyType;
  code: string;
  name: string;
  phone?: string;
  email?: string;
  address: string;
  notes?: string;
  attributes?: Record<string, string>;
};

export type StatusDefinition = {
  id: string;
  code: string;
  label: string;
  statusGroup: StatusGroup;
  applicableOrderKind: OrderKind | "all";
  isInitial: boolean;
  isTerminal: boolean;
  sortOrder: number;
  colorHex: string;
};

export type StatusTransition = {
  id: string;
  fromStatusId: string;
  toStatusId: string;
  transitionLabel: string;
  active: boolean;
};

export type OrderLine = {
  id: string;
  itemId: string;
  quantity: number;
  unitPrice: number;
  notes?: string;
};

export type OrderHistory = {
  id: string;
  fromStatusId?: string;
  toStatusId: string;
  changedByMembershipId?: string;
  changeReason?: string;
  changedAt: string;
};

export type Order = {
  id: string;
  orderNumber: string;
  orderKind: OrderKind;
  relatedPartyId?: string;
  currentStatusId: string;
  assignedMembershipId?: string;
  orderDate: string;
  dueDate?: string;
  subtotalAmount: number;
  discountAmount: number;
  totalAmount: number;
  notes: string;
  createdByMembershipId: string;
  items: OrderLine[];
  history: OrderHistory[];
};

export type StockBalance = {
  id: string;
  itemId: string;
  onHandQty: number;
  reservedQty: number;
  availableQty: number;
  updatedAt: string;
};

export type StockMovement = {
  id: string;
  itemId: string;
  movementType: MovementType;
  quantity: number;
  balanceBefore: number;
  balanceAfter: number;
  referenceType: "order" | "manual_adjustment" | "system";
  referenceId?: string;
  reasonText: string;
  movedByMembershipId?: string;
  movedAt: string;
};

export type KnowledgeDocument = {
  id: string;
  title: string;
  documentType: DocumentType;
  status: KnowledgeStatus;
  uploadedAt: string;
  uploadedByMembershipId: string;
  summary: string;
  fileName: string;
};

export type WhatsappAuthorization = {
  id: string;
  userName: string;
  phone: string;
  accessLevel: "owner" | "authorized_party";
  status: "active" | "revoked";
  isPrimaryOwner: boolean;
  lastSeenAt?: string;
};

export type AuditLog = {
  id: string;
  happenedAt: string;
  actorName: string;
  actorType: "user" | "system";
  actionKey: string;
  entityType: string;
  entityLabel: string;
  description: string;
};

export type TenantSettings = {
  businessLabels: {
    itemLabel: string;
    orderLabel: string;
    stockLabel: string;
    customerLabel: string;
  };
  operationalRules: {
    defaultOrderKind: OrderKind;
    defaultDueDays: number;
    criticalStockFocus: string;
  };
  uiPreferences: {
    compactTable: boolean;
    dashboardHighlight: string;
  };
  aiPreferences: {
    tone: string;
    responseLanguage: string;
    answerStyle: string;
  };
  reportingPreferences: {
    defaultRange: string;
    emphasizeMetric: string;
  };
  featureFlags: {
    key: string;
    enabled: boolean;
  }[];
};

export type TenantData = {
  memberships: MembershipRecord[];
  itemCategories: ItemCategory[];
  items: Item[];
  businessParties: BusinessParty[];
  statusDefinitions: StatusDefinition[];
  statusTransitions: StatusTransition[];
  orders: Order[];
  stockBalances: StockBalance[];
  stockMovements: StockMovement[];
  knowledgeDocuments: KnowledgeDocument[];
  whatsappAuthorizations: WhatsappAuthorization[];
  auditLogs: AuditLog[];
  settings: TenantSettings;
  whatsappChannelStatus: {
    state: "connected" | "reconnecting" | "disconnected";
    phone: string;
    updatedAt: string;
    mode: "bot_only" | "ai_only" | "hybrid";
  };
};

export type MockDatabase = {
  tenants: Tenant[];
  users: DemoUser[];
  tenantData: Record<string, TenantData>;
};

export type MockSession = {
  userId?: string;
  activeTenantId?: string;
  activeRoleCode?: RoleCode;
};

export type ToastMessage = {
  id: string;
  title: string;
  description?: string;
  tone?: ToastTone;
};
