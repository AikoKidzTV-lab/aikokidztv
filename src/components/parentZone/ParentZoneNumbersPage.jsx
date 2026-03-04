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
      description="100-question numbers test with counting patterns, basic math, and milestone gem rewards."
      quizEmoji="Numbers"
      variant="numbers"
      questions={JUNIOR_NUMBERS_QUIZ_QUESTIONS}
      milestoneSize={JUNIOR_NUMBERS_MILESTONE_SIZE}
    />
  );
}
