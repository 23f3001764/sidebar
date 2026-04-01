export interface Explainer {
  id: string;
  title: string;
  subtitle: string;
  field: string;
  badgeColor: string;
  readTime: string;
  content: string[];
  keyInsights: string[];
}

export const explainers: Explainer[] = [
  {
    id: 'quantum-dog',
    title: 'The Quantum Dog: Schrödinger\'s Pet Paradox',
    subtitle: 'How quantum superposition works — explained through a thought experiment about a very confused dog.',
    field: 'QUANTUM PHYSICS',
    badgeColor: 'cyan',
    readTime: '8 MIN READ',
    content: [
      'Imagine a dog inside a sealed kennel. According to quantum mechanics, until you open the door and observe the dog, it exists in a superposition of all possible states — sleeping, playing, barking, and eating simultaneously.',
      'This thought experiment, inspired by Schrödinger\'s famous cat paradox, illustrates one of the most counterintuitive aspects of quantum mechanics: superposition. In the quantum world, particles don\'t have definite properties until they\'re measured.',
      'The act of measurement "collapses" the wave function, forcing the system to choose one definite state. Before measurement, all possibilities coexist in a mathematical framework called the wave function.',
      'Quantum decoherence explains why we don\'t see dogs in superposition in real life. The environment constantly "measures" macroscopic objects, collapsing their quantum states almost instantaneously.',
      'Modern quantum computers exploit superposition by using qubits that can be 0 and 1 simultaneously, enabling parallel computation on an exponential scale.',
      'The implications extend beyond computing: quantum sensing, quantum cryptography, and quantum networks all leverage these strange properties of nature.',
    ],
    keyInsights: [
      'Superposition allows particles to exist in multiple states simultaneously',
      'Measurement collapses the wave function to a definite state',
      'Quantum decoherence prevents macroscopic superposition',
      'Quantum computers leverage superposition for exponential speedup',
    ],
  },
  {
    id: 'crispr-scissors',
    title: 'CRISPR: The Molecular Scissors Rewriting Life',
    subtitle: 'Gene editing technology that could cure diseases, enhance crops, and reshape evolution itself.',
    field: 'BIOLOGY',
    badgeColor: 'green',
    readTime: '7 MIN READ',
    content: [
      'CRISPR-Cas9 is a revolutionary gene-editing tool that allows scientists to cut, delete, and replace DNA sequences with unprecedented precision. Think of it as molecular scissors guided by a GPS.',
      'The technology was adapted from a natural defense system that bacteria use to fight viruses. When a virus attacks, bacteria capture snippets of viral DNA and store them as "memory" to recognize future threats.',
      'Scientists Jennifer Doudna and Emmanuelle Charpentier realized this system could be reprogrammed to target any DNA sequence, earning them the 2020 Nobel Prize in Chemistry.',
      'CRISPR has already shown promise in treating sickle cell disease, certain cancers, and inherited blindness. Clinical trials are advancing rapidly across dozens of conditions.',
      'The technology also raises profound ethical questions: should we edit human embryos? Could gene drives eliminate entire species of mosquitoes? Where do we draw the line?',
      'Next-generation tools like base editing and prime editing offer even more precise modifications, potentially correcting single-letter mutations without cutting the DNA double strand.',
    ],
    keyInsights: [
      'CRISPR-Cas9 acts as programmable molecular scissors for DNA',
      'Adapted from bacterial immune defense systems',
      'Already treating sickle cell disease in clinical trials',
      'Raises critical ethical questions about human germline editing',
    ],
  },
  {
    id: 'neural-networks',
    title: 'Neural Networks: How Machines Learn to Think',
    subtitle: 'From perceptrons to transformers — the architecture of artificial intelligence.',
    field: 'AI',
    badgeColor: 'violet',
    readTime: '10 MIN READ',
    content: [
      'Artificial neural networks are computing systems inspired by the biological neural networks in animal brains. They learn by adjusting the strength of connections between artificial neurons.',
      'The simplest neural network, the perceptron, was invented in 1958. It could only solve linearly separable problems — a limitation that almost killed the field for decades.',
      'The breakthrough came with backpropagation and deep learning: stacking many layers of neurons allows networks to learn hierarchical representations of increasingly abstract features.',
      'Convolutional Neural Networks (CNNs) revolutionized computer vision by learning spatial hierarchies of features. Recurrent Neural Networks (RNNs) tackled sequences like text and speech.',
      'The transformer architecture, introduced in 2017\'s "Attention Is All You Need" paper, replaced recurrence with self-attention mechanisms, enabling massive parallelization and leading to models like GPT and BERT.',
      'Today\'s frontier models contain hundreds of billions of parameters and can write code, compose music, analyze medical images, and engage in complex reasoning — capabilities that seemed impossible just a decade ago.',
    ],
    keyInsights: [
      'Neural networks learn by adjusting connection weights through backpropagation',
      'Deep learning enables hierarchical feature representation',
      'Transformers replaced recurrence with attention for massive parallelism',
      'Modern models demonstrate emergent capabilities at scale',
    ],
  },
  {
    id: 'dark-energy',
    title: 'Dark Energy: The Force Tearing the Universe Apart',
    subtitle: 'The mysterious energy that makes up 68% of the universe and accelerates cosmic expansion.',
    field: 'EARTH & SPACE',
    badgeColor: 'orange',
    readTime: '6 MIN READ',
    content: [
      'In 1998, two teams of astronomers made a shocking discovery: the universe is not just expanding — it\'s accelerating. Something was pushing galaxies apart faster and faster.',
      'This mysterious force was named "dark energy." Despite constituting about 68% of the total energy of the universe, we know almost nothing about what it actually is.',
      'The leading hypothesis is the cosmological constant — a uniform energy density filling space homogeneously. Einstein first introduced this concept in 1917, then called it his "biggest blunder."',
      'Alternative theories include quintessence (a dynamic field that varies in space and time), modifications to general relativity at cosmic scales, and effects of extra dimensions.',
      'Dark energy has profound implications for the fate of the universe. If it remains constant, the universe will expand forever, eventually reaching "heat death." If it strengthens, a "Big Rip" could tear apart even atoms.',
      'Current experiments like the Dark Energy Survey and future missions like ESA\'s Euclid satellite aim to map the history of cosmic expansion with unprecedented precision.',
    ],
    keyInsights: [
      'The universe\'s expansion is accelerating, driven by dark energy',
      'Dark energy constitutes ~68% of the universe\'s total energy',
      'The cosmological constant is the leading theoretical explanation',
      'The fate of the universe depends on dark energy\'s behavior over time',
    ],
  },
  {
    id: 'fusion-energy',
    title: 'Fusion Energy: Bottling a Star on Earth',
    subtitle: 'The quest to harness the power source of the sun for unlimited clean energy.',
    field: 'CLIMATE & ENERGY',
    badgeColor: 'gold',
    readTime: '9 MIN READ',
    content: [
      'Nuclear fusion powers every star in the universe. By fusing hydrogen atoms into helium at extreme temperatures and pressures, stars release enormous amounts of energy according to E=mc².',
      'Recreating this process on Earth requires heating hydrogen plasma to over 100 million degrees Celsius — ten times hotter than the core of the sun. No material can contain such plasma.',
      'Two main approaches exist: magnetic confinement (tokamaks like ITER) uses powerful magnetic fields to contain plasma in a donut shape, while inertial confinement (NIF) uses powerful lasers to compress fuel pellets.',
      'In December 2022, the National Ignition Facility achieved scientific breakeven for the first time — the fusion reaction produced more energy than the lasers delivered to the fuel.',
      'Private fusion companies like Commonwealth Fusion Systems, TAE Technologies, and Helion Energy are pursuing novel approaches, with some promising commercial power by the early 2030s.',
      'If achieved, fusion would provide virtually unlimited, clean energy with no greenhouse gas emissions, no long-lived radioactive waste, and fuel (deuterium) available from seawater.',
    ],
    keyInsights: [
      'Fusion requires temperatures 10x hotter than the sun\'s core',
      'NIF achieved scientific breakeven in December 2022',
      'Multiple private companies target commercial fusion by the 2030s',
      'Fusion fuel (deuterium) is essentially unlimited from seawater',
    ],
  },
  {
    id: 'blockchain-consensus',
    title: 'Blockchain Consensus: Trust Without Authority',
    subtitle: 'How distributed networks agree on truth without a central authority.',
    field: 'COMPUTER SCIENCE',
    badgeColor: 'red',
    readTime: '7 MIN READ',
    content: [
      'The fundamental challenge of distributed systems is the Byzantine Generals Problem: how can multiple parties agree on a course of action when some may be unreliable or malicious?',
      'Blockchain solves this through consensus mechanisms — protocols that allow a network of computers to agree on the state of a shared ledger without trusting any single participant.',
      'Proof of Work (PoW), used by Bitcoin, requires miners to solve computationally expensive puzzles. The first to solve gets to add the next block. This is secure but energy-intensive.',
      'Proof of Stake (PoS), adopted by Ethereum in 2022, selects validators based on their staked cryptocurrency. It\'s ~99.95% more energy-efficient than PoW while maintaining security.',
      'Novel consensus mechanisms continue to emerge: Proof of History (Solana), Directed Acyclic Graphs (IOTA), and Byzantine Fault Tolerant protocols (Cosmos) each offer different tradeoffs.',
      'Beyond cryptocurrency, consensus mechanisms enable decentralized identity, supply chain tracking, voting systems, and any application requiring trustless coordination between strangers.',
    ],
    keyInsights: [
      'Consensus mechanisms solve the Byzantine Generals Problem',
      'Proof of Stake is ~99.95% more energy-efficient than Proof of Work',
      'Multiple novel mechanisms offer different performance tradeoffs',
      'Applications extend far beyond cryptocurrency',
    ],
  },
];
