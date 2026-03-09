'use client';

import { useTranslations } from 'next-intl';

export default function BackgammonRules() {
  const t = useTranslations('rules.backgammon');

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
        <h3 className="font-semibold text-night mb-1">{t('hittingTitle')}</h3>
        <p>{t('hitting')}</p>
      </section>
      <section>
        <h3 className="font-semibold text-night mb-1">{t('bearingOffTitle')}</h3>
        <p>{t('bearingOff')}</p>
      </section>
      <section>
        <h3 className="font-semibold text-night mb-1">{t('endGameTitle')}</h3>
        <p>{t('endGame')}</p>
      </section>
    </div>
  );
}
