import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const submittedBy = searchParams.get('submittedBy')

  const resources = await prisma.resource.findMany({
    where: submittedBy ? { submittedBy } : undefined,
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(resources)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, link, description, submittedBy } = body

  if (!title || !link || !submittedBy) {
    return NextResponse.json(
      { error: 'title, link, and submittedBy are required' },
      { status: 400 }
    )
  }

  const resource = await prisma.resource.create({
    data: {
      title,
      link,
      description: description || '',
      submittedBy,
    },
  })

  return NextResponse.json(resource, { status: 201 })
}

export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')

  if (!id) {
    return NextResponse.json({ error: 'id is required' }, { status: 400 })
  }

  await prisma.resource.delete({
    where: { id: parseInt(id) },
  })

  return NextResponse.json({ success: true })
}