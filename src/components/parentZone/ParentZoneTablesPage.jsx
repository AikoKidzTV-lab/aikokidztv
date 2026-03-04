import React from 'react';
import ParentZoneQuizPage from './ParentZoneQuizPage';
import {
  JUNIOR_TABLES_MILESTONE_SIZE,
  JUNIOR_TABLES_QUIZ_QUESTIONS,
} from '../../constants/juniorQuizzes';

export default function ParentZoneTablesPage() {
  return (
    <ParentZoneQuizPage
      title="Tables"
      description="30-question multiplication tables test with Test Mode, milestone rewards, and final score bonus."
      quizEmoji="Tables"
      variant="tables"
      questions={JUNIOR_TABLES_QUIZ_QUESTIONS}
      milestoneSize={JUNIOR_TABLES_MILESTONE_SIZE}
    />
  );
}
