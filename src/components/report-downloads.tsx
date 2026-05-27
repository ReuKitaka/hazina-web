'use client'

import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Download, FileDown, Sheet, ChevronDown } from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Document, Page, View, Text, StyleSheet, pdf,
} from '@react-pdf/renderer'
import * as XLSX from 'xlsx'
import type {
  TrialBalanceReport,
  ProfitAndLossReport,
  BalanceSheetReport,
  CashFlowReport,
} from '@/types'

// ─── Number formatter ─────────────────────────────────────────────────────────

const n = (v: number) =>
  new Intl.NumberFormat('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(v)

// ─── Shared PDF styles ────────────────────────────────────────────────────────

const s = StyleSheet.create({
  page: { fontFamily: 'Helvetica', fontSize: 9.5, paddingTop: 44, paddingBottom: 52, paddingHorizontal: 44, color: '#1e293b' },
  header: { marginBottom: 18 },
  badge: { flexDirection: 'row', alignItems: 'center', marginBottom: 4 },
  badgeBox: { width: 20, height: 20, borderRadius: 4, backgroundColor: '#4f46e5', alignItems: 'center', justifyContent: 'center', marginRight: 6 },
  badgeText: { color: '#fff', fontSize: 11, fontFamily: 'Helvetica-Bold' },
  org: { fontSize: 8, color: '#94a3b8' },
  title: { fontSize: 17, fontFamily: 'Helvetica-Bold', color: '#1e293b', marginBottom: 2 },
  subtitle: { fontSize: 9, color: '#64748b' },
  divider: { height: 1.5, backgroundColor: '#4f46e5', marginVertical: 12, borderRadius: 1 },

  // Sections
  sectionHead: { fontSize: 8.5, fontFamily: 'Helvetica-Bold', color: '#64748b', backgroundColor: '#f8fafc', paddingVertical: 5, paddingHorizontal: 8, marginTop: 10 },

  // Table
  tableHead: { flexDirection: 'row', backgroundColor: '#f1f5f9', paddingVertical: 5, paddingHorizontal: 8, borderRadius: 3 },
  tableRow: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9' },
  tableRowAlt: { flexDirection: 'row', paddingVertical: 4, paddingHorizontal: 8, borderBottomWidth: 0.5, borderBottomColor: '#f1f5f9', backgroundColor: '#f8fafc' },
  tableFooter: { flexDirection: 'row', paddingVertical: 5, paddingHorizontal: 8, backgroundColor: '#f1f5f9', borderTopWidth: 1.5, borderTopColor: '#cbd5e1' },
  th: { fontSize: 8, fontFamily: 'Helvetica-Bold', color: '#64748b' },
  td: { fontSize: 9, color: '#334155', lineHeight: 1.4 },
  tdBold: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#334155', lineHeight: 1.4 },
  tdMono: { fontSize: 8.5, color: '#6366f1', fontFamily: 'Helvetica' },
  right: { textAlign: 'right' },

  // Summary row
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 8, paddingVertical: 5, borderTopWidth: 0.5, borderTopColor: '#e2e8f0' },
  summaryLabel: { fontSize: 9, color: '#64748b' },
  summaryVal: { fontSize: 9, fontFamily: 'Helvetica-Bold', color: '#334155' },

  // Net income banner
  netBanner: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 8, marginTop: 12, borderRadius: 5 },
  netLabel: { fontSize: 10, fontFamily: 'Helvetica-Bold' },
  netVal: { fontSize: 11, fontFamily: 'Helvetica-Bold' },

  // Footer
  footer: { position: 'absolute', bottom: 24, left: 44, right: 44, flexDirection: 'row', justifyContent: 'space-between' },
  footerTxt: { fontSize: 7.5, color: '#94a3b8' },
})

// ─── Shared PDF header ────────────────────────────────────────────────────────

function PdfHeader({ title, subtitle, orgName }: { title: string; subtitle: string; orgName: string }) {
  return (
    <View style={s.header}>
      <View style={s.badge}>
        <View style={s.badgeBox}><Text style={s.badgeText}>{orgName[0]?.toUpperCase() ?? 'H'}</Text></View>
        <Text style={s.org}>{orgName}</Text>
      </View>
      <Text style={s.title}>{title}</Text>
      <Text style={s.subtitle}>{subtitle}</Text>
      <View style={s.divider} />
    </View>
  )
}

function PdfFooter({ label }: { label: string }) {
  return (
    <View style={s.footer} fixed>
      <Text style={s.footerTxt}>{label}</Text>
      <Text style={s.footerTxt} render={({ pageNumber, totalPages }) => `Page ${pageNumber} of ${totalPages}`} />
    </View>
  )
}

// ─── Trial Balance PDF ────────────────────────────────────────────────────────

function TrialBalancePdf({ data, orgName }: { data: TrialBalanceReport; orgName: string }) {
  const balanced = Math.abs(data.totalDebits - data.totalCredits) < 0.01
  return (
    <Document title="Trial Balance">
      <Page size="A4" style={s.page}>
        <PdfFooter label="Trial Balance" />
        <PdfHeader title="Trial Balance" subtitle={`As of ${data.asOf}`} orgName={orgName} />
        <View style={s.tableHead}>
          <Text style={[s.th, { flex: 1 }]}>Code</Text>
          <Text style={[s.th, { flex: 3 }]}>Account</Text>
          <Text style={[s.th, { flex: 1.5 }]}>Type</Text>
          <Text style={[s.th, { flex: 1.5, textAlign: 'right' }]}>Debit</Text>
          <Text style={[s.th, { flex: 1.5, textAlign: 'right' }]}>Credit</Text>
        </View>
        {data.lines.map((l, i) => (
          <View key={l.accountId} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tdMono, { flex: 1 }]}>{l.accountCode}</Text>
            <Text style={[s.td, { flex: 3 }]}>{l.accountName}</Text>
            <Text style={[s.td, { flex: 1.5 }]}>{l.accountType}</Text>
            <Text style={[s.td, { flex: 1.5, textAlign: 'right' }]}>{l.debitBalance > 0 ? n(l.debitBalance) : '—'}</Text>
            <Text style={[s.td, { flex: 1.5, textAlign: 'right' }]}>{l.creditBalance > 0 ? n(l.creditBalance) : '—'}</Text>
          </View>
        ))}
        <View style={s.tableFooter}>
          <Text style={[s.tdBold, { flex: 5.5 }]}>Totals</Text>
          <Text style={[s.tdBold, { flex: 1.5, textAlign: 'right' }]}>{n(data.totalDebits)}</Text>
          <Text style={[s.tdBold, { flex: 1.5, textAlign: 'right' }]}>{n(data.totalCredits)}</Text>
        </View>
        <View style={[s.netBanner, { backgroundColor: balanced ? '#f0fdf4' : '#fef2f2', marginTop: 10 }]}>
          <Text style={[s.netLabel, { color: balanced ? '#15803d' : '#dc2626' }]}>
            {balanced ? '✓ Trial balance is balanced' : `⚠ Out of balance by ${n(Math.abs(data.totalDebits - data.totalCredits))}`}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// ─── Profit & Loss PDF ────────────────────────────────────────────────────────

function ProfitAndLossPdf({ data, orgName }: { data: ProfitAndLossReport; orgName: string }) {
  return (
    <Document title="Profit & Loss">
      <Page size="A4" style={s.page}>
        <PdfFooter label="Profit & Loss" />
        <PdfHeader title="Profit & Loss" subtitle={`Period: ${data.from} to ${data.to}`} orgName={orgName} />

        <Text style={s.sectionHead}>REVENUE</Text>
        <View style={s.tableHead}>
          <Text style={[s.th, { flex: 1 }]}>Code</Text>
          <Text style={[s.th, { flex: 4 }]}>Account</Text>
          <Text style={[s.th, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
        </View>
        {data.revenues.map((l, i) => (
          <View key={l.accountCode} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tdMono, { flex: 1 }]}>{l.accountCode}</Text>
            <Text style={[s.td, { flex: 4 }]}>{l.accountName}</Text>
            <Text style={[s.td, { flex: 1.5, textAlign: 'right' }]}>{n(l.amount)}</Text>
          </View>
        ))}
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Total Revenue</Text>
          <Text style={s.summaryVal}>{n(data.totalRevenue)}</Text>
        </View>

        <Text style={[s.sectionHead, { marginTop: 14 }]}>EXPENSES</Text>
        <View style={s.tableHead}>
          <Text style={[s.th, { flex: 1 }]}>Code</Text>
          <Text style={[s.th, { flex: 4 }]}>Account</Text>
          <Text style={[s.th, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
        </View>
        {data.expenses.map((l, i) => (
          <View key={l.accountCode} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
            <Text style={[s.tdMono, { flex: 1 }]}>{l.accountCode}</Text>
            <Text style={[s.td, { flex: 4 }]}>{l.accountName}</Text>
            <Text style={[s.td, { flex: 1.5, textAlign: 'right' }]}>{n(l.amount)}</Text>
          </View>
        ))}
        <View style={s.summaryRow}>
          <Text style={s.summaryLabel}>Total Expenses</Text>
          <Text style={s.summaryVal}>{n(data.totalExpenses)}</Text>
        </View>

        <View style={[s.netBanner, { backgroundColor: data.netIncome >= 0 ? '#f0fdf4' : '#fef2f2', marginTop: 14 }]}>
          <Text style={[s.netLabel, { color: data.netIncome >= 0 ? '#15803d' : '#dc2626' }]}>
            {data.netIncome >= 0 ? 'Net Income' : 'Net Loss'}
          </Text>
          <Text style={[s.netVal, { color: data.netIncome >= 0 ? '#15803d' : '#dc2626' }]}>
            {n(Math.abs(data.netIncome))}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// ─── Balance Sheet PDF ────────────────────────────────────────────────────────

function BalanceSheetPdf({ data, orgName }: { data: BalanceSheetReport; orgName: string }) {
  const balanced = Math.abs(data.totalAssets - data.totalLiabilitiesAndEquity) < 0.01
  const sections = [
    { label: 'ASSETS', lines: data.assets, total: data.totalAssets, totalLabel: 'Total Assets' },
    { label: 'LIABILITIES', lines: data.liabilities, total: data.totalLiabilities, totalLabel: 'Total Liabilities' },
    { label: 'EQUITY', lines: data.equity, total: data.totalEquity, totalLabel: 'Total Equity' },
  ]
  return (
    <Document title="Balance Sheet">
      <Page size="A4" style={s.page}>
        <PdfFooter label="Balance Sheet" />
        <PdfHeader title="Balance Sheet" subtitle={`As of ${data.asOf}`} orgName={orgName} />
        {sections.map(sec => (
          <View key={sec.label}>
            <Text style={s.sectionHead}>{sec.label}</Text>
            <View style={s.tableHead}>
              <Text style={[s.th, { flex: 1 }]}>Code</Text>
              <Text style={[s.th, { flex: 4 }]}>Account</Text>
              <Text style={[s.th, { flex: 1.5, textAlign: 'right' }]}>Balance</Text>
            </View>
            {sec.lines.map((l, i) => (
              <View key={l.accountCode} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={[s.tdMono, { flex: 1 }]}>{l.accountCode}</Text>
                <Text style={[s.td, { flex: 4 }]}>{l.accountName}</Text>
                <Text style={[s.td, { flex: 1.5, textAlign: 'right' }]}>{n(l.balance)}</Text>
              </View>
            ))}
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>{sec.totalLabel}</Text>
              <Text style={s.summaryVal}>{n(sec.total)}</Text>
            </View>
          </View>
        ))}
        <View style={s.summaryRow}>
          <Text style={[s.summaryLabel, { fontFamily: 'Helvetica-Bold' }]}>Total Liabilities & Equity</Text>
          <Text style={[s.summaryVal]}>{n(data.totalLiabilitiesAndEquity)}</Text>
        </View>
        <View style={[s.netBanner, { backgroundColor: balanced ? '#f0fdf4' : '#fef2f2', marginTop: 10 }]}>
          <Text style={[s.netLabel, { color: balanced ? '#15803d' : '#dc2626' }]}>
            {balanced ? `✓ Balanced — Total Assets = ${n(data.totalAssets)}` : `⚠ Out of balance: Assets ${n(data.totalAssets)} ≠ L+E ${n(data.totalLiabilitiesAndEquity)}`}
          </Text>
        </View>
      </Page>
    </Document>
  )
}

// ─── Cash Flow PDF ────────────────────────────────────────────────────────────

function CashFlowPdf({ data, orgName }: { data: CashFlowReport; orgName: string }) {
  return (
    <Document title="Cash Flow">
      <Page size="A4" style={s.page}>
        <PdfFooter label="Cash Flow" />
        <PdfHeader title="Cash Flow" subtitle={`Period: ${data.from} to ${data.to}`} orgName={orgName} />

        {/* Summary */}
        <View style={{ flexDirection: 'row', gap: 8, marginBottom: 14 }}>
          {[
            { label: 'Total Receipts', val: data.totalReceipts, color: '#15803d' },
            { label: 'Total Payments', val: data.totalPayments, color: '#dc2626' },
            { label: 'Net Cash Flow', val: data.netCashFlow, color: data.netCashFlow >= 0 ? '#4338ca' : '#dc2626' },
          ].map(card => (
            <View key={card.label} style={{ flex: 1, padding: 8, backgroundColor: '#f8fafc', borderRadius: 5 }}>
              <Text style={{ fontSize: 7.5, color: '#64748b', marginBottom: 3 }}>{card.label}</Text>
              <Text style={{ fontSize: 11, fontFamily: 'Helvetica-Bold', color: card.color }}>{n(card.val)}</Text>
            </View>
          ))}
        </View>

        {data.receipts.length > 0 && (
          <View>
            <Text style={s.sectionHead}>RECEIPTS</Text>
            <View style={s.tableHead}>
              <Text style={[s.th, { flex: 1.2 }]}>Date</Text>
              <Text style={[s.th, { flex: 3 }]}>Description</Text>
              <Text style={[s.th, { flex: 2 }]}>Account</Text>
              <Text style={[s.th, { flex: 1.2 }]}>Ref</Text>
              <Text style={[s.th, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
            </View>
            {data.receipts.map((r, i) => (
              <View key={r.transactionId} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={[s.td, { flex: 1.2 }]}>{r.date}</Text>
                <Text style={[s.td, { flex: 3 }]}>{r.description}</Text>
                <Text style={[s.td, { flex: 2 }]}>{r.cashAccountName || '—'}</Text>
                <Text style={[s.td, { flex: 1.2 }]}>{r.reference || '—'}</Text>
                <Text style={[s.td, { flex: 1.5, textAlign: 'right', color: '#15803d' }]}>{n(r.amount)}</Text>
              </View>
            ))}
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Total Receipts</Text>
              <Text style={[s.summaryVal, { color: '#15803d' }]}>{n(data.totalReceipts)}</Text>
            </View>
          </View>
        )}

        {data.payments.length > 0 && (
          <View>
            <Text style={[s.sectionHead, { marginTop: 12 }]}>PAYMENTS</Text>
            <View style={s.tableHead}>
              <Text style={[s.th, { flex: 1.2 }]}>Date</Text>
              <Text style={[s.th, { flex: 3 }]}>Description</Text>
              <Text style={[s.th, { flex: 2 }]}>Account</Text>
              <Text style={[s.th, { flex: 1.2 }]}>Ref</Text>
              <Text style={[s.th, { flex: 1.5, textAlign: 'right' }]}>Amount</Text>
            </View>
            {data.payments.map((p, i) => (
              <View key={p.transactionId} style={i % 2 === 0 ? s.tableRow : s.tableRowAlt}>
                <Text style={[s.td, { flex: 1.2 }]}>{p.date}</Text>
                <Text style={[s.td, { flex: 3 }]}>{p.description}</Text>
                <Text style={[s.td, { flex: 2 }]}>{p.cashAccountName || '—'}</Text>
                <Text style={[s.td, { flex: 1.2 }]}>{p.reference || '—'}</Text>
                <Text style={[s.td, { flex: 1.5, textAlign: 'right', color: '#dc2626' }]}>{n(p.amount)}</Text>
              </View>
            ))}
            <View style={s.summaryRow}>
              <Text style={s.summaryLabel}>Total Payments</Text>
              <Text style={[s.summaryVal, { color: '#dc2626' }]}>{n(data.totalPayments)}</Text>
            </View>
          </View>
        )}
      </Page>
    </Document>
  )
}

// ─── Excel helpers ────────────────────────────────────────────────────────────

function downloadXlsx(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename)
}

function applyHeaderStyle(ws: XLSX.WorkSheet, range: string) {
  // SheetJS Community doesn't support cell styling; column widths are enough
  return ws
}

function excelTrialBalance(data: TrialBalanceReport, orgName: string) {
  const rows: (string | number)[][] = [
    [`${orgName.toUpperCase()} — TRIAL BALANCE`],
    [`As of: ${data.asOf}`],
    [],
    ['Code', 'Account', 'Type', 'Debit', 'Credit'],
    ...data.lines.map(l => [l.accountCode, l.accountName, l.accountType, l.debitBalance || 0, l.creditBalance || 0]),
    [],
    ['', '', 'TOTALS', data.totalDebits, data.totalCredits],
    [],
    [Math.abs(data.totalDebits - data.totalCredits) < 0.01 ? 'STATUS: BALANCED' : 'STATUS: OUT OF BALANCE'],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 10 }, { wch: 35 }, { wch: 14 }, { wch: 16 }, { wch: 16 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Trial Balance')
  downloadXlsx(wb, `${orgName}-Trial-Balance-${data.asOf}.xlsx`)
}

function excelProfitAndLoss(data: ProfitAndLossReport, orgName: string) {
  const rows: (string | number)[][] = [
    [`${orgName.toUpperCase()} — PROFIT & LOSS`],
    [`Period: ${data.from} to ${data.to}`],
    [],
    ['REVENUE'],
    ['Code', 'Account', 'Amount'],
    ...data.revenues.map(l => [l.accountCode, l.accountName, l.amount]),
    ['', 'Total Revenue', data.totalRevenue],
    [],
    ['EXPENSES'],
    ['Code', 'Account', 'Amount'],
    ...data.expenses.map(l => [l.accountCode, l.accountName, l.amount]),
    ['', 'Total Expenses', data.totalExpenses],
    [],
    [data.netIncome >= 0 ? 'NET INCOME' : 'NET LOSS', '', Math.abs(data.netIncome)],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 10 }, { wch: 35 }, { wch: 18 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Profit & Loss')
  downloadXlsx(wb, `${orgName}-Profit-and-Loss-${data.from}-to-${data.to}.xlsx`)
}

function excelBalanceSheet(data: BalanceSheetReport, orgName: string) {
  const rows: (string | number)[][] = [
    [`${orgName.toUpperCase()} — BALANCE SHEET`],
    [`As of: ${data.asOf}`],
    [],
    ['ASSETS'],
    ['Code', 'Account', 'Balance'],
    ...data.assets.map(l => [l.accountCode, l.accountName, l.balance]),
    ['', 'Total Assets', data.totalAssets],
    [],
    ['LIABILITIES'],
    ['Code', 'Account', 'Balance'],
    ...data.liabilities.map(l => [l.accountCode, l.accountName, l.balance]),
    ['', 'Total Liabilities', data.totalLiabilities],
    [],
    ['EQUITY'],
    ['Code', 'Account', 'Balance'],
    ...data.equity.map(l => [l.accountCode, l.accountName, l.balance]),
    ['', 'Total Equity', data.totalEquity],
    [],
    ['', 'Total Liabilities & Equity', data.totalLiabilitiesAndEquity],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 10 }, { wch: 35 }, { wch: 18 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Balance Sheet')
  downloadXlsx(wb, `${orgName}-Balance-Sheet-${data.asOf}.xlsx`)
}

function excelCashFlow(data: CashFlowReport, orgName: string) {
  const rows: (string | number)[][] = [
    [`${orgName.toUpperCase()} — CASH FLOW`],
    [`Period: ${data.from} to ${data.to}`],
    [],
    ['Summary'],
    ['Total Receipts', data.totalReceipts],
    ['Total Payments', data.totalPayments],
    ['Net Cash Flow', data.netCashFlow],
    [],
    ['RECEIPTS'],
    ['Date', 'Description', 'Account', 'Reference', 'Amount'],
    ...data.receipts.map(r => [r.date, r.description, r.cashAccountName || '', r.reference || '', r.amount]),
    ['', '', '', 'Total Receipts', data.totalReceipts],
    [],
    ['PAYMENTS'],
    ['Date', 'Description', 'Account', 'Reference', 'Amount'],
    ...data.payments.map(p => [p.date, p.description, p.cashAccountName || '', p.reference || '', p.amount]),
    ['', '', '', 'Total Payments', data.totalPayments],
  ]
  const ws = XLSX.utils.aoa_to_sheet(rows)
  ws['!cols'] = [{ wch: 13 }, { wch: 35 }, { wch: 22 }, { wch: 14 }, { wch: 16 }]
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Cash Flow')
  downloadXlsx(wb, `${orgName}-Cash-Flow-${data.from}-to-${data.to}.xlsx`)
}

// ─── Download Buttons ─────────────────────────────────────────────────────────

type Props =
  | { report: 'trial-balance'; data: TrialBalanceReport }
  | { report: 'profit-and-loss'; data: ProfitAndLossReport }
  | { report: 'balance-sheet'; data: BalanceSheetReport }
  | { report: 'cash-flow'; data: CashFlowReport }

export function ReportDownloadButtons(props: Props) {
  const [pdfLoading, setPdfLoading] = useState(false)
  const { user } = useAuth()
  const orgName = user?.orgName ?? 'Hazina'

  async function downloadPdf() {
    setPdfLoading(true)
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let doc: React.ReactElement<any>
      let filename: string

      if (props.report === 'trial-balance') {
        doc = <TrialBalancePdf data={props.data} orgName={orgName} />
        filename = `${orgName}-Trial-Balance-${props.data.asOf}.pdf`
      } else if (props.report === 'profit-and-loss') {
        doc = <ProfitAndLossPdf data={props.data} orgName={orgName} />
        filename = `${orgName}-Profit-and-Loss-${props.data.from}-to-${props.data.to}.pdf`
      } else if (props.report === 'balance-sheet') {
        doc = <BalanceSheetPdf data={props.data} orgName={orgName} />
        filename = `${orgName}-Balance-Sheet-${props.data.asOf}.pdf`
      } else {
        doc = <CashFlowPdf data={props.data} orgName={orgName} />
        filename = `${orgName}-Cash-Flow-${props.data.from}-to-${props.data.to}.pdf`
      }

      const blob = await pdf(doc).toBlob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename
      a.click()
      URL.revokeObjectURL(url)
    } finally {
      setPdfLoading(false)
    }
  }

  function downloadExcel() {
    if (props.report === 'trial-balance') excelTrialBalance(props.data, orgName)
    else if (props.report === 'profit-and-loss') excelProfitAndLoss(props.data, orgName)
    else if (props.report === 'balance-sheet') excelBalanceSheet(props.data, orgName)
    else excelCashFlow(props.data, orgName)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={pdfLoading}
        className="inline-flex items-center gap-1.5 rounded-md border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 shadow-sm hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        <Download className="h-3.5 w-3.5" />
        {pdfLoading ? 'Generating…' : 'Download'}
        <ChevronDown className="h-3 w-3 opacity-50" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={downloadPdf} className="gap-2 cursor-pointer">
          <FileDown className="h-4 w-4 text-slate-500" />
          PDF
        </DropdownMenuItem>
        <DropdownMenuItem onClick={downloadExcel} className="gap-2 cursor-pointer">
          <Sheet className="h-4 w-4 text-emerald-600" />
          Excel
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}