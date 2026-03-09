'use client';

import { ComponentType } from 'react';
import { useTranslations } from 'next-intl';
import Modal from '@/components/ui/Modal';
import { GameType } from '@/game-logic/types';
import AzulRules from './AzulRules';
import PetitsChevauxRules from './PetitsChevauxRules';
import BurkutBoriRules from './BurkutBoriRules';
import MemoryRules from './MemoryRules';
import ToguzKorgoolRules from './ToguzKorgoolRules';
import BackgammonRules from './BackgammonRules';

const rulesComponents: Record<GameType, ComponentType> = {
  azul: AzulRules,
  petitsChevaux: PetitsChevauxRules,
  burkutBori: BurkutBoriRules,
  memory: MemoryRules,
  toguzKorgool: ToguzKorgoolRules,
  backgammon: BackgammonRules,
};

interface RulesModalProps {
  gameType: GameType;
  open: boolean;
  onClose: () => void;
}

export default function RulesModal({ gameType, open, onClose }: RulesModalProps) {
  const t = useTranslations('rules');
  const Content = rulesComponents[gameType];

  return (
    <Modal open={open} onClose={onClose} title={t(`${gameType}.title`)} className="max-w-lg">
      <Content />
    </Modal>
  );
}
