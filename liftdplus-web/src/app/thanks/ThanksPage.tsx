import Link from "next/link";

type ThanksPageProps = {
  message: string;
};

export default function ThanksPage({ message }: ThanksPageProps) {
  return (
    <div className="min-h-screen bg-[#f9f8f7] flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full text-center">
        <p className="text-xl font-bold tracking-tight text-[#313a43] mb-8">LIFTD+</p>

        <p className="text-base leading-relaxed text-[#313a43] mb-10">{message}</p>

        <Link
          href="/results"
          className="inline-block text-sm font-semibold text-[#6b938c] underline underline-offset-4 hover:text-[#5a7d75] transition-colors"
        >
          Open your guide
        </Link>
      </div>
    </div>
  );
}
