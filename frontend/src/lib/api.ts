import { API_URL, uploadApiBase } from "./api-url";

export type UserRole = "customer" | "admin" | "artiste" | "commande";

export type UserRecord = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
};

export type OrderStatus = "pending" | "paid" | "shipped" | "cancelled";

export type OrderSummary = {
  id: string;
  userId: string;
  reference: string;
  customerName: string;
  email: string;
  shippingCity?: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
};

export type OrderLineItem = {
  id: string;
  paintingSlug: string;
  paintingTitle: string;
  type: "original" | "print";
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type OrderHistoryEvent = {
  id: string;
  type: string;
  message: string;
  actorName?: string;
  createdAt: string;
};

export type OrderDetail = OrderSummary & {
  email: string;
  phone?: string;
  shippingAddress?: string;
  shippingPostalCode?: string;
  shippingCity?: string;
  shippingCountry: string;
  subtotal: number;
  shippingAmount: number;
  paidAt?: string;
  shippedAt?: string;
  shippingCarrier?: string;
  shippingTrackingNumber?: string;
  internalNote?: string;
  refundedAt?: string;
  history: OrderHistoryEvent[];
  items: OrderLineItem[];
};

export type OrderStats = {
  total: number;
  pending: number;
  paid: number;
  shipped: number;
  cancelled: number;
  revenueMonth: number;
  averageOrder: number;
  delayedOrders: number;
};

export type UpdateOrderStatusPayload = {
  status: OrderStatus;
  shippingCarrier?: string;
  shippingTrackingNumber?: string;
};

export type OrderAlertType =
  | "no_confirmation"
  | "not_delivered"
  | "damaged"
  | "wrong_item"
  | "other";

export type OrderAlertStatus = "open" | "in_progress" | "resolved";

export type OrderAlert = {
  id: string;
  orderId: string;
  orderReference: string;
  customerName: string;
  customerEmail: string;
  type: OrderAlertType;
  typeLabel: string;
  message?: string;
  status: OrderAlertStatus;
  staffNote?: string;
  createdAt: string;
  resolvedAt?: string;
};

export type OrderAlertStats = {
  open: number;
  inProgress: number;
  total: number;
};

export type NotificationType =
  | "order_confirmed"
  | "order_shipped"
  | "order_cancelled"
  | "order_refunded"
  | "alert_in_progress"
  | "alert_resolved"
  | "order_new"
  | "order_alert"
  | "order_delayed"
  | "painting_sold"
  | "blog_published"
  | "user_registered";

export type AppNotification = {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  link?: string;
  metadata?: Record<string, string>;
  read: boolean;
  createdAt: string;
};

export type AuthUser = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country: string;
  role: UserRole;
};

export type AdminStats = {
  totalPaintings: number;
  available: number;
  sold: number;
  customers: number;
  blogPosts: number;
  events: number;
};

export type BlogPostInput = {
  title: string;
  slug?: string;
  excerpt: string;
  content: string;
  image: string;
  publishedAt: string;
  published?: boolean;
};

export type BlogPostRecord = BlogPostInput & {
  id: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type EventInput = {
  title: string;
  city: string;
  eventDate: string;
  description?: string;
  published?: boolean;
};

export type EventRecord = EventInput & {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type PaintingInput = {
  title: string;
  slug?: string;
  year: number;
  dimensions: string;
  medium: string;
  price: number;
  status: "available" | "sold";
  printAvailable?: boolean;
  printPrice?: number;
  image: string;
  description: string;
  subject: string;
  location: string;
  collection: string;
  featured?: boolean;
  bestSeller?: boolean;
};

export type PaintingRecord = PaintingInput & {
  id: string;
  slug: string;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
};

export type AdminListOptions = { includeDeleted?: boolean };

function adminListPath(path: string, opts?: AdminListOptions): string {
  return opts?.includeDeleted ? `${path}?includeDeleted=true` : path;
}

export type AuthResponse = {
  user: AuthUser;
  accessToken: string;
};

export type UpdateProfileInput = {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  currentPassword?: string;
  newPassword?: string;
};

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
  ) {
    super(message);
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { token?: string } = {},
): Promise<T> {
  const { token, ...init } = options;
  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(init.headers as Record<string, string>),
  };
  if (token) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${API_URL}${path}`, { ...init, headers });
  } catch {
    throw new ApiError(
      "Impossible de joindre le serveur. Vérifiez que l’API est démarrée (npm run start:dev dans backend).",
      0,
    );
  }

  if (!res.ok) {
    let message = "Une erreur est survenue";
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message[0] ?? message;
      else if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<T>;
}

async function downloadFile(
  path: string,
  token: string,
  filename: string,
): Promise<void> {
  const res = await fetch(`${API_URL}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!res.ok) {
    let message = "Téléchargement impossible";
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message[0] ?? message;
      else if (body.message) message = body.message;
    } catch {
      /* ignore */
    }
    throw new ApiError(message, res.status);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

async function uploadRequest(
  path: string,
  token: string,
  file: File,
  slug: string,
): Promise<{ url: string; filename: string }> {
  const form = new FormData();
  form.append("file", file);
  form.append("slug", slug);

  let res: Response;
  try {
    const uploadBase = uploadApiBase().replace(/\/$/, "");
    res = await fetch(`${uploadBase}${path}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
      body: form,
    });
  } catch {
    throw new ApiError(
      "Impossible de joindre le serveur. Vérifiez que l’API est démarrée (npm run start:dev dans backend).",
      0,
    );
  }

  if (!res.ok) {
    let message = "Échec de l’upload";
    try {
      const body = (await res.json()) as { message?: string | string[] };
      if (Array.isArray(body.message)) message = body.message[0] ?? message;
      else if (body.message) message = body.message;
    } catch {
      if (res.status === 413) {
        message = "Image trop volumineuse pour l’hébergement (max ~4 Mo). Réduisez le fichier ou réessayez.";
      } else {
        message = `Échec de l’upload (HTTP ${res.status})`;
      }
    }
    throw new ApiError(message, res.status);
  }

  return res.json() as Promise<{ url: string; filename: string }>;
}

export const api = {
  register: (data: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    phone?: string;
  }) => request<AuthResponse>("/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { email: string; password: string }) =>
    request<AuthResponse>("/auth/login", { method: "POST", body: JSON.stringify(data) }),

  me: (token: string) => request<AuthUser>("/auth/me", { token }),

  updateProfile: (token: string, data: UpdateProfileInput) =>
    request<AuthUser>("/auth/me", {
      method: "PATCH",
      token,
      body: JSON.stringify(data),
    }),

  wishlist: {
    list: (token: string) =>
      request<{ paintingIds: string[] }>("/wishlist", { token }),
    sync: (token: string, paintingIds: string[]) =>
      request<{ paintingIds: string[] }>("/wishlist/sync", {
        method: "POST",
        token,
        body: JSON.stringify({ paintingIds }),
      }),
    add: (token: string, paintingId: string) =>
      request<{ paintingIds: string[] }>(`/wishlist/${paintingId}`, {
        method: "POST",
        token,
      }),
    remove: (token: string, paintingId: string) =>
      request<{ paintingIds: string[] }>(`/wishlist/${paintingId}`, {
        method: "DELETE",
        token,
      }),
  },

  admin: {
    stats: (token: string) => request<AdminStats>("/admin/stats", { token }),
    uploadImage: (token: string, kind: "painting" | "blog", file: File, slug: string) =>
      uploadRequest(`/admin/uploads/${kind}`, token, file, slug),
    paintings: {
      list: (token: string, opts?: AdminListOptions) =>
        request<PaintingRecord[]>(adminListPath("/admin/paintings", opts), { token }),
      get: (token: string, id: string) =>
        request<PaintingRecord>(`/admin/paintings/${id}`, { token }),
      create: (token: string, data: PaintingInput) =>
        request<PaintingRecord>("/admin/paintings", {
          method: "POST",
          token,
          body: JSON.stringify(data),
        }),
      update: (token: string, id: string, data: Partial<PaintingInput>) =>
        request<PaintingRecord>(`/admin/paintings/${id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(data),
        }),
      delete: (token: string, id: string) =>
        request<{ ok: boolean }>(`/admin/paintings/${id}`, { method: "DELETE", token }),
      restore: (token: string, id: string) =>
        request<PaintingRecord>(`/admin/paintings/${id}/restore`, { method: "POST", token }),
      syncCatalog: (token: string) =>
        request<{ created: number; already: number; total: number; errors: string[] }>(
          "/admin/paintings/sync-catalog",
          { method: "POST", token },
        ),
    },
    blogPosts: {
      list: (token: string, opts?: AdminListOptions) =>
        request<BlogPostRecord[]>(adminListPath("/admin/blog-posts", opts), { token }),
      get: (token: string, id: string) =>
        request<BlogPostRecord>(`/admin/blog-posts/${id}`, { token }),
      create: (token: string, data: BlogPostInput) =>
        request<BlogPostRecord>("/admin/blog-posts", {
          method: "POST",
          token,
          body: JSON.stringify(data),
        }),
      update: (token: string, id: string, data: Partial<BlogPostInput>) =>
        request<BlogPostRecord>(`/admin/blog-posts/${id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(data),
        }),
      delete: (token: string, id: string) =>
        request<{ ok: boolean }>(`/admin/blog-posts/${id}`, { method: "DELETE", token }),
      restore: (token: string, id: string) =>
        request<BlogPostRecord>(`/admin/blog-posts/${id}/restore`, { method: "POST", token }),
    },
    events: {
      list: (token: string, opts?: AdminListOptions) =>
        request<EventRecord[]>(adminListPath("/admin/events", opts), { token }),
      get: (token: string, id: string) =>
        request<EventRecord>(`/admin/events/${id}`, { token }),
      create: (token: string, data: EventInput) =>
        request<EventRecord>("/admin/events", {
          method: "POST",
          token,
          body: JSON.stringify(data),
        }),
      update: (token: string, id: string, data: Partial<EventInput>) =>
        request<EventRecord>(`/admin/events/${id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(data),
        }),
      delete: (token: string, id: string) =>
        request<{ ok: boolean }>(`/admin/events/${id}`, { method: "DELETE", token }),
      restore: (token: string, id: string) =>
        request<EventRecord>(`/admin/events/${id}/restore`, { method: "POST", token }),
    },
    users: {
      list: (token: string) => request<UserRecord[]>("/admin/users", { token }),
      create: (
        token: string,
        data: {
          firstName: string;
          lastName: string;
          email: string;
          password: string;
          phone?: string;
          role: UserRole;
        },
      ) =>
        request<UserRecord>("/admin/users", {
          method: "POST",
          token,
          body: JSON.stringify(data),
        }),
      get: (token: string, id: string) =>
        request<UserRecord>(`/admin/users/${id}`, { token }),
      update: (
        token: string,
        id: string,
        data: {
          firstName?: string;
          lastName?: string;
          email?: string;
          password?: string;
          phone?: string;
          role?: UserRole;
        },
      ) =>
        request<UserRecord>(`/admin/users/${id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(data),
        }),
      updateRole: (token: string, id: string, role: UserRole) =>
        request<UserRecord>(`/admin/users/${id}/role`, {
          method: "PATCH",
          token,
          body: JSON.stringify({ role }),
        }),
      delete: (token: string, id: string) =>
        request<{ ok: boolean }>(`/admin/users/${id}`, { method: "DELETE", token }),
    },
  },

  studio: {
    uploadImage: (token: string, file: File, slug: string) =>
      uploadRequest("/studio/uploads/blog", token, file, slug),
    blogPosts: {
      list: (token: string, opts?: AdminListOptions) =>
        request<BlogPostRecord[]>(adminListPath("/studio/blog-posts", opts), { token }),
      get: (token: string, id: string) =>
        request<BlogPostRecord>(`/studio/blog-posts/${id}`, { token }),
      create: (token: string, data: BlogPostInput) =>
        request<BlogPostRecord>("/studio/blog-posts", {
          method: "POST",
          token,
          body: JSON.stringify(data),
        }),
      update: (token: string, id: string, data: Partial<BlogPostInput>) =>
        request<BlogPostRecord>(`/studio/blog-posts/${id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(data),
        }),
      delete: (token: string, id: string) =>
        request<{ ok: boolean }>(`/studio/blog-posts/${id}`, { method: "DELETE", token }),
      restore: (token: string, id: string) =>
        request<BlogPostRecord>(`/studio/blog-posts/${id}/restore`, { method: "POST", token }),
    },
    events: {
      list: (token: string, opts?: AdminListOptions) =>
        request<EventRecord[]>(adminListPath("/studio/events", opts), { token }),
      get: (token: string, id: string) =>
        request<EventRecord>(`/studio/events/${id}`, { token }),
      create: (token: string, data: EventInput) =>
        request<EventRecord>("/studio/events", {
          method: "POST",
          token,
          body: JSON.stringify(data),
        }),
      update: (token: string, id: string, data: Partial<EventInput>) =>
        request<EventRecord>(`/studio/events/${id}`, {
          method: "PATCH",
          token,
          body: JSON.stringify(data),
        }),
      delete: (token: string, id: string) =>
        request<{ ok: boolean }>(`/studio/events/${id}`, { method: "DELETE", token }),
      restore: (token: string, id: string) =>
        request<EventRecord>(`/studio/events/${id}/restore`, { method: "POST", token }),
    },
  },

  accountOrders: {
    list: (token: string) => request<OrderSummary[]>("/account/orders", { token }),
    get: (token: string, id: string) =>
      request<OrderDetail>(`/account/orders/${id}`, { token }),
    reportAlert: (
      token: string,
      orderId: string,
      data: { type: OrderAlertType; message?: string },
    ) =>
      request<OrderAlert>(`/account/orders/${orderId}/alerts`, {
        method: "POST",
        token,
        body: JSON.stringify(data),
      }),
  },

  checkout: {
    createSession: (
      token: string,
      data: {
        items: { slug: string; type: "original" | "print"; quantity: number }[];
        shipping: {
          address: string;
          postalCode?: string;
          city: string;
          country: string;
          saveToProfile?: boolean;
        };
      },
    ) =>
      request<{
        orderId: string;
        reference: string;
        devMode: boolean;
        url: string;
        sessionId?: string;
      }>("/checkout/session", {
        method: "POST",
        token,
        body: JSON.stringify(data),
      }),
    confirmDev: (token: string, orderId: string) =>
      request<{ orderId: string; reference: string; status: OrderStatus }>(
        `/checkout/confirm-dev/${orderId}`,
        { method: "POST", token },
      ),
  },

  commande: {
    stats: (token: string) =>
      request<OrderStats>("/commande/stats", { token }),
    orders: (token: string) => request<OrderSummary[]>("/commande/orders", { token }),
    get: (token: string, id: string) =>
      request<OrderDetail>(`/commande/orders/${id}`, { token }),
    updateStatus: (token: string, id: string, payload: UpdateOrderStatusPayload) =>
      request<OrderDetail>(`/commande/orders/${id}/status`, {
        method: "PATCH",
        token,
        body: JSON.stringify(payload),
      }),
    updateInternalNote: (token: string, id: string, internalNote: string) =>
      request<OrderDetail>(`/commande/orders/${id}/internal-note`, {
        method: "PATCH",
        token,
        body: JSON.stringify({ internalNote }),
      }),
    refund: (token: string, id: string) =>
      request<OrderDetail>(`/commande/orders/${id}/refund`, {
        method: "POST",
        token,
      }),
    downloadInvoice: (token: string, id: string, reference: string) =>
      downloadFile(
        `/commande/orders/${id}/invoice.pdf`,
        token,
        `facture-${reference}.pdf`,
      ),
    downloadPreparation: (token: string, id: string, reference: string) =>
      downloadFile(
        `/commande/orders/${id}/preparation.pdf`,
        token,
        `bon-preparation-${reference}.pdf`,
      ),
    bulkUpdateStatus: (token: string, ids: string[], status: OrderStatus) =>
      request<{ updated: OrderSummary[]; errors: { id: string; message: string }[] }>(
        "/commande/orders/bulk-status",
        {
          method: "POST",
          token,
          body: JSON.stringify({ ids, status }),
        },
      ),
    alertStats: (token: string) =>
      request<OrderAlertStats>("/commande/alerts/stats", { token }),
    alerts: (token: string, status?: OrderAlertStatus) => {
      const q = status ? `?status=${status}` : "";
      return request<OrderAlert[]>(`/commande/alerts${q}`, { token });
    },
    updateAlert: (
      token: string,
      id: string,
      data: { status: OrderAlertStatus; staffNote?: string },
    ) =>
      request<OrderAlert>(`/commande/alerts/${id}`, {
        method: "PATCH",
        token,
        body: JSON.stringify(data),
      }),
  },

  notifications: {
    list: (token: string, limit?: number) => {
      const q = limit ? `?limit=${limit}` : "";
      return request<AppNotification[]>(`/notifications${q}`, { token });
    },
    unreadCount: (token: string) =>
      request<number>("/notifications/unread-count", { token }),
    markRead: (token: string, id: string) =>
      request<AppNotification>(`/notifications/${id}/read`, {
        method: "PATCH",
        token,
      }),
    markAllRead: (token: string) =>
      request<{ ok: boolean }>("/notifications/read-all", {
        method: "PATCH",
        token,
      }),
  },
};
