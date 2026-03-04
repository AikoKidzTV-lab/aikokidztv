import React from 'react';
import CharacterBioPageLayout from './CharacterBioPageLayout';

export default function MikoBioPage() {
  return (
    <CharacterBioPageLayout
      title="Miko Bio"
      emoji={'\u{1F9ED}'}
      description="Dedicated route for Miko Bio."
    />
  );
}
