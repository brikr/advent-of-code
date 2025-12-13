export function sign(num: number): number {
  if (num > 0) {
    return 1;
  } else if (num < 0) {
    return -1;
  } else {
    return 0;
  }
}

export function gcd(m: number, n: number): number {
  let tmp: number;
  while (m !== 0) {
    tmp = m;
    m = n % m;
    n = tmp;
  }
  return n;
}

export function lcm(m: number, n: number): number {
  return Math.floor(m / gcd(m, n)) * n;
}

export function logBase(val: number, base: number): number {
  return Math.log(val) / Math.log(base);
}

export function getDigit(num: number, digit: number): number {
  const digits = String(num).split('').reverse();
  return Number(digits[digit] ?? 0);
}

export function product(arr: number[]): number {
  return arr.reduce((a, b) => a * b, 1);
}
