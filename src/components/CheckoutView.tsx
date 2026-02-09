import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Globe, Truck, ShieldCheck, Sparkles } from 'lucide-react';
import { AnalysisResult } from '../types';

const CheckoutView: React.FC<{ result: AnalysisResult | null }> = ({ result }) => {
  const [shippingMethod, setShippingMethod] = useState('dhl');

  const subtotal =
    result?.recommendations.products.reduce(
      (acc, p) => acc + parseFloat(p.price.replace('$', '')),
      0
    ) || 45;
  const shippingCost = shippingMethod === 'dhl' ? 18 : 12;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-6xl mx-auto py-20"
    >
      {/* Header */}
      <header className="mb-20 border-b border-black pb-12">
        <p className="text-[10px] font-black tracking-[0.6em] text-[#FF4D8D] mb-6 uppercase">
          Step 04 — Acquisition
        </p>
        <h2 className="text-[50px] lg:text-[80px] heading-font leading-[0.9] tracking-tight uppercase">
          Secure Your <br />
          <span className="italic underline decoration-1 underline-offset-8">Archive.</span>
        </h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
        {/* Left Column: Forms */}
        <div className="lg:col-span-7 space-y-16">
          {/* Shipping Destination */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest mb-10 flex items-center gap-3">
              <Globe size={14} /> 01. Shipping Destination
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">
                  Full Name
                </label>
                <input
                  type="text"
                  placeholder="Sarah Jenkins"
                  className="w-full bg-[#F9F9F9] border-none rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 ring-black transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">
                  Country
                </label>
                <select className="w-full bg-[#F9F9F9] border-none rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 ring-black">
                  <option>United States</option>
                  <option>United Kingdom</option>
                  <option>France</option>
                  <option>Germany</option>
                  <option>Japan</option>
                  <option>South Korea</option>
                  <option>Australia</option>
                  <option>Canada</option>
                </select>
              </div>
              <div className="md:col-span-2 space-y-2">
                <label className="text-[9px] font-black uppercase text-gray-400 ml-2">
                  Address
                </label>
                <input
                  type="text"
                  placeholder="123 Beauty Lane, Manhattan, NY 10001"
                  className="w-full bg-[#F9F9F9] border-none rounded-2xl px-6 py-4 text-sm focus:outline-none focus:ring-1 ring-black"
                />
              </div>
            </div>
          </section>

          {/* Logistics */}
          <section>
            <h3 className="text-xs font-black uppercase tracking-widest mb-10 flex items-center gap-3">
              <Truck size={14} /> 02. Logistics
            </h3>
            <div className="space-y-4">
              <label
                className={`flex justify-between items-center p-6 rounded-3xl border-2 cursor-pointer transition-all ${
                  shippingMethod === 'dhl'
                    ? 'border-black bg-white'
                    : 'border-gray-50 bg-[#F9F9F9]'
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  className="hidden"
                  checked={shippingMethod === 'dhl'}
                  onChange={() => setShippingMethod('dhl')}
                />
                <div className="flex items-center gap-4">
                  <div className="font-bold text-sm text-yellow-500">DHL Express</div>
                  <span className="text-[10px] text-gray-400 font-medium">3-5 Business Days</span>
                </div>
                <span className="font-black text-sm">$18.00</span>
              </label>
              <label
                className={`flex justify-between items-center p-6 rounded-3xl border-2 cursor-pointer transition-all ${
                  shippingMethod === 'ems'
                    ? 'border-black bg-white'
                    : 'border-gray-50 bg-[#F9F9F9]'
                }`}
              >
                <input
                  type="radio"
                  name="shipping"
                  className="hidden"
                  checked={shippingMethod === 'ems'}
                  onChange={() => setShippingMethod('ems')}
                />
                <div className="flex items-center gap-4">
                  <div className="font-bold text-sm text-blue-500">EMS Global</div>
                  <span className="text-[10px] text-gray-400 font-medium">7-14 Business Days</span>
                </div>
                <span className="font-black text-sm">$12.00</span>
              </label>
            </div>
          </section>
        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-5">
          <div className="bg-white border border-gray-100 rounded-[3rem] p-10 sticky top-32 shadow-2xl">
            <h4 className="text-[10px] font-black uppercase tracking-[0.4em] mb-10 text-gray-300 text-center">
              Order Summary
            </h4>

            {/* Product List */}
            <div className="space-y-6 mb-10">
              {result?.recommendations.products.slice(0, 3).map((p, i) => (
                <div key={i} className="flex justify-between items-center">
                  <div className="flex gap-4 items-center">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl overflow-hidden flex items-center justify-center">
                      <Sparkles size={14} className="text-gray-200" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase">{p.name}</p>
                      <p className="text-[9px] text-gray-400 uppercase tracking-widest">{p.brand}</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold">{p.price}</span>
                </div>
              ))}
            </div>

            {/* Totals */}
            <div className="space-y-4 pt-6 border-t border-gray-50 mb-10">
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400">
                <span>Shipping ({shippingMethod.toUpperCase()})</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center pt-4">
                <span className="text-sm font-black uppercase">Total</span>
                <span className="text-2xl heading-font italic uppercase">
                  ${(subtotal + shippingCost).toFixed(2)}
                </span>
              </div>
            </div>

            {/* CTA */}
            <button className="w-full py-6 bg-black text-white rounded-2xl font-black text-xs tracking-[0.3em] uppercase hover:bg-[#FF4D8D] transition-all mb-6 shadow-xl cursor-pointer gm-hover">
              Complete Payment
            </button>
            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-300 font-bold uppercase tracking-widest">
              <ShieldCheck size={14} className="text-green-500" /> Secure Checkout by Stripe
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CheckoutView;
