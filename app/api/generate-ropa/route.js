import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { handleOPTIONS } from '@/lib/cors'
import { jsPDF } from 'jspdf'
import 'jspdf-autotable'

export async function OPTIONS() {
  return handleOPTIONS()
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const schoolId = searchParams.get('schoolId')

    // Fetch school data
    let school
    if (schoolId) {
      const { data, error } = await supabaseAdmin
        .from('schools')
        .select('*')
        .eq('id', schoolId)
        .single()
      
      if (error || !data) {
        // Use sample data if school not found
        school = getSampleSchoolData()
      } else {
        school = data
      }
    } else {
      // Use sample data
      school = getSampleSchoolData()
    }

    // Generate PDF
    const pdfBuffer = await generateRoPAPDF(school)

    // Return PDF
    const filename = `RoPA_${sanitizeFilename(school.name)}_${new Date().toISOString().split('T')[0]}.pdf`

    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Access-Control-Allow-Origin': process.env.CORS_ORIGINS || '*'
      }
    })

  } catch (error) {
    console.error('GET /api/generate-ropa error:', error)
    return new NextResponse(
      JSON.stringify({ error: 'Error al generar RoPA' }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

function getSampleSchoolData() {
  return {
    id: 'sample-school-001',
    name: 'IES Miguel de Cervantes',
    cif_nif: 'Q2876543B',
    address: 'Calle de Alcalá, 123\n28009 Madrid, España',
    dpo_email: 'dpo@iesmiguelcervantes.es',
    created_at: new Date().toISOString()
  }
}

function sanitizeFilename(name) {
  return name
    .replace(/[^a-zA-Z0-9áéíóúñÁÉÍÓÚÑ\s]/g, '')
    .replace(/\s+/g, '_')
    .substring(0, 50)
}

async function generateRoPAPDF(school) {
  const doc = new jsPDF()
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  let yPos = 20

  // Helper function for page breaks
  const checkPageBreak = (height = 10) => {
    if (yPos + height > pageHeight - 20) {
      doc.addPage()
      yPos = 20
      return true
    }
    return false
  }

  // Header
  doc.setFillColor(30, 64, 175) // Blue
  doc.rect(0, 0, pageWidth, 30, 'F')
  doc.setTextColor(255, 255, 255)
  doc.setFontSize(20)
  doc.setFont(undefined, 'bold')
  doc.text('REGISTRO DE ACTIVIDADES DE TRATAMIENTO', pageWidth / 2, 15, { align: 'center' })
  doc.setFontSize(10)
  doc.text('(RoPA - Art. 30 RGPD)', pageWidth / 2, 22, { align: 'center' })

  yPos = 40

  // Section 1: Responsible Entity
  doc.setTextColor(0, 0, 0)
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('1. RESPONSABLE DEL TRATAMIENTO', 14, yPos)
  yPos += 10

  doc.setFontSize(10)
  doc.setFont(undefined, 'normal')
  
  const responsibleData = [
    ['Denominación:', school.name],
    ['CIF/NIF:', school.cif_nif],
    ['Dirección:', school.address],
    ['Delegado de Protección de Datos (DPO):', school.dpo_email],
    ['Fecha de elaboración:', new Date().toLocaleDateString('es-ES', { day: '2-digit', month: 'long', year: 'numeric' })]
  ]

  doc.autoTable({
    startY: yPos,
    body: responsibleData,
    theme: 'plain',
    styles: { fontSize: 9, cellPadding: 2 },
    columnStyles: {
      0: { fontStyle: 'bold', cellWidth: 70 },
      1: { cellWidth: 110 }
    }
  })

  yPos = doc.lastAutoTable.finalY + 15
  checkPageBreak(20)

  // Section 2: Processing Activities
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('2. ACTIVIDADES DE TRATAMIENTO', 14, yPos)
  yPos += 10

  const activities = [
    {
      name: 'Corrección Automatizada de Exámenes',
      purpose: 'Evaluación del rendimiento académico de estudiantes mediante inteligencia artificial',
      legalBasis: 'Art. 6.1.f RGPD - Interés legítimo (evaluación educativa)',
      dataCategories: 'Nombre del estudiante, clase/grupo, imágenes de exámenes (contenido académico), calificaciones',
      recipients: 'OpenAI (GPT-4o) - Procesamiento IA en EEUU con cláusulas contractuales tipo',
      retention: 'Configurable por centro (por defecto: 24 meses desde corrección)',
      security: 'Cifrado SSL/TLS, autenticación Supabase, rate limiting, validación de archivos'
    },
    {
      name: 'Gestión de Profesorado',
      purpose: 'Administración de cuentas de profesores del centro educativo',
      legalBasis: 'Art. 6.1.b RGPD - Ejecución de contrato (relación laboral)',
      dataCategories: 'Nombre, email, rol (profesor/admin), centro educativo',
      recipients: 'Supabase (Alemania) - Almacenamiento base de datos',
      retention: 'Mientras dure la relación laboral + 5 años (obligaciones fiscales)',
      security: 'Autenticación multifactor, roles y permisos (RBAC), sesiones con timeout'
    },
    {
      name: 'Consentimiento Parental (Menores < 14 años)',
      purpose: 'Gestión de consentimientos para tratamiento de datos de menores según LOPDGDD Art. 92',
      legalBasis: 'Art. 6.1.a RGPD - Consentimiento del titular (padre/madre/tutor)',
      dataCategories: 'Nombre del estudiante, email del padre/madre, fecha de consentimiento, IP',
      recipients: 'No se comunican a terceros',
      retention: 'Hasta que el estudiante cumpla 18 años o se retire el consentimiento',
      security: 'Registro inmutable de consentimientos, verificación de email'
    },
    {
      name: 'Registro de Auditoría',
      purpose: 'Cumplimiento de obligaciones de trazabilidad y seguridad (Art. 32 RGPD)',
      legalBasis: 'Art. 6.1.c RGPD - Obligación legal',
      dataCategories: 'Usuario, acción realizada, fecha/hora, IP, tabla/registro afectado',
      recipients: 'No se comunican a terceros',
      retention: '5 años (obligaciones legales de conservación)',
      security: 'Tabla inmutable, sin posibilidad de modificación o eliminación'
    }
  ]

  activities.forEach((activity, index) => {
    checkPageBreak(80)

    doc.setFontSize(11)
    doc.setFont(undefined, 'bold')
    doc.setFillColor(240, 245, 250)
    doc.rect(14, yPos - 3, pageWidth - 28, 8, 'F')
    doc.text(`2.${index + 1}. ${activity.name}`, 16, yPos + 2)
    yPos += 12

    doc.setFontSize(9)
    doc.setFont(undefined, 'normal')

    const activityDetails = [
      ['Finalidad:', activity.purpose],
      ['Base legal:', activity.legalBasis],
      ['Categorías de datos:', activity.dataCategories],
      ['Destinatarios:', activity.recipients],
      ['Plazo de conservación:', activity.retention],
      ['Medidas de seguridad:', activity.security]
    ]

    doc.autoTable({
      startY: yPos,
      body: activityDetails,
      theme: 'plain',
      styles: { fontSize: 8, cellPadding: 2, lineColor: [220, 220, 220], lineWidth: 0.1 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 45, fillColor: [250, 250, 250] },
        1: { cellWidth: 135 }
      }
    })

    yPos = doc.lastAutoTable.finalY + 8
  })

  checkPageBreak(20)

  // Section 3: Data Subject Rights
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('3. DERECHOS DE LOS INTERESADOS', 14, yPos)
  yPos += 10

  doc.setFontSize(9)
  doc.setFont(undefined, 'normal')
  const rightsText = `Los titulares de los datos pueden ejercer los siguientes derechos ante el Responsable del Tratamiento:

• Derecho de acceso (Art. 15 RGPD): Obtener confirmación sobre si se están tratando sus datos
• Derecho de rectificación (Art. 16 RGPD): Solicitar la corrección de datos inexactos
• Derecho de supresión / "Derecho al olvido" (Art. 17 RGPD): Solicitar la eliminación de datos
• Derecho de limitación (Art. 18 RGPD): Solicitar la limitación del tratamiento
• Derecho de portabilidad (Art. 20 RGPD): Recibir datos en formato estructurado (JSON/CSV)
• Derecho de oposición (Art. 21 RGPD): Oponerse al tratamiento en circunstancias particulares

Para ejercer estos derechos, contactar con el DPO: ${school.dpo_email}

Los interesados también tienen derecho a presentar una reclamación ante la Agencia Española de Protección de Datos (AEPD): www.aepd.es`

  const splitRights = doc.splitTextToSize(rightsText, pageWidth - 28)
  doc.text(splitRights, 14, yPos)
  yPos += splitRights.length * 5

  // Section 4: International Transfers
  checkPageBreak(30)
  doc.setFontSize(14)
  doc.setFont(undefined, 'bold')
  doc.text('4. TRANSFERENCIAS INTERNACIONALES', 14, yPos)
  yPos += 10

  doc.setFontSize(9)
  doc.setFont(undefined, 'normal')
  const transferText = `Los datos pueden ser transferidos fuera del Espacio Económico Europeo (EEE) a:

• OpenAI (Estados Unidos) - Para procesamiento de inteligencia artificial (GPT-4o)
  Garantías: Cláusulas contractuales tipo aprobadas por la Comisión Europea (Art. 46.2.c RGPD)
  
Todas las transferencias cumplen con las garantías adecuadas establecidas en el Capítulo V del RGPD.`

  const splitTransfer = doc.splitTextToSize(transferText, pageWidth - 28)
  doc.text(splitTransfer, 14, yPos)
  yPos += splitTransfer.length * 5

  // Footer
  checkPageBreak(20)
  doc.setFontSize(7)
  doc.setTextColor(100, 100, 100)
  doc.text(
    `Documento generado automáticamente el ${new Date().toLocaleString('es-ES')} | Cumple con RGPD (UE) 2016/679 y LOPDGDD 3/2018`,
    pageWidth / 2,
    pageHeight - 10,
    { align: 'center' }
  )

  return doc.output('arraybuffer')
}
