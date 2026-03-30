export default function Home() {
  return (
    <main>
      <p>Redirecting…</p>
      <script
        dangerouslySetInnerHTML={{
          __html: `window.location.href = '/index.html';`,
        }}
      />
    </main>
  );
}
