import { useMemo, useState } from 'react'
import { Icon } from '@iconify/react'
import { useDevoirs } from '../../hooks/useDevoirs'

function getNotificationTypeLabel(type) {
  if (type === 'reminder') return 'Rappel'
  if (type === 'assignment') return 'Attribution'
  if (type === 'update') return 'Mise a jour'
  if (type === 'attachment') return 'Fichier'
  if (type === 'delete') return 'Suppression'
  return 'Info'
}

function getNotificationTypeClass(type) {
  if (type === 'reminder') return 'border-amber-400/40 bg-amber-400/10 text-amber-100'
  if (type === 'assignment') return 'border-sky-400/40 bg-sky-400/10 text-sky-100'
  if (type === 'update') return 'border-brand-red/50 bg-brand-red/15 text-brand-red'
  if (type === 'attachment') return 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
  if (type === 'delete') return 'border-white/15 bg-white/5 text-white/75'
  return 'border-white/15 bg-white/5 text-white/75'
}

export default function AdminNotificationsManager() {
  const {
    error,
    notifications,
    remindersSent,
    memberById,
    devoirs,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    sendReminders,
  } = useDevoirs()

  const [filter, setFilter] = useState('toutes')

  const devoirById = useMemo(
    () => new Map(devoirs.map((devoir) => [String(devoir.id), devoir])),
    [devoirs],
  )

  const unreadCount = notifications.filter((notification) => !notification.is_read).length

  const filteredNotifications = useMemo(() => {
    if (filter === 'non_lues') {
      return notifications.filter((notification) => !notification.is_read)
    }
    return notifications
  }, [filter, notifications])

  return (
    <div className="dashboard-page-shell">
      <div className="dashboard-page-content">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-brand-red/75">Centre admin</p>
            <h2 className="mt-2 text-xl font-bold tracking-tight">Notifications</h2>
            <p className="mt-1 text-sm text-white/70">
              Suivi des rappels, affectations et mises a jour liees aux devoirs admin.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={sendReminders}
              className="inline-flex items-center gap-2 rounded-xl border border-brand-red/50 bg-brand-red/15 px-4 py-2 text-sm font-semibold text-white transition hover:border-brand-red/80 hover:bg-brand-red/25"
            >
              <Icon icon="solar:siren-bold" width={18} />
              Relancer avec rappels
            </button>
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              disabled={unreadCount === 0}
              className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm font-semibold text-white/85 transition hover:border-brand-red/60 hover:bg-brand-red/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Icon icon="solar:check-read-bold" width={18} />
              Tout marquer comme lu
            </button>
          </div>
        </div>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 p-3 text-sm text-red-100">{error}</div>
        ) : null}

        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="dashboard-panel p-4">
            <p className="text-xs uppercase tracking-wide text-white/55">Total notifications</p>
            <p className="mt-2 text-3xl font-bold text-white">{notifications.length}</p>
          </div>
          <div className="dashboard-panel p-4">
            <p className="text-xs uppercase tracking-wide text-white/55">Non lues</p>
            <p className="mt-2 text-3xl font-bold text-brand-red">{unreadCount}</p>
          </div>
          <div className="dashboard-panel p-4">
            <p className="text-xs uppercase tracking-wide text-white/55">Rappels envoyes</p>
            <p className="mt-2 text-3xl font-bold text-white">{remindersSent}</p>
          </div>
        </div>

        <div className="mb-4 flex flex-wrap items-center gap-2">
          <button
            type="button"
            onClick={() => setFilter('toutes')}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              filter === 'toutes'
                ? 'border-brand-red/60 bg-brand-red/20 text-white'
                : 'border-white/10 bg-white/5 text-white/75 hover:border-brand-red/40 hover:text-white'
            }`}
          >
            Toutes
          </button>
          <button
            type="button"
            onClick={() => setFilter('non_lues')}
            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
              filter === 'non_lues'
                ? 'border-brand-red/60 bg-brand-red/20 text-white'
                : 'border-white/10 bg-white/5 text-white/75 hover:border-brand-red/40 hover:text-white'
            }`}
          >
            Non lues
          </button>
        </div>

        <section className="dashboard-panel p-4">
          {filteredNotifications.length === 0 ? (
            <div className="dashboard-subpanel p-5 text-center text-sm text-white/70">
              Aucune notification a afficher pour ce filtre.
            </div>
          ) : (
            <ul className="space-y-3">
              {filteredNotifications.map((notification) => {
                const member = memberById.get(notification.user_id)
                const devoir = notification.devoir_id ? devoirById.get(String(notification.devoir_id)) : null

                return (
                  <li
                    key={notification.id ?? notification.created_at}
                    className="dashboard-subpanel flex flex-col gap-3 p-4 lg:flex-row lg:items-start lg:justify-between"
                  >
                    <div className="min-w-0">
                      <div className="mb-2 flex flex-wrap items-center gap-2">
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[11px] font-semibold ${getNotificationTypeClass(notification.type)}`}
                        >
                          {getNotificationTypeLabel(notification.type)}
                        </span>
                        <h3 className="text-sm font-semibold text-white/95">
                          {notification.title || 'Notification admin'}
                        </h3>
                        <span
                          className={
                            notification.is_read
                              ? 'rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/65'
                              : 'rounded-full border border-brand-red/50 bg-brand-red/15 px-3 py-1 text-[11px] font-semibold text-brand-red'
                          }
                        >
                          {notification.is_read ? 'Lu' : 'Non lu'}
                        </span>
                      </div>

                      <p className="text-sm text-white/75">{notification.content}</p>

                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/60">
                        <span>
                          <b className="text-white/80">Date:</b>{' '}
                          {new Date(notification.created_at).toLocaleString('fr-FR')}
                        </span>
                        <span>
                          <b className="text-white/80">Membre:</b> {member?.name || 'Admin'}
                        </span>
                        {devoir ? (
                          <span>
                            <b className="text-white/80">Devoir:</b> {devoir.titre}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      {!notification.is_read ? (
                        <button
                          type="button"
                          onClick={() => markNotificationAsRead(notification.id)}
                          className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white/85 transition hover:border-brand-red/60 hover:bg-brand-red/10"
                        >
                          <Icon icon="solar:eye-bold" width={16} />
                          Marquer lu
                        </button>
                      ) : null}

                      <button
                        type="button"
                        onClick={() => deleteNotification(notification.id)}
                        className="inline-flex items-center gap-2 rounded-xl border border-red-500/40 bg-red-500/10 px-3 py-2 text-xs font-semibold text-red-100 transition hover:bg-red-500/20"
                      >
                        <Icon icon="solar:trash-bin-trash-bold" width={16} />
                        Supprimer
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  )
}
