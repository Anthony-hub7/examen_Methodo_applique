import { useEffect } from 'react'
import { usePosts } from '../../hooks/usePosts'
import PostComposer from './PostComposer'
import PostList from './PostList'

export default function PostsWidget() {
  const { posts, refresh } = usePosts()

  useEffect(() => {
    refresh({ includeInactive: false })
  }, [refresh])

  return (
    <section className="mt-6">
      <div className="mb-3">
        <p className="text-xs uppercase tracking-wide text-white/50">Communauté</p>
        <h3 className="mt-1 text-lg font-semibold">Posts (mock)</h3>
      </div>

      <div className="space-y-3">
        <PostComposer
          compact
          onCreated={() => {
            refresh({ includeInactive: false })
          }}
        />

        <PostList posts={posts} />
      </div>
    </section>
  )
}
