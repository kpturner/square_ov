export const PUBLIC_PAGES = ['/', '/login', '/reset-password'];

export const ADMIN_PAGES = ['/users'];

export const COOKIE = 'square-ov-auth';

export const PUBLIC_ENDPOINTS = [
  '/api/login',
  '/api/register',
  '/api/password/request',
  '/api/password/reset',
  '/api/ov/positions',
];

export const OV_TYPES = [
  {
    title: 'Craft',
    value: 'craft',
  },
  {
    title: 'Royal Arch',
    value: 'ra',
  },
] as const;

export const OV_TYPE_LABELS = {
  craft: 'Craft',
  ra: 'Royal Arch',
} as const;

export function ovTypeLabel(type: 'craft' | 'ra') {
  return OV_TYPE_LABELS[type];
}

export const VIP_RANKS = ['PGM', 'DPGM', 'APGM', 'MEGS', 'DGSUPT', '2NDPGP', '3RDPGP', 'APGP'];
