# Hazina — User Guide

Welcome to **Hazina**, your business accounting system. This guide will walk you through everything you need to manage your company's finances — no accounting or technical background required.

---

## Table of Contents

1. [Logging In](#1-logging-in)
2. [Understanding Your Dashboard](#2-understanding-your-dashboard)
3. [First-Time Setup](#3-first-time-setup)
4. [Managing Accounts (Chart of Accounts)](#4-managing-accounts-chart-of-accounts)
5. [Cash Book](#5-cash-book)
6. [Sending Invoices (Receivables)](#6-sending-invoices-receivables)
7. [Paying Bills (Payables)](#7-paying-bills-payables)
8. [Journal Entries](#8-journal-entries)
9. [Budgets](#9-budgets)
10. [Financial Reports](#10-financial-reports)
11. [Managing Users](#11-managing-users)
12. [Frequently Asked Questions](#12-frequently-asked-questions)

---

## 1. Logging In

1. Open your browser and go to the Hazina address provided by your administrator.
2. Enter your **email address** and **password**.
3. Click **Sign In**.

> If you see a message saying your account is pending approval, contact your administrator — your organisation may not have been activated yet.

**Forgot your password?** Contact your administrator to have it reset.

---

## 2. Understanding Your Dashboard

After logging in, you land on the **Dashboard**. Think of it as your financial summary at a glance.

| Card | What it shows |
|------|---------------|
| **Revenue** | Total money earned so far this year |
| **Expenses** | Total money spent so far this year |
| **Net Income** | Revenue minus Expenses (your profit or loss) |
| **Cash Balance** | How much cash and bank money you currently hold |
| **Receivables** | Money customers owe you (unpaid invoices) |
| **Payables** | Money you owe suppliers (unpaid bills) |

The bar chart below the cards compares your income vs spending month by month.

---

## 3. First-Time Setup

Before you can start recording transactions, follow these steps in order. You only need to do this once.

### Step 1 — Set up your Accounts

Accounts are the categories that every transaction is filed under (e.g. "Cash", "Sales Revenue", "Rent Expense"). See [Section 4](#4-managing-accounts-chart-of-accounts) for how to do this.

### Step 2 — Set up your Cash Book

If your business has a bank account or cash float, register it in the Cash Book. See [Section 5](#5-cash-book).

### Step 3 — Add your Customers

Before you can raise an invoice, the customer must exist in the system. See [Section 6](#6-sending-invoices-receivables).

### Step 4 — Add your Suppliers

Before you can record a bill, the supplier must exist. See [Section 7](#7-paying-bills-payables).

### Step 5 — Create Budgets (optional)

If you want to track spending against limits, set up budgets. See [Section 9](#9-budgets).

### Step 6 — Add team members

If others will use Hazina, create their accounts. See [Section 11](#11-managing-users).

---

## 4. Managing Accounts (Chart of Accounts)

**Where to find it:** Sidebar → **Accounts**

Accounts are the building blocks of your finances. Every transaction must be linked to at least two accounts. Hazina uses five types:

| Type | What it covers |
|------|----------------|
| **Asset** | Things you own — cash, bank balance, money owed to you |
| **Liability** | Things you owe — loans, unpaid bills |
| **Equity** | Your stake in the business — capital, retained profit |
| **Revenue** | Money coming in — sales, fees, interest earned |
| **Expense** | Money going out — salaries, rent, utilities |

### Creating a new account

1. Go to **Accounts** in the sidebar.
2. Click **+ New Account**.
3. Fill in:
   - **Code** — a short number like `1010` (must be unique)
   - **Name** — what the account is for, e.g. *Petty Cash*
   - **Type** — choose from the list above
   - **Parent Account** *(optional)* — group this under a larger category
4. Click **Save**.

### Recommended starter accounts

| Code | Name | Type |
|------|------|------|
| 1000 | Cash and Bank | Asset |
| 1100 | Accounts Receivable | Asset |
| 2000 | Accounts Payable | Liability |
| 3000 | Owner's Equity | Equity |
| 4000 | Sales Revenue | Revenue |
| 5000 | Cost of Sales | Expense |
| 6000 | Operating Expenses | Expense |

---

## 5. Cash Book

**Where to find it:** Sidebar → **Cash Book**

The Cash Book tracks the day-to-day movement of money in your bank accounts and cash floats.

### Adding a cash or bank account

1. Go to **Cash Book**.
2. Click **+ New Account**.
3. Enter:
   - **Name** — e.g. *KCB Current Account*
   - **GL Account** — pick the matching account from your Chart of Accounts (e.g. *Cash and Bank*)
   - **Currency** — e.g. *KES*
   - **Bank Name** and **Account Number** *(optional)*
4. Click **Save**.

The account will appear in the list with a balance of 0.00.

### Recording a transaction

1. Click on the account you want to record a transaction for.
2. Click **Record Transaction**.
3. Choose the type:
   - **Receipt** — money coming IN (customer payment, sale, deposit)
   - **Payment** — money going OUT (supplier payment, expense)
4. Fill in the **Date**, **Amount**, **Description**, and **Counterpart Account** (where the money came from or went to in your accounts list).
5. Add a **Reference** *(optional)* — e.g. a cheque number.
6. Click **Save**.

The account balance will update automatically.

---

## 6. Sending Invoices (Receivables)

**Where to find it:** Sidebar → **Receivables**

Use this section to raise invoices for customers and track when they pay.

### Adding a customer

Before creating an invoice, the customer must be in the system.

1. Go to **Receivables** → click **Customers** (top right or sidebar sub-link).
2. Click **+ New Customer**.
3. Enter the customer's **Name** (required), plus email, phone, and address if available.
4. Click **Create Customer**.

### Creating an invoice

1. Go to **Receivables**.
2. Click **+ New Invoice**.
3. Fill in:
   - **Customer** — select from your customer list
   - **Invoice Date** and **Due Date**
   - **Currency**
4. Add line items — for each item or service:
   - **Description** — what was sold
   - **Account** — the revenue account to credit (e.g. *Sales Revenue*)
   - **Quantity** and **Unit Price**
5. The total is calculated automatically.
6. Click **Save as Draft**.

### Approving and tracking payment

| Step | What to do | When |
|------|-----------|------|
| **Approve** | Click **Approve** on a Draft invoice | When the invoice is ready to send to the customer |
| **Record Receipt** | Click **Record Receipt** on an Approved invoice | When the customer pays |
| **Cancel** | Click **Cancel** on a Draft invoice | If the invoice was raised in error |

Once fully paid, the invoice status changes to **Paid** and the outstanding balance for that customer goes to zero.

---

## 7. Paying Bills (Payables)

**Where to find it:** Sidebar → **Payables**

Use this section to record bills from suppliers and track payments you make.

### Adding a supplier

Before recording a bill, the supplier must be in the system.

1. Go to **Payables** → click **Suppliers**.
2. Click **+ New Supplier**.
3. Enter the supplier's **Name** (required), plus email, phone, KRA PIN, and address if available.
4. Click **Create Supplier**.

### Recording a bill

1. Go to **Payables**.
2. Click **+ New Bill**.
3. Fill in:
   - **Supplier** — select from your supplier list
   - **Bill Date** and **Due Date**
   - **Currency**
4. Add line items — for each item or service:
   - **Description** — what was purchased
   - **Account** — the expense account to charge (e.g. *Operating Expenses*)
   - **Quantity** and **Unit Price**
5. Click **Save as Draft**.

### Approving and recording payment

| Step | What to do | When |
|------|-----------|------|
| **Approve** | Click **Approve** on a Draft bill | When you confirm the bill is correct |
| **Record Payment** | Click **Record Payment** on an Approved bill | When you pay the supplier |
| **Cancel** | Click **Cancel** on a Draft bill | If the bill was entered in error |

---

## 8. Journal Entries

**Where to find it:** Sidebar → **Journal Entries**

Journal entries are direct accounting adjustments. You'll use these for things like:
- Payroll
- Depreciation
- Prepaid expenses
- End-of-period corrections

> Most day-to-day transactions are handled through Invoices, Bills, and the Cash Book — you won't need journal entries often.

### Creating a journal entry

1. Go to **Journal Entries**.
2. Click **+ New Entry**.
3. Fill in the header:
   - **Date** — the date the entry applies to
   - **Description** — what this entry is for (e.g. *May 2026 Payroll*)
   - **Reference** *(optional)* — e.g. *PAY-005*
4. Add your lines. Every entry needs at least two lines and **debits must equal credits**:
   - Select an **Account**
   - Add a **Narration** *(optional)*
   - Enter either a **Debit** or **Credit** amount (not both on the same line)
5. Watch the totals at the bottom — when you see **✓ Balanced**, the entry is ready.
6. Click **Save as Draft**.

### Posting and reversing

| Action | What it does |
|--------|-------------|
| **Post** | Confirms the entry and updates all account balances. Cannot be edited after posting. |
| **Reverse** | Creates an equal and opposite entry to undo a posted one. The original is marked as Reversed. |

> Click on any entry row to expand it and see the full list of lines.

---

## 9. Budgets

**Where to find it:** Sidebar → **Budgets**

Budgets let you set a spending limit for an expense account over a time period. Hazina automatically tracks how much has been spent and warns you when you're close to the limit.

### Creating a budget

1. Go to **Budgets**.
2. Click **+ New Budget**.
3. Fill in:
   - **Budget Name** — e.g. *Q2 Marketing Spend*
   - **Expense Account** — the account you want to control spending on
   - **Period Start** and **Period End** — the dates this budget covers
   - **Budget Amount** — your spending limit
   - **Notes** *(optional)*
4. Click **Create Budget**.

### Reading the budget card

Each budget is shown as a card with:

| Element | Meaning |
|---------|---------|
| **Budget** | Your total limit |
| **Spent** | How much has been recorded against this account in the period |
| **Progress bar** | Visual fill — green is healthy, amber is a warning, red means exceeded |
| **% used** | Percentage of the budget consumed |
| **Remaining** | How much is left |

| Status | Meaning |
|--------|---------|
| **OK** (green) | Spending is within budget |
| **WARNING** (amber) | Over 80% of the budget has been used |
| **EXCEEDED** (red) | Spending has gone over the budget |

To delete a budget, click the trash icon on the budget card.

---

## 10. Financial Reports

**Where to find it:** Sidebar → **Reports**

Reports give you a financial picture of your business. All users can view reports.

### Trial Balance

**What it tells you:** A list of all accounts with their debit and credit balances. If total debits equal total credits, your books are balanced.

**Use it for:** Month-end checks, auditor requests, or any time you want to verify the books.

1. Go to **Reports → Trial Balance**.
2. Select the **As of Date** (e.g. end of last month).
3. The report loads automatically.

---

### Profit & Loss (P&L)

**What it tells you:** How much money you earned and spent over a period, and whether you made a profit or a loss.

**Use it for:** Monthly performance reviews, tax preparation, board reporting.

1. Go to **Reports → Profit & Loss**.
2. Choose a **From** and **To** date.
3. The report shows revenue, expenses, and net income.

---

### Balance Sheet

**What it tells you:** A snapshot of what your business owns (assets), what it owes (liabilities), and the owners' stake (equity) on a given date.

**Use it for:** Bank loan applications, end-of-year reporting, investor updates.

1. Go to **Reports → Balance Sheet**.
2. Select the **As of Date**.
3. Verify that **Total Assets = Total Liabilities + Total Equity**.

---

### Cash Flow

**What it tells you:** All cash that came in (receipts) and went out (payments) during a period, and the net movement.

**Use it for:** Understanding your cash position, spotting cash shortfalls.

1. Go to **Reports → Cash Flow**.
2. Choose a **From** and **To** date.
3. Review total receipts, payments, and net cash movement.

---

## 11. Managing Users

**Where to find it:** Sidebar → **Settings → Users**

> Only **Admin** users can manage other users.

### Adding a new user

1. Go to **Settings → Users**.
2. Click **+ Add User**.
3. Fill in:
   - **First Name** and **Last Name**
   - **Email address** — this is their login username
   - **Password** — minimum 8 characters (they can change it after first login)
   - **Role** — choose what level of access they get (see below)
4. Click **Create User**.

### User roles explained

| Role | What they can do |
|------|----------------|
| **Admin** | Full access — can do everything including manage users |
| **Accountant** | Can create and post transactions, invoices, bills, and journal entries |
| **Viewer** | Read-only — can view all data and reports but cannot make any changes |

### Deactivating or reactivating a user

If someone leaves the company or should no longer have access:

1. Find the user in the list.
2. Click **Deactivate** next to their name.

Their account is blocked immediately. To restore access, click **Activate**.

> You cannot deactivate your own account.

---

## 12. Frequently Asked Questions

**Q: I made a mistake on a posted journal entry. How do I fix it?**

You cannot edit a posted entry. Instead, click **Reverse** to create a cancelling entry, then create a new correct entry. This keeps a clean audit trail.

---

**Q: I approved an invoice but the customer wants changes. What do I do?**

Once an invoice is approved it cannot be edited. Cancel it, then create a new one with the correct details.

---

**Q: What's the difference between a Receipt and a Payment in the Cash Book?**

- **Receipt** = money arriving in your account (e.g. a customer paying you)
- **Payment** = money leaving your account (e.g. you paying a supplier or an expense)

---

**Q: Why can't I post my journal entry?**

The entry won't post if debits and credits don't balance. Check the totals row at the bottom of the entry form — it will show the difference and tell you whether you need more debits or more credits.

---

**Q: My budget says EXCEEDED but I haven't spent that much. Why?**

The budget tracks all transactions posted to that expense account during the budget period. Check your journal entries, bills, and cash payments for that account to see what's been recorded.

---

**Q: I can't log in and I haven't forgotten my password.**

Your account may have been deactivated. Contact your administrator to check your account status.

---

*For technical support or to report a problem, contact your system administrator.*