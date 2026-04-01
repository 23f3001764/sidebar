export const FIELDS = [
  'PHYSICS', 'CHEMISTRY', 'BIOLOGY', 'MEDICINE', 'EARTH & SPACE',
  'COMPUTER SCIENCE', 'AI', 'ROBOTICS', 'ENGINEERING',
  'MATHEMATICS & DATA', 'CLIMATE & ENERGY',
] as const;

export type Field = typeof FIELDS[number];

export const FIELD_ICONS: Record<Field, string> = {
  'PHYSICS': '⚛️',
  'CHEMISTRY': '🧪',
  'BIOLOGY': '🧬',
  'MEDICINE': '💊',
  'EARTH & SPACE': '🌍',
  'COMPUTER SCIENCE': '💻',
  'AI': '🤖',
  'ROBOTICS': '🦾',
  'ENGINEERING': '⚙️',
  'MATHEMATICS & DATA': '📐',
  'CLIMATE & ENERGY': '🌱',
};

export const FIELD_COLORS: Record<Field, string> = {
  'PHYSICS': 'cyan',
  'CHEMISTRY': 'orange',
  'BIOLOGY': 'green',
  'MEDICINE': 'red',
  'EARTH & SPACE': 'violet',
  'COMPUTER SCIENCE': 'cyan',
  'AI': 'violet',
  'ROBOTICS': 'orange',
  'ENGINEERING': 'gold',
  'MATHEMATICS & DATA': 'cyan',
  'CLIMATE & ENERGY': 'green',
};

export interface Article {
  id: string;
  title: string;
  abstract: string;
  field: Field;
  author: string;
  date: string;
  readTime: string;
  content: string[];
  quotes: string[];
  keyFindings: string[];
  relatedTopics: string[];
}

export const articles: Article[] = [
  {
    id: 'a1', title: 'Topological Qubits Achieve 99.9% Fidelity', abstract: 'Microsoft Research demonstrates record-breaking qubit stability using Majorana fermions in topological superconductors.', field: 'PHYSICS', author: 'Dr. Sarah Chen', date: '2025-03-15', readTime: '12 min',
    content: ['Topological quantum computing has long been considered the holy grail of quantum information science. Unlike conventional qubits that are fragile and error-prone, topological qubits encode information in the global properties of a quantum system.', 'The key innovation lies in using Majorana fermions — exotic particles that are their own antiparticles. When these particles are braided around each other, they perform quantum computations that are inherently protected from local noise.', 'Microsoft\'s latest breakthrough achieved 99.9% gate fidelity, surpassing the threshold needed for practical quantum error correction. This means that topological quantum computers could require orders of magnitude fewer physical qubits.', 'The implications are staggering: drug discovery simulations that would take classical computers millions of years could be completed in hours. Materials science, cryptography, and optimization problems all stand to benefit.'],
    quotes: ['"This is the moment topological quantum computing goes from theory to engineering." — Dr. Chetan Nayak, Microsoft'],
    keyFindings: ['99.9% gate fidelity achieved', 'Majorana fermion braiding demonstrated at scale', '1000x fewer physical qubits needed vs. conventional approaches'],
    relatedTopics: ['Quantum Error Correction', 'Majorana Fermions', 'Topological Insulators'],
  },
  {
    id: 'a2', title: 'CRISPR Base Editing Cures Beta-Thalassemia in Phase III Trial', abstract: 'Vertex Pharmaceuticals reports 94% of patients achieved transfusion independence after single-dose base editing therapy.', field: 'MEDICINE', author: 'Prof. James Liu', date: '2025-03-10', readTime: '10 min',
    content: ['In a landmark Phase III clinical trial, base editing technology has achieved what was once considered impossible: a functional cure for beta-thalassemia, a genetic blood disorder affecting millions worldwide.', 'Unlike traditional CRISPR-Cas9 which creates double-strand breaks, base editing makes precise single-nucleotide changes without cutting the DNA backbone, dramatically reducing the risk of unintended mutations.', 'Patients received a single infusion of edited stem cells. Within three months, 94% no longer required regular blood transfusions — a treatment they had depended on since childhood.', 'The therapy works by reactivating fetal hemoglobin production, bypassing the defective adult hemoglobin gene. This elegant approach could also treat sickle cell disease.'],
    quotes: ['"We are witnessing the dawn of precision genetic medicine." — Prof. David Liu, Broad Institute'],
    keyFindings: ['94% transfusion independence rate', 'Single-dose treatment protocol', 'No serious adverse events in 18-month follow-up'],
    relatedTopics: ['Base Editing', 'Gene Therapy', 'Hemoglobin Disorders'],
  },
  {
    id: 'a3', title: 'GPT-6 Demonstrates PhD-Level Scientific Reasoning', abstract: 'OpenAI\'s latest model passes graduate-level exams across 50 scientific disciplines with 92% accuracy.', field: 'AI', author: 'Dr. Maya Patel', date: '2025-03-12', readTime: '14 min',
    content: ['The latest frontier model from OpenAI has achieved a milestone that many AI researchers didn\'t expect for years: PhD-level performance across diverse scientific disciplines.', 'GPT-6 was evaluated on graduate qualifying exams from 50 top universities, spanning physics, chemistry, biology, mathematics, and engineering. It achieved 92% accuracy overall.', 'More remarkably, the model demonstrated genuine scientific reasoning — formulating hypotheses, designing experiments, and identifying flaws in published papers with accuracy rivaling domain experts.', 'Critics note that passing exams doesn\'t equal scientific creativity. However, the model\'s ability to connect disparate findings across fields has already led to novel research hypotheses being investigated in labs.'],
    quotes: ['"This doesn\'t replace scientists — it gives every scientist a tireless, knowledgeable collaborator." — Dr. Ilya Sutskever'],
    keyFindings: ['92% accuracy across 50 graduate-level scientific exams', 'Novel hypothesis generation capabilities', 'Cross-disciplinary reasoning surpassing individual human experts'],
    relatedTopics: ['Large Language Models', 'Scientific Discovery', 'AI Safety'],
  },
  {
    id: 'a4', title: 'Perovskite-Silicon Tandem Solar Cells Break 35% Efficiency', abstract: 'NREL and Oxford PV achieve new world record for commercial-size solar cell efficiency, approaching the theoretical limit.', field: 'CLIMATE & ENERGY', author: 'Dr. Kenji Watanabe', date: '2025-03-08', readTime: '8 min',
    content: ['A collaboration between the National Renewable Energy Laboratory and Oxford PV has shattered the solar cell efficiency record, achieving 35.2% for commercial-size tandem cells.', 'Tandem cells stack a perovskite layer on top of a conventional silicon cell. The perovskite captures high-energy blue light, while silicon captures lower-energy red and infrared light.', 'At 35.2% efficiency, these cells convert more than a third of incoming sunlight into electricity — approaching the theoretical Shockley-Queisser limit for tandem architectures.', 'Manufacturing costs are projected to add only 10-15% to conventional silicon panel prices, making this technology commercially viable within 2-3 years.'],
    quotes: ['"This is the technology that will power the next generation of solar farms." — Dr. Henry Snaith, Oxford PV'],
    keyFindings: ['35.2% efficiency world record', 'Only 10-15% cost premium over silicon', 'Commercial production expected by 2027'],
    relatedTopics: ['Perovskites', 'Photovoltaics', 'Renewable Energy Economics'],
  },
  {
    id: 'a5', title: 'Boston Dynamics Atlas Achieves Autonomous Construction Tasks', abstract: 'Humanoid robot completes full framing of a residential wall without human intervention in 4 hours.', field: 'ROBOTICS', author: 'Dr. Raj Mehta', date: '2025-03-05', readTime: '9 min',
    content: ['Boston Dynamics has demonstrated a new milestone in humanoid robotics: the Atlas robot autonomously framed a residential wall in just 4 hours, a task that typically takes two skilled carpenters 6-8 hours.', 'The robot used a combination of reinforcement learning and large language model-guided planning to interpret blueprints, select materials, and execute complex manipulation tasks.', 'Key innovations include adaptive grasp planning that handles irregular lumber, real-time structural analysis to ensure proper load distribution, and recovery behaviors when tools are dropped or materials break.', 'The construction industry faces a severe labor shortage, with an estimated 500,000 unfilled positions in the US alone. Robotic construction could address this gap while improving safety.'],
    quotes: ['"We\'re not replacing construction workers — we\'re augmenting them for dangerous and repetitive tasks." — Robert Playter, CEO, Boston Dynamics'],
    keyFindings: ['4-hour autonomous wall framing', 'Adaptive manipulation with irregular materials', 'Integration of LLM planning with physical control'],
    relatedTopics: ['Humanoid Robots', 'Construction Technology', 'Reinforcement Learning'],
  },
  {
    id: 'a6', title: 'Room-Temperature Superconductor Confirmed by Three Independent Labs', abstract: 'LK-99 successor material shows zero resistance at 15°C and ambient pressure, verified across MIT, Max Planck, and RIKEN.', field: 'PHYSICS', author: 'Dr. Elena Volkov', date: '2025-02-28', readTime: '11 min',
    content: ['In what may be the most significant physics discovery of the century, three independent laboratories have confirmed room-temperature superconductivity in a modified copper-lead apatite material.', 'The material, designated CPA-2, shows zero electrical resistance at temperatures up to 15°C (59°F) at ambient pressure — shattering the previous record which required extreme pressures.', 'Researchers at MIT, Max Planck Institute, and RIKEN independently synthesized the material using a modified process that creates a specific crystalline defect pattern essential for superconductivity.', 'Applications could revolutionize every aspect of technology: lossless power transmission, levitating transportation, quantum computers operating at room temperature, and MRI machines small enough for a doctor\'s office.'],
    quotes: ['"If this holds up, it\'s the most important materials discovery since the transistor." — Prof. Philip Anderson, Princeton'],
    keyFindings: ['Zero resistance confirmed at 15°C ambient pressure', 'Three independent reproductions', 'Specific crystal defect pattern identified as mechanism'],
    relatedTopics: ['Superconductivity', 'Materials Science', 'Condensed Matter Physics'],
  },
  {
    id: 'a7', title: 'DeepMind Solves Protein-Protein Interaction Prediction', abstract: 'AlphaFold 4 predicts multi-protein complex formations with 95% accuracy, unlocking drug target discovery.', field: 'BIOLOGY', author: 'Dr. Ana Torres', date: '2025-03-01', readTime: '10 min',
    content: ['DeepMind\'s AlphaFold 4 has solved one of biology\'s grand challenges: predicting how multiple proteins interact and assemble into functional complexes.', 'While AlphaFold 2 revolutionized single-protein structure prediction, most biological functions depend on complex interactions between multiple proteins. AlphaFold 4 predicts these assemblies with 95% accuracy.', 'The model was trained on cryo-electron microscopy data of over 100,000 protein complexes, learning the subtle rules that govern protein-protein recognition and binding.', 'This capability is transformative for drug discovery. Understanding how disease-related proteins interact allows researchers to design drugs that precisely disrupt pathological interactions while leaving healthy ones intact.'],
    quotes: ['"This is the missing piece that turns structural biology into a truly predictive science." — Demis Hassabis, CEO, DeepMind'],
    keyFindings: ['95% accuracy for multi-protein complex prediction', 'Trained on 100,000+ cryo-EM structures', 'Already identified 12 novel drug targets'],
    relatedTopics: ['Protein Folding', 'Drug Discovery', 'Structural Biology'],
  },
  {
    id: 'a8', title: 'Solid-State Batteries Enter Mass Production', abstract: 'Toyota begins commercial production of solid-state batteries with 1,200km range and 10-minute charging.', field: 'ENGINEERING', author: 'Dr. Yuki Tanaka', date: '2025-03-18', readTime: '7 min',
    content: ['Toyota has begun mass production of solid-state batteries at its Himeji facility, marking the beginning of a new era for electric vehicles and energy storage.', 'The batteries use a sulfide-based solid electrolyte instead of liquid, enabling higher energy density (500 Wh/kg vs 250 Wh/kg for current lithium-ion), faster charging, and improved safety.', 'Initial production will supply Toyota\'s new flagship EV, offering 1,200km range and 10% to 80% charging in just 10 minutes — eliminating the two biggest barriers to EV adoption.', 'The technology also enables new form factors: batteries can be made thinner, lighter, and in arbitrary shapes, opening possibilities for wearable electronics, aerospace, and grid storage.'],
    quotes: ['"Solid-state batteries will do for EVs what lithium-ion did for smartphones." — Akio Toyoda, Toyota Chairman'],
    keyFindings: ['500 Wh/kg energy density (2x current Li-ion)', '10-minute fast charging to 80%', 'Mass production at commercial scale'],
    relatedTopics: ['Battery Technology', 'Electric Vehicles', 'Energy Storage'],
  },
  {
    id: 'a9', title: 'Riemann Hypothesis Proof Verified by Mathematical Community', abstract: 'After 3 years of scrutiny, the proof by Dr. Yitang Zhang is accepted, solving the 165-year-old problem.', field: 'MATHEMATICS & DATA', author: 'Dr. Michael Torres', date: '2025-02-20', readTime: '13 min',
    content: ['The mathematical community has formally accepted a proof of the Riemann Hypothesis, one of the seven Millennium Prize Problems and arguably the most important unsolved problem in mathematics.', 'Dr. Yitang Zhang, known for his breakthrough on bounded gaps between primes, submitted the proof in 2022. After three years of intense verification by dozens of mathematicians, no errors have been found.', 'The Riemann Hypothesis concerns the distribution of prime numbers and the zeros of the Riemann zeta function. Its proof has implications across mathematics, physics, and cryptography.', 'RSA cryptography, which secures most internet communications, relies on the difficulty of factoring large numbers — intimately connected to prime distribution. The proof\'s implications for cybersecurity are still being assessed.'],
    quotes: ['"This is the Mount Everest of mathematics. Zhang has reached the summit." — Prof. Terence Tao, UCLA'],
    keyFindings: ['Proof verified by 40+ independent mathematicians', 'Implications for prime number distribution fully characterized', 'Potential impact on RSA cryptography security assessment'],
    relatedTopics: ['Number Theory', 'Zeta Function', 'Prime Distribution'],
  },
  {
    id: 'a10', title: 'Mars Sample Return: First Martian Soil Arrives on Earth', abstract: 'ESA-NASA joint mission successfully delivers 350g of Perseverance-collected Mars samples to Utah facility.', field: 'EARTH & SPACE', author: 'Dr. Clara Novak', date: '2025-03-20', readTime: '8 min',
    content: ['In a historic achievement for space exploration, the first samples of Martian soil have safely landed on Earth, completing a mission that took over a decade of planning and execution.', 'The Mars Sample Return mission, a joint effort between ESA and NASA, retrieved 30 sealed tubes cached by the Perseverance rover across Jezero Crater — an ancient lake bed believed to have once harbored microbial life.', 'The 350 grams of material include sedimentary rocks, igneous samples, and atmospheric gases. Preliminary analysis suggests the presence of complex organic molecules, though biological origin has not been confirmed.', 'Samples are being distributed to 200 laboratories in 30 countries for analysis, using instruments far more sensitive than any rover could carry. Results are expected to transform our understanding of Mars\'s habitability.'],
    quotes: ['"Holding a piece of Mars in your hands — it changes your perspective on what\'s possible." — Dr. Laurie Leshin, JPL Director'],
    keyFindings: ['350g of Martian material safely returned', 'Complex organic molecules detected in preliminary analysis', '200 labs in 30 countries conducting analysis'],
    relatedTopics: ['Mars Exploration', 'Astrobiology', 'Sample Return Missions'],
  },
  {
    id: 'a11', title: 'Catalytic CO2 Conversion Achieves Industrial Scale', abstract: 'Carbon Engineering\'s new catalyst converts atmospheric CO2 to jet fuel at $80/barrel, competitive with fossil fuels.', field: 'CHEMISTRY', author: 'Dr. Amara Osei', date: '2025-03-14', readTime: '9 min',
    content: ['Carbon Engineering has achieved a breakthrough that could transform the fight against climate change: converting atmospheric CO2 into synthetic jet fuel at costs competitive with fossil fuels.', 'The new iron-cobalt catalyst operates at lower temperatures and pressures than previous approaches, dramatically reducing energy requirements. The process captures CO2 directly from air and combines it with green hydrogen.', 'At $80 per barrel equivalent, synthetic aviation fuel is now within the price range of conventional jet fuel, removing the economic barrier to decarbonizing the aviation industry.', 'The company has broken ground on a facility in Texas that will produce 100 million liters of synthetic fuel annually, enough to power 10,000 transatlantic flights per year.'],
    quotes: ['"We\'re turning air pollution into aviation fuel. The circular carbon economy is here." — Steve Oldham, CEO, Carbon Engineering'],
    keyFindings: ['$80/barrel synthetic fuel from atmospheric CO2', 'New catalyst reduces energy requirements by 60%', '100 million liter/year facility under construction'],
    relatedTopics: ['Carbon Capture', 'Catalysis', 'Sustainable Aviation'],
  },
];
