import React from 'react';
import ParentZoneQuizPage from './ParentZoneQuizPage';
import {
  JUNIOR_LAW_MILESTONE_SIZE,
  JUNIOR_LAW_QUIZ_QUESTIONS,
} from '../../constants/juniorQuizzes';

export default function ParentZoneJuniorLawPage() {
  return (
    <ParentZoneQuizPage
      title="Junior Law & Rights"
      description="80-question interactive law and rights test with milestone rewards and final result bonus."
      quizEmoji="Law"
      variant="law"
      questions={JUNIOR_LAW_QUIZ_QUESTIONS}
      milestoneSize={JUNIOR_LAW_MILESTONE_SIZE}
    />
  );
}
