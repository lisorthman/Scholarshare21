import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import connectDB from '@/lib/mongoose';
import ResearchPaper from '@/models/ResearchPaper';
import AdminCategory from '@/models/AdminCategory';
import { ObjectId } from 'mongodb';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
];

// GET: Fetch single paper
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const paper = await ResearchPaper.findById(id)
      .select('-__v')
      .lean();

    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    return NextResponse.json(paper);
  } catch (error) {
    console.error('GET error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch paper' },
      { status: 500 }
    );
  }
}

// PATCH: Update paper
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const formData = await request.formData();

    const title = formData.get('title')?.toString() || '';
    const abstract = formData.get('abstract')?.toString() || '';
    const categoryId = formData.get('category')?.toString() || '';
    const file = formData.get('file') as File | null;

    // Validate category exists in database
    const category = await AdminCategory.findById(categoryId);
    if (!category && categoryId) {
      const allCategories = await AdminCategory.find({}, 'name');
      return NextResponse.json(
        { 
          error: 'Invalid category selected',
          receivedCategoryId: categoryId,
          availableCategories: allCategories
        },
        { status: 400 }
      );
    }

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    let fileData = {
      url: paper.fileUrl,
      name: paper.fileName,
      size: paper.fileSize,
      type: paper.fileType,
      blobKey: paper.blobKey
    };

    if (file?.size) {
      if (!ALLOWED_FILE_TYPES.includes(file.type)) {
        return NextResponse.json({ error: 'Invalid file type' }, { status: 400 });
      }
      if (file.size > MAX_FILE_SIZE) {
        return NextResponse.json({ error: 'File too large' }, { status: 400 });
      }

      // Delete old blob if exists
      if (paper.blobKey) {
        try {
          const deleteResponse = await fetch(`https://blob.vercel-storage.com/${paper.blobKey}`, {
            method: 'DELETE',
            headers: {
              Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
            },
          });

          if (!deleteResponse.ok) {
            const text = await deleteResponse.text();
            console.error('Blob delete failed:', deleteResponse.status, text);
            throw new Error('Failed to delete blob');
          }
        } catch (err) {
          console.error('Blob delete error during PATCH:', err);
        }
      }

      // Upload new blob
      const { url, pathname } = await put(file.name, file, { access: 'public' });
      console.log('Updated file URL for plagiarism check:', url); // Debug log for plagiarism check
      fileData = {
        url,
        name: file.name,
        size: file.size,
        type: file.type,
        blobKey: pathname
      };
    }

    const updateData: any = {
      title,
      abstract,
      updatedAt: new Date()
    };

    // Only update category fields if a new category was provided
    if (categoryId) {
      updateData.category = category ? category.name : null;
      updateData.categoryId = new ObjectId(categoryId);
    }

    // Only update file fields if a new file was provided
    if (file?.size) {
      updateData.fileUrl = fileData.url;
      updateData.fileName = fileData.name;
      updateData.fileSize = fileData.size;
      updateData.fileType = fileData.type;
      updateData.blobKey = fileData.blobKey;
      // Reset plagiarism-related fields to trigger a new check
      updateData.status = 'pending';
      updateData.plagiarismScore = 0;
      updateData.aiScore = 0;
      updateData.rejectionReason = null;
    }

    const updatedPaper = await ResearchPaper.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );

    return NextResponse.json({
      success: true,
      paper: updatedPaper
    });
  } catch (error) {
    console.error('PATCH error:', error);
    return NextResponse.json(
      { error: 'Failed to update paper' },
      { status: 500 }
    );
  }
}

// DELETE: Remove paper and blob
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const paper = await ResearchPaper.findById(id);
    if (!paper) {
      return NextResponse.json({ error: 'Paper not found' }, { status: 404 });
    }

    // Delete blob from Vercel
    if (paper.blobKey) {
      try {
        const response = await fetch(`https://blob.vercel-storage.com/${paper.blobKey}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${process.env.BLOB_READ_WRITE_TOKEN}`,
          },
        });

        if (!response.ok) {
          const text = await response.text();
          console.error('Blob delete failed:', response.status, text);
          throw new Error('Failed to delete blob');
        }
      } catch (err) {
        console.error('Blob delete error during DELETE:', err);
        return NextResponse.json(
          { error: 'Failed to delete blob' },
          { status: 500 }
        );
      }
    }

    // Delete from DB
    await ResearchPaper.findByIdAndDelete(id);

    return NextResponse.json({
      success: true,
      message: 'Paper deleted successfully'
    });
  } catch (error) {
    console.error('DELETE error:', error);
    return NextResponse.json(
      { error: 'Failed to delete paper' },
      { status: 500 }
    );
  }
}