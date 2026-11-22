import { createBrowserRouter, redirect } from 'react-router';
import { Layout } from './components/Layout';
import { CommunityFeed } from './components/CommunityFeed';
import { AthleteProfile } from './components/AthleteProfile';
import { ExerciseLibrary } from './components/ExerciseLibrary';
import { WorkoutBuilder } from './components/WorkoutBuilder';
import { LiveTracker } from './components/LiveTracker';
import { WorkoutSummary } from './components/WorkoutSummary';
import { History } from './components/History';
import { Profile } from './components/Profile';
import { PostDetail } from './components/PostDetail';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: CommunityFeed },
      { path: 'post/:postId', Component: PostDetail },
      { path: 'athlete/:userId', Component: AthleteProfile },
      { path: 'library', Component: ExerciseLibrary },
      { path: 'builder', Component: History },
      { path: 'builder/new', Component: WorkoutBuilder },
      { path: 'builder/:id/edit', Component: WorkoutBuilder },
      { path: 'workouts/:id/live', Component: LiveTracker },
      { path: 'workout/:sessionId/summary', Component: WorkoutSummary },
      { path: 'profile', Component: Profile },
      { path: '*', loader: () => redirect('/') },
    ],
  },
]);