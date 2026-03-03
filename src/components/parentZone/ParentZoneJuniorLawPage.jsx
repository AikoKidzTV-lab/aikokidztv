import React from 'react';
import ParentZoneQuizPage from './ParentZoneQuizPage';
import { JUNIOR_LAW_QUIZ_QUESTIONS } from '../../constants/juniorQuizzes';

export default function ParentZoneJuniorLawPage() {
  return (
    <ParentZoneQuizPage
      title="Junior Law & Rights"
      description="30-question interactive quiz on safety, rights, and civic basics for kids."
      quizEmoji="⚖️"
      variant="law"
      questions={JUNIOR_LAW_QUIZ_QUESTIONS}
      rewardKey="parent_zone_junior_law_rights_quiz_50"
    />
  );
}
