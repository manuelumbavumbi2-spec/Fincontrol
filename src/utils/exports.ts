import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import { Expense, Income, Budget, SavingsGoal, Investment, Debt, Asset, Category, Person, Account } from '../types';
import { formatCurrency, formatDate } from './formatters';

interface ExportContextData {
  appName: string;
  currency: string;
  userName: string;
  periodLabel: string;
  expenses: Expense[];
  incomes: Income[];
  budgets: Budget[];
  savings: SavingsGoal[];
  investments: Investment[];
  debts: Debt[];
  assets: Asset[];
  categories: Category[];
  people: Person[];
  accounts: Account[];
}

export function exportToPDF(data: ExportContextData) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Header banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text(data.appName || 'FinControl Angola', 14, 18);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Relatório Financeiro Executivo e Familiar', 14, 25);
  doc.text(`Período: ${data.periodLabel} | Utilizador: ${data.userName}`, 14, 32);

  // Financial summary numbers
  const totalReceitas = data.incomes.reduce((acc, i) => acc + i.amount, 0);
  const totalDespesas = data.expenses.filter(e => e.status !== 'cancelado').reduce((acc, e) => acc + e.amount, 0);
  const totalPoupancas = data.savings.reduce((acc, s) => acc + s.currentAmount, 0);
  const totalInvestido = data.investments.reduce((acc, i) => acc + i.currentValue, 0);
  const totalDividas = data.debts.filter(d => d.status !== 'paga').reduce((acc, d) => acc + d.remainingAmount, 0);
  const totalActivos = data.assets.reduce((acc, a) => acc + a.estimatedValue, 0);
  const patrimonioLiquido = (totalActivos + totalPoupancas + totalInvestido) - totalDividas;
  const saldoPeriodo = totalReceitas - totalDespesas;

  let y = 48;
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Resumo Financeiro do Período', 14, y);

  y += 6;
  const summaryData = [
    ['Receitas Totais', formatCurrency(totalReceitas, data.currency), 'Total Despesas', formatCurrency(totalDespesas, data.currency)],
    ['Saldo do Período', formatCurrency(saldoPeriodo, data.currency), 'Poupança Acumulada', formatCurrency(totalPoupancas, data.currency)],
    ['Total Investido', formatCurrency(totalInvestido, data.currency), 'Dívidas Pendentes', formatCurrency(totalDividas, data.currency)],
    ['Património Líquido', formatCurrency(patrimonioLiquido, data.currency), 'Taxa Poupança', totalReceitas > 0 ? `${((totalPoupancas / totalReceitas) * 100).toFixed(1)}%` : '0%']
  ];

  autoTable(doc, {
    startY: y,
    head: [],
    body: summaryData,
    theme: 'grid',
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      0: { fontStyle: 'bold', fillColor: [248, 250, 252] },
      2: { fontStyle: 'bold', fillColor: [248, 250, 252] }
    }
  });

  // Table of Expenses
  y = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text(`Despesas Registadas (${data.expenses.length})`, 14, y);

  const categoryMap = new Map(data.categories.map(c => [c.id, c.name]));
  const personMap = new Map(data.people.map(p => [p.id, p.name]));
  const accountMap = new Map(data.accounts.map(a => [a.id, a.name]));

  const expensesTableBody = data.expenses.slice(0, 30).map(e => [
    formatDate(e.date),
    e.description,
    categoryMap.get(e.categoryId) || 'Geral',
    personMap.get(e.personId || '') || '-',
    accountMap.get(e.accountId) || '-',
    e.status.toUpperCase(),
    formatCurrency(e.amount, data.currency)
  ]);

  autoTable(doc, {
    startY: y + 4,
    head: [['Data', 'Descrição', 'Categoria', 'Pessoa', 'Conta', 'Estado', 'Valor']],
    body: expensesTableBody,
    theme: 'striped',
    headStyles: { fillColor: [30, 41, 59], textColor: 255, fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 2.5 },
    columnStyles: {
      6: { halign: 'right', fontStyle: 'bold' }
    }
  });

  // Add Page for Investments & Debts
  doc.addPage();
  y = 20;

  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Investimentos e Dívidas', 14, y);

  y += 6;
  const investmentsBody = data.investments.map(i => [
    i.name,
    i.institution,
    formatCurrency(i.investedAmount, data.currency),
    formatCurrency(i.currentValue, data.currency),
    `${i.returnRate}%`,
    formatCurrency(i.currentValue - i.investedAmount, data.currency)
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Investimento', 'Instituição', 'Capital Investido', 'Valor Actual', 'Taxa', 'Lucro/Ganho']],
    body: investmentsBody.length ? investmentsBody : [['Nenhum investimento registado', '-', '-', '-', '-', '-']],
    headStyles: { fillColor: [16, 185, 129] },
    styles: { fontSize: 8 }
  });

  y = (doc as any).lastAutoTable.finalY + 12;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('Dívidas e Obrigações', 14, y);

  y += 6;
  const debtsBody = data.debts.map(d => [
    d.creditor,
    d.description,
    formatCurrency(d.originalAmount, data.currency),
    formatCurrency(d.paidAmount, data.currency),
    formatCurrency(d.remainingAmount, data.currency),
    d.status.toUpperCase(),
    formatDate(d.dueDate)
  ]);

  autoTable(doc, {
    startY: y,
    head: [['Credor', 'Descrição', 'Valor Original', 'Valor Pago', 'Em Falta', 'Estado', 'Vencimento']],
    body: debtsBody.length ? debtsBody : [['Nenhuma dívida registada', '-', '-', '-', '-', '-', '-']],
    headStyles: { fillColor: [239, 68, 68] },
    styles: { fontSize: 8 }
  });

  // Footer on each page
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text(
      `Gerado por FinControl Angola em ${new Date().toLocaleDateString('pt-AO')} - Página ${i} de ${pageCount}`,
      14,
      doc.internal.pageSize.getHeight() - 10
    );
  }

  doc.save(`FinControl_Relatorio_${new Date().toISOString().slice(0, 10)}.pdf`);
}

export function exportToExcel(data: ExportContextData) {
  const wb = XLSX.utils.book_new();

  const categoryMap = new Map(data.categories.map(c => [c.id, c.name]));
  const personMap = new Map(data.people.map(p => [p.id, p.name]));
  const accountMap = new Map(data.accounts.map(a => [a.id, a.name]));

  // Sheet 1: Resumo Executivo
  const totalReceitas = data.incomes.reduce((acc, i) => acc + i.amount, 0);
  const totalDespesas = data.expenses.filter(e => e.status !== 'cancelado').reduce((acc, e) => acc + e.amount, 0);
  const totalPoupancas = data.savings.reduce((acc, s) => acc + s.currentAmount, 0);
  const totalInvestido = data.investments.reduce((acc, i) => acc + i.currentValue, 0);
  const totalDividas = data.debts.filter(d => d.status !== 'paga').reduce((acc, d) => acc + d.remainingAmount, 0);
  const totalActivos = data.assets.reduce((acc, a) => acc + a.estimatedValue, 0);

  const resumoRows = [
    { Indicador: 'Aplicação', Valor: data.appName || 'FinControl Angola' },
    { Indicador: 'Utilizador', Valor: data.userName },
    { Indicador: 'Período', Valor: data.periodLabel },
    { Indicador: 'Data de Exportação', Valor: new Date().toLocaleString('pt-AO') },
    { Indicador: '', Valor: '' },
    { Indicador: 'Receitas Totais (Kz)', Valor: totalReceitas },
    { Indicador: 'Despesas Totais (Kz)', Valor: totalDespesas },
    { Indicador: 'Saldo Líquido (Kz)', Valor: totalReceitas - totalDespesas },
    { Indicador: 'Poupanças Acumuladas (Kz)', Valor: totalPoupancas },
    { Indicador: 'Investimentos Actuais (Kz)', Valor: totalInvestido },
    { Indicador: 'Dívidas Pendentes (Kz)', Valor: totalDividas },
    { Indicador: 'Activos Registados (Kz)', Valor: totalActivos },
    { Indicador: 'Património Líquido (Kz)', Valor: (totalActivos + totalPoupancas + totalInvestido) - totalDividas },
    { Indicador: 'Taxa de Poupança (%)', Valor: totalReceitas > 0 ? (totalPoupancas / totalReceitas) * 100 : 0 },
    { Indicador: 'Taxa de Investimento (%)', Valor: totalReceitas > 0 ? (totalInvestido / totalReceitas) * 100 : 0 },
  ];
  const wsResumo = XLSX.utils.json_to_sheet(resumoRows);
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo Executivo');

  // Sheet 2: Despesas
  const despesasRows = data.expenses.map(e => ({
    Data: formatDate(e.date),
    Descrição: e.description,
    Valor_Kz: e.amount,
    Categoria: categoryMap.get(e.categoryId) || 'Geral',
    Pessoa: personMap.get(e.personId || '') || '-',
    Conta: accountMap.get(e.accountId) || '-',
    Forma_Pagamento: e.paymentMethod,
    Estado: e.status,
    Recorrência: e.recurrence,
    Local: e.location || '',
    Observações: e.notes || ''
  }));
  const wsDespesas = XLSX.utils.json_to_sheet(despesasRows);
  XLSX.utils.book_append_sheet(wb, wsDespesas, 'Despesas');

  // Sheet 3: Receitas
  const receitasRows = data.incomes.map(i => ({
    Data: formatDate(i.date),
    Descrição: i.description,
    Valor_Kz: i.amount,
    Categoria: categoryMap.get(i.categoryId) || 'Geral',
    Fonte: i.source,
    Conta: accountMap.get(i.accountId) || '-',
    Pessoa: personMap.get(i.personId || '') || '-',
    Recorrência: i.recurrence,
    Observações: i.notes || ''
  }));
  const wsReceitas = XLSX.utils.json_to_sheet(receitasRows);
  XLSX.utils.book_append_sheet(wb, wsReceitas, 'Receitas');

  // Sheet 4: Poupança
  const poupancaRows = data.savings.map(s => ({
    Nome_Meta: s.name,
    Valor_Alvo_Kz: s.targetAmount,
    Valor_Actual_Kz: s.currentAmount,
    Valor_Falta_Kz: Math.max(0, s.targetAmount - s.currentAmount),
    Progresso_Percent: s.targetAmount > 0 ? ((s.currentAmount / s.targetAmount) * 100).toFixed(1) : 0,
    Prazo: formatDate(s.deadline),
    Meta_Mensal_Kz: s.monthlyTarget,
    Estado: s.status
  }));
  const wsPoupanca = XLSX.utils.json_to_sheet(poupancaRows);
  XLSX.utils.book_append_sheet(wb, wsPoupanca, 'Poupança');

  // Sheet 5: Investimentos
  const investRows = data.investments.map(i => ({
    Investimento: i.name,
    Tipo: i.type,
    Instituição: i.institution,
    Capital_Investido_Kz: i.investedAmount,
    Valor_Actual_Kz: i.currentValue,
    Lucro_Ganho_Kz: i.currentValue - i.investedAmount,
    Rentabilidade_Percent: i.investedAmount > 0 ? (((i.currentValue - i.investedAmount) / i.investedAmount) * 100).toFixed(2) : 0,
    Taxa_Anual_Percent: i.returnRate,
    Rendimentos_Recebidos_Kz: i.returnsReceived,
    Vencimento: formatDate(i.maturityDate || ''),
    Estado: i.status
  }));
  const wsInvest = XLSX.utils.json_to_sheet(investRows);
  XLSX.utils.book_append_sheet(wb, wsInvest, 'Investimentos');

  // Sheet 6: Dívidas
  const dividasRows = data.debts.map(d => ({
    Credor: d.creditor,
    Descrição: d.description,
    Valor_Original_Kz: d.originalAmount,
    Valor_Pago_Kz: d.paidAmount,
    Valor_Em_Falta_Kz: d.remainingAmount,
    Prestação_Mensal_Kz: d.installmentAmount,
    Taxa_Juro_Percent: d.interestRate,
    Vencimento: formatDate(d.dueDate),
    Estado: d.status
  }));
  const wsDividas = XLSX.utils.json_to_sheet(dividasRows);
  XLSX.utils.book_append_sheet(wb, wsDividas, 'Dívidas');

  // Sheet 7: Activos & Património
  const activosRows = data.assets.map(a => ({
    Activo: a.name,
    Tipo: a.type,
    Valor_Estimado_Kz: a.estimatedValue,
    Data_Aquisicao: formatDate(a.purchaseDate || ''),
    Observações: a.notes || ''
  }));
  const wsActivos = XLSX.utils.json_to_sheet(activosRows);
  XLSX.utils.book_append_sheet(wb, wsActivos, 'Activos');

  XLSX.writeFile(wb, `FinControl_Completo_${new Date().toISOString().slice(0, 10)}.xlsx`);
}

export function exportToCSV(data: Expense[], categories: Category[], people: Person[], accounts: Account[]) {
  const categoryMap = new Map(categories.map(c => [c.id, c.name]));
  const personMap = new Map(people.map(p => [p.id, p.name]));
  const accountMap = new Map(accounts.map(a => [a.id, a.name]));

  const headers = ['Data', 'Descricao', 'Valor_Kz', 'Categoria', 'Pessoa', 'Conta', 'Estado', 'Forma_Pagamento', 'Observacoes'];
  const rows = data.map(e => [
    formatDate(e.date),
    `"${(e.description || '').replace(/"/g, '""')}"`,
    e.amount,
    `"${categoryMap.get(e.categoryId) || 'Geral'}"`,
    `"${personMap.get(e.personId || '') || '-'}"`,
    `"${accountMap.get(e.accountId) || '-'}"`,
    e.status,
    e.paymentMethod,
    `"${(e.notes || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FinControl_Despesas_${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportJSONBackup(data: any) {
  const jsonStr = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonStr], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `FinControl_Backup_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
