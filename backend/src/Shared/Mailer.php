<?php
declare(strict_types=1);

namespace App\Shared;

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

class Mailer
{
    public function send(string $to, string $toName, string $subject, string $htmlBody): bool
    {
        $driver = $_ENV['MAIL_DRIVER'] ?? 'log';

        if ($driver === 'log') {
            $logFile = BASE_PATH . '/storage/logs/app.log';
            $log = sprintf("[%s] MAIL to=%s subject=%s\n", date('Y-m-d H:i:s'), $to, $subject);
            file_put_contents($logFile, $log, FILE_APPEND);
            return true;
        }

        $mail = new PHPMailer(true);

        try {
            $mail->isSMTP();
            $mail->Host       = $_ENV['MAIL_HOST'] ?? 'localhost';
            $mail->Port       = (int)($_ENV['MAIL_PORT'] ?? 1025);
            $mail->SMTPAuth   = false;
            $mail->CharSet    = 'UTF-8';
            $mail->setFrom($_ENV['MAIL_FROM'] ?? 'noreply@localhost', 'Incident Reporter');
            $mail->addAddress($to, $toName);
            $mail->isHTML(true);
            $mail->Subject = $subject;
            $mail->Body    = $htmlBody;
            $mail->send();
            return true;
        } catch (Exception $e) {
            error_log('Mailer error: ' . $e->getMessage());
            return false;
        }
    }
}
