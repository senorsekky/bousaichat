import { NextResponse } from 'next/server';
import { GoogleAuth } from 'google-auth-library';

export async function POST(request: Request) {
  try {

    const auth = new GoogleAuth({
      keyFile: process.env.GOOGLE_APPLICATION_CREDENTIALS,
      scopes: ['https://www.googleapis.com/auth/cloud-platform'],
    });

    const client = await auth.getClient();
    const projectId = process.env.NEXT_PUBLIC_PROJECT_ID;
    const location = process.env.NEXT_PUBLIC_LOCATION;
    const endpointId = process.env.NEXT_PUBLIC_ENDPOINT_ID;
    const url = `https://asia-northeast1-aiplatform.googleapis.com/v1/projects/${projectId}/locations/${location}/endpoints/${endpointId}:routeinfo`;

    const body = await request.json(); // クライアントからのリクエストボディを取得

    const response = await client.request({
      url,
      method: 'POST',
      data: body, // クライアントからのリクエストボディをそのまま渡す
    });

    const responseData = response.data; // レスポンスデータを取得
    return NextResponse.json(responseData); // レスポンスデータをクライアントに返す

  } catch (error) {
    console.error('Error during prediction request:', error);
    return NextResponse.json({ error: 'Prediction request failed' }, { status: 500 });
  }
}
