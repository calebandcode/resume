export interface ResumeBullet {
  id: string;
  text: string;
  /** Transcript snippet or user input that grounds this claim */
  sourceEvidence?: string;
  verified: boolean;
}

export interface ExperienceItem {
  id: string;
  role: string;
  company: string;
  location: string;
  period: string;
  bullets: ResumeBullet[];
}

export interface ProjectItem {
  id: string;
  name: string;
  tagline: string;
  tech: string[];
  link?: string;
  highlights: ResumeBullet[];
}

export interface ReferenceItem {
  id: string;
  name: string;
  title: string;
  contact: string;
}

export interface EducationItem {
  id: string;
  school: string;
  degree: string;
  period: string;
  description?: string;
}

export interface CareerProfile {
  fullName: string;
  headline: string;
  avatarUrl?: string;
  addressLine1?: string;
  location: string;
  phone?: string;
  email: string;
  website?: string;
  linkedin?: string;
  facebook?: string;
  behance?: string;
  github?: string;
  summary: string;
  summaryEvidence?: string;
  experience: ExperienceItem[];
  projects: ProjectItem[];
  education: EducationItem[];
  skills: string[];
  references?: ReferenceItem[];
}

export type DiffTargetType =
  | 'summary'
  | 'experience_bullet'
  | 'project_highlight'
  | 'add_experience'
  | 'add_project';

export interface PendingDiff {
  id: string;
  targetType: DiffTargetType;
  /** Parent item id (experience or project) when applicable */
  parentId?: string;
  /** Bullet/highlight id when modifying an existing line */
  targetId?: string;
  originalText: string;
  proposedText: string;
  reason: string;
  sourceEvidence: string;
  /** Optional structured payload for new items */
  newExperience?: ExperienceItem;
  newProject?: ProjectItem;
}

export type DiagnosticSeverity = 'warning' | 'info' | 'verified';

export interface LinterDiagnostic {
  id: string;
  targetId: string;
  severity: DiagnosticSeverity;
  title: string;
  message: string;
  suggestedAction?: string;
}

export const INITIAL_PROFILE: CareerProfile = {
  fullName: 'Stephanie Roberts',
  headline: 'Graphic Designer & Illustrator',
  addressLine1: '150 Forest Ave',
  location: 'Palo Alto, CA 94301',
  phone: '+1 (650) 289 3400',
  email: 'st.roberts@gmail.com',
  website: 'www.srdesigns.com',
  linkedin: 'LinkedIn.com/st.roberts',
  facebook: 'Facebook.com/st.roberts',
  behance: 'Behance.net/st.roberts',
  summary:
    'Highly creative and multitalented Graphic Designer with extensive experience in multimedia, marketing and print design. Exceptional collaborative and interpersonal skills; dynamic team player with well developed written and verbal communication abilities. I was full-time freelancer before I started working in companies.',
  summaryEvidence: 'Initial profile',
  experience: [
    {
      id: 'exp-1',
      role: 'Product Designer',
      company: 'Apple Inc.',
      location: 'Cupertino, CA',
      period: 'September 2015 - Present, 2 years 1 month',
      bullets: [
        {
          id: 'b-1',
          text: 'Product design is the process of transforming your wireframe ideas into mock ups. It is important to consider the platform you’re designing in order to understand the needs of the developers on the way to final product.',
          sourceEvidence: 'Apple Inc. role description',
          verified: true,
        },
      ],
    },
    {
      id: 'exp-2',
      role: 'User Experience Designer',
      company: 'Google Inc.',
      location: 'Mountain View, CA',
      period: 'May 2012 - September 2015, 3 years 4 months',
      bullets: [
        {
          id: 'b-2',
          text: 'Visual interface designers can play an important role on a UX team and make significant contributions to a team UX design effort, but they are not UX Designers. Being a UX Designer comprehends all of this and so much more.',
          sourceEvidence: 'Google Inc. role description',
          verified: true,
        },
      ],
    },
    {
      id: 'exp-3',
      role: 'Graphic Designer',
      company: 'Facebook Inc.',
      location: 'Menlo Park, CA',
      period: 'January 2008 - May 2012, 4 years 5 months',
      bullets: [
        {
          id: 'b-3',
          text: 'Graphic design is a creative process that combines art and technology to communicate ideas. The designer works with a variety of communication tools in order to convey a message from a client to a particular audience.',
          sourceEvidence: 'Facebook Inc. role description',
          verified: true,
        },
      ],
    },
  ],
  projects: [
    {
      id: 'proj-1',
      name: 'Apple Design System',
      tagline: 'Cross-platform UI kits and interactive prototypes.',
      tech: ['Sketch', 'Principle', 'InVision'],
      link: 'srdesigns.com',
      highlights: [
        {
          id: 'ph-1',
          text: 'Transformed wireframe concepts into production-ready mockups across iOS and web.',
          sourceEvidence: 'Product Designer work',
          verified: true,
        },
      ],
    },
  ],
  education: [
    {
      id: 'edu-1',
      school: 'Coursera.org',
      degree: 'Introduction to User Experience Design',
      period: 'August 2014 - February 2015, 6 months',
      description:
        'Being a UX Designer comprehends all of this and so much more. Visual interface designers can play an important role on a UX team and make significant contributions to a team UX design effort, but they are not User Interface Designers.',
    },
    {
      id: 'edu-2',
      school: 'Stanford University, Santa Clara, CA',
      degree: 'Master of Design',
      period: 'October 2007 - June 2008, 9 months',
      description:
        'Graduates with a Master of Design should be well-equipped to interpret cultural and societal needs and trends, in order to develop the most appropriate formats, designs and multimedia to achieve a desired sensation or function.',
    },
    {
      id: 'edu-3',
      school: 'CIT, Pasadena, CA',
      degree: 'Bachelor of Arts',
      period: 'October 2004 - June 2007, 2 years 9 months',
      description:
        'Core teaching weaves together a range of different approaches to the cultural industries: high-level business management, creative entrepreneurship, art and culture fundraising, event management, and design and creative marketing.',
    },
  ],
  skills: [
    'Research',
    'Photoshop',
    'Analytics',
    'Illustrator',
    'Collaboration',
    'Sketch',
    'Prototyping',
    'Experience Design',
    'Interaction design',
    'Axure',
    'Coding',
    'Invision',
    'Communication',
    'Principle',
    'Writing',
    'XCode',
  ],
  references: [
    {
      id: 'ref-1',
      name: 'Matt Hudson',
      title: 'Project Lead at Google LLC.',
      contact: 'Mountain View, CA, +1 (702) 962-9000, matt.hudson@google.com',
    },
    {
      id: 'ref-2',
      name: 'Amanda Hendrick',
      title: 'HR Manager at Facebook Inc.',
      contact: 'Menlo Park, CA, +1 (835) 983-9094, amanda.hendrick@facebook.com',
    },
    {
      id: 'ref-3',
      name: 'George Willson',
      title: 'Vice President at Apple Inc.',
      contact: 'Cupertino, CA, +1 (944) 877-9833, george.willson@apple.com',
    },
  ],
};

