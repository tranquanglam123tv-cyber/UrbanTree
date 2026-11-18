import {
  AnchorStatus,
  CareActionType,
  CareRecord,
  Incident,
  IncidentSeverity,
  IncidentStatus,
  IncidentUpdate,
  Tree,
  TreeHealthStatus,
  TreeType,
  User,
} from '../types';

export function healthFromDb(val?: string | null): TreeHealthStatus {
  switch (val) {
    case 'Tốt':
      return 'GOOD';
    case 'Bình thường':
      return 'FAIR';
    case 'Cần chăm sóc':
      return 'POOR';
    case 'Sâu bệnh':
    case 'Nguy hiểm':
      return 'CRITICAL';
    default:
      return 'GOOD';
  }
}

export function healthToDb(val?: TreeHealthStatus): string {
  switch (val) {
    case 'GOOD':
      return 'Tốt';
    case 'FAIR':
      return 'Bình thường';
    case 'POOR':
      return 'Cần chăm sóc';
    case 'CRITICAL':
    case 'DEAD':
      return 'Nguy hiểm';
    default:
      return 'Tốt';
  }
}

export function careActionFromDb(val?: string | null): CareActionType {
  switch (val) {
    case 'Tưới nước':
      return 'WATERING';
    case 'Cắt tỉa':
      return 'PRUNING';
    case 'Bón phân':
      return 'FERTILIZING';
    case 'Trị sâu bệnh':
      return 'PEST_CONTROL';
    case 'Gia cố cọc':
      return 'SUPPORT_STAKE';
    default:
      return 'SURVEY';
  }
}

export function careActionToDb(val?: CareActionType): string {
  switch (val) {
    case 'WATERING':
      return 'Tưới nước';
    case 'PRUNING':
      return 'Cắt tỉa';
    case 'FERTILIZING':
      return 'Bón phân';
    case 'PEST_CONTROL':
    case 'TREATMENT':
      return 'Trị sâu bệnh';
    case 'SUPPORT_STAKE':
    case 'SURVEY':
    default:
      return 'Gia cố cọc';
  }
}

export function severityFromDb(val?: string | null): IncidentSeverity {
  switch (val) {
    case 'Thấp':
      return 'LOW';
    case 'Trung bình':
      return 'MEDIUM';
    case 'Cao':
      return 'HIGH';
    case 'Khẩn cấp':
      return 'CRITICAL';
    default:
      return 'MEDIUM';
  }
}

export function severityToDb(val?: IncidentSeverity): string {
  switch (val) {
    case 'LOW':
      return 'Thấp';
    case 'MEDIUM':
      return 'Trung bình';
    case 'HIGH':
      return 'Cao';
    case 'CRITICAL':
      return 'Khẩn cấp';
    default:
      return 'Trung bình';
  }
}

export function incidentStatusFromDb(val?: string | null): IncidentStatus {
  switch (val) {
    case 'Chờ xử lý':
      return 'RECEIVED';
    case 'Đã tiếp nhận':
      return 'ASSIGNED';
    case 'Đang xử lý':
      return 'IN_PROGRESS';
    case 'Đã giải quyết':
    case 'Đã hoàn thành':
      return 'RESOLVED';
    case 'Từ chối':
      return 'REJECTED';
    default:
      return 'RECEIVED';
  }
}

export function incidentStatusToDb(val?: IncidentStatus): string {
  switch (val) {
    case 'RECEIVED':
      return 'Chờ xử lý';
    case 'ASSIGNED':
      return 'Đã tiếp nhận';
    case 'IN_PROGRESS':
      return 'Đang xử lý';
    case 'RESOLVED':
      return 'Đã hoàn thành';
    case 'REJECTED':
      return 'Từ chối';
    default:
      return 'Chờ xử lý';
  }
}

export interface DbAuditRow {
  id: number;
  record_type: string;
  record_id: string;
  data_hash: string;
  tx_hash: string | null;
  block_number: number | null;
  chain_id: number | null;
  contract_address: string | null;
  recorder_address: string | null;
  status: string;
  confirmed_at: string | null;
  created_at: string;
}

export function mapUserFromDb(row: any): User {
  return {
    id: String(row.id),
    username: row.username,
    fullName: row.full_name,
    role: row.role === 'ADMIN' ? 'ADMIN' : 'STAFF',
    isActive: row.status !== 'INACTIVE',
    avatarUrl: row.avatar_url || undefined,
  };
}

export function mapTreeTypeFromDb(row: any): TreeType {
  return {
    id: String(row.id),
    name: row.name,
    scientificName: row.scientific_name || '',
    description: row.description || '',
    careGuide: row.care_guide || '',
    isActive: row.status !== 'INACTIVE',
  };
}

export function mapTreeFromDb(row: any, audits: DbAuditRow[]): Tree {
  const audit = audits.find(
    (a) => a.record_type === 'TREE_PROFILE' && a.record_id === row.tree_code && a.status === 'CONFIRMED'
  );
  return {
    id: String(row.id),
    publicCode: row.tree_code,
    treeTypeId: row.tree_type_id ? String(row.tree_type_id) : '1',
    displayName: row.species,
    address: row.address || row.location_name || '',
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    plantedAt: row.planted_date || '',
    healthStatus: healthFromDb(row.health_status),
    imageUrl: row.image_url || undefined,
    diameterCm: row.diameter_cm != null ? Number(row.diameter_cm) : undefined,
    heightM: row.height_meter != null ? Number(row.height_meter) : undefined,
    isActive: row.status !== 'INACTIVE' && row.status !== 'REMOVED',
    createdAt: row.created_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.created_at || new Date().toISOString(),
    payloadVersion: 1,
    payloadHash: row.data_hash || audit?.data_hash || undefined,
    anchorStatus: audit ? ('CONFIRMED' as AnchorStatus) : 'NOT_ANCHORED',
    txHash: audit?.tx_hash || undefined,
  };
}

export function mapCareFromDb(row: any, audits: DbAuditRow[]): CareRecord {
  const code = row.care_code || `CARE-${row.id}`;
  const audit = audits.find(
    (a) => a.record_type === 'CARE_LOG' && a.record_id === code && a.status === 'CONFIRMED'
  );
  return {
    id: code,
    treeId: String(row.tree_id),
    staffUserId: row.staff_id ? String(row.staff_id) : '',
    staffName: row.caretaker_name,
    actionType: careActionFromDb(row.action_type),
    healthBefore: healthFromDb(row.health_before),
    healthAfter: healthFromDb(row.health_after || row.health_before),
    notes: row.notes || '',
    imageUrl: row.image_after_url || row.image_before_url || undefined,
    performedAt: row.action_date || row.created_at || new Date().toISOString(),
    createdAt: row.created_at || new Date().toISOString(),
    payloadVersion: 1,
    payloadHash: row.data_hash || audit?.data_hash || undefined,
    anchorStatus: (row.anchor_status as AnchorStatus) || (audit ? 'CONFIRMED' : 'NOT_ANCHORED'),
    txHash: audit?.tx_hash || undefined,
  };
}

export function mapIncidentFromDb(row: any, audits: DbAuditRow[]): Incident {
  const code = row.tracking_code || `INC-${row.id}`;
  const audit = audits.find(
    (a) =>
      a.record_type === 'INCIDENT_REPORT' &&
      (a.record_id === code || a.record_id === `INC-${row.id}`) &&
      a.status === 'CONFIRMED'
  );
  return {
    id: String(row.id),
    publicCode: code,
    treeId: row.tree_id ? String(row.tree_id) : null,
    reporterName: row.reporter_name || 'Người dân ẩn danh',
    reporterPhone: row.reporter_phone || '',
    description: row.description || '',
    imageUrl: row.image_url || undefined,
    latitude: row.latitude != null ? Number(row.latitude) : 10.77,
    longitude: row.longitude != null ? Number(row.longitude) : 106.69,
    address: row.address || row.location_name || '',
    severity: severityFromDb(row.severity),
    status: incidentStatusFromDb(row.status),
    assignedToUserId: row.assigned_staff_id ? String(row.assigned_staff_id) : null,
    reportedAt: row.reported_at || new Date().toISOString(),
    resolvedAt: row.resolved_at || null,
    createdAt: row.reported_at || new Date().toISOString(),
    updatedAt: row.updated_at || row.reported_at || new Date().toISOString(),
    payloadVersion: 1,
    payloadHash: audit?.data_hash || undefined,
    anchorStatus: audit ? 'CONFIRMED' : 'NOT_ANCHORED',
    txHash: audit?.tx_hash || undefined,
  };
}

export function mapIncidentUpdateFromDb(row: any): IncidentUpdate {
  return {
    id: String(row.id),
    incidentId: String(row.incident_id),
    actorUserId: row.actor_id ? String(row.actor_id) : 'system',
    actorName: row.actor_name || 'Hệ thống UrbanTree',
    oldStatus: incidentStatusFromDb(row.old_status),
    newStatus: incidentStatusFromDb(row.new_status),
    note: row.notes || '',
    createdAt: row.created_at || new Date().toISOString(),
  };
}
