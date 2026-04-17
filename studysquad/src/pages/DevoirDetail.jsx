import { useEffect, useState, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { Icon } from '@iconify/react'
import { Worker, Viewer } from '@react-pdf-viewer/core'
import { defaultLayoutPlugin } from '@react-pdf-viewer/default-layout'
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import DashboardLayout from '../components/layout/DashboardLayout'
import { useAuth } from '../hooks/useAuth'
import { useDevoirs } from '../hooks/useDevoirs'
import '@react-pdf-viewer/core/lib/styles/index.css'
import '@react-pdf-viewer/default-layout/lib/styles/index.css'
import { playBye, playSongBG, playTyping } from '@/services/soundManager'

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
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const { loading, devoirs, members, memberById, groupById, formatDateFR } = useDevoirs()

  const [selectedDevoirId, setSelectedDevoirId] = useState('')
  const [activeQuestionId, setActiveQuestionId] = useState('q1')
  const [answerStore, setAnswerStore] = useState(() => readAnswersStorage())

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

  const questions = buildQuestions(selectedDevoir)

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

  const connectedUsers = (() => {
    if (!selectedDevoir?.group_id || !selectedGroup) return []

    const rawUsers = [selectedMember, members.find((member) => String(member.id) === String(selectedGroup.created_by))].filter(
      Boolean,
    )

    const uniqueById = new Map(rawUsers.map((member) => [String(member.id), member]))
    return Array.from(uniqueById.values())
  })()
  

  const handleLogout = async () => {

    playBye();
    logout()
    navigate('/')
}

useEffect(() => {
  if (!editor) return

  let last = 0

  const handleUpdate = () => {
    const now = Date.now()

    // anti spam (évite son à chaque lettre trop violent)
    if (now - last < 80) return
    last = now
    playSongBG()
    playTyping()
  }

  editor.on('update', handleUpdate)

  return () => {
    editor.off('update', handleUpdate)
  }
}, [editor])



  return (
    <DashboardLayout
      userName={`${user?.name} (${user?.role || 'etudiant'})`}
      roleLabel="Dashboard Etudiant"
      userRole={user?.role}
      onLogout={handleLogout}
    >
      <div className="w-full flex-1 px-4 py-6 sm:px-6 lg:px-8">
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
            <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <article className="rounded-2xl border border-white/10 bg-[#0f0f12] p-3">
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
              </article>

              <article className="rounded-2xl border border-white/10 bg-[#0f0f12] p-3">
                <div className="mb-3 rounded-xl border border-white/10 bg-white/5 p-3">
                  <h2 className="text-sm font-semibold uppercase tracking-wide text-white/75">Réponses collaboratives</h2>
                  <p className="mt-1 text-sm text-white/65">
                    Structurez vos réponses question par question. Sauvegarde locale automatique.
                  </p>
                </div>

                <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-3">
                  {questions.map((question) => (
                    <button
                      key={question.id}
                      type="button"
                      onClick={() => setActiveQuestionId(question.id)}
                      className={
                        'rounded-xl border px-3 py-2 text-left transition ' +
                        (activeQuestionId === question.id
                          ? 'border-brand-red/70 bg-brand-red/15 text-white'
                          : 'border-white/10 bg-white/5 text-white/80 hover:border-white/30')
                      }
                    >
                      <p className="text-sm font-semibold">{question.title}</p>
                      <p className="text-xs text-white/65">{question.subtitle}</p>
                    </button>
                  ))}
                </div>

                {activeQuestion ? (
                  <div className="mb-3 rounded-xl border border-white/10 bg-black/30 p-3">
                    <h3 className="text-base font-semibold text-white">{activeQuestion.title}</h3>
                    <p className="mt-1 text-sm text-white/70">{activeQuestion.prompt}</p>
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

                  <div 
                  id="editor-area"
                  className="max-h-[40vh] overflow-y-auto px-4 py-3">
                    <EditorContent editor={editor} />
                  </div>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3 text-xs text-white/65">
                  <p>
                    Collaboration temps réel (Yjs): non activée pour l&apos;instant. La structure est prête pour brancher un provider
                    ensuite.
                  </p>
                </div>

                <div className="mt-3 rounded-xl border border-white/10 bg-black/30 p-3">
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
      </div>
    </DashboardLayout>
  )
}
