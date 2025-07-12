import { NextResponse } from 'next/server';
import connectToDB from 'lib/mongodb'; // Adjust the path to your MongoDB connection utility
import AdminCategory from 'models/AdminCategory'; // Adjust the path to your AdminCategory model

export async function GET() {
  try {
    // Ensure the database connection is established
    await connectToDB();

    // Fetch all admin categories
    const categories = await AdminCategory.find({}).exec();

    return NextResponse.json(categories, { status: 200 });
  } catch (error) {
    console.error('Error fetching admin categories:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}