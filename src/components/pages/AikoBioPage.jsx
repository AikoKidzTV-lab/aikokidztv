import React from 'react';
import CharacterBioPageLayout from './CharacterBioPageLayout';
import { CHARACTER_PROFILE_BY_KEY } from '../../constants/characters';

export default function AikoBioPage() {
  return <CharacterBioPageLayout character={CHARACTER_PROFILE_BY_KEY.aiko} />;
}
