const PAGE_WIDTH = 595.28;
const PAGE_HEIGHT = 841.89;
const MARGIN = 44;
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

export type PlannerPdfState = {
  profile: { name: string; college: string; course: string; branch: string; semester: string; year: string; roll: string; email: string };
  subjects: { id: string; name: string; faculty: string; credits: number; target: string; current: string; progress: number; notes: string }[];
  goals: { category: string; title: string; description: string; date: string; progress: number; completed: boolean }[];
  assignments: { subject: string; title: string; description: string; due: string; priority: string; status: string; submitted: boolean }[];
  exams: { subject: string; date: string; time: string; topics: string; progress: number; revisions: boolean[] }[];
  habits: { name: string; days: number[] }[];
  importantDates: { title: string; type: string; date: string; note: string }[];
  habitMonth: string;
  timetable: Record<string, string>;
  weekly: Record<string, string>;
  daily: { date: string; priorities: string[]; notes: string; achievements: string };
  monthly: { month: string; goals: string; notes: string };
  grades: Record<string, number[]>;
  revisions: Record<string, { topic: string; checks: boolean[]; confidence: string }[]>;
  notes: { title: string; body: string }[];
  reflection: Record<string, string>;
};

type Color = [number, number, number];
type PdfPage = { commands: string[] };

const COLORS = {
  plum: [48, 39, 68] as Color,
  purple: [104, 82, 153] as Color,
  lavender: [234, 228, 249] as Color,
  cream: [249, 246, 239] as Color,
  paper: [255, 253, 249] as Color,
  ink: [45, 40, 53] as Color,
  muted: [105, 98, 112] as Color,
  line: [218, 211, 201] as Color,
  amber: [229, 145, 51] as Color,
  teal: [66, 122, 119] as Color,
  rose: [185, 94, 94] as Color,
  white: [255, 255, 255] as Color,
};

function color(value: Color) {
  return value.map((part) => (part / 255).toFixed(3)).join(' ');
}

function safeText(value: unknown) {
  return String(value ?? '')
    .replace(/[–—−]/g, '-')
    .replace(/[·•]/g, ' | ')
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/[^\x20-\x7E\n]/g, '?');
}

function escapePdf(value: unknown) {
  return safeText(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
}

function wrapText(value: unknown, fontSize: number, width: number) {
  const maxChars = Math.max(1, Math.floor(width / (fontSize * 0.49)));
  const result: string[] = [];
  for (const paragraph of safeText(value).split('\n')) {
    if (!paragraph.trim()) {
      result.push('');
      continue;
    }
    const words = paragraph.split(/\s+/);
    let line = '';
    for (const word of words) {
      if (!line && word.length > maxChars) {
        for (let i = 0; i < word.length; i += maxChars) result.push(word.slice(i, i + maxChars));
        continue;
      }
      const next = line ? `${line} ${word}` : word;
      if (next.length > maxChars && line) {
        result.push(line);
        line = word;
      } else {
        line = next;
      }
    }
    if (line) result.push(line);
  }
  return result.length ? result : [''];
}

function formatDate(value: string) {
  if (!value) return '';
  const date = new Date(`${value}T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' });
}

function monthLabel(value: string) {
  if (!value) return '';
  const date = new Date(`${value}-01T12:00:00`);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString(undefined, { month: 'long', year: 'numeric' });
}

function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

class PdfBuilder {
  private pages: PdfPage[] = [];
  private current: PdfPage;
  y = MARGIN;

  constructor() {
    this.current = { commands: [] };
    this.pages.push(this.current);
  }

  private command(value: string) {
    this.current.commands.push(value);
  }

  page() {
    this.current = { commands: [] };
    this.pages.push(this.current);
    this.y = MARGIN;
  }

  text(value: unknown, x: number, y: number, size = 10, bold = false, textColor: Color = COLORS.ink) {
    const baseline = PAGE_HEIGHT - y;
    this.command(`BT /F${bold ? 'B' : 'N'} ${size} Tf ${color(textColor)} rg 1 0 0 1 ${x.toFixed(2)} ${baseline.toFixed(2)} Tm (${escapePdf(value)}) Tj ET`);
  }

  block(value: unknown, x: number, y: number, width: number, size = 10, leading = size * 1.45, bold = false, textColor: Color = COLORS.ink) {
    const lines = wrapText(value, size, width);
    lines.forEach((line, index) => this.text(line, x, y + index * leading, size, bold, textColor));
    return y + lines.length * leading;
  }

  rect(x: number, y: number, width: number, height: number, fill?: Color, stroke?: Color, lineWidth = 1) {
    const bottom = PAGE_HEIGHT - y - height;
    if (fill) this.command(`${color(fill)} rg`);
    if (stroke) this.command(`${color(stroke)} RG ${lineWidth} w`);
    this.command(`${x.toFixed(2)} ${bottom.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re ${fill && stroke ? 'B' : fill ? 'f' : 'S'}`);
  }

  line(x1: number, y1: number, x2: number, y2: number, stroke: Color = COLORS.line, lineWidth = 0.8) {
    this.command(`${color(stroke)} RG ${lineWidth} w ${x1.toFixed(2)} ${(PAGE_HEIGHT - y1).toFixed(2)} m ${x2.toFixed(2)} ${(PAGE_HEIGHT - y2).toFixed(2)} l S`);
  }

  circle(x: number, y: number, radius: number, fill: Color, stroke?: Color) {
    const k = 0.5522848;
    const cy = PAGE_HEIGHT - y;
    const r = radius;
    this.command(`${color(fill)} rg`);
    if (stroke) this.command(`${color(stroke)} RG 1 w`);
    this.command(`${(x + r).toFixed(2)} ${cy.toFixed(2)} m ${(x + r).toFixed(2)} ${(cy + k * r).toFixed(2)} ${(x + k * r).toFixed(2)} ${(cy + r).toFixed(2)} ${x.toFixed(2)} ${(cy + r).toFixed(2)} c ${(x - k * r).toFixed(2)} ${(cy + r).toFixed(2)} ${(x - r).toFixed(2)} ${(cy + k * r).toFixed(2)} ${(x - r).toFixed(2)} ${cy.toFixed(2)} c ${(x - r).toFixed(2)} ${(cy - k * r).toFixed(2)} ${(x - k * r).toFixed(2)} ${(cy - r).toFixed(2)} ${x.toFixed(2)} ${(cy - r).toFixed(2)} c ${(x + k * r).toFixed(2)} ${(cy - r).toFixed(2)} ${(x + r).toFixed(2)} ${(cy - k * r).toFixed(2)} ${(x + r).toFixed(2)} ${cy.toFixed(2)} c ${fill && stroke ? 'B' : 'f'}`);
  }

  rule(y: number, stroke: Color = COLORS.line) {
    this.line(MARGIN, y, PAGE_WIDTH - MARGIN, y, stroke, 0.7);
  }

  header(title: string, subtitle?: string) {
    this.text('ULTIMATE SEMESTER PLANNER', MARGIN, 30, 7.5, true, COLORS.purple);
    this.text(title, MARGIN, 58, 24, true, COLORS.plum);
    if (subtitle) this.block(subtitle, MARGIN, 75, CONTENT_WIDTH, 9.5, 13, false, COLORS.muted);
    this.rule(94);
    this.y = subtitle ? 116 : 106;
  }

  footer(pageNumber: number) {
    this.line(MARGIN, PAGE_HEIGHT - 31, PAGE_WIDTH - MARGIN, PAGE_HEIGHT - 31, COLORS.line, 0.6);
    this.text('Ultimate Semester Planner', MARGIN, PAGE_HEIGHT - 18, 7.5, false, COLORS.muted);
    this.text(`Page ${pageNumber}`, PAGE_WIDTH - MARGIN - 42, PAGE_HEIGHT - 18, 7.5, false, COLORS.muted);
  }

  section(title: string, subtitle?: string) {
    this.page();
    this.header(title, subtitle);
  }

  label(value: string, x: number, y: number, width = 150) {
    this.text(value.toUpperCase(), x, y, 7.2, true, COLORS.purple);
    this.line(x, y + 6, x + width, y + 6, COLORS.line, 0.6);
  }

  field(label: string, value: unknown, x: number, y: number, width: number, height = 30) {
    this.text(label.toUpperCase(), x, y, 7, true, COLORS.purple);
    this.rect(x, y + 5, width, height, COLORS.paper, COLORS.line, 0.7);
    if (value) this.block(value, x + 8, y + 17, width - 16, 9.5, 12, false, COLORS.ink);
  }

  table(headers: string[], rows: string[][], widths: number[], options: { compact?: boolean } = {}) {
    const rowMin = options.compact ? 19 : 25;
    const headerHeight = options.compact ? 22 : 27;
    const fontSize = options.compact ? 6.6 : 7.4;
    let x = MARGIN;
    let y = this.y;
    const drawHeader = () => {
      x = MARGIN;
      this.rect(MARGIN, y, CONTENT_WIDTH, headerHeight, COLORS.plum);
      headers.forEach((header, index) => {
        this.block(header, x + 5, y + 8, widths[index] - 10, fontSize, fontSize + 1, true, COLORS.white);
        x += widths[index];
      });
      y += headerHeight;
    };
    drawHeader();
    rows.forEach((row) => {
      const cells = row.map((cell, index) => wrapText(cell, fontSize, widths[index] - 10));
      const height = Math.max(rowMin, Math.min(45, Math.max(...cells.map((cell) => cell.length)) * (fontSize + 1) + 10));
      if (y + height > PAGE_HEIGHT - 52) {
        this.y = y;
        this.page();
        this.header(headers.join(' / '));
        y = this.y;
        drawHeader();
      }
      this.rect(MARGIN, y, CONTENT_WIDTH, height, rows.indexOf(row) % 2 ? COLORS.paper : [247, 244, 238], COLORS.line, 0.45);
      x = MARGIN;
      row.forEach((cell, index) => {
        this.block(cell, x + 5, y + 8, widths[index] - 10, fontSize, fontSize + 1, index === 0, COLORS.ink);
        x += widths[index];
      });
      x = MARGIN;
      widths.slice(0, -1).forEach((width) => {
        x += width;
        this.line(x, y, x, y + height, COLORS.line, 0.4);
      });
      y += height;
    });
    this.y = y + 15;
  }

  build() {
    const objects: string[] = [];
    const addObject = (value: string) => {
      objects.push(value);
      return objects.length;
    };
    const fontNormal = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>');
    const fontBold = addObject('<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>');
    const pageObjectIds: number[] = [];
    const contentObjectIds: number[] = [];
    this.pages.forEach((page) => {
      const stream = page.commands.join('\n');
      const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
      const pageId = addObject('');
      contentObjectIds.push(contentId);
      pageObjectIds.push(pageId);
    });
    const pagesId = addObject('');
    const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
    objects[pagesId - 1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(' ')}] /Count ${pageObjectIds.length} >>`;
    pageObjectIds.forEach((pageId, index) => {
      objects[pageId - 1] = `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /N ${fontNormal} 0 R /B ${fontBold} 0 R >> >> /Contents ${contentObjectIds[index]} 0 R >>`;
    });
    // Keep the file body ASCII-only so PDF byte offsets match the string lengths
    // used in the xref table when the browser turns it into a Blob.
    let pdf = '%PDF-1.4\n%\n';
    const offsets: number[] = [0];
    objects.forEach((object, index) => {
      offsets[index + 1] = pdf.length;
      pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
    });
    const xrefOffset = pdf.length;
    pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach((offset) => { pdf += `${String(offset).padStart(10, '0')} 00000 n \n`; });
    pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
    return new Blob([pdf], { type: 'application/pdf' });
  }

  pageCount() {
    return this.pages.length;
  }

  addFooters() {
    this.pages.forEach((_, index) => {
      this.current = this.pages[index];
      this.footer(index + 1);
    });
  }
}

function blankRows(count: number, columns: number) {
  return Array.from({ length: count }, () => Array.from({ length: columns }, () => ''));
}

function progressText(value: number) {
  return `${Math.round(value || 0)}%`;
}

function renderCover(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.rect(0, 0, PAGE_WIDTH, PAGE_HEIGHT, COLORS.cream);
  pdf.circle(PAGE_WIDTH - 26, 76, 86, [245, 176, 73]);
  pdf.circle(24, 160, 72, [221, 94, 62]);
  pdf.circle(PAGE_WIDTH - 2, PAGE_HEIGHT - 100, 64, [241, 151, 43]);
  pdf.circle(35, PAGE_HEIGHT - 52, 34, [224, 112, 46]);
  pdf.line(70, 110, 126, 84, COLORS.teal, 2);
  pdf.line(126, 84, 152, 106, COLORS.teal, 2);
  pdf.line(PAGE_WIDTH - 120, 146, PAGE_WIDTH - 75, 100, COLORS.teal, 2);
  pdf.line(PAGE_WIDTH - 75, 100, PAGE_WIDTH - 48, 128, COLORS.teal, 2);
  pdf.rect(55, 130, PAGE_WIDTH - 110, PAGE_HEIGHT - 260, [255, 248, 236], [236, 211, 183], 1);
  pdf.text('A SEMESTER, HELD GENTLY', 91, 192, 9, true, COLORS.amber);
  pdf.text('ULTIMATE', 91, 276, 33, true, COLORS.plum);
  pdf.text('SEMESTER', 91, 320, 33, true, COLORS.plum);
  pdf.text('PLANNER', 91, 364, 33, true, COLORS.plum);
  pdf.line(91, 391, PAGE_WIDTH - 92, 391, COLORS.amber, 1.5);
  pdf.text('Plan  |  Study  |  Track  |  Achieve', 91, 421, 12, false, COLORS.teal);
  pdf.text('NAME', 91, 518, 8, true, COLORS.purple);
  pdf.text(state.profile.name || ' ', 91, 538, 15, true, COLORS.plum);
  pdf.text('COURSE', 91, 580, 8, true, COLORS.purple);
  pdf.text(state.profile.course || ' ', 91, 600, 11, false, COLORS.ink);
  pdf.text('SEMESTER', 91, 642, 8, true, COLORS.purple);
  pdf.text(`${state.profile.semester || ' '}  |  ${state.profile.year || ' '}`, 91, 662, 11, false, COLORS.ink);
  pdf.text(initials(state.profile.name), PAGE_WIDTH - 139, PAGE_HEIGHT - 86, 22, true, COLORS.amber);
  pdf.text('PERSONAL STUDY EDITION', PAGE_WIDTH - 205, PAGE_HEIGHT - 55, 7.5, true, COLORS.purple);
}

function renderProfile(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Student Profile', 'A personal reference page for the semester ahead.');
  const fields = [
    ['Name', state.profile.name], ['College / University', state.profile.college],
    ['Course', state.profile.course], ['Branch / Major', state.profile.branch],
    ['Semester', state.profile.semester], ['Academic Year', state.profile.year],
    ['Roll Number', state.profile.roll], ['Email', state.profile.email],
  ];
  fields.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    pdf.field(label, value, MARGIN + col * 255, pdf.y + row * 62, 235, 32);
  });
  pdf.y += 4 * 62 + 20;
  pdf.rect(MARGIN, pdf.y, CONTENT_WIDTH, 72, COLORS.lavender, COLORS.line);
  pdf.text('A NOTE TO YOURSELF', MARGIN + 14, pdf.y + 19, 8, true, COLORS.purple);
  pdf.block('A good semester is not a perfect one. Use this planner to notice what matters, make room for it, and begin again without drama.', MARGIN + 14, pdf.y + 38, CONTENT_WIDTH - 28, 10, 14, false, COLORS.ink);
  pdf.y += 94;
}

function renderGoals(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Semester Goals', 'Small promises, kept. Progress can be imperfect.');
  const rows = state.goals.length
    ? state.goals.map((goal) => [goal.category, goal.title, goal.description, formatDate(goal.date), progressText(goal.progress), goal.completed ? 'Complete' : 'In progress'])
    : blankRows(6, 6);
  pdf.table(['Area', 'Goal', 'Description', 'Target date', 'Progress', 'Status'], rows, [70, 123, 150, 76, 48, 84]);
  if (!state.goals.length) pdf.text('Write a goal, what it looks like in practice, and a date that gives it shape.', MARGIN, pdf.y, 8.5, false, COLORS.muted);
}

function renderSubjects(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Subject Overview', 'A compact landscape view of the classes shaping your week.');
  const rows = state.subjects.length
    ? state.subjects.map((subject) => [subject.name, subject.faculty, String(subject.credits || ''), subject.target, subject.current, progressText(subject.progress), subject.notes])
    : blankRows(7, 7);
  pdf.table(['Subject', 'Faculty', 'Credits', 'Target', 'Current', 'Progress', 'Notes'], rows, [105, 100, 48, 52, 55, 60, 83], { compact: true });
}

function renderTimetable(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Class Timetable', 'A weekly grid for classes, rooms, and protected study blocks.');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const times = ['09:00', '11:00', '13:00', '15:00', '17:00'];
  const rows = times.map((time) => [time, ...days.map((day) => state.timetable[`${day}-${time}`] || '')]);
  pdf.table(['Time', ...days], rows, [55, 74, 74, 74, 74, 74, 74], { compact: true });
}

function renderDates(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Semester Important Dates', 'Keep deadlines, exams, practicals, and events close.');
  const rows = state.importantDates.length
    ? [...state.importantDates].sort((a, b) => a.date.localeCompare(b.date)).map((item) => [formatDate(item.date), item.type, item.title, item.note])
    : blankRows(8, 4);
  pdf.table(['Date', 'Type', 'What is it?', 'Note'], rows, [92, 90, 175, 146]);
}

function renderMonthly(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Monthly Planner', `${monthLabel(state.monthly.month)}. Make space for deadlines and for the parts of life that make the work worth doing.`);
  const value = state.monthly.month || new Date().toISOString().slice(0, 7);
  const date = new Date(`${value}-01T12:00:00`);
  const first = date.getDay() === 0 ? 6 : date.getDay() - 1;
  const total = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  const cellWidth = CONTENT_WIDTH / 7;
  const calendarY = pdf.y;
  pdf.rect(MARGIN, calendarY, CONTENT_WIDTH, 255, COLORS.paper, COLORS.line);
  ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].forEach((day, index) => {
    pdf.rect(MARGIN + index * cellWidth, calendarY, cellWidth, 23, COLORS.plum, COLORS.line, 0.3);
    pdf.text(day, MARGIN + index * cellWidth + 5, calendarY + 15, 7, true, COLORS.white);
  });
  for (let index = 0; index < 42; index += 1) {
    const row = Math.floor(index / 7);
    const col = index % 7;
    const day = index - first + 1;
    const y = calendarY + 23 + row * 38.5;
    pdf.rect(MARGIN + col * cellWidth, y, cellWidth, 38.5, COLORS.paper, COLORS.line, 0.35);
    if (day >= 1 && day <= total) {
      pdf.text(String(day), MARGIN + col * cellWidth + 5, y + 13, 7.5, true, COLORS.plum);
      const dateKey = `${value}-${String(day).padStart(2, '0')}`;
      if (state.importantDates.some((item) => item.date === dateKey)) pdf.circle(MARGIN + col * cellWidth + cellWidth - 10, y + 10, 3, COLORS.amber);
    }
  }
  pdf.y = calendarY + 280;
  pdf.field('Monthly goals', state.monthly.goals, MARGIN, pdf.y, 240, 70);
  pdf.field('Notes & events', state.monthly.notes, MARGIN + 263, pdf.y, 240, 70);
}

function renderWeekly(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Weekly Planner', 'One meaningful task per day is a good place to start.');
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
  const rows = days.map((day) => [day, state.weekly[day] || '', '', '', '', '']);
  pdf.table(['Day', 'Main task', 'Subject', 'Study hours', 'Priority', 'Done'], rows, [76, 187, 92, 63, 56, 29]);
}

function renderDaily(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Daily Study Planner', 'Three priorities, protected time, and a place to notice what went well.');
  pdf.field('Date', formatDate(state.daily.date), MARGIN, pdf.y, 150, 30);
  pdf.y += 62;
  pdf.text("TODAY'S TOP 3 PRIORITIES", MARGIN, pdf.y, 8, true, COLORS.purple);
  pdf.y += 14;
  const priorities = state.daily.priorities.length ? state.daily.priorities : ['', '', ''];
  priorities.slice(0, 3).forEach((priority, index) => {
    pdf.rect(MARGIN, pdf.y, CONTENT_WIDTH, 30, COLORS.paper, COLORS.line);
    pdf.circle(MARGIN + 16, pdf.y + 15, 8, COLORS.lavender, COLORS.purple);
    pdf.text(String(index + 1), MARGIN + 13.4, pdf.y + 18, 7, true, COLORS.purple);
    pdf.block(priority, MARGIN + 32, pdf.y + 18, CONTENT_WIDTH - 44, 9.5, 12, false, COLORS.ink);
    pdf.y += 38;
  });
  pdf.y += 10;
  pdf.field('Study sessions, subject, topic, breaks & notes', state.daily.notes, MARGIN, pdf.y, 240, 145);
  pdf.field("Today's achievements", state.daily.achievements, MARGIN + 263, pdf.y, 240, 145);
}

function renderAssignments(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Assignment Tracker', 'Move work from vague to visible.');
  const rows = state.assignments.length
    ? state.assignments.map((item) => [item.subject, item.title, item.description, formatDate(item.due), item.priority, item.status, item.submitted ? 'Yes' : 'No'])
    : blankRows(8, 7);
  pdf.table(['Subject', 'Assignment', 'Description', 'Due date', 'Priority', 'Status', 'Submitted'], rows, [75, 105, 122, 70, 54, 58, 54], { compact: true });
}

function renderExams(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Exam Tracker', 'Name the topics, then let small revisions build confidence.');
  const rows = state.exams.length
    ? state.exams.map((exam) => [exam.subject, formatDate(exam.date), exam.time, exam.topics, progressText(exam.progress), exam.revisions.map((done, index) => done ? `R${index + 1}` : '').filter(Boolean).join(', ')])
    : blankRows(7, 6);
  pdf.table(['Subject', 'Exam date', 'Time', 'Topics', 'Prepared', 'Revisions'], rows, [105, 82, 55, 157, 58, 46], { compact: true });
}

function renderProgress(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Study Progress Tracker', 'Turn each subject into a collection of topics.');
  const rows = state.subjects.length
    ? state.subjects.map((subject) => {
      const completed = Math.round((subject.progress || 0) / 10);
      return [subject.name, '10', String(completed), String(10 - completed), progressText(subject.progress)];
    })
    : blankRows(7, 5);
  pdf.table(['Subject', 'Total topics', 'Completed', 'Remaining', 'Progress'], rows, [205, 78, 78, 78, 64]);
  state.subjects.forEach((subject) => {
    const progress = Math.max(0, Math.min(100, subject.progress || 0));
    pdf.text(subject.name, MARGIN, pdf.y, 8, true, COLORS.ink);
    pdf.rect(MARGIN + 150, pdf.y - 8, 250, 9, COLORS.lavender, COLORS.line, 0.4);
    pdf.rect(MARGIN + 150, pdf.y - 8, 250 * (progress / 100), 9, COLORS.purple);
    pdf.text(progressText(progress), MARGIN + 412, pdf.y, 8, true, COLORS.purple);
    pdf.y += 21;
  });
}

function renderHabits(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Habit Tracker', `${monthLabel(state.habitMonth)}. Notice the days you kept the promise.`);
  const header = ['Habit / day', ...Array.from({ length: 31 }, (_, index) => String(index + 1))];
  const rows = state.habits.length
    ? state.habits.map((habit) => [habit.name, ...Array.from({ length: 31 }, (_, index) => habit.days.includes(index + 1) ? 'x' : '')])
    : [['', ...Array.from({ length: 31 }, () => '')], ['', ...Array.from({ length: 31 }, () => '')], ['', ...Array.from({ length: 31 }, () => '')], ['', ...Array.from({ length: 31 }, () => '')]];
  pdf.table(header, rows, [105, ...Array.from({ length: 31 }, () => 12.8)], { compact: true });
}

function renderGrades(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Grade Tracker', 'Enter marks as you receive them. Totals are calculated out of 500.');
  const parts = ['Assignment', 'Internal', 'Practical', 'Midterm', 'Final'];
  const rows = state.subjects.length
    ? state.subjects.map((subject) => {
      const values = state.grades[subject.id] || [];
      const marks = parts.map((_, index) => String(values[index] || ''));
      const total = values.reduce((sum, value) => sum + (value || 0), 0);
      const grade = total >= 450 ? 'A' : total >= 400 ? 'B+' : total >= 350 ? 'B' : total ? 'C' : '';
      return [subject.name, ...marks, total ? String(total) : '', grade];
    })
    : blankRows(7, 8);
  pdf.table(['Subject', ...parts, 'Total', 'Grade'], rows, [107, 63, 63, 63, 63, 63, 48, 30], { compact: true });
}

function renderRevision(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Revision Tracker', 'Spaced returns make recall calmer.');
  const rows: string[][] = [];
  state.subjects.forEach((subject) => {
    const subjectRows = state.revisions[subject.id] || [];
    if (!subjectRows.length) rows.push([subject.name, '', '', '', '', '', '']);
    subjectRows.forEach((row) => rows.push([subject.name, row.topic, ...row.checks.map((checked) => checked ? 'Done' : ''), row.confidence]));
  });
  pdf.table(['Subject', 'Topic', 'Revision 1', 'Revision 2', 'Revision 3', 'Revision 4', 'Confidence'], rows.length ? rows : blankRows(8, 7), [100, 150, 56, 56, 56, 56, 79], { compact: true });
}

function renderNotes(pdf: PdfBuilder, state: PlannerPdfState) {
  const notes = state.notes.length ? state.notes : [{ title: '', body: '' }];
  notes.forEach((note, index) => {
    pdf.section('Notes', note.title ? note.title : `Notes page ${index + 1}`);
    if (note.body) {
      pdf.block(note.body, MARGIN, pdf.y, CONTENT_WIDTH, 10, 15, false, COLORS.ink);
      pdf.y += 12;
    }
    for (let line = 0; line < 35; line += 1) {
      pdf.line(MARGIN, pdf.y + line * 18, PAGE_WIDTH - MARGIN, pdf.y + line * 18, [226, 221, 215], 0.55);
    }
  });
  for (let page = 0; page < 2; page += 1) {
    pdf.section('Notes', `Blank notes page ${page + 1}`);
    for (let line = 0; line < 35; line += 1) {
      pdf.line(MARGIN, pdf.y + line * 18, PAGE_WIDTH - MARGIN, pdf.y + line * 18, [226, 221, 215], 0.55);
    }
  }
}

function renderReflection(pdf: PdfBuilder, state: PlannerPdfState) {
  pdf.section('Semester Reflection', 'Look back with kindness. Keep the evidence of what you can now carry.');
  const fields: [string, string][] = [
    ['What I achieved', state.reflection.achieved || ''],
    ['What I learned', state.reflection.learned || ''],
    ['My biggest challenge', state.reflection.challenge || ''],
    ['What I improved', state.reflection.improved || ''],
    ['Skills I developed', state.reflection.skills || ''],
    ['What I want to improve next semester', state.reflection.next || ''],
  ];
  fields.forEach(([label, value], index) => {
    const col = index % 2;
    const row = Math.floor(index / 2);
    const x = MARGIN + col * 263;
    const y = pdf.y + row * 132;
    pdf.text(label.toUpperCase(), x, y, 7.2, true, COLORS.purple);
    pdf.rect(x, y + 8, 240, 102, COLORS.paper, COLORS.line, 0.7);
    if (value) pdf.block(value, x + 10, y + 27, 220, 9.3, 14, false, COLORS.ink);
  });
}

export function makeBlankPlannerState(state: PlannerPdfState): PlannerPdfState {
  return {
    ...state,
    profile: { name: '', college: '', course: '', branch: '', semester: '', year: '', roll: '', email: '' },
    subjects: [],
    goals: [],
    assignments: [],
    exams: [],
    habits: [],
    importantDates: [],
    habitMonth: '',
    timetable: {},
    weekly: {},
    daily: { date: '', priorities: [], notes: '', achievements: '' },
    monthly: { month: '', goals: '', notes: '' },
    grades: {},
    revisions: {},
    notes: [],
    reflection: { achieved: '', learned: '', challenge: '', improved: '', skills: '', next: '' },
  };
}

export function buildPlannerPdf(state: PlannerPdfState) {
  const pdf = new PdfBuilder();
  renderCover(pdf, state);
  renderProfile(pdf, state);
  renderGoals(pdf, state);
  renderSubjects(pdf, state);
  renderTimetable(pdf, state);
  renderDates(pdf, state);
  renderMonthly(pdf, state);
  renderWeekly(pdf, state);
  renderDaily(pdf, state);
  renderAssignments(pdf, state);
  renderExams(pdf, state);
  renderProgress(pdf, state);
  renderHabits(pdf, state);
  renderGrades(pdf, state);
  renderRevision(pdf, state);
  renderNotes(pdf, state);
  renderReflection(pdf, state);
  pdf.addFooters();
  return { blob: pdf.build(), pageCount: pdf.pageCount() };
}

export function downloadPlannerPdf(state: PlannerPdfState, blank = false) {
  const { blob } = buildPlannerPdf(blank ? makeBlankPlannerState(state) : state);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = blank ? 'ultimate-semester-planner-blank.pdf' : 'ultimate-semester-planner.pdf';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}