export const dynamic = "force-dynamic";

export default function Page({ params }: { params: { slug: string } }) {
  return (
    <div style={{ padding: 24 }}>
      <h1>Route OK</h1>
      <p>slug: <code>{params.slug}</code></p>
    </div>
  );
}
