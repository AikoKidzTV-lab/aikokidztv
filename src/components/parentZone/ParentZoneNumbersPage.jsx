import React from 'react';
import ParentZoneQuizPage from './ParentZoneQuizPage';
import {
  JUNIOR_NUMBERS_MILESTONE_SIZE,
  JUNIOR_NUMBERS_QUIZ_QUESTIONS,
} from '../../constants/juniorQuizzes';

export default function ParentZoneNumbersPage() {
  return (
    <ParentZoneQuizPage
      title="Numbers"
      description="30-question numbers test with Test Mode, milestone rewards, and final score bonus."
      quizEmoji="Numbers"
      variant="numbers"
      questions={JUNIOR_NUMBERS_QUIZ_QUESTIONS}
      milestoneSize={JUNIOR_NUMBERS_MILESTONE_SIZE}
    />
  );
}
