import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

export function formatDate(date) {
  return new Date(date).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
}

export function getGradeColor(grade) {
  if (grade >= 9) return 'text-green-600'
  if (grade >= 7) return 'text-blue-600'
  if (grade >= 5) return 'text-yellow-600'
  return 'text-red-600'
}

export function getGradeLabel(grade) {
  if (grade >= 9) return 'Sobresaliente'
  if (grade >= 7) return 'Notable'
  if (grade >= 6) return 'Bien'
  if (grade >= 5) return 'Suficiente'
  return 'Insuficiente'
}
