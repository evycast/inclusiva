import { Suspense } from 'react';
import PostsListClient from './PostsListClient';

export default function PostsListPage() {
  return (
    <Suspense>
      <PostsListClient />
    </Suspense>
  );
}
