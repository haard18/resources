import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const tags = await prisma.tag.findMany({
    include: { _count: { select: { resources: true } } },
    orderBy: { name: 'asc' },
  })
  return NextResponse.json(tags)
}

export async function POST(request: NextRequest) {
  const body = await request.json()
  const { name } = body

  if (!name || !name.trim()) {
    return NextResponse.json({ error: 'name is required' }, { status: 400 })
  }

  const tag = await prisma.tag.upsert({
    where: { name: name.trim().toLowerCase() },
    update: {},
    create: { name: name.trim().toLowerCase() },
  })

  return NextResponse.json(tag, { status: 201 })
}