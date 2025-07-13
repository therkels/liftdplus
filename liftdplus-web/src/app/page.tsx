import NavBar from "@/components/site_core/nav";
import Card from "@/components/site_core/Card";
import CardScroller from "@/components/site_core/CardScroller";

const sampleCards = [
  {
    image: "/dandelion.jpg",
    title: "Medical Cannabis Fundamentals",
    secondaryTitle: "Understanding therapeutic applications",
    authorName: "Dr. Jane Smith, PhD",
    likes: 245,
    tags: ["Medical", "Research", "Wellness"],
  },
  {
    image: "/dandelion.jpg",
    title: "Holistic Wellness Guide",
    secondaryTitle: "Natural approaches to health and healing",
    authorName: "Dr. John Doe, MD",
    likes: 189,
    tags: ["Wellness", "Natural", "Health"],
  },
  {
    image: "/dandelion.jpg",
    title: "Plant Medicine Research",
    secondaryTitle: "Latest clinical studies and findings",
    authorName: "Prof. Sarah Wilson, PharmD",
    likes: 312,
    tags: ["Research", "Clinical", "Education"],
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-gray-50">
      <NavBar />
      <main className="container mx-auto px-4 py-8">
        <CardScroller title="Trending">
          {sampleCards.map((card, index) => (
            <Card key={index} {...card} />
          ))}
        </CardScroller>

        <CardScroller title="Recently Added">
          {sampleCards.map((card, index) => (
            <Card key={`recent-${index}`} {...card} />
          ))}
        </CardScroller>
      </main>
    </div>
  );
}