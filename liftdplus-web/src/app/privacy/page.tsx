import fs from "fs";
import path from "path";

export default function PrivacyPage() {
  const html = fs.readFileSync(path.join(process.cwd(), "public/privacy.html"), "utf8");
  return (
    <div style={{ maxWidth: "860px", margin: "0 auto", padding: "60px 24px 80px" }}>
      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
