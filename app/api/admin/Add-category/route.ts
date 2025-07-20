import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import connectToDB from 'lib/mongodb';
import AdminCategory from 'models/AdminCategory';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    // Parse Authorization header
    const authHeader = request.headers.get('Authorization');
    console.log("AddCategory API: Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log("AddCategory API: No valid Bearer token provided");
      return NextResponse.json({ message: 'Unauthorized: No token provided' }, { status: 401 });
    }

    const token = authHeader.split(' ')[1];
    console.log("AddCategory API: Received token:", token);

    // Check for JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.log("AddCategory API: JWT_SECRET is not defined in environment variables");
      return NextResponse.json({ message: 'Server configuration error: JWT_SECRET missing' }, { status: 500 });
    }

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      userId?: string;
      name?: string;
      email?: string;
      role?: string;
      _id?: string;
    };
    console.log("AddCategory API: Decoded token:", decoded);

    if (!decoded.role || decoded.role !== 'admin') {
      console.log("AddCategory API: User not admin:", decoded);
      return NextResponse.json({ message: 'Unauthorized: Admin access required' }, { status: 403 });
    }

    const idField = decoded.userId || decoded._id;
    if (!idField || !ObjectId.isValid(idField)) {
      console.log("AddCategory API: Invalid user identifier:", idField);
      return NextResponse.json({ message: 'Invalid user identifier' }, { status: 401 });
    }

    // Connect to the database
    await connectToDB();
    console.log("AddCategory API: Connected to database");

    // Parse request body
    const { name, description, parentCategory } = await request.json();
    console.log("AddCategory API: Request body:", { name, description, parentCategory });

    // Validate input
    if (!name) {
      console.log("AddCategory API: Category name is required");
      return NextResponse.json({ message: 'Category name is required' }, { status: 400 });
    }

    // Create the new admin category
    const newCategory = new AdminCategory({
      name,
      description: description || '',
      parentCategory: parentCategory || null,
      createdAt: new Date(),
    });

    // Save the category to the database
    await newCategory.save();
    console.log("AddCategory API: Category saved:", newCategory);

    return NextResponse.json({ message: 'Category added successfully', id: newCategory._id }, { status: 201 });
  } catch (error) {
    console.error('AddCategory API: Error adding admin category:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 401 });
    }
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return NextResponse.json({ message: 'Category name already exists' }, { status: 400 });
    }
    return NextResponse.json({ message: 'Internal server error', error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}