// app/api/admin/Add/delete/route.ts

import { NextResponse } from 'next/server';
import connectToDB from '@/lib/mongodb';
import Category from '@/models/Category';

export async function POST(req: Request) {
  try {
    await connectToDB();

    const body = await req.json();
    const { name, contents } = body;

    if (!name) {
      return NextResponse.json(
        { success: false, message: 'Name is required' },
        { status: 400 }
      );
    }

    const newCategory = new Category({
      name,
      contents: contents || [],
    });

    await newCategory.save();

    return NextResponse.json({ success: true, category: newCategory }, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { success: false, message: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
