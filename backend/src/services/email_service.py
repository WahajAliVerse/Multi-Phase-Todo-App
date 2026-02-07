import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from typing import Dict, Any
import asyncio
import aiosmtplib
from backend.src.core.config import settings


class EmailService:
    def __init__(self):
        self.smtp_host = settings.EMAIL_HOST
        self.smtp_port = settings.EMAIL_PORT
        self.smtp_username = settings.EMAIL_USERNAME
        self.smtp_password = settings.EMAIL_PASSWORD
        self.sender_email = settings.EMAIL_SENDER

    async def send_email(
        self,
        recipient_email: str,
        subject: str,
        body: str,
        html_body: str = None,
        attachments: list = None
    ) -> bool:
        """
        Send an email to the specified recipient
        """
        try:
            # Create message
            msg = MIMEMultipart()
            msg['From'] = self.sender_email
            msg['To'] = recipient_email
            msg['Subject'] = subject

            # Add body to email
            msg.attach(MIMEText(body, 'plain'))
            
            if html_body:
                msg.attach(MIMEText(html_body, 'html'))

            # Add attachments if any
            if attachments:
                for file_path in attachments:
                    with open(file_path, "rb") as attachment:
                        part = MIMEBase('application', 'octet-stream')
                        part.set_payload(attachment.read())

                    encoders.encode_base64(part)
                    part.add_header(
                        'Content-Disposition',
                        f'attachment; filename= {os.path.basename(file_path)}'
                    )
                    msg.attach(part)

            # Send email using aiosmtplib for async operation
            await aiosmtplib.send(
                msg,
                hostname=self.smtp_host,
                port=self.smtp_port,
                start_tls=True,
                username=self.smtp_username,
                password=self.smtp_password
            )
            
            return True
        except Exception as e:
            print(f"Error sending email: {str(e)}")
            return False

    async def send_task_reminder_email(
        self,
        recipient_email: str,
        task_title: str,
        task_description: str = None,
        due_date: str = None
    ) -> bool:
        """
        Send a task reminder email to the specified recipient
        """
        subject = f"Task Reminder: {task_title}"
        
        body = f"""
        Hi there,

        This is a reminder about your task: {task_title}

        {f"Description: {task_description}" if task_description else ""}
        {f"Due Date: {due_date}" if due_date else ""}

        Please complete this task as soon as possible.

        Best regards,
        Todo App Team
        """

        html_body = f"""
        <html>
          <body>
            <p>Hi there,</p>
            
            <p>This is a reminder about your task: <strong>{task_title}</strong></p>
            
            {f"<p><strong>Description:</strong> {task_description}</p>" if task_description else ""}
            {f"<p><strong>Due Date:</strong> {due_date}</p>" if due_date else ""}
            
            <p>Please complete this task as soon as possible.</p>
            
            <p>Best regards,<br>
            Todo App Team</p>
          </body>
        </html>
        """

        return await self.send_email(
            recipient_email=recipient_email,
            subject=subject,
            body=body,
            html_body=html_body
        )

    async def send_welcome_email(self, recipient_email: str, user_name: str = None) -> bool:
        """
        Send a welcome email to a new user
        """
        subject = "Welcome to Todo App!"
        
        name = user_name or "there"
        body = f"""
        Hi {name},

        Welcome to Todo App! We're excited to have you on board.

        You can now start managing your tasks more efficiently.

        If you have any questions, feel free to reach out to our support team.

        Best regards,
        Todo App Team
        """

        html_body = f"""
        <html>
          <body>
            <p>Hi {name},</p>
            
            <p>Welcome to <strong>Todo App</strong>! We're excited to have you on board.</p>

            <p>You can now start <a href="{settings.FRONTEND_BASE_URL}">managing your tasks</a> more efficiently.</p>
            
            <p>If you have any questions, feel free to reach out to our <a href="mailto:{settings.SUPPORT_EMAIL}">support team</a>.</p>

            <p>Best regards,<br>
            Todo App Team</p>
          </body>
        </html>
        """

        return await self.send_email(
            recipient_email=recipient_email,
            subject=subject,
            body=body,
            html_body=html_body
        )

    async def send_password_reset_email(self, recipient_email: str, reset_token: str) -> bool:
        """
        Send a password reset email to the specified recipient
        """
        subject = "Password Reset Request"
        
        reset_url = f"{settings.FRONTEND_BASE_URL}/reset-password?token={reset_token}"
        
        body = f"""
        Hi there,

        You have requested to reset your password. Click the link below to reset it:

        {reset_url}

        If you didn't request this, please ignore this email.

        Best regards,
        Todo App Team
        """

        html_body = f"""
        <html>
          <body>
            <p>Hi there,</p>
            
            <p>You have requested to reset your password. Click the link below to reset it:</p>
            
            <p><a href="{reset_url}">Reset Password</a></p>
            
            <p>If you didn't request this, please ignore this email.</p>

            <p>Best regards,<br>
            Todo App Team</p>
          </body>
        </html>
        """

        return await self.send_email(
            recipient_email=recipient_email,
            subject=subject,
            body=body,
            html_body=html_body
        )

    async def send_account_updated_email(self, recipient_email: str, update_details: str) -> bool:
        """
        Send an email notification when user account is updated
        """
        subject = "Account Updated"
        
        body = f"""
        Hi there,

        Your account has been updated with the following changes:
        {update_details}

        If you didn't make these changes, please contact our support team immediately.

        Best regards,
        Todo App Team
        """

        html_body = f"""
        <html>
          <body>
            <p>Hi there,</p>
            
            <p>Your account has been updated with the following changes:</p>
            <p>{update_details}</p>
            
            <p>If you didn't make these changes, please contact our <a href="mailto:{settings.SUPPORT_EMAIL}">support team</a> immediately.</p>

            <p>Best regards,<br>
            Todo App Team</p>
          </body>
        </html>
        """

        return await self.send_email(
            recipient_email=recipient_email,
            subject=subject,
            body=body,
            html_body=html_body
        )