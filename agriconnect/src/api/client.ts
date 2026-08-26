const API_BASE = "";

function getToken(): string | null {
  return localStorage.getItem("agriconnect-token");
}

export function setToken(token: string) {
  localStorage.setItem("agriconnect-token", token);
}

export function clearToken() {
  localStorage.removeItem("agriconnect-token");
  localStorage.removeItem("agriconnect-user");
}

async function request<T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed with status ${res.status}`);
  }
  return data;
}

// Auth API
export const authApi = {
  register: (body: {
    email: string; phone: string; password: string; name: string;
    role?: string; organizationOrFarm?: string; location?: string;
  }) => request("/api/auth/register", { method: "POST", body: JSON.stringify(body) }),

  login: (emailOrPhone: string, password: string) =>
    request("/api/auth/login", { method: "POST", body: JSON.stringify({ emailOrPhone, password }) }),

  me: () => request("/api/auth/me"),

  updateProfile: (body: any) =>
    request("/api/auth/profile", { method: "PUT", body: JSON.stringify(body) }),

  verify: (level: string) =>
    request("/api/auth/verify", { method: "PUT", body: JSON.stringify({ level }) }),
};

// Listings API
export const listingsApi = {
  list: (params?: Record<string, string>) => {
    const qs = params ? "?" + new URLSearchParams(params).toString() : "";
    return request(`/api/listings${qs}`);
  },

  get: (id: string) => request(`/api/listings/${id}`),

  create: (body: any) =>
    request("/api/listings", { method: "POST", body: JSON.stringify(body) }),

  update: (id: string, body: any) =>
    request(`/api/listings/${id}`, { method: "PUT", body: JSON.stringify(body) }),

  delete: (id: string) =>
    request(`/api/listings/${id}`, { method: "DELETE" }),
};

// Messages API
export const messagesApi = {
  getConversations: () => request("/api/messages/conversations"),

  startConversation: (recipientId: string) =>
    request("/api/messages/conversations", {
      method: "POST",
      body: JSON.stringify({ recipientId }),
    }),

  getMessages: (conversationId: string) =>
    request(`/api/messages/conversations/${conversationId}`),

  send: (conversationId: string, text: string, offerDetails?: any) =>
    request("/api/messages/send", {
      method: "POST",
      body: JSON.stringify({ conversationId, text, offerDetails }),
    }),

  updateOfferStatus: (conversationId: string, messageId: string, status: string) =>
    request("/api/messages/offer-status", {
      method: "PUT",
      body: JSON.stringify({ conversationId, messageId, status }),
    }),

  getUnreadCount: () => request("/api/messages/unread"),
};

// Notifications API
export const notificationsApi = {
  list: () => request("/api/notifications"),

  markRead: (ids?: string[]) =>
    request("/api/notifications/read", {
      method: "PUT",
      body: JSON.stringify({ ids }),
    }),

  getUnreadCount: () => request("/api/notifications/unread-count"),

  delete: (id: string) =>
    request(`/api/notifications/${id}`, { method: "DELETE" }),
};

// Market API
export const marketApi = {
  getPrices: () => request("/api/market/prices"),

  getTradeOffers: () => request("/api/market/trade-offers"),

  updateOfferStatus: (id: string, status: string) =>
    request(`/api/market/trade-offers/${id}/status`, {
      method: "PUT",
      body: JSON.stringify({ status }),
    }),
};

// Upload API
export const uploadApi = {
  cropImages: async (files: File[]) => {
    const formData = new FormData();
    files.forEach((f) => formData.append("images", f));
    const token = getToken();
    const res = await fetch("/api/upload/crop", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data;
  },

  profileImage: async (file: File) => {
    const formData = new FormData();
    formData.append("avatar", file);
    const token = getToken();
    const res = await fetch("/api/upload/profile", {
      method: "POST",
      headers: token ? { Authorization: `Bearer ${token}` } : {},
      body: formData,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data;
  },
};

// AI API
export const aiApi = {
  advisor: (message: string, history?: any[], context?: any) =>
    request("/api/ai/advisor", {
      method: "POST",
      body: JSON.stringify({ message, history, context }),
    }),

  plan: (params: any) =>
    request("/api/ai/plan", { method: "POST", body: JSON.stringify(params) }),

  priceEstimate: (params: any) =>
    request("/api/ai/price-estimate", { method: "POST", body: JSON.stringify(params) }),

  analyzeCrop: (imageBase64: string) =>
    request("/api/ai/analyze-crop", { method: "POST", body: JSON.stringify({ image: imageBase64 }) }),

  analyzeLeaf: (imageBase64: string) =>
    request("/api/ai/analyze-leaf", { method: "POST", body: JSON.stringify({ image: imageBase64 }) }),
};

// Weather API
export const weatherApi = {
  get: (location?: string, crop?: string) =>
    request("/api/weather", { method: "POST", body: JSON.stringify({ location, crop }) }),
};
