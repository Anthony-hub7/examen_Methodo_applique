import PostItem from './PostItem'

export default function PostList({ posts }) {
  if (!posts || posts.length === 0) {
    return (
      <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-sm text-white/60">
        Aucun post pour le moment.
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {posts.slice(0, 5).map((post) => (
        <PostItem key={post.id} post={post} />
      ))}
    </div>
  )
}

