# Hazina User Guide

**Hazina** is a web-based accounting system for managing your company's finances — invoices, bills, cash, budgets, and financial reports — all in one place.

---

## Table of Contents

1. [Logging In](#1-logging-in)
2. [Dashboard](#2-dashboard)
3. [Chart of Accounts](#3-chart-of-accounts)
4. [Journal Entries](#4-journal-entries)
5. [Cash Book](#5-cash-book)
6. [Accounts Receivable (Invoices)](#6-accounts-receivable-invoices)
7. [Accounts Payable (Bills)](#7-accounts-payable-bills)
8. [Budgets](#8-budgets)
9. [Exchange Rates & FX Revaluation](#9-exchange-rates--fx-revaluation)
10. [Reports](#10-reports)
11. [User Management](#11-user-management)
12. [Common Workflows](#12-common-workflows)

---

## 1. Logging In

Open `http://localhost:3000` (or the URL your administrator provides).

Enter your **email address** and **password**, then click **Sign in**.

- If you forget your password, ask your system administrator to reset it.
- Your role (ADMIN, ACCOUNTANT, or VIEWER) determines what you can do:

| Role | What you can do |
|---|---|
| VIEWER | Read and view all data — no changes |
| ACCOUNTANT | Create and approve transactions |
| ADMIN | Full access including user management |

---

## 2. Dashboard

The dashboard gives you a live snapshot of your company's financial health.

**Metric cards** (top row):
- **Revenue** — total income for the current month
- **Expenses** — total costs for the current month
- **Net Income** — Revenue minus Expenses
- **Cash Balance** — combined balance across all cash/bank accounts
- **AR Outstanding** — total unpaid customer invoices
- **AP Outstanding** — total unpaid supplier bills

**Bar chart** — plots Revenue, Expenses, and Net Income side by side for the current month.

**P&L Summary** — breakdown of revenue and expense accounts on the right panel.

---

## 3. Chart of Accounts

**Finance → Accounts**

The Chart of Accounts is the backbone of the system. Every transaction is posted to one or more accounts here.

### Account types

| Type | Examples |
|---|---|
| ASSET | Cash, Bank, Accounts Receivable, Equipment |
| LIABILITY | Accounts Payable, Loans, Taxes Payable |
| EQUITY | Owner's Equity, Retained Earnings |
| REVENUE | Sales, Service Income, FX Gain |
| EXPENSE | Rent, Salaries, Utilities, FX Loss |

### Filtering accounts

Use the **type filter tabs** (All / Asset / Liability / Equity / Revenue / Expense) at the top to narrow the list.

### Creating an account

1. Click **Add Account**
2. Enter a **Code** (e.g. `1100`), **Name** (e.g. `Trade Debtors`), and **Type**
3. Optionally add a **Description** and a **Parent Account** for sub-accounts
4. Click **Create**

> Account codes are free-form but it is good practice to use a numbering scheme:
> 1xxx = Assets, 2xxx = Liabilities, 3xxx = Equity, 4xxx = Revenue, 5xxx = Expenses.

---

## 4. Journal Entries

**Finance → Journal Entries**

A journal entry records any financial transaction directly in the General Ledger. Every entry must **balance** — the total of all debit amounts must equal the total of all credit amounts.

> Most day-to-day transactions are created automatically when you approve invoices, record receipts, or use the Cash Book. Manual journal entries are for adjustments and corrections.

### Viewing entries

- Use the **status filter** (All / Draft / Posted / Reversed) to narrow the list.
- Click the **chevron** on any row to expand it and see the individual debit/credit lines.

### Posting and reversing

- **Post** — finalises a Draft entry; it cannot be edited after posting.
- **Reverse** — creates a mirror-image entry that cancels a Posted entry.

---

## 5. Cash Book

**Operations → Cash Book**

Tracks money moving in and out of your cash and bank accounts.

### Selecting an account

Click a **cash account card** at the top to select it. Its transaction history loads below.

### Recording a transaction

1. Click **Record Transaction**
2. Choose **Receipt** (money in) or **Payment** (money out)
3. Fill in the amount, date, description, and the **counterpart account** (what the money is for — e.g. a revenue account for a sale or an expense account for a bill)
4. Click **Record**

A journal entry is automatically created and posted.

---

## 6. Accounts Receivable (Invoices)

**Operations → Receivables**

Manage invoices you send to customers.

### Invoice lifecycle

```
DRAFT → APPROVED → PARTIALLY_PAID → PAID
               ↘ CANCELLED
```

### Step 1 — Create an invoice (via API or Swagger)

Invoices are currently created via the API. Ask your administrator for the Swagger URL.

### Step 2 — Approve an invoice

1. Find the invoice in the list (filter by **DRAFT** to see pending ones)
2. Click **Approve**

Approving posts the GL entry: DR Accounts Receivable, CR Revenue.

### Step 3 — Record a receipt

When a customer pays:
1. Filter by **APPROVED** or **PARTIALLY_PAID**
2. Click **Record Receipt** on the invoice row
3. Enter the **payment date**, **amount received**, and the **bank/cash account** where the money landed
4. Optionally enter a **payment method** (e.g. Bank Transfer, M-Pesa)
5. Click **Record Receipt**

The outstanding balance on the invoice updates automatically.

### Managing customers

Click **Manage Customers** to see all registered customers and their outstanding balances.

---

## 7. Accounts Payable (Bills)

**Operations → Payables**

Manage bills you receive from suppliers.

### Bill lifecycle

```
DRAFT → APPROVED → PARTIALLY_PAID → PAID
               ↘ CANCELLED
```

### Step 1 — Approve a bill

1. Find the bill in the list (filter by **DRAFT**)
2. Click **Approve**

Approving posts the GL entry: DR Expense accounts, CR Accounts Payable.

### Step 2 — Record a payment

When you pay a supplier:
1. Filter by **APPROVED** or **PARTIALLY_PAID**
2. Click **Record Payment** on the bill row
3. Enter the **payment date**, **amount paid**, and the **bank/cash account** you paid from
4. Optionally enter a **payment method**
5. Click **Record Payment**

### Managing suppliers

Click **Manage Suppliers** to see all registered suppliers and their outstanding balances.

---

## 8. Budgets

**Planning → Budgets**

Set spending limits for specific accounts over a time period and monitor them in real time.

### Reading a budget card

Each budget card shows:
- **Budget** — the spending limit you set
- **Spent** — actual spending pulled live from the General Ledger
- **Progress bar** — colour-coded by alert level
- **% used** and **remaining** amount
- **Period** — the date range the budget covers

### Alert levels

| Colour | Level | Meaning |
|---|---|---|
| Green | OK | More than 20% of budget remaining |
| Amber | WARNING | Less than 20% remaining — watch this |
| Red | EXCEEDED | Spending has gone over the limit |

> Budgets are created via the API. The dashboard always reflects live GL data.

---

## 9. Exchange Rates & FX Revaluation

**Planning → Currencies**

Use this section if your business handles transactions in foreign currencies.

### Adding an exchange rate

1. Click **Add Rate**
2. Enter the **Base Currency** (e.g. `USD`), **Quote Currency** (e.g. `KES`), and the **Rate** (how many KES = 1 USD)
3. Set the **Effective Date**
4. Click **Add Rate**

Rates are stored historically — you can have multiple rates for the same pair on different dates.

### FX Revaluation

When exchange rates change, the KES value of a foreign-currency balance needs to be adjusted. Revaluation posts a journal entry for the difference.

1. Click **Revalue**
2. Select the **Account to Revalue** (the account holding the foreign currency balance)
3. Enter the **Foreign Currency** (e.g. `USD`)
4. Select the **FX Gain/Loss Account** — where the adjustment will be posted (typically a Revenue or Expense account)
5. Set the **Valuation Date** — the system will use the latest rate on or before this date
6. Click **Run Revaluation**

A success message shows the journal entry number and whether it was a **Gain** or **Loss**.

---

## 10. Reports

All reports are computed live from posted General Ledger entries.

### Trial Balance — Reports → Trial Balance

Lists every account with its total debit and credit balances as of a chosen date. The totals at the bottom must always be equal — this confirms the ledger is in balance.

- Use the **date picker** (top right) to change the as-of date.

### Profit & Loss — Reports → Profit & Loss

Shows Revenue minus Expenses for a period, resulting in Net Income (or Net Loss).

- Use the **From / To date pickers** to set the period.
- Green footer = profit; red footer = loss.

### Balance Sheet — Reports → Balance Sheet

A snapshot of the company's financial position:
- **Assets** (left) — what the company owns
- **Liabilities + Equity** (right) — how it's financed

The totals on both sides must always be equal. Retained Earnings is calculated automatically from all historical profits and losses.

- Use the **date picker** to change the as-of date.

### Cash Flow — Reports → Cash Flow

Lists all cash receipts and payments for a period with summary totals.

- **Total Receipts** (green) — money received
- **Total Payments** (red) — money paid out
- **Net Cash Flow** — the difference

Use the **From / To date pickers** to set the period.

---

## 11. User Management

**Settings → Users** *(ADMIN only)*

### Viewing users

The table shows all system users with their name, email, role, status, last login, and join date.

### Creating a user

1. Click **Add User**
2. Enter first name, last name, email, and a password (minimum 8 characters)
3. Choose a **Role**:
   - **VIEWER** — read-only
   - **ACCOUNTANT** — can create and approve transactions
   - **ADMIN** — full access
4. Click **Create User**

### Activating / Deactivating a user

Click **Deactivate** to block a user from logging in. Click **Activate** to restore access. The user's data is preserved.

---

## 12. Common Workflows

### Record a customer payment end-to-end

1. **Accounts → Create** the AR account (if not done) and Revenue account
2. **Customers → Create** the customer (via API/Swagger)
3. **Invoices → Create** the invoice (via API/Swagger)
4. **Receivables → Approve** the invoice
5. When payment arrives: **Receivables → Record Receipt**
6. Check **Reports → Profit & Loss** to see the revenue reflected

---

### Pay a supplier bill end-to-end

1. **Accounts → Create** the AP account (if not done) and Expense account
2. **Suppliers → Create** the supplier (via API/Swagger)
3. **Bills → Create** the bill (via API/Swagger)
4. **Payables → Approve** the bill
5. When you make payment: **Payables → Record Payment**
6. Check **Reports → Balance Sheet** to see AP balance reduced

---

### Check if you are over budget

1. Go to **Planning → Budgets**
2. Look for cards with an **EXCEEDED** (red) or **WARNING** (amber) badge
3. Drill into the detail to see how much has been spent vs the limit
4. Cross-reference with **Reports → Profit & Loss** to see the underlying transactions

---

### Run month-end close

1. **Reports → Trial Balance** — verify totals are equal (balanced)
2. **Reports → Profit & Loss** — review net income for the month
3. **Reports → Balance Sheet** — confirm assets = liabilities + equity
4. **Reports → Cash Flow** — reconcile cash movements
5. **Currencies → Revalue** any foreign-currency accounts with the month-end rate
6. Review **Budgets** for any EXCEEDED alerts before the next period
