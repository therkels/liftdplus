// Interest schema definition
export interface Interest {
  id: string;
  displayName: string;
  isActive: boolean;
}

export interface InterestsSchema {
  interests: Interest[];
}

// Mock data matching the requested interests
export const mockInterestsData: InterestsSchema = {
  interests: [
    {
      id: "stress-anxiety",
      displayName: "Stress & Anxiety",
      isActive: true,
    },
    {
      id: "sleep-rest",
      displayName: "Sleep & Rest", 
      isActive: true,
    },
    {
      id: "pain-relief",
      displayName: "Pain Relief",
      isActive: true,
    },
  ],
};
