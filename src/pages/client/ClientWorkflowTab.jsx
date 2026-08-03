import { memo, useMemo, useState } from 'react'
import { Link, useOutletContext } from 'react-router-dom'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  pointerWithin,
} from '@dnd-kit/core'
import { Loader2, AlertCircle, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import KanbanCard, { KanbanCardContent } from '@/components/KanbanCard'
import KanbanCardModal from '@/components/KanbanCardModal'
import ConfirmActionSheet from '@/components/ConfirmActionSheet'
import { useKanbanManagement } from '@/hooks/useKanbanManagement'
import { cn } from '@/lib/utils'

// Colunas fixas que o backend não aceita como destino de um move manual.
const LOCKED_FIXED_KEYS = ['AGENDADO', 'FINALIZADO']

function isLockedColumn(column) {
  return LOCKED_FIXED_KEYS.includes(column?.fixed_key)
}

// memo: durante o arrasto o dnd-kit atualiza o `isOver` a cada movimento do
// ponteiro. Sem memo, o componente pai re-renderiza todas as colunas (e todos
// os cards) a cada frame; com memo, só a coluna sob o cursor redesenha.
const KanbanColumn = memo(function KanbanColumn({ column, onOpenCard, onRequestDelete }) {
  const locked = isLockedColumn(column)
  // Só essa coluna fixa tem retenção por tempo — o backend já filtra
  // GET /kanban pra devolver aqui só posts concluídos nos últimos 15 dias.
  const isFinalizado = column.fixed_key === 'FINALIZADO'
  // `data` memoizado: um objeto literal novo a cada render invalidaria o
  // cache interno do dnd-kit para este droppable.
  const droppableData = useMemo(() => ({ locked }), [locked])
  const { setNodeRef, isOver } = useDroppable({
    id: `column-${column.id}`,
    data: droppableData,
  })

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-semibold text-foreground">{column.name}</h3>
        <div className="flex items-center gap-1">
          <span className="text-xs text-muted-foreground">{column.posts.length}</span>
          {!column.is_fixed && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => onRequestDelete(column)}
              aria-label={`Excluir coluna ${column.name}`}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {isFinalizado && (
        <p className="-mt-2 text-xs text-muted-foreground">
          Mostra só os últimos 15 dias — histórico completo no{' '}
          <Link to="/feed" className="underline underline-offset-2 hover:text-foreground">
            Feed
          </Link>
          .
        </p>
      )}

      <div
        ref={setNodeRef}
        className={cn(
          'flex flex-col gap-2 rounded-lg bg-muted/40 p-2 min-h-24 transition-colors',
          isOver && locked && 'bg-destructive/10 ring-2 ring-destructive/40',
          isOver && !locked && 'bg-accent/40 ring-2 ring-ring/40'
        )}
      >
        {column.posts.length === 0 ? (
          <p className="py-6 text-center text-xs text-muted-foreground">
            {isFinalizado
              ? 'Nenhum post finalizado nos últimos 15 dias'
              : locked
                ? 'Preenchido automaticamente'
                : 'Nenhum post'}
          </p>
        ) : (
          column.posts.map((post) => (
            <KanbanCard key={post.id} post={post} onOpen={onOpenCard} dragDisabled={locked} />
          ))
        )}
      </div>
    </div>
  )
})

function ClientWorkflowTab() {
  const { clientId } = useOutletContext()
  const {
    columns,
    status,
    error,
    creatingColumn,
    deletingColumnId,
    updatingCaptionPostId,
    updatingMediaPostId,
    cancellingScheduleId,
    changingScheduleDateId,
    deletingPostId,
    publishingPostId,
    schedulingPostId,
    addColumn,
    removeColumn,
    moveCard,
    updateCaptionAction,
    updateDraftMediaAction,
    removeDraftMediaAction,
    changeScheduleDateAction,
    cancelScheduleAction,
    deletePostAction,
    publishPostAction,
    scheduleDraftAction,
    refetch,
  } = useKanbanManagement(clientId)

  const [selectedPost, setSelectedPost] = useState(null)
  const [newColumnName, setNewColumnName] = useState('')
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [activePost, setActivePost] = useState(null)

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 8 } }))

  const handleDragStart = (event) => {
    const dragged = columns
      .flatMap((c) => c.posts)
      .find((p) => String(p.id) === String(event.active.id))
    setActivePost(dragged ?? null)
  }

  const handleDragEnd = (event) => {
    setActivePost(null)
    const { active, over } = event
    if (!over) return

    // Só as colunas são droppables, então `over.id` é sempre `column-<id>`.
    // Ids são comparados como string: o do card vem numérico da API.
    const overId = String(over.id)
    if (!overId.startsWith('column-')) return
    const destColumnId = overId.replace('column-', '')

    const sourceColumn = columns.find((c) =>
      c.posts.some((p) => String(p.id) === String(active.id))
    )
    if (!sourceColumn) return
    if (String(sourceColumn.id) === String(destColumnId)) return

    // Bloqueio antecipado só de UX — o backend é a fonte de verdade e `moveCard`
    // reverte o estado otimista se a API recusar de qualquer forma.
    const destColumn = columns.find((c) => String(c.id) === String(destColumnId))
    if (isLockedColumn(destColumn)) return

    moveCard(active.id, destColumnId)
  }

  const handleCreateColumn = async (e) => {
    e.preventDefault()
    const name = newColumnName.trim()
    if (!name) return
    const ok = await addColumn(name)
    if (ok) setNewColumnName('')
  }

  const handleCancelSchedule = async (postId) => {
    const ok = await cancelScheduleAction(postId)
    // O post volta a ser rascunho e muda de coluna — fecha pra ver o quadro atualizado.
    if (ok) setSelectedPost(null)
    return ok
  }

  const handleDeletePost = async (postId) => {
    const ok = await deletePostAction(postId)
    // O post deixa de existir, então fecha o modal junto.
    if (ok) setSelectedPost(null)
    return ok
  }

  const handlePublish = async (postId) => {
    const ok = await publishPostAction(postId)
    // O post sai de DRAFT e muda de coluna — fecha e deixa o quadro atualizado à vista.
    if (ok) setSelectedPost(null)
    return ok
  }

  const handleSchedule = async (postId, scheduledFor) => {
    const ok = await scheduleDraftAction(postId, scheduledFor)
    // O backend move o card pra Agendado sozinho — fecha o modal pra ver o quadro atualizado.
    if (ok) setSelectedPost(null)
    return ok
  }

  // `selectedPost` é só o snapshot de qual card foi clicado; o que o modal exibe
  // vem sempre de `columns`, pra refletir edições sem sincronizar nada à mão.
  const openPost = selectedPost
    ? columns.flatMap((c) => c.posts).find((p) => String(p.id) === String(selectedPost.id)) ??
      selectedPost
    : null

  if (status === 'loading' && columns.length === 0) {
    return (
      <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Carregando quadro...
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex flex-col items-center gap-3 py-16 text-center">
        <AlertCircle className="h-6 w-6 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <button
          type="button"
          onClick={refetch}
          className="text-sm font-medium text-primary underline underline-offset-4"
        >
          Tentar novamente
        </button>
      </div>
    )
  }

  return (
    <div>
      <form onSubmit={handleCreateColumn} className="mb-4 flex items-center justify-end gap-2">
        <Input
          value={newColumnName}
          onChange={(e) => setNewColumnName(e.target.value)}
          placeholder="Nome da nova coluna"
          className="w-56"
          disabled={creatingColumn}
        />
        <Button type="submit" disabled={creatingColumn || !newColumnName.trim()}>
          {creatingColumn ? (
            <Loader2 className="h-4 w-4 animate-spin shrink-0" />
          ) : (
            <Plus className="h-4 w-4 shrink-0" />
          )}
          Nova coluna
        </Button>
      </form>

      {/* pointerWithin: com o card seguindo o cursor via DragOverlay, a coluna
          sob o ponteiro é o alvo correto — o padrão (rectIntersection) mede
          sobreposição de área e dispara alvos vizinhos com o card grande. */}
      <DndContext
        sensors={sensors}
        collisionDetection={pointerWithin}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
        onDragCancel={() => setActivePost(null)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              onOpenCard={setSelectedPost}
              onRequestDelete={setDeleteTarget}
            />
          ))}
        </div>

        <DragOverlay dropAnimation={null}>
          {activePost ? (
            <div className="cursor-grabbing rotate-2 opacity-95 shadow-xl">
              <KanbanCardContent post={activePost} />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <KanbanCardModal
        open={selectedPost !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedPost(null)
        }}
        post={openPost}
        clientId={clientId}
        onUpdateCaption={updateCaptionAction}
        onUpdateMedia={updateDraftMediaAction}
        onRemoveMedia={removeDraftMediaAction}
        onChangeScheduleDate={changeScheduleDateAction}
        onCancelSchedule={handleCancelSchedule}
        onDeletePost={handleDeletePost}
        onPublish={handlePublish}
        onSchedule={handleSchedule}
        isUpdatingCaption={updatingCaptionPostId === openPost?.id}
        isUpdatingMedia={updatingMediaPostId === openPost?.id}
        isChangingScheduleDate={changingScheduleDateId === openPost?.id}
        isCancellingSchedule={cancellingScheduleId === openPost?.id}
        isDeletingPost={deletingPostId === openPost?.id}
        isPublishing={publishingPostId === openPost?.id}
        isScheduling={schedulingPostId === openPost?.id}
      />

      <ConfirmActionSheet
        open={deleteTarget !== null}
        onOpenChange={(open) => {
          if (!open) setDeleteTarget(null)
        }}
        title="Excluir coluna"
        description={
          deleteTarget
            ? `A coluna "${deleteTarget.name}" será excluída e ${deleteTarget.posts.length} post(s) serão movidos para Ideias.`
            : undefined
        }
        confirmText="Excluir"
        loadingText="Excluindo..."
        isLoading={deletingColumnId === deleteTarget?.id}
        onConfirm={() => removeColumn(deleteTarget.id)}
        variant="destructive"
      />
    </div>
  )
}

export default ClientWorkflowTab
