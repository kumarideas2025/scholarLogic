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
