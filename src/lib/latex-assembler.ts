import { type SeedEntry } from "./seed-bank";

const PREAMBLE = `%-------------------------
% Resume in Latex
% Author : Jake Gutierrez
% Based off of: https://github.com/sb2nov/resume
% License : MIT
%------------------------

\\documentclass[letterpaper,11pt]{article}

\\usepackage{latexsym}
\\usepackage[empty]{fullpage}
\\usepackage{titlesec}
\\usepackage{marvosym}
\\usepackage[usenames,dvipsnames]{color}
\\usepackage{verbatim}
\\usepackage{enumitem}
\\usepackage[hidelinks]{hyperref}
\\usepackage{fancyhdr}
\\usepackage[english]{babel}
\\usepackage{tabularx}
\\input{glyphtounicode}

\\pagestyle{fancy}
\\fancyhf{}
\\fancyfoot{}
\\renewcommand{\\headrulewidth}{0pt}
\\renewcommand{\\footrulewidth}{0pt}

\\addtolength{\\oddsidemargin}{-0.5in}
\\addtolength{\\evensidemargin}{-0.5in}
\\addtolength{\\textwidth}{1in}
\\addtolength{\\topmargin}{-.5in}
\\addtolength{\\textheight}{1.0in}

\\urlstyle{same}

\\raggedbottom
\\raggedright
\\setlength{\\tabcolsep}{0in}

\\titleformat{\\section}{
  \\vspace{-4pt}\\scshape\\raggedright\\large
}{}{0em}{}[\\color{black}\\titlerule \\vspace{-5pt}]

\\pdfgentounicode=1

\\newcommand{\\resumeItem}[1]{
  \\item\\small{
    {#1 \\vspace{-2pt}}
  }
}

\\newcommand{\\resumeSubheading}[4]{
  \\vspace{-2pt}\\item
    \\begin{tabular*}{0.97\\textwidth}[t]{l@{\\extracolsep{\\fill}}r}
      \\textbf{#1} & #2 \\\\
      \\textit{\\small#3} & \\textit{\\small #4} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubSubheading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\textit{\\small#1} & \\textit{\\small #2} \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeProjectHeading}[2]{
    \\item
    \\begin{tabular*}{0.97\\textwidth}{l@{\\extracolsep{\\fill}}r}
      \\small#1 & #2 \\\\
    \\end{tabular*}\\vspace{-7pt}
}

\\newcommand{\\resumeSubItem}[1]{\\resumeItem{#1}\\vspace{-4pt}}

\\renewcommand\\labelitemii{$\\vcenter{\\hbox{\\tiny$\\bullet$}}$}

\\newcommand{\\resumeSubHeadingListStart}{\\begin{itemize}[leftmargin=0.15in, label={}]}
\\newcommand{\\resumeSubHeadingListEnd}{\\end{itemize}}
\\newcommand{\\resumeItemListStart}{\\begin{itemize}}
\\newcommand{\\resumeItemListEnd}{\\end{itemize}\\vspace{-5pt}}`;

const HEADING = `\\begin{center}
    \\textbf{\\Huge \\scshape Keshav Mehndiratta} \\\\ \\vspace{1pt}
    \\small +1(343)333-7585 $|$ \\href{mailto:keshav.m@queensu.ca}{\\underline{keshav.m@queensu.ca}} $|$
    \\href{https://www.linkedin.com/in/keshav-mehndiratta}{\\underline{linkedin.com/in/keshav-mehndiratta}} $|$
    \\href{https://www.keshavhq.com}{\\underline{keshavhq.com}} $|$
    \\href{https://github.com/KeshavM05}{\\underline{github.com/KeshavM05}}
\\end{center}`;

function renderExperience(entry: SeedEntry, bulletOverrides?: Map<number, string>): string {
  const bullets = entry.bullets.map((b, i) =>
    bulletOverrides?.has(i) ? bulletOverrides.get(i)! : b
  );

  return `    \\resumeSubheading
      {${entry.subtitle}}{${entry.dateRange}}
      {${entry.title}}{${entry.location || ""}}
      \\resumeItemListStart
${bullets.map((b) => `        \\resumeItem{${b}}`).join("\n")}
      \\resumeItemListEnd`;
}

function renderProject(entry: SeedEntry, bulletOverrides?: Map<number, string>): string {
  const bullets = entry.bullets.map((b, i) =>
    bulletOverrides?.has(i) ? bulletOverrides.get(i)! : b
  );

  const techSuffix = entry.subtitle
    ? ` $|$ \\emph{${entry.subtitle}}`
    : "";

  return `      \\resumeProjectHeading
          {\\textbf{${entry.title}}${techSuffix}}{${entry.dateRange || ""}}
          \\resumeItemListStart
${bullets.map((b) => `            \\resumeItem{${b}}`).join("\n")}
          \\resumeItemListEnd`;
}

export type BulletEdit = {
  entryTitle: string;
  bulletIndex: number;
  original: string;
  edited: string;
  reason: string;
};

export function assembleResume(
  experiences: SeedEntry[],
  project: SeedEntry,
  educationTex: string,
  skillsTex: string,
  edits?: BulletEdit[]
): string {
  const editMap = new Map<string, Map<number, string>>();
  if (edits) {
    for (const edit of edits) {
      if (!editMap.has(edit.entryTitle)) {
        editMap.set(edit.entryTitle, new Map());
      }
      editMap.get(edit.entryTitle)!.set(edit.bulletIndex, edit.edited);
    }
  }

  const experienceSection = experiences
    .map((e) => renderExperience(e, editMap.get(e.title)))
    .join("\n\n");

  const projectSection = renderProject(project, editMap.get(project.title));

  return `${PREAMBLE}

%-------------------------------------------
%%%%%%  RESUME STARTS HERE  %%%%%%%%%%%%%%%%%%%%%%%%%%%%


\\begin{document}

%----------HEADING----------

${HEADING}


%-----------EDUCATION-----------
\\section{Education}
${educationTex}


%-----------EXPERIENCE-----------
\\section{Experience}
  \\resumeSubHeadingListStart

${experienceSection}

  \\resumeSubHeadingListEnd


%-----------PROJECTS-----------
\\section{Projects}
    \\resumeSubHeadingListStart
${projectSection}
    \\resumeSubHeadingListEnd



%
%-----------PROGRAMMING SKILLS-----------
\\section{Technical Skills}
 ${skillsTex}


%-------------------------------------------
\\end{document}
`;
}
