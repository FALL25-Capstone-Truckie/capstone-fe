export enum IssueStatus {
  OPEN = 'OPEN',
  IN_PROGRESS = 'IN_PROGRESS',
  RESOLVED = 'RESOLVED',
  CLOSED_FRAUD = 'CLOSED_FRAUD',
  EXPIRED = 'EXPIRED',
}

export const IssueStatusLabel: Record<IssueStatus, string> = {
  [IssueStatus.OPEN]: 'Chờ xử lý',
  [IssueStatus.IN_PROGRESS]: 'Đang xử lý',
  [IssueStatus.RESOLVED]: 'Đã giải quyết',
  [IssueStatus.CLOSED_FRAUD]: 'Đóng do gian lận',
  [IssueStatus.EXPIRED]: 'Hết hạn khiếu nại',
};

export const IssueStatusColor: Record<IssueStatus, string> = {
  [IssueStatus.OPEN]: 'blue',
  [IssueStatus.IN_PROGRESS]: 'orange',
  [IssueStatus.RESOLVED]: 'green',
  [IssueStatus.CLOSED_FRAUD]: 'red',
  [IssueStatus.EXPIRED]: 'default',
};

export function getIssueStatusLabel(status: string): string {
  return IssueStatusLabel[status as IssueStatus] || status || 'Không rõ';
}

export function getIssueStatusColor(status: string): string {
  return IssueStatusColor[status as IssueStatus] || 'blue';
}
