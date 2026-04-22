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
