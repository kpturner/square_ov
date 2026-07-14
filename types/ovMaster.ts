import type { ActiveOfficer, OVMaster, OVMasterAdditionalOfficer } from '@prisma/client';

export type OVMasterAdditionalOfficerWithOfficer = OVMasterAdditionalOfficer & {
  activeOfficer: ActiveOfficer;
};

export type OVMasterWithAdditionalOfficers = OVMaster & {
  swordOfficer: ActiveOfficer;
  standardOfficer: ActiveOfficer;
  stewardOfficer: ActiveOfficer;
  officer1Officer: ActiveOfficer;
  officer2Officer: ActiveOfficer;
  officer3Officer: ActiveOfficer;
  officer4Officer: ActiveOfficer;
  officer5Officer: ActiveOfficer;
  officer6Officer: ActiveOfficer;
  officer7Officer: ActiveOfficer;
  additionalOfficers: OVMasterAdditionalOfficerWithOfficer[];
};

export type EnrichedCell = {
  address: string;
  row: number;
  col: number;
  value: unknown;
  colour?: string;
};
