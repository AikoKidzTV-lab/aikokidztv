import React from 'react';
import ParentZoneQuizPage from './ParentZoneQuizPage';
import {
  JUNIOR_RIGHTS_MILESTONE_SIZE,
  JUNIOR_RIGHTS_QUIZ_QUESTIONS,
} from '../../constants/juniorQuizzes';

export default function ParentZoneJuniorRightsPage() {
  return (
    <ParentZoneQuizPage
      title="Junior Rights"
      description="100-question child rights quiz covering education, safety, equality, and expression."
      quizEmoji="Rights"
      variant="law"
      questions={JUNIOR_RIGHTS_QUIZ_QUESTIONS}
      milestoneSize={JUNIOR_RIGHTS_MILESTONE_SIZE}
    />
  );
}
