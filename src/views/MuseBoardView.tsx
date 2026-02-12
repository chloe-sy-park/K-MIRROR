import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutGrid, Plus, Trash2, X, Sparkles, User, ChevronLeft, Camera,
} from 'lucide-react';
import { useMuseStore } from '@/store/museStore';
import { containerVariants, itemVariants } from '@/constants/animations';

const BOARD_ICONS = ['🎨', '💄', '✨', '🌸', '🔥', '💎', '🦋', '🌙'];

const MuseBoardView = () => {
  const navigate = useNavigate();
  const {
    boards, muses, activeBoardId, loading,
    fetchBoards, fetchMuses, createBoard, deleteBoard, deleteMuse,
    setActiveBoard,
  } = useMuseStore();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardName, setNewBoardName] = useState('');
  const [newBoardIcon, setNewBoardIcon] = useState('🎨');

  useEffect(() => {
    fetchBoards();
    fetchMuses();
  }, [fetchBoards, fetchMuses]);

  useEffect(() => {
    fetchMuses(activeBoardId ?? undefined);
  }, [activeBoardId, fetchMuses]);

  const handleCreateBoard = async () => {
    if (!newBoardName.trim()) return;
    await createBoard(newBoardName.trim(), newBoardIcon);
    setNewBoardName('');
    setNewBoardIcon('🎨');
    setShowCreateModal(false);
  };

  const handleDeleteBoard = async (id: string) => {
    await deleteBoard(id);
  };

  const activeBoard = boards.find((b) => b.id === activeBoardId);

  return (
    <motion.div
      initial="hidden" animate="visible" variants={containerVariants}
      className="space-y-16 pb-20"
    >
      {/* Header */}
      <motion.div variants={itemVariants} className="text-center space-y-4">
        <h2 className="text-[50px] lg:text-[80px] heading-font leading-[0.85] tracking-[-0.05em] uppercase">
          MUSE <span className="italic text-[#FF4D8D]">BOARD</span>
        </h2>
        <p className="text-[10px] font-black uppercase tracking-[0.5em] text-gray-400">
          Your Saved Neural Analyses
        </p>
      </motion.div>

      {/* Board Tabs */}
      <motion.div variants={itemVariants}>
        <div className="flex items-center gap-4 overflow-x-auto pb-4 scrollbar-hide">
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
            All Muses
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
            onClick={() => setShowCreateModal(true)}
            className="flex-shrink-0 w-10 h-10 rounded-2xl bg-gray-50 border border-dashed border-gray-200 flex items-center justify-center text-gray-300 hover:text-[#FF4D8D] hover:border-[#FF4D8D] transition-all"
          >
            <Plus size={16} />
          </button>
        </div>
      </motion.div>

      {/* Active Board Header */}
      {activeBoard && (
        <motion.div
          variants={itemVariants}
          className="flex items-center justify-between p-8 bg-gray-50 rounded-[2.5rem]"
        >
          <div className="flex items-center gap-4">
            <span className="text-3xl">{activeBoard.icon}</span>
            <div>
              <h3 className="text-lg font-black uppercase tracking-tight">{activeBoard.name}</h3>
              <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">
                {activeBoard.count} {activeBoard.count === 1 ? 'muse' : 'muses'} saved
              </p>
            </div>
          </div>
          <button
            onClick={() => handleDeleteBoard(activeBoard.id)}
            className="p-3 text-gray-300 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </motion.div>
      )}

      {/* Muses Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-gray-50 rounded-[3rem] h-80" />
          ))}
        </div>
      ) : muses.length === 0 ? (
        <motion.div variants={itemVariants} className="py-32 text-center border-2 border-dashed border-gray-100 rounded-[4rem] bg-gray-50/20 space-y-6">
          <LayoutGrid size={64} className="mx-auto text-gray-200" />
          <p className="text-gray-300 font-black uppercase tracking-[0.4em] text-sm">
            {activeBoardId ? 'This board is empty' : 'No saved muses yet'}
          </p>
          <p className="text-[10px] text-gray-300 max-w-xs mx-auto">
            Run a scan and save your analysis to start building your muse collection.
          </p>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-8 py-4 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-[#FF4D8D] transition-all"
          >
            <Camera size={14} /> Start a Scan
          </button>
        </motion.div>
      ) : (
        <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {muses.map((muse) => (
            <motion.div
              key={muse.id}
              whileHover={{ y: -4 }}
              className="group relative bg-white border border-gray-100 rounded-[3rem] overflow-hidden shadow-sm hover:shadow-xl transition-all"
            >
              {/* Images */}
              <div className="relative h-52 bg-gray-50 overflow-hidden">
                {muse.userImage ? (
                  <img
                    src={
                      muse.userImage.startsWith('data:') || muse.userImage.startsWith('http')
                        ? muse.userImage
                        : `data:image/jpeg;base64,${muse.userImage}`
                    }
                    alt="Your photo"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User size={40} className="text-gray-200" />
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <div className="absolute bottom-6 left-6 right-6">
                  <p className="text-white text-lg heading-font italic uppercase leading-tight">
                    {muse.celebName}
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
                  {muse.aiStylePoints.slice(0, 3).map((point) => (
                    <span
                      key={point}
                      className="text-[8px] font-black uppercase tracking-widest bg-gray-50 px-3 py-1 rounded-full border border-gray-100"
                    >
                      {point}
                    </span>
                  ))}
                </div>
              </div>

              {/* Delete button */}
              <button
                onClick={() => deleteMuse(muse.id)}
                className="absolute top-4 right-4 p-2 bg-white/80 backdrop-blur-sm rounded-xl opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-500 transition-all"
              >
                <Trash2 size={14} />
              </button>
            </motion.div>
          ))}
        </motion.div>
      )}

      {/* Create Board Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[250] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
            onClick={() => setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative"
            >
              <button
                onClick={() => setShowCreateModal(false)}
                className="absolute top-6 right-6 p-2 text-gray-300 hover:text-black transition-colors"
              >
                <X size={20} />
              </button>

              <div className="text-center mb-10">
                <h2 className="text-3xl heading-font uppercase tracking-tight">
                  New <span className="italic text-[#FF4D8D]">Board</span>
                </h2>
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 mt-3">
                  Organize your muse collection
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-1">
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Icon</label>
                  <div className="flex gap-2 flex-wrap">
                    {BOARD_ICONS.map((icon) => (
                      <button
                        key={icon}
                        onClick={() => setNewBoardIcon(icon)}
                        className={`w-12 h-12 rounded-2xl text-xl flex items-center justify-center transition-all ${
                          newBoardIcon === icon
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
                  <label className="text-[9px] font-black uppercase text-gray-400 ml-2">Board Name</label>
                  <input
                    type="text"
                    value={newBoardName}
                    onChange={(e) => setNewBoardName(e.target.value)}
                    placeholder="e.g., Summer Looks, Daily Glam"
                    maxLength={40}
                    className="w-full bg-[#F9F9F9] rounded-2xl px-4 py-4 text-sm focus:ring-1 ring-black transition-all border-none"
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateBoard()}
                  />
                </div>

                <button
                  onClick={handleCreateBoard}
                  disabled={!newBoardName.trim()}
                  className="w-full py-5 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] hover:bg-[#FF4D8D] transition-all disabled:opacity-40"
                >
                  Create Board
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default MuseBoardView;
