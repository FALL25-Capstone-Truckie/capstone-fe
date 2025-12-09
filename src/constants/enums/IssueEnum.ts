export enum IssueEnum {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED_FRAUD = 'CLOSED_FRAUD',
  EXPIRED = 'EXPIRED',
}

export const IssueStatusColors: Record<IssueEnum, string> = {
  [IssueEnum.OPEN]: 'blue',
  [IssueEnum.IN_PROGRESS]: 'orange',
  [IssueEnum.RESOLVED]: 'green',
  [IssueEnum.CLOSED_FRAUD]: 'red',
  [IssueEnum.EXPIRED]: 'default',
};

export const IssueStatusLabels: Record<IssueEnum, string> = {
  [IssueEnum.OPEN]: 'Chờ xử lý',
  [IssueEnum.IN_PROGRESS]: 'Đang xử lý',
  [IssueEnum.RESOLVED]: 'Đã giải quyết',
  [IssueEnum.CLOSED_FRAUD]: 'Đóng do gian lận',
  [IssueEnum.EXPIRED]: 'Hết hạn khiếu nại',
};