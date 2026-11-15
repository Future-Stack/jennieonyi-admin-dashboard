import { describe, expect, it } from "vitest";
import {
  accountActionResultSchema,
  buildVerificationQueue,
  buildPeopleListPath,
  buildVerificationListPath,
  customerSchema,
  pendingServiceReviewSchema,
  stylistDetailSchema,
} from "@/lib/admin/people";

const person = {
  userId: "user-1",
  name: "Ada Obi",
  email: "ada@example.test",
  phone: "+2348012345678",
  role: "STYLIST",
  status: "ACTIVE",
  avatar: null,
  createdAt: "2025-01-01T00:00:00.000Z",
  location: "Lagos",
  isFlagged: false,
  flagReason: null,
};

describe("Admin people API contracts", () => {
  it("builds paginated customer exports with current filters", () => {
    expect(
      buildPeopleListPath(
        "customers",
        {
          page: 2,
          limit: 10,
          search: " Ada ",
          status: "ACTIVE",
          isFlagged: false,
        },
        "csv",
      ),
    ).toBe(
      "customers?page=2&limit=10&sortBy=createdAt&sortOrder=desc&format=csv&search=Ada&status=ACTIVE&isFlagged=false",
    );
  });

  it("limits the KYC query to stylists and provides a separate service-review route", () => {
    const filters = { page: 1, limit: 50, search: "Ada" };
    expect(buildVerificationListPath("kyc/pending", filters)).toContain(
      "kyc/pending?page=1&limit=50&sortBy=createdAt&sortOrder=desc&format=json&search=Ada&role=STYLIST",
    );
    expect(buildVerificationListPath("stylist-services/pending", filters)).toContain(
      "stylist-services/pending?page=1&limit=50&sortBy=createdAt&sortOrder=desc&format=json&search=Ada",
    );
  });

  it("validates directory rows and the sensitive stylist detail projection", () => {
    expect(customerSchema.parse({ ...person, role: "CUSTOMER", bookingsCount: 3, totalSpent: 9200 })).toMatchObject({
      userId: "user-1",
      totalSpent: 9200,
    });

    expect(
      stylistDetailSchema.parse({
        ...person,
        stylistId: "stylist-1",
        specialties: ["Braiding"],
        rating: 4.8,
        completedJobs: 12,
        revenue: 15000,
        tier: "Silver",
        plaitPoints: 140,
        isKycApproved: true,
        idDocumentUrl: "https://files.example.test/id",
        bank: {
          bankName: "Access Bank",
          maskedAccount: "******6789",
          isVerified: true,
        },
        referredBy: { agentId: "agent-1", agentCode: "AGENT-1", name: "Agent" },
        reviews: [],
      }),
    ).toMatchObject({
      bank: { maskedAccount: "******6789" },
      isKycApproved: true,
    });
  });

  it("rejects malformed pending-service review data", () => {
    expect(() => pendingServiceReviewSchema.parse({ user: person, service: {} })).toThrow();
  });

  it("merges account and service queues without losing active-stylist videos", () => {
    const pending = {
      id: "service-pending",
      serviceName: "Knotless Braids",
      serviceDuration: "3 hours",
      price: 160,
      homeServiceAddon: 20,
      userType: "ALL",
      description: null,
      verificationVideoUrl: "https://video.example.test/pending.mp4",
      status: "PENDING_REVIEW",
      adminNote: null,
      createdAt: "2025-01-03T00:00:00.000Z",
    } as const;
    const kycService = {
      ...pending,
      id: "kyc-service",
      status: "LIVE",
    } as const;
    const activeStylist = { ...person, userId: "active-stylist", status: "ACTIVE" } as const;
    const kycStylist = { ...person, userId: "new-stylist", status: "PENDING_APPROVAL" } as const;
    const groups = buildVerificationQueue(
      [
        {
          user: kycStylist,
          services: [kycService, pending],
          idDocumentUrl: null,
          bank: { bankName: null, maskedAccount: null },
          referral: null,
        },
      ],
      [
        { user: kycStylist, service: pending },
        { user: activeStylist, service: { ...pending, id: "active-service" } },
      ],
    );

    expect(groups).toHaveLength(2);
    expect(groups.find((group) => group.user.userId === "new-stylist")).toMatchObject({
      accountPending: true,
      services: [{ id: "service-pending" }],
    });
    expect(groups.find((group) => group.user.userId === "active-stylist")).toMatchObject({
      accountPending: false,
      services: [{ id: "active-service" }],
    });
  });

  it("accepts the real suspend/reinstate response (message is on the envelope, not in data)", () => {
    expect(accountActionResultSchema.parse({ userId: "u1", status: "SUSPEND", suspendReason: "Suspended by platform administrator" }).status).toBe("SUSPEND");
    expect(accountActionResultSchema.parse({ userId: "u1", status: "ACTIVE" }).status).toBe("ACTIVE");
    expect(() => accountActionResultSchema.parse({ message: "Account suspended" })).toThrow();
  });
});
