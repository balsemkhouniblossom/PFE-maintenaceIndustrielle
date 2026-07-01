import { Controller, Get } from '@nestjs/common';
import { EmailService } from './email.service';

@Controller('email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Get('test')
  async test() {
    return this.emailService.sendMail({
      to: 'test@gmail.com',
      subject: 'SMTP Test ✔',
      text: 'Hello SMTP',
      html: '<b>SMTP works</b>',
    });
  }
}
