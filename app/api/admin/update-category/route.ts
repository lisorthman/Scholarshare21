import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import AdminCategory from "@/models/AdminCategory";
import connectDB from "@/lib/mongodb";

export async function PUT(request: Request) {
  await connectDB();

  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ message: "Unauthorized: No token provided" }, { status: 401 });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_jwt_secret") as { userId: string; role: string };
    if (decoded.role !== "admin") {
      return NextResponse.json({ message: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const categoryId = searchParams.get("id");
    if (!categoryId) {
      return NextResponse.json({ message: "Category ID is required" }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, parentCategory } = body;

    if (!name) {
      return NextResponse.json({ message: "Category name is required" }, { status: 400 });
    }

    // Check if the category exists
    const category = await AdminCategory.findById(categoryId);
    if (!category) {
      return NextResponse.json({ message: "Category not found" }, { status: 404 });
    }

    // Check if the new name is unique (excluding the current category)
    const existingCategory = await AdminCategory.findOne({ name, _id: { $ne: categoryId } });
    if (existingCategory) {
      return NextResponse.json({ message: "Category name must be unique" }, { status: 400 });
    }

    // Check if the parentCategory exists (if provided)
    if (parentCategory) {
      const parent = await AdminCategory.findById(parentCategory);
      if (!parent) {
        return NextResponse.json({ message: "Parent category not found" }, { status: 400 });
      }
      // Prevent a category from being its own parent
      if (parentCategory === categoryId) {
        return NextResponse.json({ message: "A category cannot be its own parent" }, { status: 400 });
      }
    }

    // Update the category
    category.name = name;
    category.description = description || "";
    category.parentCategory = parentCategory || null;
    await category.save();

    return NextResponse.json({ message: `Category "${name}" updated successfully` }, { status: 200 });
  } catch (error) {
    console.error("UpdateCategory API: Error:", error);
    return NextResponse.json({ message: "Failed to update category" }, { status: 500 });
  }
}