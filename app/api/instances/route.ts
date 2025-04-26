import { NextResponse, NextRequest } from 'next/server';
import { auth } from '@/app/(auth)/auth';
import {
  saveInstance,
  getInstancesByUserId,
  getInstanceById,
  updateInstanceById,
  deleteInstanceById,
} from '@/lib/db/queries';
import { verifyDhis2Instance } from '@/lib/dhis2/verify';

export async function POST(request: NextRequest) {
  try {
    const {
      name,
      url,
      apiToken,
      description,
      username,
      password,
    } = await request.json();

    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Attempt to verify the instance
    let verified = false;
    let details = null;

    if (apiToken) {
      try {
        const verificationResult = await verifyDhis2Instance(url, apiToken);
        verified = verificationResult.success;
        details = verificationResult.data;
      } catch (error) {
        console.error('Error verifying DHIS2 instance:', error);
        // We'll continue and save the instance as unverified
      }
    }

    const [newInstance] = await saveInstance({
      name,
      url,
      apiToken,
      description,
      username,
      password,
      details,
      verified,
      userId: session.user.id,
    });

    return NextResponse.json(newInstance, { status: 201 });
  } catch (error) {
    console.error('Error creating instance:', error);
    return NextResponse.json(
      { error: 'Failed to create instance' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth();

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const instances = await getInstancesByUserId(session.user.id);
    return NextResponse.json(instances);
  } catch (error) {
    console.error('Error fetching instances:', error);
    return NextResponse.json(
      { error: 'Failed to fetch instances' },
      { status: 500 }
    );
  }
}