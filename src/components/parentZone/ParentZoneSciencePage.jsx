import React from 'react';
import ParentZoneQuizPage from './ParentZoneQuizPage';
import {
  JUNIOR_SCIENCE_MILESTONE_SIZE,
  JUNIOR_SCIENCE_QUIZ_QUESTIONS,
} from '../../constants/juniorQuizzes';

export default function ParentZoneSciencePage() {
  return (
    <ParentZoneQuizPage
      title="Junior Science"
      description="100-question interactive science quiz with single-card flow, instant feedback, and milestone gems."
      quizEmoji="Science"
      variant="science"
      questions={JUNIOR_SCIENCE_QUIZ_QUESTIONS}
      milestoneSize={JUNIOR_SCIENCE_MILESTONE_SIZE}
    />
  );
}
