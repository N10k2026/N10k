'use client';

import { Dialog, DialogContent, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Ruler, X } from 'lucide-react';

interface SizeGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

const sizeData = [
  { size: 'S', chest: '86-91', waist: '71-76', hip: '86-91', length: '66' },
  { size: 'M', chest: '92-97', waist: '77-82', hip: '92-97', length: '69' },
  { size: 'L', chest: '98-103', waist: '83-88', hip: '98-103', length: '72' },
  { size: 'XL', chest: '104-109', waist: '89-94', hip: '104-109', length: '75' },
];

export default function SizeGuide({ isOpen, onClose }: SizeGuideProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-lg w-[95vw] bg-[#0D0D0D]/98 backdrop-blur-2xl border-white/10 p-0 overflow-hidden rounded-3xl">
        <DialogTitle className="sr-only">Guía de tallas</DialogTitle>
        <DialogDescription className="sr-only">Tabla de medidas para ropa N10K</DialogDescription>

        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-xl bg-[#E30613]/10 flex items-center justify-center">
              <Ruler className="h-5 w-5 text-[#E30613]" />
            </div>
            <div>
              <h3 className="text-lg font-montserrat-extrabold text-white">GUÍA DE TALLAS</h3>
              <p className="text-gray-500 text-xs font-montserrat-medium">Medidas en centímetros</p>
            </div>
          </div>

          {/* Size Table */}
          <div className="overflow-hidden rounded-xl border border-white/10">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[#E30613]/10">
                  <th className="px-4 py-3 text-left text-[#E30613] font-montserrat-extrabold text-xs tracking-wider uppercase">Talla</th>
                  <th className="px-4 py-3 text-center text-[#E30613] font-montserrat-extrabold text-xs tracking-wider uppercase">Pecho</th>
                  <th className="px-4 py-3 text-center text-[#E30613] font-montserrat-extrabold text-xs tracking-wider uppercase">Cintura</th>
                  <th className="px-4 py-3 text-center text-[#E30613] font-montserrat-extrabold text-xs tracking-wider uppercase">Cadera</th>
                  <th className="px-4 py-3 text-center text-[#E30613] font-montserrat-extrabold text-xs tracking-wider uppercase">Largo</th>
                </tr>
              </thead>
              <tbody>
                {sizeData.map((row, i) => (
                  <tr
                    key={row.size}
                    className={`border-t border-white/5 ${i % 2 === 0 ? 'bg-white/[0.02]' : ''} hover:bg-white/[0.04] transition-colors`}
                  >
                    <td className="px-4 py-3 text-white font-montserrat-extrabold">{row.size}</td>
                    <td className="px-4 py-3 text-center text-gray-400 font-montserrat-medium">{row.chest}</td>
                    <td className="px-4 py-3 text-center text-gray-400 font-montserrat-medium">{row.waist}</td>
                    <td className="px-4 py-3 text-center text-gray-400 font-montserrat-medium">{row.hip}</td>
                    <td className="px-4 py-3 text-center text-gray-400 font-montserrat-medium">{row.length}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Tips */}
          <div className="mt-5 space-y-3">
            <h4 className="text-white font-montserrat-bold text-sm">Tips para medirte:</h4>
            <div className="space-y-2">
              {[
                { label: 'Pecho', desc: 'Mide alrededor de la parte más amplia del pecho.' },
                { label: 'Cintura', desc: 'Mide alrededor de la parte más estrecha de la cintura.' },
                { label: 'Cadera', desc: 'Mide alrededor de la parte más amplia de las caderas.' },
              ].map((tip) => (
                <div key={tip.label} className="flex items-start gap-2">
                  <span className="text-[#E30613] text-xs mt-0.5">●</span>
                  <p className="text-gray-400 text-xs">
                    <span className="text-white font-montserrat-bold">{tip.label}:</span> {tip.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Note */}
          <div className="mt-5 p-3 bg-[#E30613]/5 border border-[#E30613]/10 rounded-xl">
            <p className="text-gray-400 text-[10px] sm:text-xs leading-relaxed">
              💡 <span className="text-white font-montserrat-bold">Nota:</span> Nuestras prendas tienen corte oversize. Si prefieres un ajuste más ceñido, considera elegir una talla menor. Si tienes dudas, escríbenos por WhatsApp y te asesoramos.
            </p>
          </div>

          {/* Close */}
          <button
            onClick={onClose}
            className="mt-5 w-full text-center text-xs text-gray-500 hover:text-[#E30613] transition-colors font-montserrat-bold tracking-wider uppercase cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
