/**
 * India-first salary formatting utility.
 * Formats annual salaries into LPA (Lakhs Per Annum) or monthly format.
 * Never outputs '$' or '$XXk' for Indian salary data.
 */

export function formatSalaryINR(
  min?: number | null,
  max?: number | null,
  currency: string = 'INR'
): string | null {
  if (!min && !max) return null;

  // Format a number into Lakhs (LPA)
  const formatLPA = (amount: number): string => {
    const lpa = amount / 100000;
    // If it's a whole number, don't show decimal (e.g. 8 LPA)
    // If decimal, show up to 1 decimal (e.g. 8.5 LPA)
    const formatted = Number.isInteger(lpa) ? lpa.toString() : lpa.toFixed(1);
    return `\u20b9${formatted} LPA`;
  };

  // If monthly salary format (e.g. < 100,000 and specified as monthly)
  if (min && !max && min <= 90000 && min % 1000 === 0) {
    return `\u20b9${min.toLocaleString('en-IN')}/month`;
  }

  if (min && max) {
    const minLPA = min / 100000;
    const maxLPA = max / 100000;
    const minStr = Number.isInteger(minLPA) ? minLPA.toString() : minLPA.toFixed(1);
    const maxStr = Number.isInteger(maxLPA) ? maxLPA.toString() : maxLPA.toFixed(1);
    return `\u20b9${minStr} \u2013 \u20b9${maxStr} LPA`;
  }

  if (min) {
    return `From ${formatLPA(min)}`;
  }

  if (max) {
    return `Up to ${formatLPA(max)}`;
  }

  return null;
}
