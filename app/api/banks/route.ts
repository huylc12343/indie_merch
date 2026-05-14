type VietQrBank = {
  bin: string;
  name: string;
};

type VietQrBanksResponse = {
  code: string;
  desc: string;
  data?: VietQrBank[];
};

export async function GET() {
  try {
    const response = await fetch("https://api.vietqr.io/v2/banks", {
      next: { revalidate: 86400 },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch banks: HTTP ${response.status}`);
    }

    const payload = (await response.json()) as VietQrBanksResponse;

    return Response.json(
      { data: payload.data ?? [] },
      {
        status: 200,
        headers: {
          "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=3600",
        },
      }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to fetch banks";
    return Response.json({ error: message }, { status: 500 });
  }
}