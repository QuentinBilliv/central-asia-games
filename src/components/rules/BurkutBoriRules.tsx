'use client';

import { useTranslations } from 'next-intl';

export default function BurkutBoriRules() {
  const t = useTranslations('rules.burkutBori');

  return (
    <div className="space-y-4 text-sm text-night-600">
      <section>
        <h3 className="font-semibold text-night mb-1">{t('objectiveTitle')}</h3>
        <p>{t('objective')}</p>
      </section>
      <section>
        <h3 className="font-semibold text-night mb-1">{t('turnTitle')}</h3>
        <p>{t('turn')}</p>
      </section>
      <section>
        <h3 className="font-semibold text-night mb-1">{t('eaglesTitle')}</h3>
        <p>{t('eagles')}</p>
      </section>
      <section>
        <h3 className="font-semibold text-night mb-1">{t('wolvesTitle')}</h3>
        <p>{t('wolves')}</p>
      </section>
      <section>
        <h3 className="font-semibold text-night mb-1">{t('endGameTitle')}</h3>
        <p>{t('endGame')}</p>
      </section>
    </div>
  );
}
