<?php
/**
 * MikSoftware - Contact Form Handler
 * Procesa el formulario de contacto y envía el correo
 */

// Habilitar errores para debug (quitar en producción)
// error_reporting(E_ALL);
// ini_set('display_errors', 1);

// Configuración
$to_email = 'info@miksoftwarecol.com';
$site_name = 'MikSoftware';
$site_domain = 'miksoftwarecol.com';

// Headers CORS
header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Manejar preflight OPTIONS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// Anti-bot: Verificar honeypot
if (!empty($_POST['website'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Solicitud inválida']);
    exit;
}

// Obtener y sanitizar datos
$nombre = isset($_POST['nombre']) ? trim(strip_tags($_POST['nombre'])) : '';
$email = isset($_POST['email']) ? trim(filter_var($_POST['email'], FILTER_SANITIZE_EMAIL)) : '';
$telefono = isset($_POST['telefono']) ? trim(preg_replace('/[^0-9+\s\-\(\)]/', '', $_POST['telefono'])) : '';
$servicio = isset($_POST['servicio']) ? trim(strip_tags($_POST['servicio'])) : '';
$mensaje = isset($_POST['mensaje']) ? trim(strip_tags($_POST['mensaje'])) : '';
$whatsappConsent = isset($_POST['whatsappConsent']) && $_POST['whatsappConsent'] === 'si' ? 'Sí' : 'No';

// Validaciones
$errors = [];

if (empty($nombre) || strlen($nombre) < 2) {
    $errors[] = 'El nombre es requerido';
}

if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
    $errors[] = 'El correo electrónico no es válido';
}

if (empty($servicio)) {
    $errors[] = 'Debes seleccionar un servicio';
}

if (empty($mensaje) || strlen($mensaje) < 10) {
    $errors[] = 'El mensaje debe tener al menos 10 caracteres';
}

// Si hay errores, retornar
if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => implode(', ', $errors)]);
    exit;
}

// Mapeo de servicios
$servicios_map = [
    'desarrollo-web' => 'Desarrollo Web',
    'landing-page' => 'Landing Page',
    'sistema-medida' => 'Sistema a Medida',
    'dashboard' => 'Dashboard Analytics',
    'cloud' => 'Cloud Solutions',
    'api' => 'API Development',
    'otro' => 'Otro'
];

$servicio_nombre = isset($servicios_map[$servicio]) ? $servicios_map[$servicio] : $servicio;
$fecha = date('d/m/Y H:i:s');

// Construir el correo HTML
$body = '<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; background-color: #f4f4f4;">
    <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
        <div style="background: linear-gradient(135deg, #8B5CF6, #FA8072); padding: 30px; text-align: center;">
            <h1 style="color: white; margin: 0; font-size: 24px;">Nuevo Mensaje de Contacto</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 14px;">' . $fecha . '</p>
        </div>
        <div style="padding: 30px;">
            <div style="margin-bottom: 20px;">
                <div style="font-weight: bold; color: #8B5CF6; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Nombre</div>
                <div style="background: #f9f9f9; padding: 12px; border-radius: 5px; border-left: 3px solid #8B5CF6;">' . htmlspecialchars($nombre) . '</div>
            </div>
            <div style="margin-bottom: 20px;">
                <div style="font-weight: bold; color: #8B5CF6; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Correo electrónico</div>
                <div style="background: #f9f9f9; padding: 12px; border-radius: 5px; border-left: 3px solid #8B5CF6;"><a href="mailto:' . htmlspecialchars($email) . '" style="color: #333;">' . htmlspecialchars($email) . '</a></div>
            </div>
            <div style="margin-bottom: 20px;">
                <div style="font-weight: bold; color: #8B5CF6; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">WhatsApp / Teléfono</div>
                <div style="background: #f9f9f9; padding: 12px; border-radius: 5px; border-left: 3px solid #25D366;">' . (empty($telefono) ? '<span style="color: #999;">No proporcionado</span>' : htmlspecialchars($telefono)) . '</div>
            </div>
            <div style="margin-bottom: 20px;">
                <div style="font-weight: bold; color: #8B5CF6; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Autoriza contacto por WhatsApp</div>
                <div style="background: #f9f9f9; padding: 12px; border-radius: 5px; border-left: 3px solid ' . ($whatsappConsent === 'Sí' ? '#25D366' : '#ccc') . '; ' . ($whatsappConsent === 'Sí' ? 'color: #25D366; font-weight: bold;' : 'color: #999;') . '">' . $whatsappConsent . '</div>
            </div>
            <div style="margin-bottom: 20px;">
                <div style="font-weight: bold; color: #8B5CF6; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Servicio de interés</div>
                <div style="background: #f9f9f9; padding: 12px; border-radius: 5px; border-left: 3px solid #FA8072;">' . htmlspecialchars($servicio_nombre) . '</div>
            </div>
            <div style="margin-bottom: 20px;">
                <div style="font-weight: bold; color: #8B5CF6; margin-bottom: 5px; font-size: 12px; text-transform: uppercase;">Mensaje</div>
                <div style="background: #f9f9f9; padding: 12px; border-radius: 5px; border-left: 3px solid #8B5CF6; white-space: pre-wrap;">' . htmlspecialchars($mensaje) . '</div>
            </div>
        </div>
        <div style="background: #f9f9f9; padding: 20px; text-align: center; border-top: 1px solid #eee;">
            <p style="margin: 0; color: #666; font-size: 12px;">Este mensaje fue enviado desde el formulario de contacto de ' . $site_domain . '</p>
        </div>
    </div>
</body>
</html>';

// Versión texto plano
$body_text = "NUEVO MENSAJE DE CONTACTO - $fecha\n\n";
$body_text .= "Nombre: $nombre\n";
$body_text .= "Email: $email\n";
$body_text .= "Teléfono: " . (empty($telefono) ? 'No proporcionado' : $telefono) . "\n";
$body_text .= "Autoriza WhatsApp: $whatsappConsent\n";
$body_text .= "Servicio: $servicio_nombre\n\n";
$body_text .= "Mensaje:\n$mensaje\n\n";
$body_text .= "---\nEnviado desde $site_domain";

// Subject
$subject = "=?UTF-8?B?" . base64_encode("Nuevo contacto web - $servicio_nombre") . "?=";

// Boundary para multipart
$boundary = md5(time());

// Headers del correo - Formato compatible con Hostinger
$headers = "From: $site_name <noreply@$site_domain>\r\n";
$headers .= "Reply-To: $nombre <$email>\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "X-Priority: 1\r\n";

// Cuerpo multipart
$message = "--$boundary\r\n";
$message .= "Content-Type: text/plain; charset=UTF-8\r\n";
$message .= "Content-Transfer-Encoding: base64\r\n\r\n";
$message .= chunk_split(base64_encode($body_text)) . "\r\n";
$message .= "--$boundary\r\n";
$message .= "Content-Type: text/html; charset=UTF-8\r\n";
$message .= "Content-Transfer-Encoding: base64\r\n\r\n";
$message .= chunk_split(base64_encode($body)) . "\r\n";
$message .= "--$boundary--";

// Intentar enviar correo
$mail_sent = @mail($to_email, $subject, $message, $headers);

// Log para debug (crear archivo de log)
$log_file = __DIR__ . '/contact_log.txt';
$log_entry = date('Y-m-d H:i:s') . " | ";
$log_entry .= "Nombre: $nombre | Email: $email | Servicio: $servicio | ";
$log_entry .= "Enviado: " . ($mail_sent ? 'SI' : 'NO') . "\n";
@file_put_contents($log_file, $log_entry, FILE_APPEND | LOCK_EX);

if ($mail_sent) {
    echo json_encode([
        'success' => true, 
        'message' => 'Mensaje enviado correctamente'
    ]);
} else {
    // Guardar en archivo como backup si falla el correo
    $backup_file = __DIR__ . '/mensajes_backup.txt';
    $backup_entry = "\n========== " . date('Y-m-d H:i:s') . " ==========\n";
    $backup_entry .= "Nombre: $nombre\n";
    $backup_entry .= "Email: $email\n";
    $backup_entry .= "Teléfono: $telefono\n";
    $backup_entry .= "WhatsApp: $whatsappConsent\n";
    $backup_entry .= "Servicio: $servicio_nombre\n";
    $backup_entry .= "Mensaje: $mensaje\n";
    @file_put_contents($backup_file, $backup_entry, FILE_APPEND | LOCK_EX);
    
    http_response_code(500);
    echo json_encode([
        'success' => false, 
        'message' => 'Error al enviar. Por favor contacta por WhatsApp.'
    ]);
}
