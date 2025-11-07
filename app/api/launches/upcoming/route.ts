import { NextRequest, NextResponse } from 'next/server'

const LAUNCH_LIBRARY_API = 'https://ll.thespacedevs.com/2.2.0'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || '5'

    const url = `${LAUNCH_LIBRARY_API}/launch/upcoming/?limit=${limit}`

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 30 } // Cache for 30 seconds for upcoming launches
    })

    if (!response.ok) {
      throw new Error('Failed to fetch upcoming launches')
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching upcoming launches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch upcoming launches' },
      { status: 500 }
    )
  }
}
