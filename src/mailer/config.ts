import { MailerModuleOptions } from "./mailer.interfac";

export const MailerConfig: MailerModuleOptions  = {
    transport: {
      host: process.env.MAIL_HOST,
      port: process.env.MAIL_PORT,
      secure: false,
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD
      },
      use_authentication : false,    
      tls: { rejectUnauthorized: false },
    },
    // defaults: {
    //   forceEmbeddedImages: true,
    //   from:'"nest-modules" <modules@nestjs.com>',
    // },
    templateDir: './src/assets/email-templates'
  }