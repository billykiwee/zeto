export const currencyFormatter = (value: number): string => {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR",
  }).format(value);
};

export const getContractStatusColor = (type: "ad" | "module"): string => {
  return type === "module" ? "#4CAF50" : "#3f51b5";
};
