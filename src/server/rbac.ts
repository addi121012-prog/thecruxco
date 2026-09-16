export const ROLES = ['admin', 'sales', 'presales', 'management'] as const;
export function roleLabel(r: string): string {
  return ({ admin: 'Admin', sales: 'Sales', presales: 'Pre-Sales', management: 'Management' } as any)[r] || r;
}
export function isAdmin(m: any): boolean { return m?.role === 'admin'; }
export function canManageTeam(m: any): boolean { return m?.role === 'admin'; }
// Management is read-only across the CRM; everyone else (admin/sales/presales) can write.
export function canWrite(m: any): boolean { return !!m && m.role !== 'management'; }
export function canWriteSales(m: any): boolean { return !!m && (m.role === 'admin' || m.role === 'sales'); }
export function canWritePresales(m: any): boolean { return !!m && (m.role === 'admin' || m.role === 'presales' || m.role === 'sales'); }
