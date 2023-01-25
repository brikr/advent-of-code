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
