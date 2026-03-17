export interface PayrollCalculation {
  grossSalary: number;
  deductions: {
    inss: number;
    fgts: number;
    irrf: number;
    other: number;
    total: number;
  };
  additions: {
    overtime: number;
    bonuses: number;
    vacation: number;
    thirteenth: number;
    other: number;
    total: number;
  };
  netSalary: number;
}

export function calculatePayroll(
  grossSalary: number,
  additions: {
    overtime?: number;
    bonuses?: number;
    vacation?: number;
    thirteenth?: number;
    other?: number;
  },
  deductions: {
    inss?: number;
    fgts?: number;
    irrf?: number;
    other?: number;
  }
): PayrollCalculation {
  const totalAdditions = Object.values(additions).reduce((sum, value) => sum + (value || 0), 0);
  const totalGross = grossSalary + totalAdditions;
  
  const totalDeductions = (deductions.inss || 0) + (deductions.fgts || 0) + (deductions.irrf || 0) + (deductions.other || 0);
  const netSalary = totalGross - totalDeductions;
  
  return {
    grossSalary: totalGross,
    deductions: {
      inss: deductions.inss || 0,
      fgts: deductions.fgts || 0,
      irrf: deductions.irrf || 0,
      other: deductions.other || 0,
      total: totalDeductions,
    },
    additions: {
      overtime: additions.overtime || 0,
      bonuses: additions.bonuses || 0,
      vacation: additions.vacation || 0,
      thirteenth: additions.thirteenth || 0,
      other: additions.other || 0,
      total: totalAdditions,
    },
    netSalary,
  };
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

export function getMonthName(month: string): string {
  const months: { [key: string]: string } = {
    '01': 'Janeiro',
    '02': 'Fevereiro',
    '03': 'Março',
    '04': 'Abril',
    '05': 'Maio',
    '06': 'Junho',
    '07': 'Julho',
    '08': 'Agosto',
    '09': 'Setembro',
    '10': 'Outubro',
    '11': 'Novembro',
    '12': 'Dezembro',
  };
  return months[month] || month;
}

export function getCurrentReferenceDate(): { month: string; year: number } {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const year = now.getFullYear();
  
  // Se estivermos nos primeiros dias do mês, referenciar o mês anterior
  if (now.getDate() <= 5) {
    const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
    return {
      month: String(prevMonth.getMonth() + 1).padStart(2, '0'),
      year: prevMonth.getFullYear(),
    };
  }
  
  return { month, year };
}
