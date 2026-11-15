import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { apiClient } from "@/lib/api-client";
import { BackendProtocolError } from "@/lib/api/errors";

const statusSchema = z.enum([
  "ACTIVE",
  "INACTIVE",
  "PENDING_APPROVAL",
  "SUSPEND",
  "REJECTED",
]);

const personSchema = z.object({
  userId: z.string().min(1),
  name: z.string(),
  email: z.string(),
  phone: z.string(),
  role: z.string(),
  status: statusSchema,
  avatar: z.string().nullable(),
  createdAt: z.string(),
  location: z.string().nullable(),
  isFlagged: z.boolean(),
  flagReason: z.string().nullable(),
});

export const customerSchema = personSchema.extend({
  bookingsCount: z.number(),
  totalSpent: z.number(),
});

export const stylistSchema = personSchema.extend({
  stylistId: z.string(),
  specialties: z.array(z.string()),
  rating: z.number(),
  completedJobs: z.number(),
  revenue: z.number(),
  tier: z.enum(["Bronze", "Silver", "Gold", "Platinum"]),
  plaitPoints: z.number(),
});

const listMetaSchema = z
  .object({
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    total: z.number().int().nonnegative(),
    totalPages: z.number().int().nonnegative(),
    stats: z.record(z.string(), z.number()).optional(),
    counts: z.record(z.string(), z.number()).optional(),
  })
  .passthrough();

export const customerDetailSchema = customerSchema
  .extend({
    termsAgreedAt: z.string().nullable(),
    bookings: z.array(z.object({}).passthrough()),
    orders: z.array(z.object({}).passthrough()),
  })
  .passthrough();

export const stylistDetailSchema = stylistSchema
  .extend({
    isKycApproved: z.boolean(),
    idDocumentUrl: z.string().nullable(),
    bank: z.object({
      bankName: z.string().nullable(),
      maskedAccount: z.string().nullable(),
      isVerified: z.boolean(),
    }),
    referredBy: z
      .object({
        agentId: z.string(),
        agentCode: z.string(),
        name: z.string(),
      })
      .nullable(),
    reviews: z.array(
      z.object({
        id: z.string(),
        rating: z.number(),
        comment: z.string().nullable(),
        createdAt: z.string(),
        customer: z.object({
          userId: z.string(),
          name: z.string(),
        }),
      }),
    ),
  })
  .passthrough();

const serviceViewSchema = z.object({
  id: z.string(),
  serviceName: z.string(),
  serviceDuration: z.string(),
  price: z.number(),
  homeServiceAddon: z.number(),
  userType: z.enum(["ALL", "ADULTS", "KIDS"]),
  description: z.string().nullable(),
  verificationVideoUrl: z.string().nullable(),
  status: z.enum(["LIVE", "PENDING_REVIEW", "REJECTED"]),
  adminNote: z.string().nullable(),
  createdAt: z.string(),
});

export const kycQueueEntrySchema = z.object({
  user: personSchema,
  services: z.array(serviceViewSchema),
  idDocumentUrl: z.string().nullable(),
  bank: z.object({
    bankName: z.string().nullable(),
    maskedAccount: z.string().nullable(),
  }),
  referral: z
    .object({
      agentId: z.string(),
      agentCode: z.string(),
    })
    .nullable(),
});

export const pendingServiceReviewSchema = z.object({
  user: personSchema,
  service: serviceViewSchema,
});

export type Customer = z.infer<typeof customerSchema>;
export type CustomerDetail = z.infer<typeof customerDetailSchema>;
export type Stylist = z.infer<typeof stylistSchema>;
export type StylistDetail = z.infer<typeof stylistDetailSchema>;
export type KycQueueEntry = z.infer<typeof kycQueueEntrySchema>;
export type PendingServiceReview = z.infer<typeof pendingServiceReviewSchema>;
export type AdminListMeta = z.infer<typeof listMetaSchema>;
export type PendingStylistService = PendingServiceReview["service"];

export interface VerificationQueueGroup {
  user: KycQueueEntry["user"];
  services: PendingStylistService[];
  accountPending: boolean;
}

export function buildVerificationQueue(
  kycEntries: KycQueueEntry[],
  serviceReviews: PendingServiceReview[],
): VerificationQueueGroup[] {
  const groups = new Map<string, VerificationQueueGroup>();
  const getGroup = (user: KycQueueEntry["user"]): VerificationQueueGroup => {
    const existing = groups.get(user.userId);
    if (existing) return existing;
    const group = { user, services: [], accountPending: false };
    groups.set(user.userId, group);
    return group;
  };

  for (const entry of kycEntries) {
    const group = getGroup(entry.user);
    group.accountPending = true;
    for (const service of entry.services) {
      if (
        service.status === "PENDING_REVIEW" &&
        !group.services.some((item) => item.id === service.id)
      ) {
        group.services.push(service);
      }
    }
  }
  for (const row of serviceReviews) {
    const group = getGroup(row.user);
    if (!group.services.some((item) => item.id === row.service.id)) {
      group.services.push(row.service);
    }
  }

  return [...groups.values()].sort((left, right) => {
    const leftDate = Math.max(
      ...left.services.map((service) => new Date(service.createdAt).getTime()),
      0,
    );
    const rightDate = Math.max(
      ...right.services.map((service) => new Date(service.createdAt).getTime()),
      0,
    );
    return rightDate - leftDate;
  });
}

export interface PeopleFilters {
  page: number;
  limit: number;
  search: string;
  status?: string;
  tab?: string;
  isFlagged?: boolean;
}

export const peopleQueryKeys = {
  customers: ["admin", "customers"] as const,
  customerDetail: (id: string) => ["admin", "customers", id] as const,
  stylists: ["admin", "stylists"] as const,
  stylistDetail: (id: string) => ["admin", "stylists", id] as const,
  pendingStylistKyc: ["admin", "kyc", "pending", "STYLIST"] as const,
  pendingServiceReviews: ["admin", "stylist-services", "pending"] as const,
};

export function buildPeopleListPath(
  resource: "customers" | "stylists",
  filters: PeopleFilters,
  format: "json" | "csv" = "json",
): string {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
    sortBy: "createdAt",
    sortOrder: "desc",
    format,
  });
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (filters.status) params.set("status", filters.status);
  if (filters.tab) params.set("tab", filters.tab);
  if (filters.isFlagged !== undefined) {
    params.set("isFlagged", String(filters.isFlagged));
  }
  return `${resource}?${params.toString()}`;
}

async function parseList<T>(
  resource: "customers" | "stylists",
  filters: PeopleFilters,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
) {
  const response = await apiClient.admin.request(
    buildPeopleListPath(resource, filters),
    { method: "GET", signal },
    (data) => z.array(schema).parse(data),
  );
  const meta = listMetaSchema.safeParse(response.meta);
  if (!meta.success) {
    throw new BackendProtocolError("The Admin API returned invalid list metadata.");
  }
  return { data: response.data, meta: meta.data };
}

export function useCustomers(filters: PeopleFilters) {
  return useQuery({
    queryKey: [...peopleQueryKeys.customers, filters],
    queryFn: ({ signal }) =>
      parseList("customers", filters, customerSchema, signal),
  });
}

export function useCustomerDetail(id: string | null) {
  return useQuery({
    queryKey: peopleQueryKeys.customerDetail(id ?? ""),
    enabled: Boolean(id),
    queryFn: async ({ signal }) =>
      (
        await apiClient.admin.request(
          `customers/${encodeURIComponent(id!)}`,
          { method: "GET", signal },
          (data) => customerDetailSchema.parse(data),
        )
      ).data,
  });
}

export function useStylists(filters: PeopleFilters) {
  return useQuery({
    queryKey: [...peopleQueryKeys.stylists, filters],
    queryFn: ({ signal }) =>
      parseList("stylists", filters, stylistSchema, signal),
  });
}

export function useStylistDetail(id: string | null) {
  return useQuery({
    queryKey: peopleQueryKeys.stylistDetail(id ?? ""),
    enabled: Boolean(id),
    queryFn: async ({ signal }) =>
      (
        await apiClient.admin.request(
          `stylists/${encodeURIComponent(id!)}`,
          { method: "GET", signal },
          (data) => stylistDetailSchema.parse(data),
        )
      ).data,
  });
}

export function buildVerificationListPath(
  resource: "kyc/pending" | "stylist-services/pending",
  filters: Pick<PeopleFilters, "page" | "limit" | "search">,
): string {
  const params = new URLSearchParams({
    page: String(filters.page),
    limit: String(filters.limit),
    sortBy: "createdAt",
    sortOrder: "desc",
    format: "json",
  });
  if (filters.search.trim()) params.set("search", filters.search.trim());
  if (resource === "kyc/pending") params.set("role", "STYLIST");
  return `${resource}?${params.toString()}`;
}

async function parseVerificationList<T>(
  path: string,
  schema: z.ZodType<T>,
  signal?: AbortSignal,
) {
  const response = await apiClient.admin.request(
    path,
    { method: "GET", signal },
    (data) => z.array(schema).parse(data),
  );
  const meta = listMetaSchema.safeParse(response.meta);
  if (!meta.success) {
    throw new BackendProtocolError("The Admin API returned invalid list metadata.");
  }
  return { data: response.data, meta: meta.data };
}

export function usePendingStylistKyc(filters: Pick<PeopleFilters, "page" | "limit" | "search">) {
  return useQuery({
    queryKey: [...peopleQueryKeys.pendingStylistKyc, filters],
    queryFn: ({ signal }) =>
      parseVerificationList(
        buildVerificationListPath("kyc/pending", filters),
        kycQueueEntrySchema,
        signal,
      ),
  });
}

export function usePendingStylistServiceReviews(
  filters: Pick<PeopleFilters, "page" | "limit" | "search">,
) {
  return useQuery({
    queryKey: [...peopleQueryKeys.pendingServiceReviews, filters],
    queryFn: ({ signal }) =>
      parseVerificationList(
        buildVerificationListPath("stylist-services/pending", filters),
        pendingServiceReviewSchema,
        signal,
      ),
  });
}

async function patchJson<T>(
  path: string,
  body: object,
  parse: (data: unknown) => T,
) {
  return apiClient.admin.request(
    path,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    },
    parse,
  );
}

export function useUpdateAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      userId: string;
      name?: string;
      email?: string;
      phone?: string;
      location?: string;
      specialties?: string[];
    }) => {
      const { userId, ...body } = input;
      return patchJson(
        `users/${encodeURIComponent(userId)}`,
        body,
        (data) => personSchema.parse(data),
      );
    },
    onSuccess: (_result, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.customers });
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.stylists });
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.customerDetail(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.stylistDetail(userId),
      });
    },
  });
}

export function useFlagAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      userId: string;
      isFlagged: boolean;
      reason: string;
    }) => {
      const { userId, ...body } = input;
      return patchJson(
        `users/${encodeURIComponent(userId)}/flag`,
        body,
        (data) =>
          z
            .object({
              userId: z.string(),
              isFlagged: z.boolean(),
              flagReason: z.string().nullable(),
            })
            .parse(data),
      );
    },
    onSuccess: (_result, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.customers });
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.stylists });
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.customerDetail(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.stylistDetail(userId),
      });
    },
  });
}

/** PATCH /admin/actions/:userId/(suspend|reinstate) → data `{ userId, status, suspendReason? }` (the message lives on the envelope). */
export const accountActionResultSchema = z
  .object({ userId: z.string(), status: statusSchema })
  .passthrough();

export function useAccountAction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      userId: string;
      action: "suspend" | "reinstate";
      reason?: string;
    }) =>
      patchJson(
        `actions/${encodeURIComponent(input.userId)}/${input.action}`,
        input.reason ? { reason: input.reason } : {},
        (data) => accountActionResultSchema.parse(data),
      ),
    onSuccess: (_result, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.customers });
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.stylists });
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.customerDetail(userId),
      });
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.stylistDetail(userId),
      });
    },
  });
}

export function useCreateStylist() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      name: string;
      email: string;
      phone: string;
      locationArea: string;
      specialties: string[];
      bankAccountNumber?: string;
      bankName?: string;
    }) =>
      (
        await apiClient.admin.request(
          "stylists",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input),
          },
          (data) =>
            z
              .object({
                userId: z.string(),
                status: z.literal("PENDING_APPROVAL"),
                setPasswordOtpSent: z.boolean(),
              })
              .parse(data),
        )
      ).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.stylists });
    },
  });
}

export function useUpdateStylistTier() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: {
      userId: string;
      tier: "Bronze" | "Silver" | "Gold" | "Platinum";
    }) =>
      patchJson(
        `actions/stylist/${encodeURIComponent(input.userId)}/tier`,
        { tier: input.tier },
        (data) =>
          z
            .object({
              userId: z.string(),
              tier: z.enum(["Bronze", "Silver", "Gold", "Platinum"]),
              plaitPoints: z.number(),
            })
            .parse(data),
      ),
    onSuccess: (_result, { userId }) => {
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.stylists });
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.stylistDetail(userId),
      });
    },
  });
}

export function useApproveStylistKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: { userId: string; notes?: string }) =>
      (
        await apiClient.admin.request(
          `actions/${encodeURIComponent(input.userId)}/approve`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(input.notes ? { notes: input.notes } : {}),
          },
          (data) =>
            z
              .object({
                userId: z.string(),
                status: z.literal("ACTIVE"),
                isKycApproved: z.boolean(),
              })
              .passthrough()
              .parse(data),
        )
      ).data,
    onSuccess: (_result, { userId }) => {
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.pendingStylistKyc,
      });
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.pendingServiceReviews,
      });
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.stylistDetail(userId),
      });
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.stylists });
    },
  });
}

export function useRejectStylistKyc() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      userId: string;
      reason: string;
      notes?: string;
    }) =>
      (
        await apiClient.admin.request(
          `actions/${encodeURIComponent(input.userId)}/reject`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              reason: input.reason,
              ...(input.notes ? { notes: input.notes } : {}),
            }),
          },
          (data) =>
            z
              .object({
                userId: z.string(),
                status: z.string(),
                isKycApproved: z.boolean(),
                rejectReason: z.string(),
              })
              .passthrough()
              .parse(data),
        )
      ).data,
    onSuccess: (_result, { userId }) => {
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.pendingStylistKyc,
      });
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.pendingServiceReviews,
      });
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.stylistDetail(userId),
      });
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.stylists });
    },
  });
}

export function useReviewStylistService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (input: {
      serviceId: string;
      status: "LIVE" | "REJECTED";
      adminNote?: string;
    }) =>
      (
        await apiClient.admin.request(
          `stylist-services/${encodeURIComponent(input.serviceId)}/review`,
          {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              status: input.status,
              ...(input.adminNote ? { adminNote: input.adminNote } : {}),
            }),
          },
          (data) => serviceViewSchema.parse(data),
        )
      ).data,
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.pendingStylistKyc,
      });
      void queryClient.invalidateQueries({
        queryKey: peopleQueryKeys.pendingServiceReviews,
      });
      void queryClient.invalidateQueries({ queryKey: peopleQueryKeys.stylists });
    },
  });
}
