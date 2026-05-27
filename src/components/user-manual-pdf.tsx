'use client'

import { HelpCircle } from 'lucide-react'
import {
  Document, Page, View, Text, StyleSheet, PDFDownloadLink,
} from '@react-pdf/renderer'

// ─── Styles ──────────────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: {
    fontFamily: 'Helvetica',
    fontSize: 10,
    paddingTop: 50,
    paddingBottom: 60,
    paddingHorizontal: 50,
    color: '#1e293b',
  },

  // Cover
  cover: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  coverBadge: {
    width: 56, height: 56, borderRadius: 12,
    backgroundColor: '#4f46e5',
    alignItems: 'center', justifyContent: 'center', marginBottom: 24,
  },
  coverBadgeText: { color: '#ffffff', fontSize: 28, fontFamily: 'Helvetica-Bold' },
  coverTitle: { fontSize: 28, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginBottom: 8 },
  coverSub: { fontSize: 13, color: '#64748b', marginBottom: 32 },
  coverDivider: { width: 60, height: 3, backgroundColor: '#4f46e5', marginBottom: 32, borderRadius: 2 },
  coverMeta: { fontSize: 9, color: '#94a3b8', textAlign: 'center', lineHeight: 1.6 },

  // Headings
  sectionTitle: {
    fontSize: 16, fontFamily: 'Helvetica-Bold', color: '#4f46e5',
    borderBottomWidth: 1.5, borderBottomColor: '#e2e8f0',
    paddingBottom: 6, marginTop: 24, marginBottom: 12,
  },
  subTitle: {
    fontSize: 11, fontFamily: 'Helvetica-Bold', color: '#1e293b',
    marginTop: 12, marginBottom: 5,
  },

  // Body
  body: { fontSize: 10, color: '#334155', lineHeight: 1.7, marginBottom: 6 },
  note: {
    backgroundColor: '#f0f9ff', borderLeftWidth: 3, borderLeftColor: '#4f46e5',
    paddingHorizontal: 10, paddingVertical: 7, marginVertical: 8, borderRadius: 3,
  },
  noteText: { fontSize: 9.5, color: '#1d4ed8', lineHeight: 1.6 },

  // Steps
  stepRow: { flexDirection: 'row', marginBottom: 6, alignItems: 'flex-start' },
  stepNum: {
    width: 20, height: 20, borderRadius: 10, backgroundColor: '#4f46e5',
    alignItems: 'center', justifyContent: 'center', marginRight: 8, marginTop: 1, flexShrink: 0,
  },
  stepNumText: { color: '#ffffff', fontSize: 9, fontFamily: 'Helvetica-Bold' },
  stepText: { fontSize: 10, color: '#334155', lineHeight: 1.7, flex: 1 },

  // Bullets
  bulletRow: { flexDirection: 'row', marginBottom: 4, alignItems: 'flex-start' },
  bulletDot: { fontSize: 10, color: '#4f46e5', marginRight: 7, marginTop: 1 },
  bulletText: { fontSize: 10, color: '#334155', lineHeight: 1.6, flex: 1 },

  // Table
  table: { marginVertical: 8 },
  tableHead: { flexDirection: 'row', backgroundColor: '#f8fafc', borderRadius: 4, paddingVertical: 6, paddingHorizontal: 8 },
  tableRow: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  tableRowAlt: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, backgroundColor: '#f8fafc', borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  thCell: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#64748b', flex: 1 },
  tdCell: { fontSize: 9.5, color: '#334155', flex: 1, lineHeight: 1.5 },
  tdCellBold: { fontSize: 9.5, fontFamily: 'Helvetica-Bold', color: '#334155', flex: 1, lineHeight: 1.5 },

  // Footer
  footer: {
    position: 'absolute', bottom: 30, left: 50, right: 50,
    flexDirection: 'row', justifyContent: 'space-between',
  },
  footerText: { fontSize: 8, color: '#94a3b8' },
  footerPage: { fontSize: 8, color: '#94a3b8' },
})

// ─── Helpers ─────────────────────────────────────────────────────────────────

function Step({ n, text }: { n: number; text: string }) {
  return (
    <View style={s.stepRow}>
      <View style={s.stepNum}><Text style={s.stepNumText}>{String(n)}</Text></View>
      <Text style={s.stepText}>{text}</Text>
    </View>
  )
}

function Bullet({ text }: { text: string }) {
  return (
    <View style={s.bulletRow}>
      <Text style={s.bulletDot}>•</Text>
      <Text style={s.bulletText}>{text}</Text>
    </View>
  )
}

function Note({ text }: { text: string }) {
  return <View style={s.note}><Text style={s.noteText}>{text}</Text></View>
}

type Row = string[]

function Table({ headers, rows }: { headers: string[]; rows: Row[] }) {
  return (
    <View style={s.table}>
      <View style={s.tableHead}>
        {headers.map((h, i) => <Text key={i} style={s.thCell}>{h}</Text>)}
      </View>
      {rows.map((row, ri) => (
        <View key={ri} style={ri % 2 === 0 ? s.tableRow : s.tableRowAlt}>
          {row.map((cell, ci) => (
            <Text key={ci} style={ci === 0 ? s.tdCellBold : s.tdCell}>{cell}</Text>
          ))}
        </View>
      ))}
    </View>
  )
}

function Footer() {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerText}>Hazina Treasury System — User Guide</Text>
      <Text style={s.footerPage} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  )
}

// ─── PDF Document ─────────────────────────────────────────────────────────────

function HazinaUserManual() {
  return (
    <Document title="Hazina User Guide" author="Hazina Treasury System">

      {/* ── Cover ── */}
      <Page size="A4" style={s.page}>
        <View style={s.cover}>
          <View style={s.coverBadge}><Text style={s.coverBadgeText}>H</Text></View>
          <Text style={s.coverTitle}>Hazina</Text>
          <Text style={s.coverSub}>User Guide</Text>
          <View style={s.coverDivider} />
          <Text style={s.coverMeta}>
            {'Version 1.0  ·  Treasury & Accounting System\nComplete step-by-step guide for all users'}
          </Text>
        </View>
      </Page>

      {/* ── Page 2: Logging In → Accounts ── */}
      <Page size="A4" style={s.page}>
        <Footer />

        <Text style={s.sectionTitle}>1. Logging In</Text>
        <Step n={1} text="Open your browser and go to the Hazina address provided by your administrator." />
        <Step n={2} text="Enter your email address and password." />
        <Step n={3} text="Click Sign In." />
        <Note text="If you see a message saying your account is pending approval, contact your administrator — your organisation may not have been activated yet." />

        <Text style={s.sectionTitle}>2. Your Dashboard</Text>
        <Text style={s.body}>After logging in you land on the Dashboard — your financial summary at a glance.</Text>
        <Table
          headers={['Card', 'What it shows']}
          rows={[
            ['Revenue', 'Total money earned so far this year'],
            ['Expenses', 'Total money spent so far this year'],
            ['Net Income', 'Revenue minus Expenses (profit or loss)'],
            ['Cash Balance', 'How much cash and bank money you hold'],
            ['Receivables', 'Money customers owe you (unpaid invoices)'],
            ['Payables', 'Money you owe suppliers (unpaid bills)'],
          ]}
        />

        <Text style={s.sectionTitle}>3. First-Time Setup</Text>
        <Text style={s.body}>Follow these steps in order the first time you use Hazina.</Text>
        <Step n={1} text="Set up your Accounts (Chart of Accounts) — the categories every transaction is filed under." />
        <Step n={2} text="Set up your Cash Book — register any bank accounts or cash floats." />
        <Step n={3} text="Add your Customers — required before raising invoices." />
        <Step n={4} text="Add your Suppliers — required before recording bills." />
        <Step n={5} text="Create Budgets (optional) — set spending limits per account." />
        <Step n={6} text="Add team members — create accounts for staff who will use the system." />

        <Text style={s.sectionTitle}>4. Chart of Accounts</Text>
        <Text style={s.body}>Sidebar → Accounts</Text>
        <Table
          headers={['Type', 'What it covers']}
          rows={[
            ['Asset', 'Things you own — cash, bank balance, money owed to you'],
            ['Liability', 'Things you owe — loans, unpaid bills'],
            ['Equity', "Your stake in the business — capital, retained profit"],
            ['Revenue', 'Money coming in — sales, fees, interest earned'],
            ['Expense', 'Money going out — salaries, rent, utilities'],
          ]}
        />
        <Text style={s.subTitle}>Creating a new account</Text>
        <Step n={1} text="Go to Accounts in the sidebar and click + New Account." />
        <Step n={2} text="Fill in the Code (e.g. 1010), Name, and Type. Parent Account and Description are optional." />
        <Step n={3} text="Click Save." />
        <Text style={s.subTitle}>Recommended starter accounts</Text>
        <Table
          headers={['Code', 'Name', 'Type']}
          rows={[
            ['1000', 'Cash and Bank', 'Asset'],
            ['1100', 'Accounts Receivable', 'Asset'],
            ['2000', 'Accounts Payable', 'Liability'],
            ['3000', "Owner's Equity", 'Equity'],
            ['4000', 'Sales Revenue', 'Revenue'],
            ['5000', 'Cost of Sales', 'Expense'],
            ['6000', 'Operating Expenses', 'Expense'],
          ]}
        />
      </Page>

      {/* ── Page 3: Cash Book → Payables ── */}
      <Page size="A4" style={s.page}>
        <Footer />

        <Text style={s.sectionTitle}>5. Cash Book</Text>
        <Text style={s.body}>Sidebar → Cash Book</Text>
        <Text style={s.subTitle}>Adding a cash or bank account</Text>
        <Step n={1} text="Go to Cash Book and click + New Account." />
        <Step n={2} text="Enter Name, GL Account, Currency, Bank Name, and Account Number." />
        <Step n={3} text="Click Save. The account appears with a balance of 0.00." />
        <Text style={s.subTitle}>Recording a transaction</Text>
        <Step n={1} text="Click on the account and then click Record Transaction." />
        <Step n={2} text="Choose the type: Receipt (money IN) or Payment (money OUT)." />
        <Step n={3} text="Fill in Date, Amount, Description, and Counterpart Account." />
        <Step n={4} text="Add a Reference (optional) — e.g. a cheque number — then click Save." />

        <Text style={s.sectionTitle}>6. Sending Invoices (Receivables)</Text>
        <Text style={s.body}>Sidebar → Receivables</Text>
        <Text style={s.subTitle}>Adding a customer</Text>
        <Step n={1} text="Go to Receivables → Customers and click + New Customer." />
        <Step n={2} text="Enter the customer's Name (required), email, phone, and address, then click Create Customer." />
        <Text style={s.subTitle}>Creating an invoice</Text>
        <Step n={1} text="Go to Receivables and click + New Invoice." />
        <Step n={2} text="Select the Customer, Invoice Date, Due Date, and Currency." />
        <Step n={3} text="Add line items — Description, Account, Quantity, and Unit Price for each item." />
        <Step n={4} text="Click Save as Draft." />
        <Table
          headers={['Step', 'What to do', 'When']}
          rows={[
            ['Approve', 'Click Approve on a Draft invoice', "When the invoice is ready to send"],
            ['Record Receipt', 'Click Record Receipt on an Approved invoice', 'When the customer pays'],
            ['Cancel', 'Click Cancel on a Draft invoice', 'If raised in error'],
          ]}
        />
        <Note text="Partial payments are supported — the status shows PARTIALLY_PAID until fully paid." />

        <Text style={s.sectionTitle}>7. Paying Bills (Payables)</Text>
        <Text style={s.body}>Sidebar → Payables</Text>
        <Text style={s.subTitle}>Adding a supplier</Text>
        <Step n={1} text="Go to Payables → Suppliers and click + New Supplier." />
        <Step n={2} text="Enter the Name, email, phone, KRA PIN, and address, then click Create Supplier." />
        <Text style={s.subTitle}>Recording a bill</Text>
        <Step n={1} text="Go to Payables and click + New Bill." />
        <Step n={2} text="Select the Supplier, Bill Date, Due Date, and Currency." />
        <Step n={3} text="Add line items — Description, Expense Account, Quantity, and Unit Price." />
        <Step n={4} text="Click Save as Draft." />
        <Table
          headers={['Step', 'What to do', 'When']}
          rows={[
            ['Approve', 'Click Approve on a Draft bill', 'When you confirm the bill is correct'],
            ['Record Payment', 'Click Record Payment on an Approved bill', 'When you pay the supplier'],
            ['Cancel', 'Click Cancel on a Draft bill', 'If entered in error'],
          ]}
        />
      </Page>

      {/* ── Page 4: Journal Entries → Reports ── */}
      <Page size="A4" style={s.page}>
        <Footer />

        <Text style={s.sectionTitle}>8. Journal Entries</Text>
        <Text style={s.body}>Sidebar → Journal Entries</Text>
        <Text style={s.body}>Used for payroll, depreciation, prepaid expenses, and period-end corrections. Most day-to-day transactions go through Invoices, Bills, and the Cash Book.</Text>
        <Text style={s.subTitle}>Creating a journal entry</Text>
        <Step n={1} text="Go to Journal Entries and click + New Entry." />
        <Step n={2} text="Fill in the Date, Description, and Reference (optional)." />
        <Step n={3} text="Add lines — each line needs an Account and either a Debit or Credit amount (not both on the same line)." />
        <Step n={4} text="Watch the totals row — when you see ✓ Balanced the entry is ready." />
        <Step n={5} text="Click Save as Draft." />
        <Note text="Every entry must balance: total debits must equal total credits before you can post it." />
        <Table
          headers={['Action', 'What it does']}
          rows={[
            ['Post', 'Confirms the entry and updates all account balances permanently.'],
            ['Reverse', 'Creates an equal and opposite entry to undo a posted one.'],
          ]}
        />

        <Text style={s.sectionTitle}>9. Budgets</Text>
        <Text style={s.body}>Sidebar → Budgets</Text>
        <Text style={s.body}>Set a spending limit for an expense account over a time period. Hazina automatically tracks how much has been spent.</Text>
        <Text style={s.subTitle}>Creating a budget</Text>
        <Step n={1} text="Go to Budgets and click + New Budget." />
        <Step n={2} text="Enter a Budget Name, select the Expense Account, set Period Start and End dates, and enter the Budget Amount." />
        <Step n={3} text="Click Create Budget." />
        <Table
          headers={['Status', 'Meaning']}
          rows={[
            ['OK (green)', 'Spending is within budget'],
            ['WARNING (amber)', 'Over 80% of the budget has been used'],
            ['EXCEEDED (red)', 'Spending has gone over the budget limit'],
          ]}
        />

        <Text style={s.sectionTitle}>10. Financial Reports</Text>
        <Text style={s.body}>Sidebar → Reports. All users can view reports — select a date range and the report loads automatically.</Text>
        <Table
          headers={['Report', 'What it tells you', 'Use it for']}
          rows={[
            ['Trial Balance', 'All accounts with debit and credit balances', 'Month-end checks, auditor requests'],
            ['Profit & Loss', 'Revenue, expenses, and net income for a period', 'Performance reviews, tax prep'],
            ['Balance Sheet', 'Assets, liabilities, and equity on a given date', 'Bank loans, year-end reporting'],
            ['Cash Flow', 'All cash received and paid for a period', 'Understanding cash position'],
          ]}
        />

        <Text style={s.sectionTitle}>11. Managing Users</Text>
        <Text style={s.body}>Sidebar → Settings → Users  (Admin only)</Text>
        <Text style={s.subTitle}>Adding a new user</Text>
        <Step n={1} text="Go to Settings → Users and click + Add User." />
        <Step n={2} text="Enter First Name, Last Name, Email, and Password (minimum 8 characters)." />
        <Step n={3} text="Choose a Role and click Create User." />
        <Table
          headers={['Role', 'What they can do']}
          rows={[
            ['Admin', 'Full access — can do everything including manage users'],
            ['Accountant', 'Can create and post transactions, invoices, bills, and journal entries'],
            ['Viewer', 'Read-only — can view all data and reports but cannot make changes'],
          ]}
        />
        <Note text="To remove access, click Deactivate next to the user's name. You cannot deactivate your own account." />
      </Page>

      {/* ── Page 5: FAQ ── */}
      <Page size="A4" style={s.page}>
        <Footer />

        <Text style={s.sectionTitle}>12. Frequently Asked Questions</Text>

        <Text style={s.subTitle}>I made a mistake on a posted journal entry. How do I fix it?</Text>
        <Text style={s.body}>You cannot edit a posted entry. Click Reverse to create a cancelling entry, then create a new correct one. This keeps a clean audit trail.</Text>

        <Text style={s.subTitle}>I approved an invoice but the customer wants changes. What do I do?</Text>
        <Text style={s.body}>Once approved, an invoice cannot be edited. Cancel it and create a new one with the correct details.</Text>

        <Text style={s.subTitle}>{"What's the difference between Receipt and Payment in the Cash Book?"}</Text>
        <Bullet text="Receipt — money arriving in your account (e.g. a customer paying you)." />
        <Bullet text="Payment — money leaving your account (e.g. paying a supplier or an expense)." />

        <Text style={s.subTitle}>{"Why can't I post my journal entry?"}</Text>
        <Text style={s.body}>The entry won't post if debits and credits don't balance. Check the totals row — it shows the difference and whether you need more debits or more credits.</Text>

        <Text style={s.subTitle}>My budget says EXCEEDED but I haven't spent that much. Why?</Text>
        <Text style={s.body}>The budget tracks all transactions posted to that expense account during the budget period. Check your journal entries, bills, and cash payments for that account.</Text>

        <Text style={s.subTitle}>{"I can't log in and I haven't forgotten my password."}</Text>
        <Text style={s.body}>Your account may have been deactivated. Contact your administrator to check your account status.</Text>

        <View style={{ marginTop: 40, padding: 16, backgroundColor: '#f8fafc', borderRadius: 6 }}>
          <Text style={{ fontSize: 9, color: '#94a3b8', textAlign: 'center', lineHeight: 1.7 }}>
            {'For technical support or to report a problem, contact your system administrator.\nHazina Treasury System — Version 1.0'}
          </Text>
        </View>
      </Page>

    </Document>
  )
}

// ─── Download Button ──────────────────────────────────────────────────────────

export function UserGuideDownloadButton() {
  return (
    <PDFDownloadLink
      document={<HazinaUserManual />}
      fileName="Hazina-User-Guide.pdf"
      className="flex items-center gap-3 rounded-lg px-3 py-2 text-sm text-slate-400 hover:bg-slate-800 hover:text-white transition-all w-full"
    >
      {({ loading }) => (
        <>
          <HelpCircle className="h-4 w-4 shrink-0" />
          <span>{loading ? 'Preparing…' : 'Download User Guide'}</span>
        </>
      )}
    </PDFDownloadLink>
  )
}