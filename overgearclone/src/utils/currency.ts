export const convertPrice = (price: number, currency: string): number => {
  // Example conversion rates (USD as base)
  const rates: Record<string, number> = {
    USD: 1,
    EUR: 0.96,
    BRL: 5.73,
  };
  return price * (rates[currency] || 1);
};