'use client';

import { useTranslations } from 'next-intl';

export default function PetitsChevauxRules() {
  const t = useTranslations('rules.petitsChevaux');

  return (
    <div className="space-y-4 text-sm text-night-600">
      <section>
        <h3 className="font-semibold text-night mb-1">{t('objectiveTitle')}</h3>
        <p>{t('objective')}</p>
      </section>
      <section>
        <h3 className="font-semibold text-night mb-1">{t('setupTitle')}</h3>
        <p>{t('setup')}</p>
      </section>
      <section>
        <h3 className="font-semibold text-night mb-1">{t('turnTitle')}</h3>
        <p>{t('turn')}</p>
      </section>
      <section>
        <h3 className="font-semibold text-night mb-1">{t('captureTitle')}</h3>
        <p>{t('capture')}</p>
      </section>
      <section>
        <h3 className="font-semibold text-night mb-1">{t('endGameTitle')}</h3>
        <p>{t('endGame')}</p>
      </section>
    </div>
  );
}
