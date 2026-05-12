import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const submittedBy = searchParams.get('submittedBy')
  const tag = searchParams.get('tag')

  const resources = await prisma.resource.findMany({
    where: {
      ...(submittedBy ? { submittedBy } : {}),
      ...(tag ? { tags: { some: { tag: { name: tag } } } } : {}),
    },
    include: { tags: { include: { tag: true } } },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(resources)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { title, link, description, submittedBy, tags } = body

  if (!title || !link || !submittedBy) {
    return NextResponse.json(
      { error: 'title, link, and submittedBy are required' },
      { status: 400 }
    )
  }

  const tagNames = tags || []

  const resource = await prisma.resource.create({
    data: {
      title,
      link,
      description: description || '',
      submittedBy,
      tags: {
        create: await Promise.all(
          tagNames.map(async (tagName: string) => {
            const tag = await prisma.tag.upsert({
              where: { name: tagName.trim().toLowerCase() },
              update: {},
              create: { name: tagName.trim().toLowerCase() },
            })
            return { tagId: tag.id }
          })
        ),
      },
    },
    include: { tags: { include: { tag: true } } },
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