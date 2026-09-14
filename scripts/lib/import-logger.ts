export function logInfo(message: string) {
  console.log(message)
}

export function logWarn(message: string) {
  console.warn(message)
}

export function logError(message: string) {
  console.error(message)
}

export function progress(prefix: string, current: number, total: number, extra = '') {
  if (current === 1 || current === total || current % 25 === 0) {
    console.log(`[${current}/${total}] ${prefix}${extra ? ` ${extra}` : ''}`)
  }
}
