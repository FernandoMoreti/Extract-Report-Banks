export function isMonday(): boolean {
  const today = new Date()
  if (today.getDay() == 1) {
    return true
  }

  return false
}