"use client";

import { useEffect, useState } from "react";

export default function TermsPage() {
  const [html, setHtml] = useState("");
  useEffect(() => {
    fetch("/terms.html")
      .then((res) => res.text())
      .then((text) => setHtml(text));
  }, []);
  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "60px 24px 80px" }}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
