'use client';

import { useState, FormEvent } from 'react';
import { useTranslations } from 'next-intl';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

interface NicknameFormProps {
  onSubmit: (nickname: string) => void;
  error?: string | null;
}

export default function NicknameForm({ onSubmit, error }: NicknameFormProps) {
  const t = useTranslations('lobby');
  const [nickname, setNickname] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmed = nickname.trim();
    if (trimmed) onSubmit(trimmed);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-night mb-1.5">
          {t('nickname')}
        </label>
        <Input
          value={nickname}
          onChange={(e) => setNickname(e.target.value)}
          placeholder={t('nicknamePlaceholder')}
          maxLength={20}
          autoFocus
        />
      </div>
      {error && (
        <p className="text-sm text-terracotta">{error}</p>
      )}
      <Button type="submit" className="w-full" disabled={!nickname.trim()}>
        {t('join')}
      </Button>
    </form>
  );
}
