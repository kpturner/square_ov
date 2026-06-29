import type { OVType } from '@prisma/client';

export const useOvType = () => {
  const preferredOvType = useCookie<OVType>('preferredOvType', {
    default: () => 'craft' as OVType,
  });

  const ovType = computed({
    get: () => preferredOvType.value,
    set: (value: OVType) => {
      preferredOvType.value = value;
    },
  });

  const saveOvType = (value: OVType) => {
    preferredOvType.value = value;
  };

  return { ovType, saveOvType };
};
