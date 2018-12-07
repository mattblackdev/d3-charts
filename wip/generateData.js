export function lerp(a, b, f) {
  return a * (1.0 - f) + b * f
}

export default function generateData(options) {
  const { start, end, days, variance } = options
  const data = []

  for (let i = 0; i < days; i++) {
    const f = 1 / days * (i + 1)
    data[i] = Math.round(Math.random() * variance + lerp(start, end, f))
  }
  return data
}

// const data = generateData({ start: 50, end: 10, days: 100, variance: 10 })
// console.log(data)
