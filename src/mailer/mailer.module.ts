import { Module} from '@nestjs/common';
import { MailerProvider } from './mailer.provider';
import { MailerConfig } from './config';
import { MailerModuleOptions } from './mailer.interfac';

const MailerOptions = {
    name: 'MAILER_MODULE_OPTIONS',
    provide: 'MAILER_MODULE_OPTIONS',
    useValue: {
      transport: MailerConfig.transport,
      defaults: MailerConfig.defaults,
      templateDir: MailerConfig.templateDir,
      templateOptions: MailerConfig.templateOptions,
    } as MailerModuleOptions,
  };

@Module({
    providers: [MailerProvider, MailerOptions],
    exports: [MailerProvider]
})
export class MailerModule {}