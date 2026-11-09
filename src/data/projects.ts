export type ProjectId = 'ai-car' | 'art-transfer' | 'local-llm' | 'smoi';

export interface Project {
  id: ProjectId;
  /** Vinyl "track" shown on the record label */
  track: string;
  name: string;
  /** Text that runs around the badge ring (must fill the circle, keep ~28-36 chars) */
  ring: string;
  /** Pastel used for this project's label, highlights and chips */
  color: string;
  tagline: string;
  about: string;
  how: string[];
  stats: { value: string; label: string }[];
  stack: string[];
  links: { label: string; href: string }[];
}

export const PROJECTS: Project[] = [
  {
    id: 'ai-car',
    track: 'A1',
    name: 'AI Car',
    ring: 'AI CAR ✦ NEAT ✦ NEUROEVOLUTION ✦ ',
    color: '#b8ddb1',
    tagline: 'Draw a track. Watch 50 cars teach themselves to drive it.',
    about:
      'A self-driving car simulator where neural networks learn to navigate a track you draw yourself. Every generation, 50 cars spawn at the start; the ones that survive longest and get closest to the goal pass their brains on, and NEAT mutates them, growing new neurons and connections along the way.',
    how: [
      'Left-drag to paint the road, right-click to drop the goal, then hit Start Training.',
      'Each car sees 13 inputs: its position, angle, speed, heading and distance to the goal, plus 7 distance sensors fanned from -90° to 90°.',
      'The network outputs just two numbers: steering and acceleration.',
      'Fitness rewards staying alive, getting closer, actually moving, and a 5000-point bonus for reaching the goal.',
    ],
    stats: [
      { value: '50', label: 'cars / gen' },
      { value: '13', label: 'inputs' },
      { value: '2', label: 'outputs' },
      { value: '50', label: 'generations' },
    ],
    stack: ['Python', 'Pygame', 'NEAT-Python'],
    links: [{ label: 'view code', href: 'https://github.com/chiranjeevbharali10/AI_car' }],
  },
  {
    id: 'art-transfer',
    track: 'A2',
    name: 'Art Transfer',
    ring: 'ART TRANSFER ✦ VGG19 ✦ PYTORCH ✦ ',
    color: '#f6c8d5',
    tagline: 'Your photo, repainted in the brushstrokes of a masterpiece.',
    about:
      'Neural Style Transfer in PyTorch: take the structure of one image and the artistic style of another, and optimise a new image that has both. Based on Gatys et al. (2015), using a VGG19 network pretrained on ImageNet as the eyes that judge content and style.',
    how: [
      'Content image: the photo whose layout you want to keep.',
      'Style image: the painting whose textures and colours you want to borrow.',
      'Style is captured as Gram matrices of VGG19 feature maps; content as the raw features of a deeper layer.',
      'L-BFGS nudges the pixels of the output until both losses are low, on the GPU when CUDA is available.',
    ],
    stats: [
      { value: 'VGG19', label: 'feature net' },
      { value: 'L-BFGS', label: 'optimiser' },
      { value: '2', label: 'losses' },
      { value: 'CUDA', label: 'accelerated' },
    ],
    stack: ['Python', 'PyTorch', 'torchvision', 'Pillow', 'NumPy'],
    links: [{ label: 'view code', href: 'https://github.com/chiranjeevbharali10/Art_Transfer' }],
  },
  {
    id: 'local-llm',
    track: 'A3',
    name: 'Local LLM',
    ring: 'LOCAL LLM ✦ vLLM ✦ FASTAPI ✦ GPU ✦ ',
    color: '#c9d8f4',
    tagline: 'A production-style LLM inference stack, squeezed onto a 6GB laptop GPU.',
    about:
      'A self-hosted inference server built to understand how LLM serving really works: not the maths, but deployment, GPU memory, batching, observability and load testing. Requests flow through Nginx and a FastAPI gateway into vLLM, with Prometheus and Grafana watching every step.',
    how: [
      'Nginx at the edge: one entry point and rate limiting (10 req/min per IP).',
      'FastAPI gateway: API-key auth and Prometheus metrics, then forwards to vLLM.',
      'vLLM serves Qwen2.5-1.5B-Instruct with PagedAttention and continuous batching, run on the host to save VRAM.',
      'Load-tested with Locust: zero failures at 50 concurrent users, p99 only rising from 640ms to 710ms.',
    ],
    stats: [
      { value: '6GB', label: 'VRAM' },
      { value: '1.5B', label: 'params' },
      { value: '0', label: 'failures @50 users' },
      { value: '710ms', label: 'p99 latency' },
    ],
    stack: ['vLLM', 'FastAPI', 'Nginx', 'Docker Compose', 'Prometheus', 'Grafana', 'Locust'],
    links: [{ label: 'view code', href: 'https://github.com/chiranjeevbharali10/LocalLLMInference' }],
  },
  {
    id: 'smoi',
    track: 'B1',
    name: 'SMOI',
    ring: 'SMOI ✦ RAG ✦ JAVA ✦ PIXEL FROG ✦ ',
    color: '#e9d9f5',
    tagline: 'A tiny pixel frog on your desktop with a hand-built RAG brain.',
    about:
      'SMOI lives on your Windows desktop as a pixel-art frog. Behind it is a retrieval-augmented generation backend written from scratch in Java: feed it documents or whole folders, ask questions, and get answers that cite the exact page they came from. If your files don\'t say, SMOI says it doesn\'t know.',
    how: [
      'Hand-written hybrid retrieval: Postgres full-text plus pgvector search, merged with reciprocal rank fusion. No LangChain.',
      'Checked citations: the model may only cite passages it was given, otherwise the answer is withheld.',
      'A Postgres job queue (FOR UPDATE SKIP LOCKED) ingests PDFs, DOCX and TXT with structure-aware chunking.',
      'Also handles tasks, reminders, calendar and mail, and only ever drafts: it never sends or deletes.',
    ],
    stats: [
      { value: 'Java 21', label: 'backend' },
      { value: 'RRF', label: 'hybrid search' },
      { value: '5', label: 'companions' },
      { value: '0', label: 'frameworks for RAG' },
    ],
    stack: ['Java 21', 'Spring Boot 4', 'PostgreSQL', 'pgvector', 'Electron', 'React', 'TypeScript', 'Ollama'],
    links: [
      { label: 'visit site', href: 'https://smoi-indol.vercel.app/' },
      { label: 'view code', href: 'https://github.com/chiranjeevbharali10/SMOI' },
    ],
  },
];
