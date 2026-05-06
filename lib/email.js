// Email helper using Resend for sending notifications in Spanish
// Templates: Teacher invitations, Parental consent, Retention alerts

import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

const FROM_EMAIL = 'Corrector de Exámenes <noreply@corrector-examenes.es>'
const FROM_NAME = 'Corrector de Exámenes IA'

/**
 * Send an email using Resend
 * @param {Object} options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.text - Plain text content (fallback)
 */
export async function sendEmail({ to, subject, html, text }) {
  try {
    // Check if Resend is configured
    if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.includes('placeholder')) {
      console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📧 EMAIL (Resend not configured - would send)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
To: ${to}
Subject: ${subject}

${text || 'See HTML version'}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
      `)
      return { success: true, messageId: 'mock-' + Date.now() }
    }

    const { data, error } = await resend.emails.send({
      from: FROM_EMAIL,
      to: [to],
      subject,
      html,
      text
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error: error.message }
    }

    console.log(`✅ Email sent to ${to}:`, data.id)
    return { success: true, messageId: data.id }

  } catch (error) {
    console.error('Send email exception:', error)
    return { success: false, error: error.message }
  }
}

/**
 * Send teacher invitation email
 */
export async function sendTeacherInvitation({ email, name, inviteLink, schoolName }) {
  const subject = `Invitación: ${schoolName} - Corrector de Exámenes IA`

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Invitación de Profesor</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🎓 Corrector de Exámenes IA</h1>
    <p style="color: #e0e7ff; margin: 10px 0 0 0;">Corrección automatizada con inteligencia artificial</p>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #1e40af; margin-top: 0;">Hola ${name},</h2>
    
    <p>Has sido invitado/a a unirte a <strong>${schoolName}</strong> en la plataforma <strong>Corrector de Exámenes IA</strong>.</p>
    
    <p>Esta herramienta te permitirá:</p>
    <ul style="color: #475569;">
      <li>✅ Corregir exámenes automáticamente con GPT-4o</li>
      <li>📊 Hacer seguimiento del rendimiento estudiantil</li>
      <li>📚 Crear y compartir rúbricas de evaluación</li>
      <li>📈 Visualizar estadísticas y tendencias</li>
      <li>🔒 Cumplir con RGPD y LOPDGDD</li>
    </ul>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${inviteLink}" style="display: inline-block; background: #1e40af; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Aceptar Invitación y Crear Contraseña
      </a>
    </div>
    
    <p style="font-size: 14px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 20px; margin-top: 30px;">
      <strong>Nota:</strong> Este enlace es personal e intransferible. Si no has solicitado esta invitación, puedes ignorar este mensaje.
    </p>
    
    <p style="font-size: 14px; color: #64748b;">
      Si tienes problemas con el enlace, copia y pega la siguiente URL en tu navegador:<br>
      <span style="color: #1e40af; word-break: break-all;">${inviteLink}</span>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; font-size: 12px; color: #94a3b8;">
    <p>Corrector de Exámenes IA - Sistema de corrección inteligente<br>
    Cumple con RGPD (UE) 2016/679 y LOPDGDD 3/2018</p>
    <p>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/legal/privacy" style="color: #3b82f6; text-decoration: none;">Política de Privacidad</a> | 
      <a href="${process.env.NEXT_PUBLIC_BASE_URL}/legal/terms" style="color: #3b82f6; text-decoration: none;">Términos de Servicio</a>
    </p>
  </div>
</body>
</html>
  `

  const text = `
Hola ${name},

Has sido invitado/a a unirte a ${schoolName} en la plataforma Corrector de Exámenes IA.

Para aceptar la invitación y crear tu contraseña, visita:
${inviteLink}

Si tienes alguna pregunta, contacta con el administrador de tu centro.

Atentamente,
Equipo de Corrector de Exámenes IA
  `

  return sendEmail({ to: email, subject, html, text })
}

/**
 * Send parental consent request email
 */
export async function sendParentalConsentRequest({ parentEmail, studentName, schoolName, consentLink }) {
  const subject = `Consentimiento Parental Requerido - ${studentName}`

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Consentimiento Parental</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #7c3aed 0%, #a78bfa 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🛡️ Consentimiento Parental</h1>
    <p style="color: #ede9fe; margin: 10px 0 0 0;">LOPDGDD Art. 92 - Menores de 14 años</p>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #7c3aed; margin-top: 0;">Estimado padre/madre/tutor:</h2>
    
    <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #92400e;"><strong>⚠️ Acción requerida:</strong> Consentimiento obligatorio para tratamiento de datos personales</p>
    </div>
    
    <p>Según el <strong>artículo 92 de la Ley Orgánica 3/2018 de Protección de Datos (LOPDGDD)</strong>, necesitamos su consentimiento para el tratamiento de datos personales de su hijo/a:</p>
    
    <div style="background: white; border: 2px solid #cbd5e1; padding: 20px; margin: 20px 0; border-radius: 8px;">
      <p style="margin: 5px 0;"><strong>Estudiante:</strong> ${studentName}</p>
      <p style="margin: 5px 0;"><strong>Centro educativo:</strong> ${schoolName}</p>
    </div>
    
    <h3 style="color: #7c3aed;">¿Qué datos se tratarán?</h3>
    <ul style="color: #475569;">
      <li>Nombre del estudiante</li>
      <li>Clase/grupo</li>
      <li>Imágenes de exámenes (contenido académico, NO fotografías personales)</li>
      <li>Calificaciones y feedback educativo</li>
    </ul>
    
    <h3 style="color: #7c3aed;">Finalidad del tratamiento:</h3>
    <p>Corrección automatizada de exámenes mediante inteligencia artificial (GPT-4o) para fines exclusivamente educativos.</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <a href="${consentLink}" style="display: inline-block; background: #7c3aed; color: white; padding: 15px 40px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
        Otorgar Consentimiento
      </a>
    </div>
    
    <div style="background: #f1f5f9; padding: 15px; border-radius: 8px; margin-top: 20px;">
      <h4 style="margin-top: 0; color: #334155;">Sus derechos (Art. 12-23 RGPD):</h4>
      <ul style="color: #64748b; font-size: 14px; margin: 0;">
        <li>Acceso a los datos de su hijo/a</li>
        <li>Rectificación de datos inexactos</li>
        <li>Supresión de datos (derecho al olvido)</li>
        <li>Portabilidad de datos</li>
      </ul>
    </div>
    
    <p style="font-size: 14px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 20px; margin-top: 30px;">
      <strong>Delegado de Protección de Datos (DPO):</strong><br>
      Para ejercer sus derechos o resolver dudas, contacte con:<br>
      📧 dpo@colegio.es
    </p>
    
    <p style="font-size: 14px; color: #64748b;">
      Si el enlace no funciona, cópielo y péguelo en su navegador:<br>
      <span style="color: #7c3aed; word-break: break-all;">${consentLink}</span>
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; font-size: 12px; color: #94a3b8;">
    <p>Este tratamiento cumple con RGPD (UE) 2016/679 y LOPDGDD 3/2018<br>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/legal/privacy" style="color: #7c3aed; text-decoration: none;">Ver Política de Privacidad completa</a></p>
  </div>
</body>
</html>
  `

  const text = `
Estimado padre/madre/tutor:

Según el artículo 92 de la LOPDGDD, necesitamos su consentimiento para el tratamiento de datos personales de su hijo/a:

Estudiante: ${studentName}
Centro: ${schoolName}

Para otorgar su consentimiento, visite:
${consentLink}

Datos a tratar: Nombre, clase/grupo, imágenes de exámenes, calificaciones.
Finalidad: Corrección automatizada mediante IA para fines educativos.

Para dudas, contacte con el DPO: dpo@colegio.es

Atentamente,
${schoolName}
  `

  return sendEmail({ to: parentEmail, subject, html, text })
}

/**
 * Send data retention policy alert to teachers
 */
export async function sendRetentionPolicyAlert({ teacherEmail, teacherName, deletedCount, schoolName }) {
  const subject = `Aviso: Política de Retención de Datos - ${deletedCount} exámenes archivados`

  const html = `
<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Política de Retención de Datos</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
  <div style="background: linear-gradient(135deg, #0891b2 0%, #06b6d4 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="color: white; margin: 0; font-size: 24px;">🔒 Política de Retención de Datos</h1>
    <p style="color: #cffafe; margin: 10px 0 0 0;">Cumplimiento RGPD - Archivado Automático</p>
  </div>
  
  <div style="background: #f8fafc; padding: 30px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #0891b2; margin-top: 0;">Hola ${teacherName},</h2>
    
    <div style="background: #e0f2fe; border-left: 4px solid #0891b2; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p style="margin: 0; color: #075985;">
        <strong>ℹ️ Notificación automática:</strong> Se ha aplicado la política de retención de datos en ${schoolName}
      </p>
    </div>
    
    <p>Como parte del cumplimiento del <strong>RGPD (Reglamento General de Protección de Datos)</strong>, se han archivado automáticamente:</p>
    
    <div style="text-align: center; margin: 30px 0;">
      <div style="background: white; border: 3px solid #0891b2; padding: 20px; border-radius: 12px; display: inline-block;">
        <p style="font-size: 48px; font-weight: bold; color: #0891b2; margin: 0;">${deletedCount}</p>
        <p style="color: #64748b; margin: 5px 0 0 0;">exámenes archivados</p>
      </div>
    </div>
    
    <h3 style="color: #0891b2;">¿Qué significa esto?</h3>
    <ul style="color: #475569;">
      <li>Los exámenes que superan el periodo de retención (24 meses) han sido <strong>archivados automáticamente</strong></li>
      <li>Los datos siguen existiendo pero están marcados como eliminados (<em>soft delete</em>)</li>
      <li>Pueden recuperarse dentro de los próximos <strong>30 días</strong> si es necesario</li>
      <li>Después de 30 días, se eliminarán permanentemente</li>
    </ul>
    
    <div style="background: #fef3c7; border: 1px solid #fbbf24; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4 style="margin-top: 0; color: #78350f;">⚠️ ¿Necesitas recuperar algún dato?</h4>
      <p style="color: #92400e; margin: 0;">Si necesitas restaurar algún examen archivado, contacta con el administrador del sistema antes de que pasen 30 días.</p>
    </div>
    
    <h3 style="color: #0891b2;">¿Por qué hacemos esto?</h3>
    <p>La política de retención de datos es <strong>obligatoria</strong> según:</p>
    <ul style="color: #475569; font-size: 14px;">
      <li><strong>Art. 5.1.e RGPD:</strong> Los datos no deben conservarse más tiempo del necesario</li>
      <li><strong>Principio de minimización:</strong> Solo conservar datos mientras sean relevantes</li>
      <li><strong>Seguridad y privacidad:</strong> Reducir el riesgo de brechas de datos</li>
    </ul>
    
    <p style="font-size: 14px; color: #64748b; border-top: 1px solid #cbd5e1; padding-top: 20px; margin-top: 30px;">
      Este proceso se ejecuta automáticamente cada noche a las 02:00 UTC. Todas las operaciones quedan registradas en el log de auditoría para cumplimiento normativo.
    </p>
  </div>
  
  <div style="text-align: center; padding: 20px; font-size: 12px; color: #94a3b8;">
    <p>Corrector de Exámenes IA - Cumplimiento RGPD y LOPDGDD<br>
    <a href="${process.env.NEXT_PUBLIC_BASE_URL}/legal/privacy" style="color: #0891b2; text-decoration: none;">Política de Privacidad</a></p>
  </div>
</body>
</html>
  `

  const text = `
Hola ${teacherName},

Se ha aplicado la política de retención de datos en ${schoolName}.

Exámenes archivados: ${deletedCount}

Los exámenes que superan 24 meses han sido archivados automáticamente (soft delete).
Pueden recuperarse dentro de 30 días si es necesario.

Esto es obligatorio según el RGPD (Art. 5.1.e) para cumplir con el principio de minimización de datos.

Atentamente,
Sistema Corrector de Exámenes IA
  `

  return sendEmail({ to: teacherEmail, subject, html, text })
}
