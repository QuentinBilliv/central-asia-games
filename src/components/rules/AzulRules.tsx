'use client';

import { useTranslations } from 'next-intl';

export default function AzulRules() {
  const t = useTranslations('rules.azul');

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
        <h3 className="font-semibold text-night mb-1">{t('scoringTitle')}</h3>
        <p>{t('scoring')}</p>
      </section>
      <section>
        <h3 className="font-semibold text-night mb-1">{t('endGameTitle')}</h3>
        <p>{t('endGame')}</p>
      </section>
    </div>
  );
}
