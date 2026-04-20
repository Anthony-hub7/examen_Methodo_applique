import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../hooks/useAuth'
import { useDevoirs } from '../hooks/useDevoirs'
import { useGroupChat } from '../hooks/useGroupChat'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import StudentDevoirManager from '@/components/devoirs/StudentDevoirManager'

const ANSWERS_STORAGE_KEY = 'studysquad_student_devoir_answers'
const PDF_WORKER_URL = 'https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js'

function readAnswersStorage() {
  const raw = localStorage.getItem(ANSWERS_STORAGE_KEY)
  if (!raw) return {}
  try {
    const parsed = JSON.parse(raw)
    return parsed && typeof parsed === 'object' ? parsed : {}
  } catch {
    return {}
  }
}

function writeAnswersStorage(nextValue) {
  localStorage.setItem(ANSWERS_STORAGE_KEY, JSON.stringify(nextValue))
}

function isPdfAttachment(attachment) {
  const type = String(attachment?.type || '').toLowerCase()
  const name = String(attachment?.name || '').toLowerCase()
  return type.includes('pdf') || name.endsWith('.pdf')
}

function buildQuestions(devoir) {
  const sujet = String(devoir?.sujet || '').trim()

  return [
    {
      id: 'q1',
      title: 'Question 1',
      subtitle: 'Compréhension du sujet',
      prompt: sujet
        ? `Expliquez l’objectif principal du sujet: "${sujet}".`
        : 'Expliquez l’objectif principal du sujet.',
    },
    {
      id: 'q2',
      title: 'Question 2',
      subtitle: 'Analyse',
      prompt: 'Présentez votre raisonnement, les notions utilisées et les étapes clés.',
    },
    {
      id: 'q3',
      title: 'Question 3',
      subtitle: 'Conclusion',
      prompt: 'Proposez une conclusion claire et une auto-évaluation de votre réponse.',
    },
  ]
}

function firstLetterAvatar(name) {
  return String(name || '?').trim().charAt(0).toUpperCase() || '?'
}

function formatDateTimeFR(value) {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleString('fr-FR', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function RichToolbarButton({ active, icon, label, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={
        'inline-flex h-9 w-9 items-center justify-center rounded-lg border text-sm transition ' +
        (active
          ? 'border-brand-red/70 bg-brand-red/20 text-white'
          : 'border-white/15 bg-white/5 text-white/80 hover:border-white/35 hover:text-white')
      }
      aria-label={label}
      title={label}
    >
      <Icon icon={icon} width={16} />
    </button>
  )
}

export default function DevoirDetail() {
  const [view, setView] = useState('list')
  // const [extraQuestions, setExtraQuestions] = useState([])
  const [extraQuestionsStore, setExtraQuestionsStore] = useState(() => {
    const raw = localStorage.getItem('extra_questions_store')
    return raw ? JSON.parse(raw) : {}
  })
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { loading, devoirs, members, memberById, groupById, formatDateFR } = useDevoirs()

  const [selectedDevoirId, setSelectedDevoirId] = useState('')
  const [activeQuestionId, setActiveQuestionId] = useState('q1')
  const [answerStore, setAnswerStore] = useState(() => readAnswersStorage())
  const [chatDraft, setChatDraft] = useState('')
  const chatListRef = useRef(null)

  const defaultLayoutPluginInstance = defaultLayoutPlugin()

  const availableDevoirs = (() => {
    const matchesMember = (member) => {
      const sameEmail =
        String(member.email || '').toLowerCase() &&
        String(member.email || '').toLowerCase() === String(user?.email || '').toLowerCase()
      const sameName = String(member.name || '').toLowerCase() === String(user?.name || '').toLowerCase()
      return sameEmail || sameName
    }

    const hasLocalMemberMatch = members.some(matchesMember)
    if (!hasLocalMemberMatch) return devoirs

    const matchingMemberIds = members.filter(matchesMember).map((member) => String(member.id))
    return devoirs.filter((devoir) => matchingMemberIds.includes(String(devoir.member_id)))
  })()

  useEffect(() => {
    if (!availableDevoirs.length) {
      setSelectedDevoirId('')
      return
    }

    const hasSelected = availableDevoirs.some((devoir) => String(devoir.id) === String(selectedDevoirId))
    if (!hasSelected) setSelectedDevoirId(String(availableDevoirs[0].id))
  }, [availableDevoirs, selectedDevoirId])

  const selectedDevoir = availableDevoirs.find((devoir) => String(devoir.id) === String(selectedDevoirId)) || null

  // const questions = buildQuestions(selectedDevoir)
  // const questions = [...buildQuestions(selectedDevoir), ...extraQuestions]

  const extraQuestions = selectedDevoir
  ? extraQuestionsStore[String(selectedDevoir.id)] || []
  : []

const questions = [...buildQuestions(selectedDevoir), ...extraQuestions]

  useEffect(() => {
    if (!questions.some((question) => question.id === activeQuestionId)) {
      setActiveQuestionId(questions[0]?.id || 'q1')
    }
  }, [questions, activeQuestionId])

  const activeQuestion = questions.find((question) => question.id === activeQuestionId) || questions[0] || null

  const answersForCurrentDevoir = selectedDevoir ? answerStore[String(selectedDevoir.id)] || {} : {}

  const currentAnswerHtml = activeQuestion ? answersForCurrentDevoir[activeQuestion.id] || '<p></p>' : '<p></p>'

  const editor = useEditor({
    extensions: [StarterKit],
    content: currentAnswerHtml,
    editorProps: {
      attributes: {
        class:
          'prose prose-invert max-w-none min-h-[280px] focus:outline-none text-[15px] leading-7 text-white/90',
      },
    },
    onUpdate: ({ editor: editorInstance }) => {
      if (!selectedDevoir || !activeQuestion) return
      const nextContent = editorInstance.getHTML()
      setAnswerStore((prev) => {
        const next = {
          ...prev,
          [String(selectedDevoir.id)]: {
            ...(prev[String(selectedDevoir.id)] || {}),
            [activeQuestion.id]: nextContent,
          },
        }
        writeAnswersStorage(next)
        return next
      })
    },
  })

  useEffect(() => {
    if (!editor) return
    const currentEditorContent = editor.getHTML()
    if (currentEditorContent !== currentAnswerHtml) {
      editor.commands.setContent(currentAnswerHtml, false)
    }
  }, [editor, currentAnswerHtml, activeQuestionId, selectedDevoirId])

  const selectedPdfAttachment = selectedDevoir?.attachments?.find((attachment) => isPdfAttachment(attachment)) || null
  const pdfFileUrl = selectedPdfAttachment?.data_url || '/sample-sujet.pdf'

  const selectedGroup = selectedDevoir?.group_id ? groupById.get(selectedDevoir.group_id) : null
  const selectedMember = selectedDevoir?.member_id ? memberById.get(selectedDevoir.member_id) : null
  const currentMember =
    members.find(
      (member) =>
        String(member.email || '').toLowerCase() === String(user?.email || '').toLowerCase() ||
        String(member.name || '').toLowerCase() === String(user?.name || '').toLowerCase(),
    ) || selectedMember || null

  const { messages: groupMessages, loading: chatLoading, sending: chatSending, error: chatError, sendMessage } = useGroupChat({
    groupId: selectedGroup?.id || '',
    memberId: currentMember?.id || '',
  })

  const connectedUsers = (() => {
    if (!selectedDevoir?.group_id || !selectedGroup) return []

    const rawUsers = members.filter((member) => {
      const participatesInDevoirGroup = String(selectedDevoir.group_id) === String(selectedGroup.id)
      const ownsSelectedDevoir = String(member.id) === String(selectedDevoir.member_id)
      const createdGroup = String(member.id) === String(selectedGroup.created_by)
      const wroteInChat = groupMessages.some((message) => String(message.member_id) === String(member.id))
      return participatesInDevoirGroup && (ownsSelectedDevoir || createdGroup || wroteInChat)
    })

    const uniqueById = new Map(rawUsers.map((member) => [String(member.id), member]))
    return Array.from(uniqueById.values())
  })()

  useEffect(() => {
    if (!chatListRef.current) return
    chatListRef.current.scrollTop = chatListRef.current.scrollHeight
  }, [groupMessages, selectedGroup?.id])

  const handleSendChatMessage = async (event) => {
    event.preventDefault()
    const didSend = await sendMessage(chatDraft)
    if (didSend) setChatDraft('')
  }

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  const addQuestion = () => {
  if (!selectedDevoir) return

  const newQuestion = {
    id: 'q_extra_' + Date.now(),
    title: `Question ${questions.length + 1}`,
    subtitle: 'Nouvelle question',
    prompt: 'Ecris ta question ici...',
  }

  setExtraQuestionsStore((prev) => {
    const devoirId = String(selectedDevoir.id)

    const updated = {
      ...prev,
      [devoirId]: [...(prev[devoirId] || []), newQuestion],
    }

    localStorage.setItem('extra_questions_store', JSON.stringify(updated))
    return updated
  })
}

 const deleteQuestion = (id) => {
  if (!selectedDevoir) return

  setExtraQuestionsStore((prev) => {
    const devoirId = String(selectedDevoir.id)

    const updated = {
      ...prev,
      [devoirId]: (prev[devoirId] || []).filter((q) => q.id !== id),
    }

    localStorage.setItem('extra_questions_store', JSON.stringify(updated))
    return updated
  })

  if (activeQuestionId === id) {
    setActiveQuestionId('q1')
  }
}
  return (
    <DashboardLayout
      userName={`${user?.name} (${user?.role || 'etudiant'})`}
      roleLabel="Dashboard Etudiant"
      userRole={user?.role}
      onLogout={handleLogout}
    >
      <div className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mt-4 flex gap-2">
          {[
            {
              key: 'list',
              label: 'DEVOIRS',
              icon: 'solar:document-text-bold',
              subtitle: '',
            },
            {
              key: 'create',
              label: 'CRÉER',
              icon: 'solar:add-circle-bold',
              subtitle: '',
            },
          ].map((item) => {
            const active = view === item.key

            return (
              <button
                key={item.key}
                onClick={() => setView(item.key)}
                className={[
                  'group relative flex flex-1 items-center gap-3 rounded-2xl px-3 py-3 transition-all duration-200',
                  active
                    ? 'bg-brand-red/[0.08] text-white'
                    : 'bg-white/[0.02] text-white/60 hover:bg-white/[0.04] hover:text-white/90',
                ].join(' ')}
              >
                {/* ICON BOX */}
                <div
                  className={[
                    'flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-200',
                    active
                      ? 'text-brand-red'
                      : 'text-white/50 group-hover:text-white/80',
                  ].join(' ')}
                  style={
                    active
                      ? {
                          background:
                            'linear-gradient(135deg, rgba(223,37,49,0.2), rgba(223,37,49,0.05))',
                          border: '1px solid rgba(223,37,49,0.2)',
                          boxShadow: '0 0 16px rgba(223,37,49,0.15)',
                        }
                      : {
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                        }
                  }
                >
                  <Icon icon={item.icon} width={20} />
                </div>

                <div className="flex flex-1 flex-col items-center justify-center text-center">
                  <div className="text-xs font-semibold tracking-[0.2em]">
                    {item.label}
                  </div>
                  <div className="text-[11px] text-white/30 leading-tight">
                    {item.subtitle}
                  </div>
                </div>

                {/* ACTIVE DOT / INDICATOR */}
                {active && (
                  <span className="absolute right-3 h-2 w-2 rounded-full bg-brand-red shadow-[0_0_10px_rgba(223,37,49,0.6)]" />
                )}
              </button>
            )
          })}
        </div>
      <br/>
      {view === 'list' && (
        <div className="mx-auto flex w-full max-w-[1600px] flex-col gap-4">
          <section className="rounded-2xl border border-white/10 bg-[#101012] p-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <div>
                <h1 className="text-xl font-bold text-white">Espace Devoir</h1>
                <p className="mt-1 text-sm text-white/65">
                  Travaillez le sujet en lecture PDF à gauche et rédigez vos réponses structurées à droite.
                </p>
              </div>

              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                <label className="text-xs font-semibold uppercase tracking-wide text-white/60" htmlFor="devoir-selector">
                  Devoir actif
                </label>
                <select
                  id="devoir-selector"
                  value={selectedDevoirId}
                  onChange={(event) => setSelectedDevoirId(event.target.value)}
                  className="rounded-xl border border-white/15 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-brand-red/60"
                >
                  {availableDevoirs.map((devoir) => (
                    <option key={devoir.id} value={devoir.id}>
                      {devoir.titre}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </section>

          {loading ? (
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              Chargement des devoirs...
            </section>
          ) : null}

          {!loading && !availableDevoirs.length ? (
            <section className="rounded-2xl border border-white/10 bg-white/5 p-6 text-sm text-white/70">
              Aucun devoir n&apos;est disponible pour le moment.
            </section>
          ) : null}

          {!loading && selectedDevoir ? (
            <section className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,0.85fr)]">
              <article className="flex min-h-0 flex-col gap-3 rounded-2xl border border-white/10 bg-[#0f0f12] p-3">
                <div className="mb-3 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                  <div className="min-w-0">
                    <h2 className="truncate text-sm font-semibold uppercase tracking-wide text-white/75">Sujet PDF</h2>
                    <p className="truncate text-base font-semibold text-white">{selectedDevoir.titre}</p>
                  </div>
                  <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/70">
                    Deadline: {formatDateFR(selectedDevoir.deadline)}
                  </span>
                </div>

                <div className="h-[65vh] overflow-hidden rounded-xl border border-white/10 bg-[#191a1f]">
                  <Worker workerUrl={PDF_WORKER_URL}>
                    <Viewer fileUrl={pdfFileUrl} plugins={[defaultLayoutPluginInstance]} />
                  </Worker>
                </div>

                <div className="flex min-h-0 flex-1 flex-col rounded-xl border border-white/10 bg-black/30 p-3">
                  <div className="flex items-start justify-between gap-3 border-b border-white/10 pb-3">
                    <div>
                      <h3 className="text-sm font-semibold text-white/90">Chat du devoir en groupe</h3>
                      <p className="mt-1 text-xs text-white/65">
                        {selectedGroup
                          ? `Discussion du groupe ${selectedGroup.name} autour du devoir actif.`
                          : 'Le chat est reserve aux devoirs rattaches a un groupe.'}
                      </p>
                    </div>
                    {selectedGroup ? (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] text-white/70">
                        {groupMessages.length} message{groupMessages.length > 1 ? 's' : ''}
                      </span>
                    ) : null}
                  </div>

                  {!selectedGroup ? (
                    <div className="mt-3 rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-4 py-5 text-sm text-white/60">
                      Ce devoir est en mode solo. Pour activer le chat et la collaboration, associez ce devoir à un groupe.
                    </div>
                  ) : (
                    <>
                      <div
                        ref={chatListRef}
                        className="mt-3 flex max-h-[32vh] min-h-[260px] flex-1 flex-col gap-3 overflow-y-auto pr-1"
                      >
                        {chatLoading ? (
                          <p className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-4 text-sm text-white/60">
                            Chargement des messages...
                          </p>
                        ) : null}

                        {!chatLoading && groupMessages.length === 0 ? (
                          <p className="rounded-xl border border-dashed border-white/10 bg-white/[0.03] px-3 py-4 text-sm text-white/60">
                            Aucun message pour le moment. Lancez la discussion pour coordonner le travail du groupe.
                          </p>
                        ) : null}

                        {!chatLoading
                          ? groupMessages.map((message) => {
                              const author = memberById.get(message.member_id)
                              const isCurrentUser = String(message.member_id) === String(currentMember?.id)

                              return (
                                <div
                                  key={message.id}
                                  className={`max-w-[88%] rounded-2xl border px-3 py-2 ${
                                    isCurrentUser
                                      ? 'ml-auto border-brand-red/30 bg-brand-red/15'
                                      : 'border-white/10 bg-white/[0.04]'
                                  }`}
                                >
                                  <div className="mb-1 flex items-center gap-2">
                                    <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold text-white">
                                      {firstLetterAvatar(author?.name)}
                                    </span>
                                    <span className="text-xs font-semibold text-white/90">
                                      {author?.name || 'Membre inconnu'}
                                    </span>
                                    <span className="text-[11px] text-white/45">{formatDateTimeFR(message.created_at)}</span>
                                  </div>
                                  <p className="whitespace-pre-wrap text-sm leading-6 text-white/85">{message.message}</p>
                                </div>
                              )
                            })
                          : null}
                      </div>

                      <form onSubmit={handleSendChatMessage} className="mt-3 border-t border-white/10 pt-3">
                        <label htmlFor="group-chat-message" className="sr-only">
                          Message du groupe
                        </label>
                        <textarea
                          id="group-chat-message"
                          value={chatDraft}
                          onChange={(event) => setChatDraft(event.target.value)}
                          placeholder="Ecrivez un message pour repartir les taches, poser une question ou partager un avancement..."
                          rows={3}
                          disabled={chatSending || !currentMember}
                          className="w-full resize-none rounded-xl border border-white/10 bg-[#111217] px-3 py-3 text-sm text-white outline-none transition focus:border-brand-red/50 disabled:cursor-not-allowed disabled:opacity-60"
                        />

                        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <div className="text-xs text-white/55">
                            {currentMember
                              ? `Envoi en tant que ${currentMember.name}`
                              : "Aucun membre du groupe n'est associe a la session actuelle."}
                          </div>
                          <button
                            type="submit"
                            disabled={chatSending || !chatDraft.trim() || !currentMember}
                            className="inline-flex items-center justify-center rounded-xl bg-brand-red px-4 py-2 text-sm font-semibold text-white transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            {chatSending ? 'Envoi...' : 'Envoyer'}
                          </button>
                        </div>

                        {chatError ? <p className="mt-2 text-sm text-red-300">{chatError}</p> : null}
                      </form>
                    </>
                  )}
                </div>
              </article>

              <article className="flex min-h-0 flex-col gap-3 rounded-2xl border border-white/10 bg-[#0f0f12] p-3">
                <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-white/75">Réponses collaboratives</h2>
                  <p className="mt-1 text-sm text-white/65">
                    Structurez vos réponses question par question. Sauvegarde locale automatique.
                  </p>
                </div>

                <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
                  {questions.map((question) => {
                    const isExtra = question.id.startsWith('q_extra_')
                    const isActive = activeQuestionId === question.id

                    return (
                      <div
                        key={question.id}
                        className={`group relative rounded-xl border px-3 py-2 transition ${
                          isActive
                            ? 'border-brand-red/70 bg-brand-red/15 text-white'
                            : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30'
                        }`}
                      >
                        <button
                          type="button"
                          onClick={() => setActiveQuestionId(question.id)}
                          className="w-full text-left"
                        >
                          {/* <p className="text-sm font-semibold"> */}
                            <p className="text-xs font-semibold truncate">
                            {question.title}</p>
                          
                          {/* <p className="text-xs text-white/65">{question.subtitle}</p> */}
                          <p className="mt-3 text-[11px] text-white/65 line-clamp-2 break-words">{question.subtitle}</p>
                        </button>

                        {/* bouton delete visible que sur custom */}
                        {isExtra && (
                          <button
                            onClick={() => deleteQuestion(question.id)}
                            className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-600"
                          >
                            <Icon icon="solar:trash-bin-trash-bold" width={16} />
                          </button>
                        )}
                      </div>
                    )
                  })}

                  {/* bouton add */}
                  <button
                    type="button"
                    onClick={addQuestion}
                    className="flex items-center justify-center rounded-xl border border-dashed border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                  >
                    <Icon icon="solar:add-circle-bold" width={20} />
                  </button>
                </div>

                {activeQuestion ? (
                  <div className="mb-3 rounded-xl border border-white/10 bg-black/30 p-3">
                    
                    {activeQuestion.id.startsWith('q_extra_') ? (
                      <>
                        {/* titre éditable mais même style */}
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            setExtraQuestionsStore((prev) => {
                              const devoirId = String(selectedDevoir.id)

                              const updated = {
                                ...prev,
                                [devoirId]: (prev[devoirId] || []).map((q) =>
                                  q.id === activeQuestion.id
                                    ? { ...q, title: e.target.innerText }
                                    : q
                                ),
                              }

                              localStorage.setItem('extra_questions_store', JSON.stringify(updated))
                              return updated
                            })
                          }
                          className="text-base font-semibold text-white outline-none"
                        >
                          {activeQuestion.title}
                        </div>

                        {/* description éditable */}
                        <div
                          contentEditable
                          suppressContentEditableWarning
                          onBlur={(e) =>
                            setExtraQuestions((prev) =>
                              prev.map((q) =>
                                q.id === activeQuestion.id
                                  ? { ...q, prompt: e.target.innerText }
                                  : q
                              )
                            )
                          }
                          className="mt-1 text-sm text-white/70 outline-none"
                        >
                          {activeQuestion.prompt}
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 className="text-base font-semibold text-white">
                          {activeQuestion.title}
                        </h3>
                        <p className="mt-1 text-sm text-white/70">
                          {activeQuestion.prompt}
                        </p>
                      </>
                    )}
                    
                  </div>
                ) : null}

                <div className="rounded-xl border border-white/10 bg-[#121318]">
                  <div className="flex flex-wrap gap-2 border-b border-white/10 px-3 py-2">
                    <RichToolbarButton
                      active={editor?.isActive('bold')}
                      icon="solar:text-bold-bold"
                      label="Gras"
                      onClick={() => editor?.chain().focus().toggleBold().run()}
                    />
                    <RichToolbarButton
                      active={editor?.isActive('italic')}
                      icon="solar:text-italic-bold"
                      label="Italique"
                      onClick={() => editor?.chain().focus().toggleItalic().run()}
                    />
                    <RichToolbarButton
                      active={editor?.isActive('bulletList')}
                      icon="solar:list-bold"
                      label="Liste"
                      onClick={() => editor?.chain().focus().toggleBulletList().run()}
                    />
                    <RichToolbarButton
                      active={editor?.isActive('orderedList')}
                      icon="solar:list-check-bold"
                      label="Liste numérotée"
                      onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                    />
                    <RichToolbarButton
                      active={editor?.isActive('heading', { level: 2 })}
                      icon="solar:text-bold-square-bold"
                      label="Titre"
                      onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
                    />
                    <RichToolbarButton
                      active={false}
                      icon="solar:refresh-bold"
                      label="Annuler"
                      onClick={() => editor?.chain().focus().undo().run()}
                    />
                    <RichToolbarButton
                      active={false}
                      icon="solar:redo-bold"
                      label="Rétablir"
                      onClick={() => editor?.chain().focus().redo().run()}
                    />
                  </div>

                  <div className="max-h-[40vh] overflow-y-auto px-4 py-3">
                    <EditorContent editor={editor} />
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/65">
                  <p>
                    Collaboration temps réel (Yjs): non activée pour l&apos;instant. La structure est prête pour brancher un provider
                    ensuite.
                  </p>
                </div>

                <div className="rounded-xl border border-white/10 bg-black/30 p-3">
                  <h3 className="text-sm font-semibold text-white/90">Utilisateurs connectés</h3>
                  {selectedGroup ? (
                    <>
                      <p className="mt-1 text-xs text-white/65">Groupe: {selectedGroup.name}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {connectedUsers.length > 0 ? (
                          connectedUsers.map((member) => (
                            <div
                              key={member.id}
                              className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-2 py-1"
                            >
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-brand-red/80 text-xs font-bold text-white">
                                {firstLetterAvatar(member.name)}
                              </span>
                              <span className="text-xs text-white/85">{member.name}</span>
                              <span className="h-2 w-2 rounded-full bg-green-400" />
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-white/65">Aucun utilisateur de groupe détecté.</p>
                        )}
                      </div>
                    </>
                  ) : (
                    <p className="mt-1 text-xs text-white/65">Mode solo: aucun utilisateur connecté à afficher.</p>
                  )}
                </div>

              </article>
            </section>
          ) : null}
        </div>
      )}
      {view === 'create' && (
        // <div className="rounded-2xl border border-white/10 bg-[#0f0f12] p-4 text-white">
          <StudentDevoirManager />
        // </div>
      )}
      </div>
    </DashboardLayout>
  )
}  
