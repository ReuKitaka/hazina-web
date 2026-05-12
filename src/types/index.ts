// ── Auth ──────────────────────────────────────────────────────────────────────
export interface AuthResponse {
  token: string
  email: string
  role: string
}

export interface LoginRequest {
  email: string
  password: string
}

// ── Accounts ──────────────────────────────────────────────────────────────────
export interface Account {
  id: string
  code: string
  name: string
  type: 'ASSET' | 'LIABILITY' | 'EQUITY' | 'REVENUE' | 'EXPENSE'
  normalBalance: 'DEBIT' | 'CREDIT'
  parentId?: string
  description?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

// ── Journal Entries ───────────────────────────────────────────────────────────
export interface JournalEntryLine {
  id: string
  accountId: string
  accountCode: string
  accountName: string
  description: string
  debitAmount: number
  creditAmount: number
  lineOrder: number
  foreignCurrency?: string
  foreignAmount?: number
  exchangeRate?: number
}

export interface JournalEntry {
  id: string
  entryNumber: string
  entryDate: string
  description: string
  reference?: string
  status: 'DRAFT' | 'POSTED' | 'REVERSED'
  lines: JournalEntryLine[]
  totalDebit: number
  totalCredit: number
  balanced: boolean
  createdAt: string
  updatedAt: string
}

// ── Cash Book ─────────────────────────────────────────────────────────────────
export interface CashAccount {
  id: string
  name: string
  accountId: string
  accountNumber?: string
  bankName?: string
  currency: string
  active: boolean
  balance?: number
  createdAt: string
  updatedAt: string
}

export interface CashTransaction {
  id: string
  cashAccountId: string
  cashAccountName: string
  transactionType: 'RECEIPT' | 'PAYMENT'
  amount: number
  description: string
  reference?: string
  counterpartAccountId: string
  counterpartAccountCode?: string
  counterpartAccountName?: string
  transactionDate: string
  journalEntryNumber: string
  createdAt: string
}

// ── AR ────────────────────────────────────────────────────────────────────────
export interface Customer {
  id: string
  customerCode: string
  name: string
  email?: string
  phone?: string
  address?: string
  outstandingBalance: number
  createdAt: string
  updatedAt: string
}

export interface InvoiceLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  revenueAccountId: string
  revenueAccountCode?: string
  revenueAccountName?: string
}

export interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customerName?: string
  arAccountId: string
  arAccountCode?: string
  invoiceDate: string
  dueDate: string
  customerRef?: string
  status: 'DRAFT' | 'APPROVED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED'
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  notes?: string
  lines: InvoiceLine[]
  createdAt: string
  updatedAt: string
}

export interface ArReceipt {
  id: string
  invoiceId: string
  invoiceNumber: string
  customerId: string
  customerName?: string
  paymentDate: string
  amountReceived: number
  paymentMethod?: string
  paymentAccountId: string
  paymentAccountCode?: string
  journalEntryNumber: string
  notes?: string
  createdAt: string
}

// ── AP ────────────────────────────────────────────────────────────────────────
export interface Supplier {
  id: string
  supplierCode: string
  name: string
  email?: string
  phone?: string
  address?: string
  taxPin?: string
  outstandingBalance: number
  createdAt: string
  updatedAt: string
}

export interface BillLine {
  id: string
  description: string
  quantity: number
  unitPrice: number
  amount: number
  expenseAccountId: string
  expenseAccountCode?: string
  expenseAccountName?: string
}

export interface Bill {
  id: string
  billNumber: string
  supplierId: string
  supplierName?: string
  apAccountId: string
  apAccountCode?: string
  billDate: string
  dueDate: string
  supplierRef?: string
  status: 'DRAFT' | 'APPROVED' | 'PARTIALLY_PAID' | 'PAID' | 'CANCELLED'
  totalAmount: number
  paidAmount: number
  outstandingAmount: number
  notes?: string
  lines: BillLine[]
  createdAt: string
  updatedAt: string
}

export interface ApPayment {
  id: string
  billId: string
  billNumber: string
  supplierId: string
  supplierName?: string
  paymentDate: string
  amountPaid: number
  paymentMethod?: string
  paymentAccountId: string
  paymentAccountCode?: string
  journalEntryNumber: string
  notes?: string
  createdAt: string
}

// ── Budgets ───────────────────────────────────────────────────────────────────
export interface Budget {
  id: string
  name: string
  accountId: string
  accountCode?: string
  accountName?: string
  periodStart: string
  periodEnd: string
  budgetAmount: number
  notes?: string
  active: boolean
  createdAt: string
  updatedAt: string
}

export interface BudgetStatus {
  budgetId: string
  budgetName: string
  accountId: string
  accountCode: string
  accountName: string
  periodStart: string
  periodEnd: string
  budgetAmount: number
  spentAmount: number
  remainingAmount: number
  percentUsed: number
  alertLevel: 'OK' | 'WARNING' | 'EXCEEDED'
}

// ── Exchange Rates ─────────────────────────────────────────────────────────────
export interface ExchangeRate {
  id: string
  baseCurrency: string
  quoteCurrency: string
  rate: number
  effectiveDate: string
  createdAt: string
}

// ── Reports ───────────────────────────────────────────────────────────────────
export interface TrialBalanceLine {
  accountId: string
  accountCode: string
  accountName: string
  accountType: string
  debitBalance: number
  creditBalance: number
}

export interface TrialBalanceReport {
  asOf: string
  lines: TrialBalanceLine[]
  totalDebits: number
  totalCredits: number
}

export interface PnlLine {
  accountId: string
  accountCode: string
  accountName: string
  amount: number
}

export interface ProfitAndLossReport {
  from: string
  to: string
  revenues: PnlLine[]
  expenses: PnlLine[]
  totalRevenue: number
  totalExpenses: number
  netIncome: number
}

export interface BalanceSheetLine {
  accountId?: string
  accountCode: string
  accountName: string
  balance: number
}

export interface BalanceSheetReport {
  asOf: string
  assets: BalanceSheetLine[]
  liabilities: BalanceSheetLine[]
  equity: BalanceSheetLine[]
  totalAssets: number
  totalLiabilities: number
  totalEquity: number
  totalLiabilitiesAndEquity: number
}

export interface CashFlowLine {
  transactionId: string
  date: string
  transactionType: string
  description: string
  reference?: string
  amount: number
  cashAccountName?: string
  counterpartAccountCode?: string
  counterpartAccountName?: string
}

export interface CashFlowReport {
  from: string
  to: string
  receipts: CashFlowLine[]
  payments: CashFlowLine[]
  totalReceipts: number
  totalPayments: number
  netCashFlow: number
}
