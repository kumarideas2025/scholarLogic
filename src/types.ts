export interface University {
  id: string;
  name: string;
  location: string;
  country: string;
  image: string;
  rank: number;
  matchPercentage: number;
  tuition: number; // in USD
  livingCost: number; // in USD
  majors: string[];
  gpaThreshold: number;
  ieltsThreshold: number;
  toeflThreshold: number;
  aiJustification: string;
  deadline: string;
  popularScholarship: string;
}

export interface Scholarship {
  id: string;
  name: string;
  provider: string;
  amount: string;
  destination: string;
  deadline: string;
  eligibility: string;
  major: string;
}

export interface Activity {
  id: string;
  type: "match" | "document" | "chat" | "scholarship";
  title: string;
  description: string;
  time: string;
}

export interface DeadlineItem {
  id: string;
  title: string;
  university: string;
  daysRemaining: number;
  completed: boolean;
}

export const INITIAL_UNIVERSITIES: University[] = [
  {
    id: "univ-stanford",
    name: "Stanford University",
    location: "Stanford, California",
    country: "USA",
    image: "https://picsum.photos/seed/stanford/600/400",
    rank: 2,
    matchPercentage: 98,
    tuition: 58000,
    livingCost: 24000,
    majors: ["Computer Science", "Artificial Intelligence", "Electrical Engineering", "Data Science"],
    gpaThreshold: 3.8,
    ieltsThreshold: 7.5,
    toeflThreshold: 100,
    aiJustification: "Your strong research publications and a 3.92 GPA align exceptionally with Stanford's Computer Science department. Your interests in Machine Learning match the recent publications from the Stanford AI Lab (SAIL).",
    deadline: "December 05, 2026",
    popularScholarship: "Knight-Hennessy Scholars Program"
  },
  {
    id: "univ-eth",
    name: "ETH Zurich",
    location: "Zurich",
    country: "Switzerland",
    image: "https://picsum.photos/seed/eth/600/400",
    rank: 7,
    matchPercentage: 95,
    tuition: 1600, // Swiss public tuition is very low!
    livingCost: 22000,
    majors: ["Computer Science", "Robotics", "Mechanical Engineering", "Data Science"],
    gpaThreshold: 3.7,
    ieltsThreshold: 7.0,
    toeflThreshold: 95,
    aiJustification: "ETH Zurich offers world-class computer science at an extremely low tuition fee ($1,600/yr), perfectly solving your student budget constraints while maintaining peak global research prestige.",
    deadline: "December 15, 2026",
    popularScholarship: "ETH Excellence Scholarship (ESOP)"
  },
  {
    id: "univ-oxford",
    name: "University of Oxford",
    location: "Oxford",
    country: "UK",
    image: "https://picsum.photos/seed/oxford/600/400",
    rank: 3,
    matchPercentage: 92,
    tuition: 44000,
    livingCost: 18000,
    majors: ["Computer Science", "Mathematics", "Software Engineering", "AI & Philosophy"],
    gpaThreshold: 3.8,
    ieltsThreshold: 7.5,
    toeflThreshold: 100,
    aiJustification: "Oxford's emphasis on intensive theoretical computer science fits your strong mathematics grades. Oxford's college structure provides unique academic mentorship opportunities.",
    deadline: "January 08, 2027",
    popularScholarship: "Clarendon Fund Scholarship"
  },
  {
    id: "univ-nus",
    name: "National University of Singapore",
    location: "Kent Ridge",
    country: "Singapore",
    image: "https://picsum.photos/seed/nus/600/400",
    rank: 8,
    matchPercentage: 91,
    tuition: 28000,
    livingCost: 12000,
    majors: ["Biomedical Engineering", "Computer Science", "Finance", "Information Systems"],
    gpaThreshold: 3.6,
    ieltsThreshold: 6.5,
    toeflThreshold: 90,
    aiJustification: "NUS represents a premier tech gateway in Asia. Your IELTS score and quantitative interests position you for entry, and Tuition Grant options can waive up to 40% of standard costs.",
    deadline: "January 15, 2027",
    popularScholarship: "NUS ASEAN Undergraduate Scholarship"
  },
  {
    id: "univ-toronto",
    name: "University of Toronto",
    location: "Toronto, Ontario",
    country: "Canada",
    image: "https://picsum.photos/seed/toronto/600/400",
    rank: 21,
    matchPercentage: 89,
    tuition: 41000,
    livingCost: 16000,
    majors: ["Computer Science", "Bioinformatics", "Materials Engineering", "Physics"],
    gpaThreshold: 3.5,
    ieltsThreshold: 7.0,
    toeflThreshold: 93,
    aiJustification: "U of T is Canada's top research powerhouse. Your high-level coding background is a fantastic match for their vector/AI institute connections, and full work authorization (PGWP) is highly viable.",
    deadline: "January 15, 2027",
    popularScholarship: "Lester B. Pearson International Scholarship"
  },
  {
    id: "univ-imperial",
    name: "Imperial College London",
    location: "South Kensington",
    country: "UK",
    image: "https://picsum.photos/seed/imperial/600/400",
    rank: 6,
    matchPercentage: 88,
    tuition: 42000,
    livingCost: 19000,
    majors: ["Electrical Engineering", "Computer Science", "Computing & AI", "Mathematics"],
    gpaThreshold: 3.7,
    ieltsThreshold: 7.0,
    toeflThreshold: 92,
    aiJustification: "Imperial's hyper-focus on industrial computing application and entrepreneurial hubs perfectly aligns with your stated goal of joining high-growth tech startups post-graduation.",
    deadline: "January 26, 2027",
    popularScholarship: "Imperial President's PhD Fellowship"
  },
  {
    id: "univ-delft",
    name: "TU Delft",
    location: "Delft",
    country: "Netherlands",
    image: "https://picsum.photos/seed/delft/600/400",
    rank: 47,
    matchPercentage: 86,
    tuition: 19500,
    livingCost: 13000,
    majors: ["Aerospace Engineering", "Computer Science", "Sustainable Energy", "Design"],
    gpaThreshold: 3.4,
    ieltsThreshold: 6.5,
    toeflThreshold: 90,
    aiJustification: "TU Delft is the premium tech university of the Netherlands. High-quality CS labs at half the cost of American alternatives, coupled with a 1-year orientation year post-study visa.",
    deadline: "January 15, 2027",
    popularScholarship: "Justus & Louise van Effen Scholarship"
  }
];

export const INITIAL_SCHOLARSHIPS: Scholarship[] = [
  {
    id: "sch-1",
    name: "Knight-Hennessy Scholars",
    provider: "Stanford University",
    amount: "Full Tuition + Living Stipend (100% Funded)",
    destination: "USA",
    deadline: "October 14, 2026",
    eligibility: "Any graduate applicant seeking Stanford enrollment. Exceptional civic leadership required.",
    major: "All"
  },
  {
    id: "sch-2",
    name: "ETH Excellence Scholarship & Opportunity Programme",
    provider: "ETH Zurich",
    amount: "Full Tuition Waiver + CHF 12,000/semester living fund",
    destination: "Switzerland",
    deadline: "December 15, 2026",
    eligibility: "Top 5% of incoming master's cohorts. Requires detailed master thesis outline proposal.",
    major: "STEM"
  },
  {
    id: "sch-3",
    name: "Lester B. Pearson Scholarship",
    provider: "University of Toronto",
    amount: "Full Tuition, Books, Incidental fees, and Residence support",
    destination: "Canada",
    deadline: "January 15, 2027",
    eligibility: "Exceptional academic credentials, school nomination, and creative leadership proof.",
    major: "All"
  },
  {
    id: "sch-4",
    name: "DAAD Study Scholarshipsfor Foreign Graduates",
    provider: "DAAD Germany",
    amount: "€994/month living stipend + health cover + travel voucher",
    destination: "Germany",
    deadline: "November 15, 2026",
    eligibility: "Bachelor degree holders targeting master level study in Germany.",
    major: "All"
  }
];

export const INITIAL_ACTIVITIES: Activity[] = [
  {
    id: "act-1",
    type: "match",
    title: "University Match Updated",
    description: "Stanford University match rating climbed from 92% to 98% because of your updated research rating.",
    time: "2 hours ago"
  },
  {
    id: "act-2",
    type: "document",
    title: "SoP Draft Evaluated",
    description: "Your Computer Science personal statement feedback was synthesized with an 84/100 readiness index.",
    time: "Yesterday"
  },
  {
    id: "act-3",
    type: "scholarship",
    title: "New Fund Recommendation",
    description: "Added ETH Excellence Scholarship (ESOP) to matching watchlist; deadline in 190 days.",
    time: "3 days ago"
  },
  {
    id: "act-4",
    type: "chat",
    title: "Counseling Consult",
    description: "Interactive session with Dr. Sophia Miller regarding European funding schemes completed.",
    time: "Last Tuesday"
  }
];

export const INITIAL_DEADLINES: DeadlineItem[] = [
  {
    id: "dl-1",
    title: "Knight-Hennessy Scholarship Round",
    university: "Stanford University",
    daysRemaining: 131,
    completed: false
  },
  {
    id: "dl-2",
    title: "Vanguard Master Application Deadline",
    university: "ETH Zurich",
    daysRemaining: 192,
    completed: false
  },
  {
    id: "dl-3",
    title: "Clarendon Fellowship Nomination",
    university: "University of Oxford",
    daysRemaining: 216,
    completed: true
  },
  {
    id: "dl-4",
    title: "Lester B. Pearson Nomination Form",
    university: "University of Toronto",
    daysRemaining: 223,
    completed: false
  }
];
