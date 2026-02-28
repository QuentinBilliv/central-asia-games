'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import Button from '@/components/ui/Button';

interface InviteLinkProps {
  roomId: string;
}

export default function InviteLink({ roomId }: InviteLinkProps) {
  const t = useTranslations('lobby');
  const tCommon = useTranslations('common');
  const [copied, setCopied] = useState(false);

  const url = typeof window !== 'undefined'
    ? `${window.location.origin}${window.location.pathname}`
    : '';

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      const input = document.createElement('input');
      input.value = url;
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-medium text-night-400 uppercase tracking-wide">
        {t('inviteLink')}
      </h3>
      <div className="flex gap-2">
        <div className="flex-1 bg-sand-100 border border-sand-300 rounded-lg px-3 py-2 text-sm text-night-400 truncate font-mono">
          {url}
        </div>
        <Button
          variant={copied ? 'secondary' : 'outline'}
          size="sm"
          onClick={copyLink}
        >
          {copied ? tCommon('copied') : t('copyLink')}
        </Button>
      </div>
    </div>
  );
}
