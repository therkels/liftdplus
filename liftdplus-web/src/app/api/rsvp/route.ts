import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const { email, firstName } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
  const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

  const memberResponse = await fetch(
    `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members`,
    {
      method: "POST",
      headers: {
        Authorization: `apikey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email_address: email,
        status: "subscribed",
        merge_fields: {
          FNAME: firstName || "",
        },
      }),
    }
  );

  const memberData = await memberResponse.json();
  const alreadyExists = memberData.title === "Member Exists";

  if (!memberResponse.ok && !alreadyExists) {
    return NextResponse.json(
      { error: memberData.detail || "Something went wrong" },
      { status: 500 }
    );
  }

  const crypto = await import("crypto");
  const emailHash = crypto
    .createHash("md5")
    .update(email.toLowerCase())
    .digest("hex");

  await fetch(
    `https://${SERVER_PREFIX}.api.mailchimp.com/3.0/lists/${AUDIENCE_ID}/members/${emailHash}/tags`,
    {
      method: "POST",
      headers: {
        Authorization: `apikey ${API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        tags: [{ name: "mama-network-event-apr16", status: "active" }],
      }),
    }
  );

  return NextResponse.json({ success: true });
}
