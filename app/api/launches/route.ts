import { NextRequest, NextResponse } from 'next/server'

const LAUNCH_LIBRARY_API = 'https://ll.thespacedevs.com/2.2.0'

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get('limit') || '10'
    const offset = searchParams.get('offset') || '0'
    const status = searchParams.get('status') || '' // upcoming, success, failure
    const search = searchParams.get('search') || ''

    let url = `${LAUNCH_LIBRARY_API}/launch/?limit=${limit}&offset=${offset}`

    if (status) {
      url += `&status=${status}`
    }

    if (search) {
      url += `&search=${encodeURIComponent(search)}`
    }

    const response = await fetch(url, {
      headers: {
        'Accept': 'application/json',
      },
      next: { revalidate: 60 } // Cache for 60 seconds
    })

    if (!response.ok) {
      throw new Error('Failed to fetch launches')
    }

    const data = await response.json()

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching launches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch launches' },
      { status: 500 }
    )
  }
}
