import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    console.log("BODY:", body);

    const response = await fetch(
      "http://127.0.0.1:8000/api/shipping/calculate",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(body),
        cache: "no-store",
      },
    );

    const text = await response.text();

    console.log("FASTAPI RESPONSE:", text);

    let data;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        {
          error: "Invalid JSON from shipping service",
          raw: text,
        },
        {
          status: 500,
        },
      );
    }

    return NextResponse.json(data, {
      status: response.status,
    });
  } catch (error) {
    console.error("SHIPPING API ROUTE ERROR:", error);

    return NextResponse.json(
      {
        error: String(error),
      },
      {
        status: 500,
      },
    );
  }
}