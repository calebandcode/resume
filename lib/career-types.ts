export interface BulletLintIssue {
  severity: 'warning' | 'info' | 'verified';
  title: string;
  message: string;
  suggestedAction?: string;
  forText: string;
}

export interface ResumeBullet {
  id: string;
  text: string;
  /** Transcript snippet or user input that grounds this claim */
  sourceEvidence?: string;
  verified: boolean;
  /** Optional contextual AI lint diagnostic attached on import */
  lintIssue?: BulletLintIssue;
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
  location?: string;
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

export const SWISS_PROFILE: CareerProfile = {
  fullName: 'RICHARD MILLE',
  headline: 'CREATIVE DIRECTOR & UI ARCHITECT',
  addressLine1: 'Seventh Avenue, Suite 4920',
  location: 'New York, NY, USA',
  phone: '+1 123 456 7890',
  email: 'richard.mille@email.com',
  website: 'www.richardmille.design',
  facebook: 'facebook.com/richardmille',
  linkedin: 'linkedin.com/in/richardmille',
  behance: '@richardmille',
  summary:
    'Multidisciplinary creative director specializing in editorial web systems, brand identity, and product design.',
  summaryEvidence: 'Richard Mille Swiss template',
  experience: [
    {
      id: 's-exp-1',
      role: 'Senior Product Designer',
      company: 'Studio Meridian',
      location: 'New York, NY',
      period: '2022 - Present',
      bullets: [
        {
          id: 's-b-1',
          text: 'Led end-to-end interface design for enterprise publishing tools used by 120,000+ monthly creators, establishing a unified monochrome component system and cutting design-to-engineering handoff time by 35%.',
          sourceEvidence: '120,000+ monthly creators, 35% faster handoff',
          verified: true,
        },
      ],
    },
    {
      id: 's-exp-2',
      role: 'Visual & UX Designer',
      company: 'Atelier Digital',
      location: 'New York, NY',
      period: '2019 - 2022',
      bullets: [
        {
          id: 's-b-2',
          text: 'Designed editorial landing experiences, interactive brand guidelines, and responsive web applications for luxury and fintech clients across North America and Europe.',
          verified: false,
        },
      ],
    },
    {
      id: 's-exp-3',
      role: 'UI Designer',
      company: 'Northstar Labs',
      location: 'Brooklyn, NY',
      period: '2017 - 2019',
      bullets: [
        {
          id: 's-b-3',
          text: 'Collaborated with product managers and frontend engineers to ship accessible design systems, motion prototypes, and high-converting onboarding flows.',
          verified: false,
        },
      ],
    },
    {
      id: 's-exp-4',
      role: 'Junior Graphic Designer',
      company: 'Press & Co.',
      location: 'New York, NY',
      period: '2015 - 2017',
      bullets: [
        {
          id: 's-b-4',
          text: 'Produced print layouts, typographic posters, and digital campaign assets while supporting senior art directors on seasonal brand launches.',
          verified: false,
        },
      ],
    },
  ],
  projects: [],
  education: [
    {
      id: 's-edu-1',
      school: 'Parsons School of Design',
      degree: 'M.F.A. Communication Design',
      period: '2013 - 2015',
      description: 'Focused on editorial typography, interaction systems, and digital publishing.',
    },
    {
      id: 's-edu-2',
      school: 'New York University',
      degree: 'B.A. Visual Arts',
      period: '2009 - 2013',
      description: 'Studied graphic composition, studio photography, and media theory.',
    },
  ],
  skills: [
    'Adobe Photoshop',
    'Adobe InDesign',
    'Adobe Illustrator',
    'Figma & Prototyping',
    'Editorial Typography',
    'JavaScript / CSS',
    'After Effects',
  ],
};

export const OLIVERA_PROFILE: CareerProfile = {
  fullName: 'OLIVERA HEWITT',
  headline: 'PROFESSIONAL JOB TITLE',
  location: 'London, UK',
  phone: '0123.000.0000',
  email: 'olivera.hewitt@email.com',
  summary:
    'Write a brief, engaging text about yourself. Provide information about your educational background, work experience, skills and key achievements relevant to the role you are applying for. Describe in one sentence your most impressive achievement and quantify it. Fill the personal profile with keywords from the job description. Try to cover all mandatory requirements within four to five sentences. To make it easier for you, we have created a template – take a look at page 8 in the Resume Writing Guide. Additionally, include relevant skills or areas of expertise below:',
  summaryEvidence: 'Olivera Hewitt ATS template',
  experience: [
    {
      id: 'o-exp-1',
      role: 'SENIOR PRODUCT STRATEGIST',
      company: 'Northbridge Group',
      location: 'London, UK',
      period: '04/2023 – Present',
      bullets: [
        {
          id: 'o-b-1',
          text: "Use bulleted lists to describe your main responsibilities and achievements in a succinct manner. Start every bullet point with an action verb, such as 'improved', 'coordinated' and 'implemented'.",
          verified: false,
        },
        {
          id: 'o-b-2',
          text: 'Be consistent with the tense you are using. Describe your current role in the present continuous tense and previous roles in the past simple tense.',
          verified: false,
        },
        {
          id: 'o-b-3',
          text: "You don't need to include all tasks you have ever done. Instead, focus on the ones relevant to your job application.",
          verified: false,
        },
        {
          id: 'o-b-4',
          text: 'Quantify your responsibilities and achievements wherever possible. Include relevant measures (e.g. increased sales, improved customer satisfaction or reduced complaints by 12.5%).',
          sourceEvidence: '12.5% complaint reduction example',
          verified: true,
        },
      ],
    },
    {
      id: 'o-exp-2',
      role: 'OPERATIONS SPECIALIST',
      company: 'Harborline Co.',
      location: 'Manchester, UK',
      period: '06/2020 – 03/2023',
      bullets: [
        {
          id: 'o-b-5',
          text: 'Double-check your resume to be sure there are no typos. Just in case, share it with someone else who can proofread it for you to avoid sending a flawed resume.',
          verified: false,
        },
        {
          id: 'o-b-6',
          text: 'Once you are sure your resume is complete, save it as a .pdf file. By saving your resume as a .pdf document, you will preserve its formatting and ensure that your resume looks exactly the same on every computer.',
          verified: false,
        },
        {
          id: 'o-b-7',
          text: "Name your resume professionally. The following title works the best: 'YourNameSurname_resume.pdf'.",
          verified: false,
        },
        {
          id: 'o-b-8',
          text: 'Congratulations! The hardest part is over. Include a few more details below and your resume will be ready to go!',
          verified: false,
        },
      ],
    },
  ],
  projects: [],
  education: [
    {
      id: 'o-edu-1',
      school: 'University of London, London, UK',
      degree: "MASTER'S DEGREE IN BUSINESS STRATEGY",
      period: '09/2018 – 06/2020',
    },
    {
      id: 'o-edu-2',
      school: 'University of Manchester, Manchester, UK',
      degree: "BACHELOR'S DEGREE IN ECONOMICS",
      period: '09/2014 – 06/2018',
    },
  ],
  skills: [
    'Product Strategy',
    'User Research',
    'Design Systems',
    'Roadmapping',
    'Stakeholder Comms',
    'Process Design',
    'Agile Delivery',
    'Data Analytics',
    'Copywriting',
    'Client Relations',
  ],
};

export const AUDREY_PROFILE: CareerProfile = {
  fullName: 'Audrey Murphy',
  headline: 'SENIOR DATA ANALYST',
  location: 'Chicago, IL',
  phone: '555.555.5555',
  email: 'audrey.murphy@mail.com',
  linkedin: 'LinkedIn.com/in/audreymurphy',
  summary:
    'Detail-oriented Data Analyst with 5+ years turning complex datasets into clear executive dashboards, predictive models, and revenue-driving product insights. Proven track record partnering with engineering and leadership teams to streamline reporting pipelines and quantify business impact.',
  summaryEvidence: 'Audrey Murphy template',
  experience: [
    {
      id: 'a-exp-1',
      role: 'LEAD DATA ANALYST',
      company: 'MetricFlow',
      location: 'Chicago, IL',
      period: 'Mar 2022 – Present',
      bullets: [
        {
          id: 'a-b-1',
          text: 'Tailor your resume using important keywords from the job posting. Highlight the skills and outcomes most relevant to the target role.',
          verified: false,
        },
        {
          id: 'a-b-2',
          text: 'Built automated SQL and Python reporting pipelines serving 40+ stakeholders across product, finance, and operations.',
          sourceEvidence: '40+ stakeholders',
          verified: true,
        },
        {
          id: 'a-b-3',
          text: 'Prove your accomplishments with numbers—reduced weekly manual spreadsheet reconciliation by 65% across regional teams.',
          sourceEvidence: '65% reduction in manual reconciliation',
          verified: true,
        },
        {
          id: 'a-b-4',
          text: 'Start every bullet with a strong action verb to emphasize ownership and measurable business impact.',
          verified: false,
        },
      ],
    },
    {
      id: 'a-exp-2',
      role: 'BUSINESS INTELLIGENCE ANALYST',
      company: 'Lakefront Retail',
      location: 'Chicago, IL',
      period: 'Jan 2020 – Feb 2022',
      bullets: [
        {
          id: 'a-b-5',
          text: 'Identified data discrepancies in key business reports that were leading to inaccurate forecasting across 12 regional hubs.',
          sourceEvidence: '12 regional hubs',
          verified: true,
        },
        {
          id: 'a-b-6',
          text: 'Designed executive KPI dashboards in SQL and Google Sheets, cutting leadership review prep time by 4 hours per week.',
          sourceEvidence: '4 hours/week saved',
          verified: true,
        },
        {
          id: 'a-b-7',
          text: 'Partnered with engineering to standardize event tracking schemas and improve warehouse query reliability.',
          verified: false,
        },
      ],
    },
  ],
  projects: [
    {
      id: 'a-proj-1',
      name: 'CHURN PREDICTOR PIPELINE',
      tagline: 'End-to-end customer retention scoring model & executive dashboard',
      tech: ['Python', 'SQL', '2024'],
      link: 'github.com/audreymurphy/churn-model',
      highlights: [],
    },
    {
      id: 'a-proj-2',
      name: 'REVENUE COHORT EXPLORER',
      tagline: 'Interactive SaaS cohort retention and LTV visualization toolkit',
      tech: ['T-SQL', 'Google Sheets', '2023'],
      link: 'audreymurphy.dev/cohorts',
      highlights: [],
    },
  ],
  education: [
    {
      id: 'a-edu-1',
      school: 'Northwestern University, Evanston, IL',
      degree: 'M.S. IN ANALYTICS',
      period: '2018 – 2020',
    },
    {
      id: 'a-edu-2',
      school: 'University of Illinois, Urbana-Champaign, IL',
      degree: 'B.S. IN STATISTICS',
      period: '2014 – 2018',
    },
  ],
  skills: [
    'Professional Skills: Data Cleaning | Data Visualization | Machine Learning | Presentation Skills | Team Leadership | Strategic Planning | Process Improvement',
    'Technical Skills: SQL | MySQL | T-SQL | R | Python | MS Excel | Google Sheets | MS Office',
  ],
};

export const WSO_PROFILE: CareerProfile = {
  fullName: 'THOMAS JAMES',
  headline: 'Analyst – Project Finance Group',
  addressLine1: '123 Washington St. Apt. #2',
  location: 'New York, NY 10014',
  phone: '646.123.4567',
  email: 'Thomas.James@gmail.com',
  summary: '',
  experience: [
    {
      id: 'w-exp-1',
      company: 'ABC Bank',
      role: 'Analyst – Project Finance Group',
      location: 'New York, NY',
      period: 'June 2012 – Present',
      bullets: [
        {
          id: 'w-b-1',
          text: 'Involved in all aspects of transactions including initial due diligence, preparation of the CIM, modeling, presentations',
          verified: false,
        },
        {
          id: 'w-b-2',
          text: 'Responsible for performing comparable companies and precedent transaction analyses in Excel',
          verified: false,
        },
        {
          id: 'w-b-3',
          text: 'Produce daily group newsletter summarizing recent events in the industry',
          verified: false,
        },
        {
          id: 'w-b-4',
          text: '$700 MM Transaction for Royal Energy (closed) – Responsibilities include monitoring the debt drawdown and its effect on covenant and credit agreement compliance',
          sourceEvidence: '$700 MM Transaction for Royal Energy',
          verified: true,
        },
        {
          id: 'w-b-5',
          text: '$500 MM Debt Financing for a Wind Farm Project (active) – Responsibilities include building a financial model to show debt financing under multiple capital structures, running sensitivity analysis to show the impact of various macroeconomic conditions, analyzing state regulations to determine project’s eligibility for subsidies and leading the production of marketing materials from design through printing',
          sourceEvidence: '$500 MM Debt Financing for a Wind Farm Project',
          verified: true,
        },
        {
          id: 'w-b-6',
          text: '$3 B Transaction for a Solar CSP Project (active) – Responsibilities include preparing pitchbook materials and follow-up on client feedback through the equity-raising process on the world’s largest solar CSP project',
          sourceEvidence: '$3 B Transaction for a Solar CSP Project',
          verified: true,
        },
      ],
    },
    {
      id: 'w-exp-2',
      company: 'ZYX Energy Cooperative',
      role: 'Research Analyst',
      location: 'New York, NY',
      period: 'June 2010 – June 2012',
      bullets: [
        {
          id: 'w-b-7',
          text: 'Analyzed and recommended specific investment opportunities to traders in natural gas, power and coal',
          verified: false,
        },
        {
          id: 'w-b-8',
          text: 'Worked directly with traders to create and improve supply and demand models for natural gas, power, and coal',
          verified: false,
        },
        {
          id: 'w-b-9',
          text: 'Sent out intraday research notes to traders in summarizing daily and weekly energy supply and demand data and news',
          verified: false,
        },
      ],
    },
  ],
  education: [
    {
      id: 'w-edu-1',
      school: 'Washington University – Olin School of Business',
      degree: 'Bachelor of Science in Business Administration; Finance Major',
      location: 'St. Louis, MO',
      period: 'Class of 2010',
      description:
        "Cumulative GPA: 3.5/4.0; Major GPA: 3.8/4.0\nGraduated magna cum laude; Dean's List all semesters\nRelevant Coursework: Financial Statement Analysis, Advanced Financial Management, M&A, Options, Futures & Derivatives, Introduction to Econometrics, International Finance, Investments, Mortgage Backed Securities",
    },
    {
      id: 'w-edu-2',
      school: 'Dalian University of Foreign Languages',
      degree: 'School of Chinese Studies',
      location: 'Dalian, Liaoning Province, China',
      period: 'Jan 2009 – May 2009',
    },
  ],
  projects: [
    {
      id: 'w-proj-1',
      name: 'Washington University NCAA Soccer Team',
      tagline: 'Captain',
      tech: ['St. Louis, MO', 'Sep 2006 – Dec 2009'],
      highlights: [
        {
          id: 'w-h-1',
          text: 'Attended league meetings and organized all games and practices in lieu of coaching staff',
          verified: false,
        },
        {
          id: 'w-h-2',
          text: 'Successfully recruited over 10 new players and developed an alumni support network via campaigns',
          sourceEvidence: '10+ new players recruited',
          verified: true,
        },
        {
          id: 'w-h-3',
          text: 'Led the team to an undefeated 2009 season within our division',
          sourceEvidence: 'Undefeated 2009 season',
          verified: true,
        },
      ],
    },
    {
      id: 'w-proj-2',
      name: 'Washington University Student Investment Fund',
      tagline: 'Founder and Co-President',
      tech: ['St. Louis, MO', 'Oct 2008 – May 2010'],
      highlights: [
        {
          id: 'w-h-4',
          text: "Co-founded a student-run fund to invest a small portion of the University's endowment",
          verified: false,
        },
        {
          id: 'w-h-5',
          text: 'Managed a $105k diversified, mid-cap equities fund which generated 27% growth over 18 months',
          sourceEvidence: '$105k fund, 27% growth over 18 months',
          verified: true,
        },
      ],
    },
  ],
  skills: [
    'Languages: Fluent in Mandarin, Basic Skills in French',
    "Modeling: Completed ABC Bank's formal modeling program run by Wall Street Prep",
    'Computer: Expert in Excel, PowerPoint, CapitalIQ, Bloomberg',
    'Certifications: Completed Bloomberg Certification Program',
  ],
};

export const LATEX_PROFILE: CareerProfile = {
  fullName: 'Thomas James',
  headline: 'Analyst – Project Finance & Quantitative Modeling',
  location: 'New York, NY',
  phone: '646.123.4567',
  email: 'Thomas.James@gmail.com',
  website: 'thomasjames.io',
  github: 'github.com/tjames-quant',
  linkedin: 'linkedin.com/in/thomasjames',
  summary: '',
  education: [
    {
      id: 'l-edu-1',
      school: 'Washington University – Olin School of Business',
      degree: 'Bachelor of Science in Business Administration (Finance Major)',
      location: 'St. Louis, MO',
      period: 'Sep 2006 – May 2010',
      description:
        'Cumulative GPA: 3.5/4.0; Major GPA: 3.8/4.0 · Magna Cum Laude, Dean’s List all semesters\nMain courses: Financial Statement Analysis, Advanced Financial Management, M&A, Options, Futures & Derivatives, Econometrics',
    },
    {
      id: 'l-edu-2',
      school: 'Dalian University of Foreign Languages',
      degree: ' visiting Scholar – School of Chinese Studies',
      location: 'Dalian, China',
      period: 'Jan 2009 – May 2009',
      description:
        'Main courses: Intensive Mandarin Business Communication, East Asian Trade & Macroeconomics',
    },
  ],
  experience: [
    {
      id: 'l-exp-1',
      role: 'Analyst – Project Finance Group',
      company: 'ABC Bank',
      location: 'New York, NY',
      period: 'June 2012 – Present',
      bullets: [
        {
          id: 'l-b-1',
          text: 'Built dynamic debt-financing model for a $500 MM Wind Farm Project across multiple capital structures and ran macroeconomic sensitivity analyses.',
          sourceEvidence: '$500 MM Wind Farm Project debt financing model',
          verified: true,
        },
        {
          id: 'l-b-2',
          text: 'Monitored debt drawdown, covenant compliance, and credit agreements on a closed $700 MM Transaction for Royal Energy.',
          sourceEvidence: '$700 MM Royal Energy transaction',
          verified: true,
        },
        {
          id: 'l-b-3',
          text: 'Prepared pitchbook materials and managed client equity-raising follow-up on a $3 B Solar CSP Project.',
          sourceEvidence: '$3 B Solar CSP Project',
          verified: true,
        },
        {
          id: 'l-b-4',
          text: 'Performed comparable company and precedent transaction analyses in Excel and produced daily industry research briefings.',
          verified: false,
        },
      ],
    },
    {
      id: 'l-exp-2',
      role: 'Research Analyst',
      company: 'ZYX Energy Cooperative',
      location: 'New York, NY',
      period: 'June 2010 – June 2012',
      bullets: [
        {
          id: 'l-b-5',
          text: 'Analyzed and recommended specific investment opportunities to institutional traders across natural gas, power, and coal markets.',
          verified: false,
        },
        {
          id: 'l-b-6',
          text: 'Partnered directly with trading desk to build and calibrate supply-and-demand forecasting models and intraday research notes.',
          verified: false,
        },
      ],
    },
  ],
  projects: [
    {
      id: 'l-proj-1',
      name: 'Washington University Student Investment Fund',
      tagline: 'Founder & Co-President',
      tech: ['Oct 2008 – May 2010'],
      highlights: [
        {
          id: 'l-h-1',
          text: 'Co-founded a student-run investment fund allocating a portion of the University endowment across mid-cap equities.',
          verified: false,
        },
        {
          id: 'l-h-2',
          text: 'Managed a $105k diversified portfolio that delivered 27% return over an 18-month period.',
          sourceEvidence: '$105k portfolio, 27% return over 18 months',
          verified: true,
        },
      ],
    },
    {
      id: 'l-proj-2',
      name: 'Washington University NCAA Soccer Team',
      tagline: 'Team Captain',
      tech: ['Sep 2006 – Dec 2009'],
      highlights: [
        {
          id: 'l-h-3',
          text: 'Recruited 10+ new players, built an alumni fundraising network, and led the squad to an undefeated 2009 division season.',
          sourceEvidence: '10+ players recruited, undefeated 2009 season',
          verified: true,
        },
      ],
    },
  ],
  skills: [
    "Financial Modeling: DCF, Project Finance, LBO, Sensitivity Analysis, Wall Street Prep (ABC Bank Program)",
    'Analytics & Tools: Excel, PowerPoint, CapitalIQ, Bloomberg Terminal, Python, SQL, LaTeX',
    'Communication: English (Native), Mandarin (Fluent), French (Basic)',
    'Certifications: Bloomberg Market Concepts & Certification Program',
  ],
};

export const TECH_ATS_PROFILE: CareerProfile = {
  fullName: 'Jane Doe',
  headline: 'Full Stack Developer',
  location: 'San Francisco, CA, USA',
  phone: '415.890.4421',
  email: 'jane.doe@anymail.com',
  website: 'jane-doe.com',
  linkedin: 'linkedin.com/in/janedoe',
  github: 'github.com/janedoe',
  summary:
    'Full-stack web developer with over 3 years of experience building responsive web applications in HTML, CSS, JavaScript, TypeScript, and PHP. Experienced across React, Angular, Vue.js, RESTful APIs, and scalable MVC backends.',
  summaryEvidence: 'Jane Doe Full Stack Developer template',
  skills: [
    'Languages: JavaScript, TypeScript, PHP, Java, HTML, CSS',
    'Frameworks: React.js, Angular, Express, Node.js, Next.js',
    'Libraries: Material UI, Redux, React Router, Tailwind CSS',
    'Databases: MongoDB, PostgreSQL, MySQL, Redis',
    'Dev Tools: Visual Studio Code, Git, GitLab, Docker, GitHub Actions',
  ],
  experience: [
    {
      id: 'jd-exp-1',
      role: 'Web Developer',
      company: 'Vanguard Digital',
      location: 'Remote – San Francisco, CA',
      period: 'Apr 2022 – Present',
      bullets: [
        {
          id: 'jd-b-1',
          text: 'Designed and developed dynamic, responsive web applications using HTML, CSS, JavaScript, React, and PHP.',
          verified: false,
        },
        {
          id: 'jd-b-2',
          text: 'Architected REST APIs to retrieve and synchronize real-time customer data across PostgreSQL and MongoDB databases.',
          verified: false,
        },
        {
          id: 'jd-b-3',
          text: 'Improved website performance and page load speed by 55% through code-splitting, caching, and bundle optimization.',
          sourceEvidence: '55% website performance and speed improvement',
          verified: true,
        },
      ],
    },
    {
      id: 'jd-exp-2',
      role: 'Backend Developer',
      company: 'CloudScale Systems',
      location: 'San Francisco, CA',
      period: 'Aug 2021 – Nov 2022',
      bullets: [
        {
          id: 'jd-b-4',
          text: 'Built modular MVC backend services in Node.js and Express to power core customer workflows.',
          verified: false,
        },
        {
          id: 'jd-b-5',
          text: 'Troubleshot and resolved critical production bottlenecks in the backend to ensure 99.9% uptime across services.',
          sourceEvidence: '99.9% uptime across services',
          verified: true,
        },
      ],
    },
    {
      id: 'jd-exp-3',
      role: 'Backend Developer Intern',
      company: 'CloudScale Systems',
      location: 'San Francisco, CA',
      period: 'Jan 2021 – Aug 2021',
      bullets: [
        {
          id: 'jd-b-6',
          text: 'Collaborated with senior engineers in the design and delivery of responsive client portals using HTML, CSS, and JavaScript.',
          verified: false,
        },
      ],
    },
  ],
  education: [
    {
      id: 'jd-edu-1',
      school: 'University of California, Berkeley',
      degree: 'Bachelor of Science in Computer Science',
      location: 'Berkeley, CA',
      period: 'Jan 2016 – Dec 2020',
    },
  ],
  projects: [
    {
      id: 'jd-proj-1',
      name: 'CommercePulse Storefront',
      tagline: 'Full-stack e-commerce platform & CI/CD pipeline',
      tech: ['React.js', 'Redux', 'PHP', 'MySQL', 'Git'],
      link: 'github.com/janedoe/commerce-pulse',
      highlights: [
        {
          id: 'jd-h-1',
          text: 'Designed and developed a clean, modern storefront using HTML, CSS, JavaScript, and React.',
          verified: false,
        },
        {
          id: 'jd-h-2',
          text: 'Optimized storefront rendering for speed, responsive design, and cross-device compatibility, deployed via GitHub Actions.',
          verified: false,
        },
      ],
    },
    {
      id: 'jd-proj-2',
      name: 'TaskFlow REST API',
      tagline: 'Scalable CRUD microservice backend',
      tech: ['Node.js', 'Express', 'JavaScript', 'Git'],
      link: 'github.com/janedoe/taskflow-api',
      highlights: [
        {
          id: 'jd-h-3',
          text: 'Built a CRUD application exposed via a RESTful API in Node.js supporting POST, GET, PATCH, and DELETE HTTP methods in Express.',
          verified: false,
        },
      ],
    },
  ],
};




