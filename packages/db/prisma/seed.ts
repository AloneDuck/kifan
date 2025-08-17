import * as argon2 from "argon2";
import {
  AccountType,
  AssetType,
  CategoryType,
  CheckStatus,
  CheckType,
  Currency,
  DebtStatus,
  DebtType,
  GoalStatus,
  LoanStatus,
  PrismaClient,
  TransactionType,
} from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  await prisma.refreshToken.deleteMany();
  await prisma.transaction.deleteMany();
  await prisma.budget.deleteMany();
  await prisma.loanInstallment.deleteMany();
  await prisma.loan.deleteMany();
  await prisma.debtRecord.deleteMany();
  await prisma.check.deleteMany();
  await prisma.asset.deleteMany();
  await prisma.goal.deleteMany();
  await prisma.recurringRule.deleteMany();
  await prisma.category.deleteMany();
  await prisma.account.deleteMany();
  await prisma.person.deleteMany();
  await prisma.settings.deleteMany();
  await prisma.user.deleteMany();

  const user = await prisma.user.create({
    data: {
      fullName: "کاربر نمونه",
      email: "demo@keyfan.app",
      passwordHash: await argon2.hash("Password123!"),
      preferredCurrency: Currency.TOMAN,
      settings: {
        create: {
          currency: Currency.TOMAN,
        },
      },
    },
  });

  const [wallet, bank] = await Promise.all([
    prisma.account.create({
      data: {
        userId: user.id,
        name: "کیف پول روزانه",
        type: AccountType.WALLET,
        initialBalance: 3500000,
        currentBalance: 3500000,
        currency: Currency.TOMAN,
      },
    }),
    prisma.account.create({
      data: {
        userId: user.id,
        name: "حساب بانک ملت",
        type: AccountType.BANK_ACCOUNT,
        initialBalance: 18000000,
        currentBalance: 18000000,
        currency: Currency.TOMAN,
      },
    }),
  ]);

  const categoryRows = await prisma.category.createManyAndReturn({
    data: [
      { userId: user.id, name: "خوراک", type: CategoryType.EXPENSE },
      { userId: user.id, name: "حمل‌ونقل", type: CategoryType.EXPENSE },
      { userId: user.id, name: "اجاره", type: CategoryType.EXPENSE },
      { userId: user.id, name: "قبض‌ها", type: CategoryType.EXPENSE },
      { userId: user.id, name: "درمان", type: CategoryType.EXPENSE },
      { userId: user.id, name: "حقوق", type: CategoryType.INCOME },
      { userId: user.id, name: "فریلنس", type: CategoryType.INCOME },
      { userId: user.id, name: "سایر درآمدها", type: CategoryType.INCOME },
    ],
  });

  const خوراک = categoryRows.find((item) => item.name === "خوراک")!;
  const حملونقل = categoryRows.find((item) => item.name === "حمل‌ونقل")!;
  const اجاره = categoryRows.find((item) => item.name === "اجاره")!;
  const حقوق = categoryRows.find((item) => item.name === "حقوق")!;
  const فریلنس = categoryRows.find((item) => item.name === "فریلنس")!;

  const [ali, sara] = await Promise.all([
    prisma.person.create({
      data: { userId: user.id, name: "علی رضایی", note: "همکار" },
    }),
    prisma.person.create({
      data: { userId: user.id, name: "سارا احمدی", note: "دوست خانوادگی" },
    }),
  ]);

  const transactions = [
    {
      userId: user.id,
      type: TransactionType.INCOME,
      amount: 22000000,
      date: new Date("2026-05-01"),
      accountId: bank.id,
      categoryId: حقوق.id,
      description: "حقوق اردیبهشت",
      tags: ["حقوق"],
    },
    {
      userId: user.id,
      type: TransactionType.INCOME,
      amount: 6500000,
      date: new Date("2026-05-11"),
      accountId: bank.id,
      categoryId: فریلنس.id,
      description: "پروژه طراحی",
      tags: ["فریلنس"],
    },
    {
      userId: user.id,
      type: TransactionType.EXPENSE,
      amount: 1800000,
      date: new Date("2026-05-04"),
      accountId: wallet.id,
      categoryId: خوراک.id,
      description: "خرید ماهانه",
      tags: ["خانه"],
    },
    {
      userId: user.id,
      type: TransactionType.EXPENSE,
      amount: 9500000,
      date: new Date("2026-05-06"),
      accountId: bank.id,
      categoryId: اجاره.id,
      description: "اجاره خانه",
      tags: ["خانه"],
    },
    {
      userId: user.id,
      type: TransactionType.EXPENSE,
      amount: 750000,
      date: new Date("2026-05-09"),
      accountId: wallet.id,
      categoryId: حملونقل.id,
      description: "هزینه رفت‌وآمد",
      tags: ["روزانه"],
    },
  ];

  await prisma.transaction.createMany({ data: transactions });

  await prisma.budget.createMany({
    data: [
      {
        userId: user.id,
        month: 3,
        year: 1405,
        categoryId: خوراک.id,
        amount: 3500000,
        spentAmount: 1800000,
      },
      {
        userId: user.id,
        month: 3,
        year: 1405,
        categoryId: حملونقل.id,
        amount: 1500000,
        spentAmount: 750000,
      },
    ],
  });

  const loan = await prisma.loan.create({
    data: {
      userId: user.id,
      name: "وام لپ‌تاپ",
      principalAmount: 30000000,
      installmentAmount: 3000000,
      numberOfInstallments: 10,
      startDate: new Date("2026-04-01"),
      monthlyDueDay: 10,
      paymentAccountId: bank.id,
      status: LoanStatus.ACTIVE,
    },
  });

  await prisma.loanInstallment.createMany({
    data: Array.from({ length: 10 }).map((_, index) => ({
      userId: user.id,
      loanId: loan.id,
      installmentNumber: index + 1,
      dueDate: new Date(2026, index + 3, 10),
      amount: 3000000,
      status: index < 2 ? "PAID" : "UNPAID",
      paidDate: index < 2 ? new Date(2026, index + 3, 8) : null,
    })),
  });

  await prisma.debtRecord.createMany({
    data: [
      {
        userId: user.id,
        personId: ali.id,
        type: DebtType.OWES_ME,
        amount: 2500000,
        status: DebtStatus.OPEN,
        settledAmount: 500000,
        note: "قرض کوتاه‌مدت",
      },
      {
        userId: user.id,
        personId: sara.id,
        type: DebtType.I_OWE,
        amount: 1800000,
        status: DebtStatus.PARTIAL,
        settledAmount: 300000,
        note: "خرید مشترک",
      },
    ],
  });

  await prisma.check.createMany({
    data: [
      {
        userId: user.id,
        type: CheckType.ISSUED,
        amount: 4200000,
        checkNumber: "904512",
        bankName: "ملت",
        personId: ali.id,
        dueDate: new Date("2026-06-20"),
        status: CheckStatus.PENDING,
      },
      {
        userId: user.id,
        type: CheckType.RECEIVED,
        amount: 3100000,
        checkNumber: "441102",
        bankName: "صادرات",
        personId: sara.id,
        dueDate: new Date("2026-06-25"),
        status: CheckStatus.CLEARED,
      },
    ],
  });

  await prisma.asset.createMany({
    data: [
      {
        userId: user.id,
        type: AssetType.GOLD,
        name: "طلای ۱۸ عیار",
        quantity: 4,
        unit: "گرم",
        unitValue: 6500000,
        totalValue: 26000000,
      },
      {
        userId: user.id,
        type: AssetType.FOREIGN_CURRENCY,
        name: "دلار",
        quantity: 1000,
        unit: "دلار",
        unitValue: 92000,
        totalValue: 92000000,
      },
    ],
  });

  await prisma.goal.create({
    data: {
      userId: user.id,
      name: "سفر پاییز",
      targetAmount: 40000000,
      currentAmount: 9500000,
      linkedAccountId: bank.id,
      status: GoalStatus.ACTIVE,
      color: "#0b5d4b",
      icon: "plane",
    },
  });

  console.log("Demo data seeded for demo@keyfan.app");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
