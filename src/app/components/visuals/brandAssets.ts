import strengthEmblem from '../../../assets/images/rep_3d_strength_emblem_1795258933907.jpg';
import calisthenicsEmblem from '../../../assets/images/rep_3d_calisthenics_emblem_1795258929044.jpg';
import flowEmblem from '../../../assets/images/rep_3d_flow_emblem_1795258928617.jpg';
import trophyRing from '../../../assets/images/rep_3d_trophy_ring_1795258941004.jpg';
import type { Category } from '../../data/exercises';

export const BRAND_3D_ASSETS = {
  gym: strengthEmblem,
  calisthenics: calisthenicsEmblem,
  animalflow: flowEmblem,
  trophyRing,
} as const;

export function getCategory3DAsset(category: Category | string): string {
  if (category === 'calisthenics') return calisthenicsEmblem;
  if (category === 'animalflow') return flowEmblem;
  return strengthEmblem;
}
