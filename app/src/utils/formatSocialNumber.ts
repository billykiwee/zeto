export const formatSocialNumber = (value: number): string => {
  if (value >= 1_000_000_000) {
    return `${Math.floor((value * 1.5) / 1_000_000_000)}B`;
  }
  if (value >= 1_000_000) {
    return `${Math.floor((value * 1.5) / 1_000_000)}M`;
  }
  if (value >= 1_000) {
    return `${Math.floor((value * 1.5) / 1_000)}k`;
  }
  if (value >= 100) {
    return `${(value / 1000).toFixed(1)}k`;
  }
  if (value === 0) {
    return "";
  }
  return value.toString();
};
