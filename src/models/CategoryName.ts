export enum CategoryName {
  NORMAL = 'NORMAL',
  FRAGILE = 'FRAGILE'
}

export const getCategoryDisplayName = (categoryName: CategoryName): string => {
  switch (categoryName) {
    case CategoryName.FRAGILE:
      return 'Hàng dễ vỡ';
    case CategoryName.NORMAL:
      return 'Hàng thông thường';
    default:
      return 'Hàng thông thường';
  }
};

export const isFragileCategory = (categoryName: CategoryName): boolean => {
  return categoryName === CategoryName.FRAGILE;
};
