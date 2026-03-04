import React from 'react';
import ParentZoneQuizPage from './ParentZoneQuizPage';
import {
  JUNIOR_LAW_MILESTONE_REWARD_GEMS,
  JUNIOR_LAW_MILESTONE_SIZE,
  JUNIOR_LAW_QUIZ_QUESTIONS,
} from '../../constants/juniorQuizzes';

export default function ParentZoneJuniorLawPage() {
  return (
    <ParentZoneQuizPage
      title="Junior Law & Rights"
      description="30-question interactive quiz on safety, rights, and civic basics for kids."
      quizEmoji="Law"
      variant="law"
      questions={JUNIOR_LAW_QUIZ_QUESTIONS}
      rewardMode="milestone_perfect"
      milestoneSize={JUNIOR_LAW_MILESTONE_SIZE}
      milestoneRewardGems={JUNIOR_LAW_MILESTONE_REWARD_GEMS}
      rewardKey="parent_zone_junior_law_rights_quiz_50"
    />
  );
}
