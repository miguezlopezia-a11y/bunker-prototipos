import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { handleCORS, handleOPTIONS } from '@/lib/cors'
import { writeAuditLog, getClientIP, AuditActions } from '@/lib/auditLog'
import { fromPath } from 'pdf2pic'
import sharp from 'sharp'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

export async function OPTIONS() {
  return handleOPTIONS()
}

const MAX_FILE_SIZE = 50 * 1024 * 1024 // 50 MB
const TEMP_DIR = '/tmp/pdf-imports'

export async function POST(request) {
  let tempFiles = []
  
  try {
    // Ensure temp directory exists
    await fs.mkdir(TEMP_DIR, { recursive: true })

    // Parse form data
    const formData = await request.formData()
    const pdfFile = formData.get('pdf')
    const wizardConfigStr = formData.get('wizardConfig')
    const pagesPerExam = parseInt(formData.get('pagesPerExam') || '1')
    const schoolId = formData.get('schoolId')
    const teacherId = formData.get('teacherId')

    // Validation
    if (!pdfFile) {
      return handleCORS(NextResponse.json(
        { success: false, error: 'No se proporcionó archivo PDF' },
        { status: 400 }
      ))
    }

    if (pdfFile.size > MAX_FILE_SIZE) {
      return handleCORS(NextResponse.json(
        { success: false, error: `Archivo demasiado grande. Máximo: 50 MB` },
        { status: 400 }
      ))
    }

    if (pdfFile.type !== 'application/pdf') {
      return handleCORS(NextResponse.json(
        { success: false, error: 'Solo se permiten archivos PDF' },
        { status: 400 }
      ))
    }

    const wizardConfig = wizardConfigStr ? JSON.parse(wizardConfigStr) : {}

    // Save PDF to temp file
    const pdfBuffer = Buffer.from(await pdfFile.arrayBuffer())
    const tempPdfPath = path.join(TEMP_DIR, `${uuidv4()}.pdf`)
    await fs.writeFile(tempPdfPath, pdfBuffer)
    tempFiles.push(tempPdfPath)

    // Convert PDF to images (300 DPI)
    const pdf2pic = fromPath(tempPdfPath, {
      density: 300,
      format: 'jpeg',
      quality: 85,
      width: 2480, // A4 at 300 DPI
      height: 3508
    })

    // Get total pages by trying to convert
    let pageImages = []
    let pageNumber = 1
    let hasMorePages = true

    while (hasMorePages) {
      try {
        const result = await pdf2pic(pageNumber, { responseType: 'buffer' })
        if (result && result.buffer) {
          pageImages.push({
            pageNumber,
            buffer: result.buffer
          })
          pageNumber++
        } else {
          hasMorePages = false
        }
      } catch (error) {
        // No more pages
        hasMorePages = false
      }
    }

    const totalPages = pageImages.length

    if (totalPages === 0) {
      return handleCORS(NextResponse.json(
        { success: false, error: 'No se pudieron extraer páginas del PDF' },
        { status: 400 }
      ))
    }

    // Create exam_documents record
    const { data: documentData, error: documentError } = await supabaseAdmin
      .from('exam_documents')
      .insert({
        school_id: schoolId || null,
        teacher_id: teacherId || null,
        original_filename: pdfFile.name,
        total_pages: totalPages,
        pages_per_exam: pagesPerExam,
        wizard_config: wizardConfig,
        status: 'processing'
      })
      .select()
      .single()

    if (documentError) {
      throw new Error(`Error al crear registro de documento: ${documentError.message}`)
    }

    // Process and upload each page
    const pageRecords = []

    for (const pageImage of pageImages) {
      // Optimize image with sharp
      const optimizedBuffer = await sharp(pageImage.buffer)
        .jpeg({ quality: 85 })
        .toBuffer()

      // Generate storage path
      const storagePath = `${documentData.id}/${pageImage.pageNumber}.jpg`

      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabaseAdmin
        .storage
        .from('exam-images')
        .upload(storagePath, optimizedBuffer, {
          contentType: 'image/jpeg',
          upsert: true
        })

      if (uploadError) {
        console.error(`Error uploading page ${pageImage.pageNumber}:`, uploadError)
        // Continue with other pages
        continue
      }

      // Get public URL
      const { data: { publicUrl } } = supabaseAdmin
        .storage
        .from('exam-images')
        .getPublicUrl(storagePath)

      // Create page record
      const { data: pageData, error: pageError } = await supabaseAdmin
        .from('exam_document_pages')
        .insert({
          document_id: documentData.id,
          page_number: pageImage.pageNumber,
          image_url: publicUrl,
          storage_path: storagePath,
          status: 'pending'
        })
        .select()
        .single()

      if (!pageError && pageData) {
        pageRecords.push(pageData)
      }
    }

    // Update document status
    await supabaseAdmin
      .from('exam_documents')
      .update({
        status: 'imported',
        processed_at: new Date().toISOString()
      })
      .eq('id', documentData.id)

    // Audit log
    await writeAuditLog({
      userId: teacherId || null,
      schoolId: schoolId || null,
      action: 'pdf_import',
      affectedTable: 'exam_documents',
      affectedRecordId: documentData.id,
      ipAddress: getClientIP(request),
      metadata: {
        filename: pdfFile.name,
        totalPages,
        pagesPerExam,
        pagesExtracted: pageRecords.length
      }
    })

    // Cleanup temp files
    await cleanupTempFiles(tempFiles)

    return handleCORS(NextResponse.json({
      success: true,
      documentId: documentData.id,
      totalPages,
      pagesExtracted: pageRecords.length,
      pages: pageRecords.map(p => ({
        id: p.id,
        pageNumber: p.page_number,
        imageUrl: p.image_url
      }))
    }))

  } catch (error) {
    console.error('POST /api/import-pdf error:', error)
    
    // Cleanup temp files on error
    await cleanupTempFiles(tempFiles)

    return handleCORS(NextResponse.json(
      { success: false, error: error.message || 'Error al procesar PDF' },
      { status: 500 }
    ))
  }
}

async function cleanupTempFiles(files) {
  for (const file of files) {
    try {
      await fs.unlink(file)
    } catch (error) {
      // Ignore cleanup errors
    }
  }
}
