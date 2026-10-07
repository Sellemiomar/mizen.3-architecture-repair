/**
 * Geographic data for Tunisian regions and development priority zones.
 * Authoritative administrative divisions of Tunisia (24 governorates).
 */

export const TUNISIAN_GOVERNORATES = [
  'Ariana', 'Béja', 'Ben Arous', 'Bizerte', 'Gabès', 'Gafsa', 'Jendouba', 
  'Kairouan', 'Kasserine', 'Kébili', 'Le Kef', 'Mahdia', 'La Manouba', 
  'Médenine', 'Monastir', 'Nabeul', 'Sfax', 'Sidi Bouzid', 'Siliana', 
  'Sousse', 'Tataouine', 'Tozeur', 'Tunis', 'Zaghouan'
] as const;

export type TunisianGovernorate = typeof TUNISIAN_GOVERNORATES[number];

/**
 * Regional development priority zones (Zones de Développement Régional - ZDR)
 * designated under Tunisian investment incentives framework.
 */
export const REGIONAL_DEVELOPMENT_ZONES: readonly string[] = [
  'Kasserine', 'Sidi Bouzid', 'Gafsa', 'Kébili', 'Tataouine', 'Tozeur', 
  'Siliana', 'Le Kef', 'Jendouba', 'Béja', 'Kairouan', 'Médenine', 'Gabès'
];
