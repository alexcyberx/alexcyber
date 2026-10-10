import { redirect } from 'next/navigation';

// /u without an id: the list of players is the leaderboard.
export default function UsersIndex() {
  redirect('/leaderboard');
}
