import { NextRequest, NextResponse } from "next/server";
import { connectToDB } from 'lib/mongodb';
import AdminCategory from 'models/AdminCategory';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';

export async function DELETE(request: NextRequest) {
  try {
    // Check for JWT_SECRET
    if (!process.env.JWT_SECRET) {
      console.log("DeleteCategory API: JWT_SECRET is not defined in environment variables");
      return NextResponse.json({ message: 'Server configuration error: JWT_SECRET missing' }, { status: 500 });
    }

    // Parse Authorization header
    const authHeader = request.headers.get("Authorization");
    console.log("DeleteCategory API: Authorization header:", authHeader);

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.log("DeleteCategory API: No valid Bearer token provided");
      return NextResponse.json(
        { message: "Authorization header missing or invalid" },
        { status: 401 }
      );
    }
    const token = authHeader.split(" ")[1];
    console.log("DeleteCategory API: Received token:", token);

    // Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET) as {
      role?: string;
    };
    console.log("DeleteCategory API: Decoded token:", decoded);

    if (!decoded || !decoded.role || decoded.role !== "admin") {
      console.log("DeleteCategory API: User not admin:", decoded);
      return NextResponse.json(
        { message: "Unauthorized: Admin access required" },
        { status: 403 }
      );
    }

    // Get the category ID from the URL
    const url = new URL(request.url);
    const categoryId = url.searchParams.get("id");
    console.log("DeleteCategory API: Category ID:", categoryId);

    if (!categoryId) {
      console.log("DeleteCategory API: Category ID is required");
      return NextResponse.json(
        { message: "Category ID is required" },
        { status: 400 }
      );
    }

    // Validate the categoryId format
    if (!ObjectId.isValid(categoryId)) {
      console.log("DeleteCategory API: Invalid category ID format:", categoryId);
      return NextResponse.json(
        { message: "Invalid category ID format" },
        { status: 400 }
      );
    }

    // Connect to the database
    await connectToDB();
    console.log("DeleteCategory API: Connected to database");

    // Find the category in the database using the AdminCategory model
    const category = await AdminCategory.findById(categoryId);
    console.log("DeleteCategory API: Found category:", category);

    if (!category) {
      console.log("DeleteCategory API: Category not found");
      return NextResponse.json(
        { message: "Category not found" },
        { status: 404 }
      );
    }

    // Check if the category has children (other categories with parentCategory = categoryId)
    const childCategories = await AdminCategory.find({ parentCategory: categoryId });
    console.log("DeleteCategory API: Child categories:", childCategories);

    if (childCategories.length > 0) {
      console.log("DeleteCategory API: Cannot delete category with children");
      return NextResponse.json(
        { message: "Cannot delete category because it has subcategories" },
        { status: 400 }
      );
    }

    // Delete the category from the database
    await AdminCategory.findByIdAndDelete(categoryId);
    console.log("DeleteCategory API: Category deleted:", categoryId);

    // Send a success message back
    return NextResponse.json(
      { message: `Category "${category.name}" deleted successfully` },
      { status: 200 }
    );
  } catch (error) {
    console.error("DeleteCategory API: Error deleting category:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
    });
    if (error instanceof Error && error.name === 'JsonWebTokenError') {
      console.log("DeleteCategory API: Invalid or expired token");
      return NextResponse.json(
        { message: "Invalid or expired token" },
        { status: 401 }
      );
    }
    return NextResponse.json(
      { message: "Failed to delete category" },
      { status: 500 }
    );
  }
}