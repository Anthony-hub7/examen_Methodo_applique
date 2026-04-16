import PostBadge from '../ui/PostBadge'

function formatDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleString(undefined, { year: 'numeric', month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function PostItem({ post }) {
  const targetText =
    post?.target?.devoir ? post.target.devoir : post?.target?.groupe ? post.target.groupe : ''

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 flex items-center justify-between gap-2">
        <PostBadge type={post.type} />
        <span className="text-[11px] text-white/50">{formatDate(post.createdAt)}</span>
      </div>

      <div className="mb-1 text-sm font-semibold text-white/90">
        {post.author?.name || 'Anonyme'}
      </div>

      {targetText ? <div className="mb-2 text-xs text-white/70">Cible : {targetText}</div> : null}

      <p className="whitespace-pre-wrap text-sm text-white/80">{post.content}</p>
    </div>
  )
}

