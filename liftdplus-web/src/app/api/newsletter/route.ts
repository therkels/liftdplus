import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: "Email is required" }, { status: 400 });
  }

  const API_KEY = process.env.MAILCHIMP_API_KEY;
  const AUDIENCE_ID = process.env.MAILCHIMP_AUDIENCE_ID;
  const SERVER_PREFIX = process.env.MAILCHIMP_SERVER_PREFIX;

  const response = await fetch(
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
      }),
    }
  );

  const data = await response.json();

  if (response.ok) {
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
          tags: [{ name: "mamas-cheat-sheet", status: "active" }],
        }),
      }
    );

    return NextResponse.json({ success: true });
  } else if (data.title === "Member Exists") {
    // Still apply the tag even if already subscribed
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
          tags: [{ name: "mamas-cheat-sheet", status: "active" }],
        }),
      }
    );
    return NextResponse.json({ success: true });
  } else {
    return NextResponse.json({ error: data.detail || "Something went wrong" }, { status: 500 });
  }
}
