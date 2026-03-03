import React from 'react';
import ParentZoneQuizPage from './ParentZoneQuizPage';
import { JUNIOR_SCIENCE_QUIZ_QUESTIONS } from '../../constants/juniorQuizzes';

export default function ParentZoneSciencePage() {
  return (
    <ParentZoneQuizPage
      title="Junior Science"
      description="30-question interactive science quiz with instant feedback for curious kids."
      quizEmoji="🔬"
      variant="science"
      questions={JUNIOR_SCIENCE_QUIZ_QUESTIONS}
      rewardKey="parent_zone_junior_science_quiz_50"
    />
  );
}
