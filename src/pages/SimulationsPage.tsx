import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SteamiLayout } from '@/components/SteamiLayout';
import { QuantumBlochSphere } from '@/components/simulations/QuantumBlochSphere';
import { ThreeBodySim } from '@/components/simulations/ThreeBodySim';

const simulations = [
  {
    id: 'quantum',
    title: 'How does Qubits react in Quantum Space',
    field: 'QUANTUM COMPUTING',
    fieldColor: 'steami-badge-violet',
    description:
      'Explore the Bloch sphere — the geometric representation of a qubit\'s quantum state. Unlike classical bits locked to 0 or 1, a qubit can exist in any superposition, represented as a point anywhere on the sphere\'s surface.',
    caption: 'Interactive Bloch Sphere — drag to rotate, toggle superposition mode, or manually set θ and φ angles.',
    readTime: '12 min interactive',
  },
  {
    id: 'threebody',
    title: 'Three Body Problem',
    field: 'PHYSICS',
    fieldColor: 'steami-badge-cyan',
    description:
      'The three-body problem has no general closed-form solution — three masses interacting gravitationally produce chaotic, unpredictable trajectories. This simulation demonstrates why even tiny changes in initial conditions lead to wildly divergent orbits.',
    caption: 'Gravitational N-body simulation — adjust mass ratios and simulation speed to observe chaotic dynamics.',
    readTime: '10 min interactive',
  },
];

export default function SimulationsPage() {
  const [openSim, setOpenSim] = useState<string | null>(null);

  return (
    <SteamiLayout>
      {/* Page header */}
      <div className="mb-8">
        <div className="steami-section-label">◆ INTERACTIVE SIMULATIONS</div>
        <h1 className="steami-heading text-2xl md:text-3xl mt-2">
          3D Simulations Lab
        </h1>
        <p className="text-[13px] font-light text-muted-foreground mt-3 max-w-[560px] leading-relaxed">
          Hands-on, interactive 3D visualisations that bring abstract scientific concepts to life. 
          Drag, adjust, and explore — learning through direct manipulation.
        </p>
      </div>

      {/* Simulation cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {simulations.map((sim) => (
          <motion.div
            key={sim.id}
            layoutId={`sim-card-${sim.id}`}
            className="glass-card relative overflow-hidden cursor-pointer group"
            onClick={() => setOpenSim(sim.id)}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
          >
            {/* Accent bar */}
            <div className="absolute top-0 left-0 right-0 h-[2px]"
              style={{ background: sim.id === 'quantum' ? 'hsl(var(--steami-violet))' : 'hsl(var(--steami-cyan))' }} />

            <div className="p-6">
              <span className={`steami-badge ${sim.fieldColor} mb-3 inline-block`}>
                {sim.field}
              </span>
              <h2 className="steami-heading text-lg mb-3">{sim.title}</h2>
              <p className="text-[12px] font-light text-muted-foreground leading-relaxed mb-4">
                {sim.description}
              </p>
              <div className="flex items-center justify-between">
                <span className="font-mono text-[9px] text-muted-foreground tracking-wider">
                  {sim.readTime}
                </span>
                <button className="steami-btn text-[9px] group-hover:border-[rgba(99,179,237,0.5)]">
                  ▶ LAUNCH SIMULATION
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal overlay */}
      <AnimatePresence>
        {openSim && (
          <motion.div
            className="fixed inset-0 z-[200] flex items-center justify-center p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ background: 'rgba(2,8,18,0.82)', backdropFilter: 'blur(8px)' }}
            onClick={() => setOpenSim(null)}
          >
            <motion.div
              className="w-full max-w-[800px] max-h-[90vh] overflow-y-auto rounded-xl"
              style={{
                background: 'var(--steami-modal-bg)',
                backdropFilter: 'blur(24px) saturate(160%)',
                border: '1px solid rgba(255,255,255,0.07)',
                boxShadow: '0 25px 50px -12px rgba(0,0,0,0.6), 0 0 40px rgba(99,179,237,0.1)',
              }}
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-white/[0.06] sticky top-0 z-10"
                style={{ background: 'rgba(5,14,32,0.92)', backdropFilter: 'blur(20px)' }}>
                <div className="flex items-center gap-3">
                  <span className={`steami-badge ${simulations.find(s => s.id === openSim)?.fieldColor}`}>
                    {simulations.find(s => s.id === openSim)?.field}
                  </span>
                  <span className="font-mono text-[9px] text-muted-foreground">
                    {simulations.find(s => s.id === openSim)?.readTime}
                  </span>
                </div>
                <button
                  onClick={() => setOpenSim(null)}
                  className="w-7 h-7 rounded-md flex items-center justify-center text-muted-foreground hover:text-destructive transition-colors"
                  style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(10,25,55,0.4)' }}
                >
                  ✕
                </button>
              </div>

              {/* Modal body */}
              <div className="p-6 md:p-8">
                <h2 className="steami-heading text-xl md:text-2xl mb-4">
                  {simulations.find(s => s.id === openSim)?.title}
                </h2>

                <p className="text-[13px] font-light italic leading-relaxed mb-6"
                  style={{ color: '#8aacca', borderLeft: '2px solid hsl(var(--steami-gold))', paddingLeft: 18 }}>
                  {simulations.find(s => s.id === openSim)?.description}
                </p>

                {/* 3D Simulation */}
                <div className="mb-4">
                  {openSim === 'quantum' && <QuantumBlochSphere />}
                  {openSim === 'threebody' && <ThreeBodySim />}
                </div>

                {/* Caption */}
                <div className="mt-4 p-3 rounded-lg" style={{ background: 'rgba(6,16,38,0.5)', border: '1px solid rgba(99,179,237,0.14)' }}>
                  <p className="font-mono text-[9px] text-muted-foreground tracking-wider leading-relaxed">
                    ◆ {simulations.find(s => s.id === openSim)?.caption}
                  </p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SteamiLayout>
  );
}
