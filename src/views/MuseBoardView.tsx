import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { AnimatePresence } from 'framer-motion';
import * as m from 'framer-motion/m';
import {
  LayoutGrid, Plus, Trash2, X, Sparkles, User, ChevronLeft, Camera,
  Pencil, FolderInput, ImagePlus, StickyNote, Tag, Upload, Link2, Cpu,
} from 'lucide-react';
import { useMuseStore } from '@/store/museStore';
import type { SavedMuse, MuseType } from '@/types';
import { containerVariants, itemVariants } from '@/constants/animations';

const BOARD_ICONS = ['🎨', '💄', '✨', '🌸', '🔥', '💎', '🦋', '🌙'];

type ModalType = 'create-board' | 'edit-board' | 'muse-detail' | 'move-muse' | 'add-muse' | null;
type AddMuseTab = 'upload' | 'url' | 'scan';

const BoardFormModal = ({
  mode, boardName, boardIcon, onNameChange, onIconChange, onSubmit, onClose,
}: {
  mode: 'create' | 'edit';
  boardName: string;
  boardIcon: string;
  onNameChange: (v: string) => void;
  onIconChange: (v: string) => void;
  onSubmit: () => void;
  onClose: () => void;
}) => {
  const { t } = useTranslation();
  return (
  <m.div
    initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
    className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
    onClick={onClose}
  >
    <m.div
      initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
      onClick={(e) => e.stopPropagation()}
      className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative"
    >
      <button
        onClick={onClose}
        className="absolute top-6 right-6 p-2 text-gray-300 hover:text-black transition-colors"
      >
        <X size={20} />
      </button>

      <div className="text-center mb-10">
        <h2 className="text-3xl heading-font uppercase tracking-tight">
          {mode === 'create' ? t('muse.newBoard') : t('muse.editBoard')}
        </h2>
        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-3">
          {mode === 'create' ? t('muse.organizeCollection') : t('muse.updateBoardDetails')}
        </p>
      </div>

      <div className="space-y-6">
        <div className="space-y-1">
          <span className="text-[9px] font-black uppercase text-gray-400 ml-2" id="icon-label">{t('muse.icon')}</span>
          <div className="flex gap-2 flex-wrap" role="group" aria-labelledby="icon-label">
            {BOARD_ICONS.map((icon) => (
              <button
                key={icon}
                onClick={() => onIconChange(icon)}
                className={`w-12 h-12 rounded-2xl text-xl flex items-center justify-center transition-all ${
                  boardIcon === icon
                    ? 'bg-black text-white scale-110 shadow-lg'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                {icon}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <label htmlFor="board-name-input" className="text-[9px] font-black uppercase text-gray-400 ml-2">{t('muse.boardName')}</label>
          <input
            id="board-name-input"
            type="text"
            value={boardName}
            onChange={(e) => onNameChange(e.target.value)}
            placeholder={t('muse.boardPlaceholder')}
            maxLength={40}
            className="w-full bg-[#F9F9F9] rounded-2xl px-4 py-4 text-sm focus:ring-1 ring-black transition-all border-none"
            onKeyDown={(e) => e.key === 'Enter' && onSubmit()}
          />
        </div>

        <button
          onClick={onSubmit}
          disabled={!boardName.trim()}
          className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#FF4D8D] transition-all disabled:opacity-40"
        >
          {mode === 'create' ? t('muse.createBoard') : t('muse.saveChanges')}
        </button>
      </div>
    </m.div>
  </m.div>
  );
};

const MuseBoardView = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const {
    boards, muses, activeBoardId, loading,
    fetchBoards, fetchMuses, createBoard, updateBoard, deleteBoard,
    saveMuse, deleteMuse, updateMuse, moveMuse, setActiveBoard,
  } = useMuseStore();

  const [modal, setModal] = useState<ModalType>(null);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardIcon, setNewBoardIcon] = useState('🎨');
  const [selectedMuse, setSelectedMuse] = useState<SavedMuse | null>(null);
  const [editNotes, setEditNotes] = useState('');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Add Muse modal state
  const [addMuseTab, setAddMuseTab] = useState<AddMuseTab>('upload');
  const [addMuseImage, setAddMuseImage] = useState('');
  const [addMuseTitle, setAddMuseTitle] = useState('');
  const [addMuseUrl, setAddMuseUrl] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const addMuseFileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchBoards();
    fetchMuses();
  }, [fetchBoards, fetchMuses]);

  useEffect(() => {
    fetchMuses(activeBoardId ?? undefined);
  }, [activeBoardId, fetchMuses]);

  // ── Board CRUD ──────────────────────────────────────

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    await createBoard(newBoardName.trim(), newBoardIcon);
    setNewBoardName('');
    setNewBoardIcon('🎨');
    setModal(null);
  };

  const handleEditBoard = async () => {
    if (!activeBoardId || !newBoardName.trim()) return;
    await updateBoard(activeBoardId, { name: newBoardName.trim(), icon: newBoardIcon });
    setNewBoardName('');
    setNewBoardIcon('🎨');
    setModal(null);
  };

  const handleDeleteBoard = async (id: string) => {
    await deleteBoard(id);
  };

  const openEditBoard = () => {
    const board = boards.find((b) => b.id === activeBoardId);
    if (!board) return;
    setNewBoardName(board.name);
    setNewBoardIcon(board.icon);
    setModal('edit-board');
  };

  // ── Muse Actions ────────────────────────────────────

  const openMuseDetail = (muse: SavedMuse) => {
    setSelectedMuse(muse);
    setEditNotes(muse.notes || '');
    setIsEditingNotes(false);
    setModal('muse-detail');
  };

  const handleSaveNotes = async () => {
    if (!selectedMuse) return;
    await updateMuse(selectedMuse.id, { notes: editNotes });
    setSelectedMuse({ ...selectedMuse, notes: editNotes });
    setIsEditingNotes(false);
  };

  const handleAddExtraImage = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedMuse || !e.target.files?.length) return;
    const file = e.target.files[0]!;
    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64 = reader.result as string;
      const updated = [...(selectedMuse.extraImages || []), base64];
      await updateMuse(selectedMuse.id, { extraImages: updated });
      setSelectedMuse({ ...selectedMuse, extraImages: updated });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveExtraImage = async (idx: number) => {
    if (!selectedMuse) return;
    const updated = selectedMuse.extraImages.filter((_, i) => i !== idx);
    await updateMuse(selectedMuse.id, { extraImages: updated });
    setSelectedMuse({ ...selectedMuse, extraImages: updated });
  };

  const openMoveModal = (muse: SavedMuse) => {
    setSelectedMuse(muse);
    setModal('move-muse');
  };

  const handleMoveMuse = async (boardId: string | null) => {
    if (!selectedMuse) return;
    await moveMuse(selectedMuse.id, boardId);
    setSelectedMuse({ ...selectedMuse, boardId: boardId ?? undefined });
    setModal(null);
  };

  // ── Add Muse Actions ─────────────────────────────

  const openAddMuse = () => {
    setAddMuseTab('upload');
    setAddMuseImage('');
    setAddMuseTitle('');
    setAddMuseUrl('');
    setModal('add-muse');
  };

  const handleAddMuseFile = useCallback((file: File) => {
    const reader = new FileReader();
    reader.onloadend = () => setAddMuseImage(reader.result as string);
    reader.readAsDataURL(file);
  }, []);

  const handleAddMuseFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) handleAddMuseFile(e.target.files[0]);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file?.type.startsWith('image/')) handleAddMuseFile(file);
  }, [handleAddMuseFile]);

  const handleSaveNewMuse = async () => {
    const museType: MuseType = addMuseTab === 'url' ? 'url' : 'image';
    const image = addMuseTab === 'url' ? addMuseUrl : addMuseImage;
    if (!image) return;

    await saveMuse({
      type: museType,
      image,
      title: addMuseTitle.trim() || undefined,
      sourceUrl: addMuseTab === 'url' ? addMuseUrl : undefined,
      date: new Date().toLocaleDateString(),
      boardId: activeBoardId ?? undefined,
      tags: [],
      notes: '',
      extraImages: [],
    });
    setModal(null);
  };

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  const getImageSrc = (img: string) =>
    img.startsWith('data:') || img.startsWith('http')
      ? img
      : `data:image/jpeg;base64,${img}`;

  return (
    <m.div
      initial="hidden" animate="visible" variants={containerVariants}
      className="space-y-16 pb-20"
    >
      {/* Header */}
      <m.div variants={itemVariants} className="text-center space-y-4">
        <h2 className="text-[32px] sm:text-[50px] lg:text-[80px] heading-font leading-[0.85] tracking-[-0.05em] uppercase">
          {t('muse.title')}
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">
          {t('muse.subtitle')}
        </p>
      </m.div>

      {/* Board Tabs */}
      <m.div variants={itemVariants}>
        <div className="flex items-center gap-4 overflow-x-auto pb-4">
          {activeBoardId && (
            <button
              onClick={() => setActiveBoard(null)}
              className="flex-shrink-0 p-3 rounded-2xl bg-gray-50 text-gray-400 hover:text-black transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
          )}
          <button
            onClick={() => setActiveBoard(null)}
            className={`flex-shrink-0 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${
              !activeBoardId
                ? 'bg-black text-white shadow-lg'
                : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
            }`}
          >
            {t('muse.allMuses')}
          </button>
          {boards.map((board) => (
            <button
              key={board.id}
              onClick={() => setActiveBoard(board.id)}
              className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all group ${
                activeBoardId === board.id
                  ? 'bg-black text-white shadow-lg'
                  : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
              }`}
            >
              <span className="text-base">{board.icon}</span>
              {board.name}
              <span className={`ml-1 text-[8px] ${activeBoardId === board.id ? 'text-gray-400' : 'text-gray-300'}`}>
                {board.count}
              </span>
            </button>
          ))}
          <button
            onClick={() => {
              setNewBoardName('');
              setNewBoardIcon('🎨');
              setModal('create-board');
            }}
            className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:text-[#FF4D8D] hover:border-[#FF4D8D] transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </m.div>

      {/* Active Board Header */}
      {activeBoard && (
        <m.div
          variants={itemVariants}
          className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem]"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">{activeBoard.icon}</span>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">{activeBoard.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {activeBoard.count} {activeBoard.count === 1 ? t('common.muse') : t('common.muses')} {t('common.saved')}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate('/scan', { state: { fromBoard: activeBoardId } })}
              className="p-3 text-gray-300 hover:text-[#FF4D8D] transition-colors"
              title="New Scan for this board"
            >
              <Camera size={16} />
            </button>
            <button
              onClick={openEditBoard}
              className="p-3 text-gray-300 hover:text-black transition-colors"
              title="Edit board"
            >
              <Pencil size={16} />
            </button>
            <button
              onClick={() => handleDeleteBoard(activeBoard.id)}
              className="p-3 text-gray-300 hover:text-red-500 transition-colors"
              title="Delete board"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </m.div>
      )}

      {/* Muses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-50 rounded-[3rem] h-80" />
          ))}
        </div>
      ) : muses.length === 0 ? (
        <m.div variants={itemVariants} className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[4rem] bg-gray-50/20 space-y-6">
          <LayoutGrid size={64} className="mx-auto text-gray-200" />
          <p className="text-gray-300 font-black uppercase tracking-[0.4em] text-sm">
            {activeBoardId ? t('muse.emptyBoard') : t('muse.noMusesYet')}
          </p>
          <p className="text-[10px] text-gray-300 max-w-xs mx-auto">
            {t('muse.emptyHint')}
          </p>
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <button
              onClick={openAddMuse}
              className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4D8D] transition-all"
            >
              <Plus size={14} /> {t('muse.addInspiration')}
            </button>
            <button
              onClick={() => navigate('/scan', { state: { fromBoard: activeBoardId } })}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gray-50 text-gray-500 border border-gray-200 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:border-[#FF4D8D] hover:text-[#FF4D8D] transition-all"
            >
              <Camera size={14} /> {t('common.startScan')}
            </button>
          </div>
        </m.div>
      ) : (
        <m.div variants={itemVariants} className="columns-1 md:columns-2 lg:columns-3 gap-6">
          {/* Add Muse Card */}
          <m.div
            whileHover={{ y: -4 }}
            onClick={openAddMuse}
            className="flex flex-col items-center justify-center border-2 border-dashed border-gray-200 rounded-[2rem] cursor-pointer hover:border-[#FF4D8D] hover:bg-[#FF4D8D]/5 transition-all break-inside-avoid mb-6"
            style={{ minHeight: '16rem' }}
          >
            <div className="w-14 h-14 rounded-full bg-gray-100 flex items-center justify-center mb-3">
              <Plus size={22} className="text-gray-400" />
            </div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">
              {t('muse.addInspiration')}
            </p>
          </m.div>

          {muses.map((muse) => (
            <m.div
              key={muse.id}
              whileHover={{ y: -4 }}
              className="group relative bg-white border border-gray-100 rounded-[2rem] overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer break-inside-avoid mb-6"
              onClick={() => openMuseDetail(muse)}
            >
              {/* Images */}
              <div className="relative h-52 bg-gray-50 overflow-hidden">
                {muse.image ? (
                  <img
                    src={getImageSrc(muse.image)}
                    alt={muse.title || muse.celebName || 'Muse'}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={40} className="text-gray-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white text-lg heading-font italic uppercase leading-tight">
                    {muse.title || muse.celebName || ''}
                  </p>
                  <p className="text-white/60 text-[9px] font-black uppercase tracking-widest mt-1">
                    {muse.date}
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="p-8 space-y-4">
                {muse.vibe && (
                  <div className="flex items-center gap-2">
                    <Sparkles size={12} className="text-[#FF4D8D]" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{muse.vibe}</span>
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {(muse.aiStylePoints || []).slice(0, 3).map((point) => (
                    <span
                      key={point}
                      className="text-[8px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100"
                    >
                      {point}
                    </span>
                  ))}
                </div>
                {/* Tags preview */}
                {muse.tags && muse.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {muse.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[8px] font-bold text-[#FF4D8D] bg-[#FF4D8D]/10 px-2 py-0.5 rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
                {/* Notes indicator */}
                {muse.notes && (
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <StickyNote size={10} />
                    <span className="text-[9px] truncate max-w-[200px]">{muse.notes}</span>
                  </div>
                )}
              </div>

              {/* Type badge */}
              {muse.type !== 'analysis' && (
                <div className="absolute top-4 left-4">
                  <span className="text-[7px] font-black uppercase tracking-widest bg-white/80 backdrop-blur-sm px-2.5 py-1 rounded-lg text-gray-500">
                    {muse.type === 'image' ? t('muse.imageType') : t('muse.urlType')}
                  </span>
                </div>
              )}

              {/* Hover action buttons */}
              <div className="absolute top-4 right-4 flex gap-2 sm:opacity-0 sm:group-hover:opacity-100 transition-all">
                <button
                  onClick={(e) => { e.stopPropagation(); openMoveModal(muse); }}
                  className="p-2 bg-white/80 backdrop-blur-sm rounded-xl text-gray-300 hover:text-blue-500 transition-all"
                  title="Move to board"
                >
                  <FolderInput size={14} />
                </button>
                <button
                  onClick={(e) => { e.stopPropagation(); deleteMuse(muse.id); }}
                  className="p-2 bg-white/80 backdrop-blur-sm rounded-xl text-gray-300 hover:text-red-500 transition-all"
                  title="Delete muse"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </m.div>
          ))}
        </m.div>
      )}

      {/* Hidden file input for extra images */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleAddExtraImage}
      />

      {/* ── Modals ─────────────────────────────────────── */}
      <AnimatePresence>
        {(modal === 'create-board' || modal === 'edit-board') && (
          <BoardFormModal
            mode={modal === 'create-board' ? 'create' : 'edit'}
            boardName={newBoardName}
            boardIcon={newBoardIcon}
            onNameChange={setNewBoardName}
            onIconChange={setNewBoardIcon}
            onSubmit={modal === 'create-board' ? handleCreateBoard : handleEditBoard}
            onClose={() => setModal(null)}
          />
        )}

        {/* Move Muse Modal */}
        {modal === 'move-muse' && selectedMuse && (
          <m.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setModal(null)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setModal(null)}
                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-2xl heading-font uppercase tracking-tight">
                  {t('muse.moveToBoard')}
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-2">
                  {t('muse.selectDestination')}
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => handleMoveMuse(null)}
                  className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all text-left ${
                    !selectedMuse.boardId
                      ? 'bg-black text-white'
                      : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                  }`}
                >
                  <LayoutGrid size={16} />
                  <span className="text-[10px] font-black uppercase tracking-widest">{t('muse.noBoardAllMuses')}</span>
                </button>
                {boards.map((board) => (
                  <button
                    key={board.id}
                    onClick={() => handleMoveMuse(board.id)}
                    className={`w-full flex items-center gap-3 px-5 py-4 rounded-2xl transition-all text-left ${
                      selectedMuse.boardId === board.id
                        ? 'bg-black text-white'
                        : 'bg-gray-50 hover:bg-gray-100 text-gray-600'
                    }`}
                  >
                    <span className="text-lg">{board.icon}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest">{board.name}</span>
                    <span className="ml-auto text-[8px] opacity-60">{board.count}</span>
                  </button>
                ))}
              </div>
            </m.div>
          </m.div>
        )}

        {/* Add Muse Modal */}
        {modal === 'add-muse' && (
          <m.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setModal(null)}
          >
            <m.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setModal(null)}
                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-8">
                <h2 className="text-3xl heading-font uppercase tracking-tight">
                  {t('muse.addInspiration')}
                </h2>
              </div>

              {/* Tabs */}
              <div className="flex gap-2 mb-8">
                {([
                  { id: 'upload' as const, icon: <Upload size={14} />, label: t('muse.uploadPhoto') },
                  { id: 'url' as const, icon: <Link2 size={14} />, label: t('muse.pasteUrl') },
                  { id: 'scan' as const, icon: <Cpu size={14} />, label: t('muse.newAiScan') },
                ]).map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setAddMuseTab(tab.id)}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-2xl text-[9px] font-black uppercase tracking-widest transition-all ${
                      addMuseTab === tab.id
                        ? 'bg-black text-white'
                        : 'bg-gray-50 text-gray-400 hover:bg-gray-100'
                    }`}
                  >
                    {tab.icon} {tab.label}
                  </button>
                ))}
              </div>

              {/* Upload Tab */}
              {addMuseTab === 'upload' && (
                <div className="space-y-6">
                  <div
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') addMuseFileRef.current?.click(); }}
                    onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => addMuseFileRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                      isDragging
                        ? 'border-[#FF4D8D] bg-[#FF4D8D]/5'
                        : addMuseImage
                          ? 'border-gray-200'
                          : 'border-gray-200 hover:border-[#FF4D8D]'
                    }`}
                  >
                    {addMuseImage ? (
                      <img src={addMuseImage} alt="Preview" className="w-full h-40 object-cover rounded-xl" />
                    ) : (
                      <>
                        <Upload size={32} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
                          {t('muse.dropOrClick')}
                        </p>
                      </>
                    )}
                  </div>
                  <input
                    ref={addMuseFileRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleAddMuseFileInput}
                  />
                  <div className="space-y-1">
                    <label htmlFor="add-muse-title" className="text-[9px] font-black uppercase text-gray-400 ml-2">
                      {t('muse.imageTitle')}
                    </label>
                    <input
                      id="add-muse-title"
                      type="text"
                      value={addMuseTitle}
                      onChange={(e) => setAddMuseTitle(e.target.value)}
                      placeholder={t('muse.titlePlaceholder')}
                      maxLength={60}
                      className="w-full bg-[#F9F9F9] rounded-2xl px-4 py-4 text-sm focus:ring-1 ring-black transition-all border-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveNewMuse}
                    disabled={!addMuseImage}
                    className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#FF4D8D] transition-all disabled:opacity-40"
                  >
                    {t('muse.save')}
                  </button>
                </div>
              )}

              {/* URL Tab */}
              {addMuseTab === 'url' && (
                <div className="space-y-6">
                  <div className="space-y-1">
                    <label htmlFor="add-muse-url" className="text-[9px] font-black uppercase text-gray-400 ml-2">
                      {t('muse.pasteUrl')}
                    </label>
                    <input
                      id="add-muse-url"
                      type="url"
                      value={addMuseUrl}
                      onChange={(e) => setAddMuseUrl(e.target.value)}
                      placeholder={t('muse.urlPlaceholder')}
                      className="w-full bg-[#F9F9F9] rounded-2xl px-4 py-4 text-sm focus:ring-1 ring-black transition-all border-none"
                    />
                  </div>
                  {addMuseUrl && addMuseUrl.startsWith('http') && (
                    <div className="rounded-2xl overflow-hidden bg-gray-50 h-40">
                      <img
                        src={addMuseUrl}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div className="space-y-1">
                    <label htmlFor="add-muse-url-title" className="text-[9px] font-black uppercase text-gray-400 ml-2">
                      {t('muse.imageTitle')}
                    </label>
                    <input
                      id="add-muse-url-title"
                      type="text"
                      value={addMuseTitle}
                      onChange={(e) => setAddMuseTitle(e.target.value)}
                      placeholder={t('muse.titlePlaceholder')}
                      maxLength={60}
                      className="w-full bg-[#F9F9F9] rounded-2xl px-4 py-4 text-sm focus:ring-1 ring-black transition-all border-none"
                    />
                  </div>
                  <button
                    onClick={handleSaveNewMuse}
                    disabled={!addMuseUrl || !addMuseUrl.startsWith('http')}
                    className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#FF4D8D] transition-all disabled:opacity-40"
                  >
                    {t('muse.save')}
                  </button>
                </div>
              )}

              {/* Scan Tab */}
              {addMuseTab === 'scan' && (
                <div className="space-y-6 text-center py-4">
                  <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center mx-auto">
                    <Camera size={32} className="text-[#FF4D8D]" />
                  </div>
                  <p className="text-[10px] text-gray-400 max-w-xs mx-auto">
                    {t('muse.emptyHint')}
                  </p>
                  <button
                    onClick={() => {
                      setModal(null);
                      navigate('/scan', { state: { fromBoard: activeBoardId } });
                    }}
                    className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#FF4D8D] transition-all"
                  >
                    {t('muse.newAiScan')}
                  </button>
                </div>
              )}
            </m.div>
          </m.div>
        )}

        {/* Muse Detail Modal */}
        {modal === 'muse-detail' && selectedMuse && (
          <m.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 overflow-y-auto"
            onClick={() => setModal(null)}
          >
            <m.div
              initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[3rem] max-w-2xl w-full shadow-2xl relative my-8"
            >
              {/* Close */}
              <button
                onClick={() => setModal(null)}
                className="absolute top-6 right-6 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-xl text-gray-400 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              {/* Images — side by side for analysis, single for image/url */}
              {selectedMuse.type === 'analysis' && selectedMuse.userImage && selectedMuse.celebImage ? (
                <div className="grid grid-cols-2 h-48 sm:h-64 rounded-t-[3rem] overflow-hidden">
                  <div className="relative bg-gray-100">
                    <img src={getImageSrc(selectedMuse.userImage)} alt="Your selfie" className="w-full h-full object-cover" loading="lazy" />
                    <span className="absolute bottom-3 left-3 text-[8px] font-black uppercase tracking-widest bg-black/60 text-white px-3 py-1 rounded-lg">{t('muse.you')}</span>
                  </div>
                  <div className="relative bg-gray-100">
                    <img src={getImageSrc(selectedMuse.celebImage)} alt={selectedMuse.celebName || ''} className="w-full h-full object-cover" loading="lazy" />
                    <span className="absolute bottom-3 left-3 text-[8px] font-black uppercase tracking-widest bg-[#FF4D8D]/80 text-white px-3 py-1 rounded-lg">{selectedMuse.celebName}</span>
                  </div>
                </div>
              ) : (
                <div className="relative h-48 sm:h-64 rounded-t-[3rem] overflow-hidden bg-gray-100">
                  {selectedMuse.image ? (
                    <img src={getImageSrc(selectedMuse.image)} alt={selectedMuse.title || ''} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center"><User size={40} className="text-gray-300" /></div>
                  )}
                </div>
              )}

              {/* Detail Content */}
              <div className="p-10 space-y-8">
                {/* Header info */}
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-2xl heading-font italic uppercase">{selectedMuse.title || selectedMuse.celebName || ''}</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{selectedMuse.date}</p>
                  </div>
                  {selectedMuse.vibe && (
                    <div className="flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-xl">
                      <Sparkles size={12} className="text-[#FF4D8D]" />
                      <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">{selectedMuse.vibe}</span>
                    </div>
                  )}
                </div>

                {/* Tags */}
                {selectedMuse.tags && selectedMuse.tags.length > 0 && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <Tag size={12} className="text-gray-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{t('muse.autoTags')}</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {selectedMuse.tags.map((tag) => (
                        <span key={tag} className="text-[9px] font-bold text-[#FF4D8D] bg-[#FF4D8D]/10 px-3 py-1 rounded-full">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* AI Style Points */}
                {selectedMuse.aiStylePoints && selectedMuse.aiStylePoints.length > 0 && (
                  <div className="space-y-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{t('muse.aiStylePoints')}</span>
                    <div className="flex flex-wrap gap-2">
                      {selectedMuse.aiStylePoints.map((point) => (
                        <span key={point} className="text-[8px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1.5 rounded-full border border-gray-100">
                          {point}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Notes */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StickyNote size={12} className="text-gray-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{t('muse.notes')}</span>
                    </div>
                    {!isEditingNotes && (
                      <button
                        onClick={() => { setEditNotes(selectedMuse.notes || ''); setIsEditingNotes(true); }}
                        className="text-[9px] font-black uppercase tracking-widest text-[#FF4D8D] hover:underline"
                      >
                        {t('muse.addNote')}
                      </button>
                    )}
                  </div>
                  {isEditingNotes ? (
                    <div className="space-y-2">
                      <textarea
                        value={editNotes}
                        onChange={(e) => setEditNotes(e.target.value)}
                        placeholder={t('muse.addNote')}
                        rows={3}
                        className="w-full bg-[#F9F9F9] rounded-2xl px-4 py-3 text-sm focus:ring-1 ring-black transition-all border-none resize-none"
                      />
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => setIsEditingNotes(false)}
                          className="px-4 py-2 text-[9px] font-black uppercase tracking-widest text-gray-400 hover:text-black"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleSaveNotes}
                          className="px-6 py-2 bg-black text-white rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-[#FF4D8D] transition-all"
                        >
                          {t('muse.saveNote')}
                        </button>
                      </div>
                    </div>
                  ) : selectedMuse.notes ? (
                    <p className="text-sm text-gray-600 leading-relaxed bg-gray-50 rounded-2xl px-5 py-4">{selectedMuse.notes}</p>
                  ) : (
                    <p className="text-[10px] text-gray-300 italic">No notes yet</p>
                  )}
                </div>

                {/* Extra Images */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ImagePlus size={12} className="text-gray-400" />
                      <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">{t('muse.extraImages')}</span>
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-[9px] font-black uppercase tracking-widest text-[#FF4D8D] hover:underline"
                    >
                      {t('muse.addImage')}
                    </button>
                  </div>
                  {selectedMuse.extraImages && selectedMuse.extraImages.length > 0 ? (
                    <div className="grid grid-cols-3 gap-3">
                      {selectedMuse.extraImages.map((img, idx) => (
                        <div key={idx} className="relative group/img aspect-square rounded-2xl overflow-hidden bg-gray-50">
                          <img src={getImageSrc(img)} alt={`Extra ${idx + 1}`} className="w-full h-full object-cover" loading="lazy" />
                          <button
                            onClick={() => handleRemoveExtraImage(idx)}
                            className="absolute top-2 right-2 p-1.5 bg-white/80 backdrop-blur-sm rounded-lg opacity-0 group-hover/img:opacity-100 text-gray-400 hover:text-red-500 transition-all"
                          >
                            <Trash2 size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-300 italic">No extra images</p>
                  )}
                </div>

                {/* Actions */}
                <div className="flex gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => { setModal(null); openMoveModal(selectedMuse); }}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-gray-50 rounded-2xl text-[10px] font-black uppercase tracking-widest text-gray-500 hover:bg-gray-100 transition-all"
                  >
                    <FolderInput size={14} /> {t('muse.moveToBoard')}
                  </button>
                  <button
                    onClick={() => navigate('/scan')}
                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4D8D] transition-all"
                  >
                    <Camera size={14} /> {t('muse.tryAgainLook')}
                  </button>
                </div>
              </div>
            </m.div>
          </m.div>
        )}
      </AnimatePresence>
    </m.div>
  );
};

export default MuseBoardView;
