import { ConfigService } from '@nestjs/config';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { MailerOptions } from '@nestjs-modules/mailer';

export async function mailerConfigFactory(
  configService: ConfigService,
): Promise<MailerOptions> {
  return {
    transport: {
      host: 'smtp.gmail.com',
      port: 587,
      auth: {
        user: configService.get<string>('GMAIL_USER'),
        pass: configService.get<string>('GMAIL_PASSWORD'),
      },
    },
    defaults: {
      from: `"와글와글" <${configService.get<string>('GMAIL_USER')}>`,
    },
    template: {
      dir: __dirname + '/templates',
      adapter: new HandlebarsAdapter(),
      options: {
        strict: true,
      },
    },
  };
}
