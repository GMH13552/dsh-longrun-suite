#!/usr/bin/env python3
"""Brute-force search for an Erdős–Straus decomposition 4/n = 1/x + 1/y + 1/z.

Usage:
    python3 verify_erdos_straus.py [N]

Verifies the conjecture for 2 <= n <= N (default 2000) and prints the first
decomposition found for each n. This is a small CPU-friendly check; it is NOT
a proof.
"""
import sys
from math import gcd


def find_decomposition(n):
    # Search x <= y <= z.
    for x in range(n // 4 + 1, (3 * n) // 4 + 1):
        num = 4 * x - n
        den = n * x
        g = gcd(num, den)
        num //= g
        den //= g

        # Need 1/y + 1/z = num/den with y <= z:
        #   1/y < num/den <= 2/y   =>   den/num < y <= 2*den/num
        y_min = max(x, den // num + 1)
        y_max = (2 * den) // num
        for y in range(y_min, y_max + 1):
            d = num * y - den
            if d <= 0:
                continue
            num_z = den * y
            if num_z % d == 0:
                z = num_z // d
                if z >= y:
                    return (x, y, z)
    return None


def main():
    limit = int(sys.argv[1]) if len(sys.argv) > 1 else 2000
    bad = []
    for n in range(2, limit + 1):
        sol = find_decomposition(n)
        if sol is None:
            bad.append(n)
            print(f"NO decomposition for n={n}")
            if len(bad) >= 5:
                break
    if bad:
        print(f"FAILED: {bad}")
        return 1
    print(f"OK: found decomposition for every 2 <= n <= {limit}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
