import * as m from 'framer-motion/m';
import { Target } from 'lucide-react';

interface ProportionVisualizerProps {
  proportions: { upper: string; middle: string; lower: string };
}

const SherlockProportionVisualizer = ({ proportions }: ProportionVisualizerProps) => {
  return (
    <m.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="relative w-full max-w-[200px] aspect-[2/3] flex flex-col items-center justify-center bg-gray-50/50 rounded-[2rem] border border-gray-100 p-4"
    >
      {/* Blueprint Grid Lines */}
      <div className="absolute inset-0 grid grid-cols-4 grid-rows-6 pointer-events-none opacity-10">
        {[...Array(24)].map((_, i) => <div key={i} className="border-[0.5px] border-black" />)}
      </div>

      <div className="relative w-full h-full flex flex-col">
        {/* Upper Zone */}
        <div className="flex-1 flex flex-col items-center justify-center relative border-b border-dashed border-[#FF4D8D]/30 group">
          <div className="text-[8px] font-black text-gray-300 uppercase absolute top-2 left-2">Frontal</div>
          <m.div
            initial={{ height: 0 }} animate={{ height: '40%' }}
            transition={{ delay: 0.5, duration: 1 }}
            className="w-[2px] bg-[#FF4D8D]/20 absolute left-1/2 -translate-x-1/2 top-0"
          />
          <span className="text-sm heading-font italic text-[#FF4D8D] font-bold">{proportions.upper}</span>
        </div>

        {/* Middle Zone */}
        <div className="flex-[1.2] flex flex-col items-center justify-center relative border-b border-dashed border-[#FF4D8D]/30">
          <div className="text-[8px] font-black text-gray-300 uppercase absolute top-2 left-2">Orbital</div>
          <m.div animate={{ opacity: [0.3, 0.6, 0.3] }} transition={{ repeat: Infinity, duration: 2 }}>
            <Target size={12} className="text-[#FF4D8D]/40 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
          </m.div>
          <span className="text-lg heading-font italic text-[#FF4D8D] font-black">{proportions.middle}</span>
        </div>

        {/* Lower Zone */}
        <div className="flex-[0.9] flex flex-col items-center justify-center relative">
          <div className="text-[8px] font-black text-gray-300 uppercase absolute top-2 left-2">Mandibular</div>
          <span className="text-sm heading-font italic text-[#FF4D8D] font-bold">{proportions.lower}</span>
        </div>
      </div>

      {/* Vertical Axis Line */}
      <div className="absolute left-1/2 top-0 bottom-0 w-[1px] bg-gradient-to-b from-transparent via-pink-200 to-transparent -translate-x-1/2 opacity-50" />

      <div className="mt-4 w-full">
        <div className="h-[2px] w-full bg-gray-100 rounded-full overflow-hidden">
          <m.div
            initial={{ width: 0 }} animate={{ width: '94%' }}
            transition={{ delay: 1, duration: 1.5 }}
            className="h-full bg-[#FF4D8D]"
          />
        </div>
        <p className="text-[7px] text-center font-black uppercase text-gray-400 tracking-[0.3em] mt-2">Sherlock Ratio Sync: 94%</p>
      </div>
    </m.div>
  );
};

export default SherlockProportionVisualizer;
