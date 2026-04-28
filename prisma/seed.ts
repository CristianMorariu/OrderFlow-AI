import "dotenv/config";
import { faker } from "@faker-js/faker";
import {
  AppRole,
  OrderPriority,
  OrderStatus,
  PrismaClient,
  ReturnStatus,
  RiskLevel,
} from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const activityTypes = [
  "status_changed",
  "priority_changed",
  "note_added",
  "return_created",
  "assignee_changed",
  "ai_summary_generated",
] as const;

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

function pickMany<T>(items: T[], count: number): T[] {
  return [...items].sort(() => 0.5 - Math.random()).slice(0, count);
}

function maybe<T>(value: T, probability = 0.5): T | null {
  return Math.random() < probability ? value : null;
}

async function main() {
  await prisma.activityLog.deleteMany();
  await prisma.note.deleteMany();
  await prisma.aiSummary.deleteMany();
  await prisma.return.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.customer.deleteMany();
  await prisma.user.deleteMany();

  const users = await Promise.all([
    prisma.user.create({
      data: {
        name: "Admin User",
        email: "admin@example.com",
        role: AppRole.ADMIN,
      },
    }),
    prisma.user.create({
      data: {
        name: "Support Agent",
        email: "support@example.com",
        role: AppRole.SUPPORT,
      },
    }),
    prisma.user.create({
      data: {
        name: "Operations Manager",
        email: "manager@example.com",
        role: AppRole.MANAGER,
      },
    }),
  ]);

  const customers = await Promise.all(
    Array.from({ length: 10 }, () =>
      prisma.customer.create({
        data: {
          fullName: faker.person.fullName(),
          email: faker.internet.email().toLowerCase(),
          phone: maybe(faker.phone.number(), 0.8) ?? undefined,
        },
      })
    )
  );

  const orders = [];

  for (let index = 0; index < 25; index += 1) {
    const customer = pickOne(customers);
    const assignedUser = pickOne(users);
    const itemCount = faker.number.int({ min: 1, max: 3 });
    const items = Array.from({ length: itemCount }, () => ({
      productName: faker.commerce.productName(),
      sku: faker.string.alphanumeric({ length: 8, casing: "upper" }),
      quantity: faker.number.int({ min: 1, max: 4 }),
      unitPrice: Number(faker.commerce.price({ min: 20, max: 400, dec: 2 })),
    }));
    const totalAmount = Number(
      items
        .reduce((sum, item) => sum + item.quantity * item.unitPrice, 0)
        .toFixed(2)
    );
    const hasIssue = faker.datatype.boolean(0.65);

    const order = await prisma.order.create({
      data: {
        orderNumber: `ORD-${String(index + 1).padStart(4, "0")}`,
        customerId: customer.id,
        status: pickOne([
          OrderStatus.NEW,
          OrderStatus.IN_REVIEW,
          OrderStatus.PENDING_CUSTOMER,
          OrderStatus.PENDING_COURIER,
          OrderStatus.RESOLVED,
        ]),
        priority: pickOne([
          OrderPriority.LOW,
          OrderPriority.MEDIUM,
          OrderPriority.HIGH,
          OrderPriority.URGENT,
        ]),
        totalAmount,
        currency: pickOne(["RON", "EUR", "USD"]),
        placedAt: faker.date.recent({ days: 45 }),
        assignedToUserId: assignedUser.id,
        hasIssue,
        issueType: hasIssue
          ? pickOne([
              "Delayed shipment",
              "Damaged item",
              "Customer requested update",
              "Return requested",
              "Wrong item delivered",
            ])
          : undefined,
        needsFollowUp: faker.datatype.boolean(0.4),
        items: {
          create: items,
        },
      },
    });

    orders.push(order);
  }

  for (const order of pickMany(orders, 8)) {
    await prisma.return.create({
      data: {
        orderId: order.id,
        status: pickOne([
          ReturnStatus.REQUESTED,
          ReturnStatus.APPROVED,
          ReturnStatus.IN_TRANSIT,
          ReturnStatus.RECEIVED,
          ReturnStatus.REFUNDED,
          ReturnStatus.REJECTED,
        ]),
        reason: pickOne([
          "Damaged on arrival",
          "Wrong item sent",
          "Customer changed mind",
          "Package lost in transit",
        ]),
        requestedAt: faker.date.recent({ days: 20 }),
        resolvedAt: maybe(faker.date.recent({ days: 10 }), 0.4) ?? undefined,
        refundAmount: maybe(
          Number(faker.commerce.price({ min: 20, max: 300, dec: 2 })),
          0.7
        ) ?? undefined,
        createdByUserId: pickOne(users).id,
      },
    });
  }

  for (let index = 0; index < 18; index += 1) {
    await prisma.note.create({
      data: {
        orderId: pickOne(orders).id,
        authorUserId: pickOne(users).id,
        body: faker.helpers.arrayElement([
          "Customer asked for a delivery update.",
          "Courier status is still pending.",
          "Support called the customer and confirmed the issue.",
          "Waiting for warehouse confirmation.",
          "Follow-up needed tomorrow morning.",
        ]),
      },
    });
  }

  for (let index = 0; index < 25; index += 1) {
    const actionType = pickOne([...activityTypes]);

    await prisma.activityLog.create({
      data: {
        orderId: pickOne(orders).id,
        actorUserId: pickOne(users).id,
        actionType,
        metadata: {
          source: "seed",
          actionType,
          oldValue: faker.helpers.arrayElement(["LOW", "MEDIUM", "NEW"]),
          newValue: faker.helpers.arrayElement(["HIGH", "URGENT", "RESOLVED"]),
        },
      },
    });
  }

  for (const order of pickMany(orders, 10)) {
    await prisma.aiSummary.create({
      data: {
        orderId: order.id,
        summary: faker.helpers.arrayElement([
          "Order is delayed and needs a courier update.",
          "Customer has already contacted support twice.",
          "Return risk is moderate due to repeated delivery issues.",
          "Case looks stable, but follow-up is still recommended.",
        ]),
        riskLevel: pickOne([
          RiskLevel.LOW,
          RiskLevel.MEDIUM,
          RiskLevel.HIGH,
        ]),
        suggestedActions: [
          "Check courier timeline",
          "Message customer with latest status",
          "Reassess in 24 hours",
        ],
      },
    });
  }

  console.log("Seed completed successfully.");
  console.log(`Users: ${users.length}`);
  console.log(`Customers: ${customers.length}`);
  console.log(`Orders: ${orders.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
