export function isMonday(): boolean {
  const today = new Date()
  if (today.getDay() == 1) {
    return true
  }

  return false
}

export function hasReportToday(bank: string): string | void {
  const today = new Date();

  if (bank == "Jbcred") {
    if (today.getDay() != 3) {
      console.log("Hoje não é dia de buscar relatorio")
      return "Hoje não é dia de Buscar relatórios"
    }
  }

  return

}

export function formatWithFixedHour(date: Date, initial: boolean = false): string {
  const todayIsMonday = isMonday()
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate() - (initial ? todayIsMonday ? 3 : 1 : 0)).padStart(2, '0');

  return `${yyyy}-${mm}-${dd}T06:00`;
}