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

export const CLASSIC_PROFILE: CareerProfile = {
  fullName: 'GRAHAM MADDOX',
  headline: 'Professional Title',
  location: 'City, Country',
  phone: '0123 000 0000',
  email: 'name.surname@email.com',
  summary:
    'Write a brief, engaging text about yourself. Provide information about your educational background, work experience, and skills relevant to the role you are applying for. Describe your most impressive achievement and quantify it. Fill the personal profile with keywords from the job description. Try to cover all mandatory requirements within four to five sentences. To make it easier for you, we have created a template – take a look at page 12 in the Resume writing workbook. We hope this helps!',
  summaryEvidence: 'Graham Maddox classic template',
  experience: [
    {
      id: 'c-exp-1',
      role: 'JOB TITLE',
      company: 'Company name',
      location: 'City, Country',
      period: '03/2023 – Present',
      bullets: [
        {
          id: 'c-b-1',
          text: "Use bullet point lists to describe your main responsibilities and achievements. Start every bullet point with an action verb, such as 'improved', 'coordinated' and 'implemented', especially if you are describing your previous accomplishments.",
          verified: false,
        },
        {
          id: 'c-b-2',
          text: 'Be consistent with the tense you are using. The recommendation is to describe your current role in present continuous tense and previous roles in past simple tense.',
          verified: false,
        },
        {
          id: 'c-b-3',
          text: "Write 3 to 5 bullet points for each job. You don't need to include all tasks you have ever had. Instead, focus on relevant ones.",
          verified: false,
        },
      ],
    },
    {
      id: 'c-exp-2',
      role: 'JOB TITLE',
      company: 'Company name',
      location: 'City, Country',
      period: '06/2020 – 02/2023',
      bullets: [
        {
          id: 'c-b-4',
          text: 'Again describe your responsibilities and achievements by using bullet points.',
          verified: false,
        },
        {
          id: 'c-b-5',
          text: 'Tailor your descriptions to the role you are applying for by reorganizing the bullet point list. The easiest way to do it is to put the most relevant tasks closer to the top of your description.',
          verified: false,
        },
        {
          id: 'c-b-6',
          text: 'Quantify your responsibilities and achievements wherever possible. Include relevant measures (e.g. increased sales or reduced complaints by 12.5%). For more examples take a look at the Resume Writing Workbook, page 13.',
          sourceEvidence: '12.5% metric example',
          verified: true,
        },
        {
          id: 'c-b-7',
          text: 'If you want to highlight your accomplishments even more, feel free to bold numbers included in the description.',
          verified: false,
        },
      ],
    },
    {
      id: 'c-exp-3',
      role: 'JOB TITLE',
      company: 'Company name',
      location: 'City, Country',
      period: '01/2018 – 05/2020',
      bullets: [
        {
          id: 'c-b-8',
          text: 'Double-check your resume to be sure there are no typos. Just in case, share it with someone else who can proofread it for you to avoid sending a flawed resume.',
          verified: false,
        },
        {
          id: 'c-b-9',
          text: 'Once you are sure your resume is completed, save it as a .pdf file. By saving your resume as a .pdf document, you will ensure that your resume looks exactly the same on every computer.',
          verified: false,
        },
        {
          id: 'c-b-10',
          text: "Name your resume professionally. The following title works the best: 'YourNameSurname_resume.pdf'.",
          verified: false,
        },
        {
          id: 'c-b-11',
          text: 'Congratulations! The hardest part is over. Include a few more details in the sections below and your CV will be ready to go.',
          verified: false,
        },
      ],
    },
  ],
  projects: [],
  education: [
    {
      id: 'c-edu-1',
      school: 'Name of the institution or university, City, Country',
      degree: "Master's Degree in Major",
      period: '09/2016 – 06/2018',
    },
    {
      id: 'c-edu-2',
      school: 'Name of the institution or university, City, Country',
      degree: "Bachelor's Degree in Major",
      period: '09/2012 – 06/2016',
    },
  ],
  skills: [
    'Languages: language (proficiency), language (proficiency), language (proficiency)',
    'Computer skills: MS Office (proficiency), software (proficiency), software (proficiency)',
    'Other skills: list a few job-relevant skills and competencies (e.g. project management, graphic design, data analysis)',
  ],
};

export const EXECUTIVE_PROFILE: CareerProfile = {
  fullName: 'THOMAS HARRISON',
  headline: 'PROFESSIONAL TITLE',
  location: 'Houston, TX, 12345',
  phone: '+1 123 456 7890',
  email: 'yourmail@email.com',
  summary:
    'When writing a summary statement, think about your "elevator pitch." For example, if you stepped into an elevator and saw the hiring manager who holds the keys to your dream job, how would you sell yourself during that 30-second elevator ride? Consider the strengths, experiences, and accomplishments that are unique to you and write each of them down as you brainstorm. Using the job posting, determine what value you can bring.',
  summaryEvidence: 'Thomas Harrison executive template',
  experience: [
    {
      id: 'e-exp-1',
      role: 'SENIOR PRODUCT LEAD',
      company: 'Horizon Systems',
      location: 'Houston, TX',
      period: 'Jan 2023 - Dec 2024',
      bullets: [
        {
          id: 'e-b-1',
          text: 'Start each bullet point with a strong action verb to describe your responsibilities and accomplishments. This makes your experiences more dynamic and engaging.',
          verified: false,
        },
        {
          id: 'e-b-2',
          text: 'Whenever possible, quantify your achievements with numbers or percentages to demonstrate the impact you had in your previous roles. For example, "Increased sales by 20% in the first quarter."',
          sourceEvidence: '20% first quarter sales metric',
          verified: true,
        },
        {
          id: 'e-b-3',
          text: 'Try to incorporate industry specific keywords. Show potential employers exactly how you will fit their position and their company.',
          verified: false,
        },
      ],
    },
    {
      id: 'e-exp-2',
      role: 'OPERATIONS ANALYST',
      company: 'Apex Logistics',
      location: 'Austin, TX',
      period: 'Jan 2021 - Dec 2022',
      bullets: [
        {
          id: 'e-b-4',
          text: 'Emphasize the results and outcomes of your work rather than just listing tasks. Employers are interested in what you have accomplished and how you have contributed to the success of your previous employers.',
          verified: false,
        },
        {
          id: 'e-b-5',
          text: 'Incorporate keywords from the job description into your work experience section to help your resume pass through applicant tracking systems (ATS) and to show that you have the specific skills.',
          verified: false,
        },
        {
          id: 'e-b-6',
          text: 'Provide specific examples of projects you worked on, initiatives you led, or problems you solved. This gives employers a better understanding of your capabilities and experiences.',
          verified: false,
        },
        {
          id: 'e-b-7',
          text: 'Aim to keep your bullet points concise and easy to read. Use bullet points instead of lengthy paragraphs, and focus on including only the most relevant and impactful information.',
          verified: false,
        },
      ],
    },
  ],
  projects: [],
  education: [
    {
      id: 'e-edu-1',
      school: 'University of Texas, Houston, TX',
      degree: 'Master Degree',
      period: '2012 - 2014',
    },
    {
      id: 'e-edu-2',
      school: 'University of Texas, Houston, TX',
      degree: 'Bachelor Degree',
      period: '2009 - 2012',
    },
  ],
  skills: [
    'Product Strategy',
    'UX Research',
    'Team Leadership',
    'Data Analysis',
    'Project Management',
    'Copywriting',
    'SQL & Analytics',
    'A/B Testing',
    'Figma',
    'Roadmapping',
    'Stakeholder Comms',
    'Agile Delivery',
  ],
};

export const MODERN_PROFILE: CareerProfile = {
  fullName: 'AMELIA WALKER',
  headline: 'PROFESSIONAL TITLE',
  location: 'City, State',
  phone: '+1 222 345 1234',
  email: 'ameliawalker@gmail.com',
  linkedin: 'linkedin.com/ameliawalker',
  summary:
    'Write a concise paragraph highlighting your relevant skills, years of experience, achievements, and expertise. Extract keywords from the job listing relevant to this section. Summarize what you can offer the company and your greatest strengths. Be specific and use numbers.',
  summaryEvidence: 'Amelia Walker modern template',
  experience: [
    {
      id: 'm-exp-1',
      role: 'INSERT JOB TITLE',
      company: 'Company',
      location: 'Location',
      period: 'Jan 2023 - Present',
      bullets: [
        {
          id: 'm-b-1',
          text: "Use reverse chronological order, meaning you'll add your most recent relevant job here. Keep things short and concise.",
          verified: false,
        },
        {
          id: 'm-b-2',
          text: 'Use a powerful action verb followed by the impact. Whenever possible, quantify the impact with numbers, percentages, amounts, and dollar values.',
          verified: false,
        },
        {
          id: 'm-b-3',
          text: 'Highlight the roles most relevant to the job posting first, and examine the job listing to find keywords you can include throughout your resume. But avoid keyword stuffing.',
          verified: false,
        },
      ],
    },
    {
      id: 'm-exp-2',
      role: 'INSERT JOB TITLE',
      company: 'Company',
      location: 'Location',
      period: 'Mar 2020 - Dec 2022',
      bullets: [
        {
          id: 'm-b-4',
          text: 'Go straight to the point when writing descriptions (e.g., closed 20 contracts in a month, served 50+ customers in a day, increased ROI by 20%, etc.).',
          sourceEvidence: '20% ROI / 50+ customers example',
          verified: true,
        },
        {
          id: 'm-b-5',
          text: 'Only talk about your personal roles at the company, and avoid talking about what your department or company does as a whole.',
          verified: false,
        },
        {
          id: 'm-b-6',
          text: "Make small tweaks to customize your resume to the job listing. Don't forget to proofread your document multiple times to ensure there are no typos!",
          verified: false,
        },
      ],
    },
  ],
  projects: [],
  education: [
    {
      id: 'm-edu-1',
      school: 'Your University, State or Country',
      degree: 'YOUR DEGREE',
      period: '2016 - 2020',
    },
    {
      id: 'm-edu-2',
      school: 'Organization',
      degree: 'CERTIFICATION HERE',
      period: '2021 - 2022',
    },
  ],
  skills: [
    'Content creation',
    'Presentation skills',
    'Brand storytelling',
    'Market research',
    'Critical thinking',
    'Commitment to deadlines',
    'Web analytics',
    'Project management',
    'Creativity',
  ],
};

