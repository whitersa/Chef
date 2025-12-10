import { Decimal } from 'decimal.js';

export class UnitConversionUtil {
  private static readonly TO_GRAMS: Record<string, number> = {
    kg: 1000,
    g: 1,
    mg: 0.001,
    l: 1000, // Assuming density of water
    ml: 1, // Assuming density of water
    pcs: 0, // Cannot convert pieces without weight info
  };

  static toGrams(quantity: number, unit: string): Decimal {
    const factor = this.TO_GRAMS[unit.toLowerCase()];
    if (factor === undefined) {
      // If unit is unknown or pcs, return 0 or throw.
      // For now, let's assume 0 and log warning if we had a logger.
      // Or better, treat as 'g' if unknown? No, that's dangerous.
      // Let's throw for now to be strict, or return 0.
      return new Decimal(0);
    }
    return new Decimal(quantity).times(factor);
  }
}
