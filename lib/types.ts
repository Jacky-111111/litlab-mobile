/**
 * Swift models from IOS_APP_SPEC.md §6 ported to TypeScript.
 * Keys match backend JSON exactly (snake_case, no conversion).
 * Dates stay as ISO strings; format lazily in the UI.
 */

export interface Profile {
  user_id: string;
  email: string;
  nickname: string;
  school: string;
  public_handle: string;
}
export interface ProfileEnvelope {
  profile: Profile;
}

export interface Project {
  id: string;
  title: string;
  description: string | null;
  /** "IMRAD" | "Review / Survey" | "Theoretical Paper" | "Case Study" */
  framework_type: string;
  goal: string | null;
  status: string | null;
  created_at: string | null;
  updated_at: string | null;
}
export interface ProjectsEnvelope {
  projects: Project[];
}

export interface FrameworkSection {
  title: string;
  explanation: string;
  prompt: string;
}
export interface FrameworkGuidance {
  description: string;
  sections: FrameworkSection[];
}
export interface ProjectDetailEnvelope {
  project: Project;
  framework_guidance: FrameworkGuidance;
}

export interface Collection {
  id: string;
  title: string;
  description: string | null;
  visibility: string | null;
  share_slug: string | null;
  created_at: string | null;
  updated_at: string | null;
}
export interface CollectionsEnvelope {
  collections: Collection[];
}
export interface CollectionEnvelope {
  collection: Collection;
}

export interface Paper {
  id: string;
  external_paper_id: string;
  source: string;
  title: string;
  nickname: string;
  authors: string[];
  year: number | null;
  abstract: string;
  url: string;
  pdf_storage_path: string;
  content_hash: string;
  citation_mla: string;
  citation_apa: string;
  citation_chicago: string;
  created_at: string | null;
  updated_at: string | null;
}
export interface PapersEnvelope {
  papers: Paper[];
}

/** `GET /collections/{id}/sharing` — fields may vary; extend as backend evolves. */
export interface CollectionSharing {
  visibility: string;
  share_slug: string | null;
  invited_emails?: string[];
}

export interface SharedCollectionSharer {
  nickname?: string | null;
  email?: string | null;
}

/** `GET /shared/c/{slug}` — success payload (shape aligned with web shared-collection). */
export interface SharedCollectionGranted {
  access: "granted";
  collection: Collection;
  papers: Paper[];
  sharer?: SharedCollectionSharer | null;
  viewer?: unknown;
}

export interface SharedCollectionDenied {
  access: "denied";
  /** e.g. private | sign_in_required | not_authorized */
  denied?: string;
  denied_reason?: string;
  detail?: string;
}

export type SharedCollectionResponse =
  | SharedCollectionGranted
  | SharedCollectionDenied;

export function isSharedCollectionGranted(
  r: SharedCollectionResponse
): r is SharedCollectionGranted {
  return r.access === "granted";
}

export function sharedCollectionDeniedReason(r: SharedCollectionDenied): string {
  if (typeof r.denied_reason === "string" && r.denied_reason.length > 0) {
    return r.denied_reason;
  }
  if (typeof r.denied === "string" && r.denied.length > 0) {
    return r.denied;
  }
  if (typeof r.detail === "string" && r.detail.length > 0) {
    return r.detail;
  }
  return "unknown";
}
