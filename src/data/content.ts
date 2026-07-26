export const site = {
  name: 'Suraj',
  role: 'Full-Stack Developer',
}

export const navLinks = [
  { id: 'hero', label: 'Enter' },
  { id: 'skills', label: 'Skills' },
  { id: 'projects', label: 'Projects' },
  { id: 'about', label: 'About' },
  { id: 'dino', label: 'Dino Game' },
  { id: 'contact', label: 'Contact' },
]

/** Full-stack skills big companies expect — shown in Skill Chamber */
export const skills = [
  {
    name: 'TypeScript',
    level: 90,
    tag: 'Language',
    move: 'Type Guard',
    desc: 'Catch type bugs at compile time — before they hit production.',
  },
  {
    name: 'Java',
    level: 84,
    tag: 'Language',
    move: 'Object Forge',
    desc: 'OOP basics — class is the blueprint, object is real, methods make it act.',
  },
  {
    name: 'React',
    level: 92,
    tag: 'Frontend',
    move: 'Component Strike',
    desc: 'Click to change state — only the Counter re-renders, not the whole page.',
  },
  {
    name: 'Next.js',
    level: 88,
    tag: 'Frontend',
    move: 'Full-Stack Slash',
    desc: 'Server renders HTML with data — users see content fast, not a blank spinner.',
  },
  {
    name: 'HTML / CSS / JS',
    level: 91,
    tag: 'Frontend',
    move: 'Body Builder',
    desc: 'HTML is structure, CSS is style, JS is behavior.',
  },
  {
    name: 'Node.js',
    level: 86,
    tag: 'Backend',
    move: 'Server Pulse',
    desc: 'Non-blocking event loop — keeps serving other requests while one waits on I/O.',
  },
  {
    name: 'Python',
    level: 82,
    tag: 'Backend',
    move: 'Script Storm',
    desc: 'Cleans messy CSV/XLSX — drop blanks, kill dupes, strip junk. FileSort in action.',
  },
  {
    name: 'PostgreSQL',
    level: 84,
    tag: 'Database',
    move: 'Query Lock',
    desc: 'Relational JOINs — match rows across tables with SQL.',
  },
  {
    name: 'MongoDB',
    level: 78,
    tag: 'Database',
    move: 'Document Shift',
    desc: 'Need a new field? SQL needs a migration — Mongo just accepts the document.',
  },
  {
    name: 'Auth & Security',
    level: 83,
    tag: 'Security',
    move: 'Token Shield',
    desc: 'No JWT → 401. With Bearer token → protected data.',
  },
  {
    name: 'Git & GitHub',
    level: 90,
    tag: 'Tooling',
    move: 'Branch Sync',
    desc: 'Branch, commit, merge — parallel work with a clean history.',
  },
  {
    name: 'Testing',
    level: 81,
    tag: 'Quality',
    move: 'Assert Break',
    desc: 'Fail → fix → pass. Tests catch bugs before users do.',
  },
  {
    name: 'AI / LLM',
    level: 76,
    tag: 'Emerging',
    move: 'Prompt Forge',
    desc: 'Without RAG models hallucinate. With RAG they answer from your docs.',
  },
]

export const projects = [
  {
    id: '01',
    title: 'Sports Lion',
    tagline: 'Sports Never Sleep',
    status: 'LIVE' as const,
    blurb:
      'International sports media site with a cinematic intro video, hero slideshow, and a Sports Hub where category cards play live action on hover — Cricket, Football, Tennis, Horse Racing, Casino Games, and Entertainment.',
    tags: ['HTML', 'CSS', 'JavaScript', 'GSAP', 'Supabase', 'EmailJS', 'Netlify'],
    href: 'https://sportslionuk.netlify.app/',
    accent: '#ffb347',
    year: '2025',
    preview: 'shot' as const,
    shot: '/sportslion-preview.png',
  },
  {
    id: '02',
    title: 'FileSort Cleaner',
    tagline: 'Sports Timing Solutions',
    status: 'LIVE' as const,
    blurb:
      'Python Streamlit tool for race timing teams — upload messy CSV/XLSX timing exports, scan columns, map fields manually or by category, clean the sheet, then download a ready file.',
    tags: ['Python', 'Streamlit', 'Pandas', 'Excel', 'CSV'],
    href: 'https://sportstimingsolutionsfilesort.streamlit.app/',
    accent: '#ff8a3d',
    year: '2025',
    preview: 'shot' as const,
    shot: '/filesort-preview.png',
  },
]

export const about = {
  eyebrow: 'About me',
  title: 'The person behind the code.',
  intro:
    "I believe the best software doesn't just work — it inspires. As a Full-Stack Developer, I specialize in crafting modern web applications that blend elegant design, powerful engineering, and seamless user experiences. My goal is simple: create technology that people enjoy using and businesses trust to grow.",
  education: [
    {
      school: 'J.J. Academy',
      program: 'SSC',
      result: '86.10%',
      logo: '/JJA-edu.jpg',
    },
    {
      school: 'K.J. Somaiya Polytechnic',
      program: 'Diploma in Computer Science',
      result: '85.10%',
      logo: '/KJSomaiya-edu.jpg',
    },
    {
      school: 'S.M.T. Indira Gandhi College of Engineering',
      program: 'Degree in Computer Science',
      result: 'Pursuing',
      logo: '/smtIndiraGandhi-edu.png',
    },
  ],
  experience: [
    {
      company: 'Squad Infotech',
      role: 'Internship',
      period: 'Jun 2023 – Jul 2023 · 2 mos',
      place: 'Vashi · On-site',
      logo: '/squad-logo.jpg',
      points: [
        'Worked on real software testing and development workflows in an on-site team.',
        'Learned how production teams plan, build, and ship features under deadlines.',
      ],
      stack: ['Python', 'Pandas', 'NumPy', 'OpenCV', 'Matplotlib', 'Scikit-learn'],
    },
    {
      company: 'NullClass',
      role: 'Web Development Training · Apprenticeship',
      period: 'May 2025 – Jun 2025 · 2 mos',
      place: 'India · Remote',
      logo: '/Null-logo.png',
      points: [
        'Completed hands-on web development training focused on building real interfaces.',
        'Strengthened frontend fundamentals and project delivery habits.',
      ],
      stack: ['MERN Stack', 'Bootstrap', 'HTML', 'CSS', 'JavaScript'],
    },
    {
      company: 'Sports Timing Solutions',
      role: 'Developer · STS Travells',
      period: 'Present',
      place: 'Sports technology',
      logo: '/sts-logo.png',
      points: [
        'Built a Python bot, travelling website, and ops-team tools for race timing workflows.',
        'Shipped across frontend, backend, and hosting — from FileSort cleanup to live deploys.',
      ],
      stack: ['HTML', 'CSS', 'JS', 'Python', 'Supabase', 'MongoDB', 'Vercel', 'Netlify'],
    },
  ],
  /** Terminal lines for the live laptop screen — full + compact for small screens */
  terminal: {
    intro: {
      full: [
        '$ whoami',
        'suraj · full-stack developer',
        'focus: design × engineering × experience',
        'status: online · building',
      ],
      compact: [
        '$ whoami',
        'suraj · full-stack',
        'status: online',
      ],
    },
    education: {
      full: [
        '$ build knowledge --tree',
        '✓ J.J. Academy · SSC · 86.10%',
        '✓ K.J. Somaiya · Diploma CS · 85.10%',
        '… Indira Gandhi · Degree CS · pursuing',
        'build: 2 passed · 1 in progress',
      ],
      compact: [
        '$ build knowledge',
        '✓ SSC 86% · Diploma 85%',
        '… Degree CS · pursuing',
      ],
    },
    experience: {
      full: [
        '$ deploy --career',
        '→ Squad Infotech · internship',
        '→ NullClass · web apprenticeship',
        '→ Sports Timing Solutions · live',
        'deploy: success · 3 missions',
      ],
      compact: [
        '$ deploy --career',
        '→ Squad · NullClass · STS',
        'deploy: success',
      ],
    },
  },
}

export const contact = {
  email: 'surajsolanki1510@gmail.com',
  phone: '+91 85914 14765',
  whatsapp: 'https://wa.me/918591414765?text=Hey%20Suraj%2C%20I%20saw%20your%20portfolio.',
  resume: '/Suraj-Solanki-Resume.pdf',
  status: 'AVAILABLE FOR WORK',
}

/** Profile links only — email / WhatsApp / call live as dedicated actions above */
export const socials = [
  { label: 'GitHub', href: 'https://github.com/surajsolanki1510', kind: 'github' as const },
  {
    label: 'LinkedIn',
    href: 'https://www.linkedin.com/in/suraj-solanki-805893245/',
    kind: 'linkedin' as const,
  },
  {
    label: 'Instagram',
    href: 'https://www.instagram.com/s.oo.raj',
    kind: 'instagram' as const,
  },
]
