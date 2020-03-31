/** Dependencies **/
import * as path from 'path';
import { renderFile } from 'pug';
import * as Handlebars from 'handlebars';
import * as fs from 'fs';
import { Injectable, Inject } from '@nestjs/common';
import {
  createTransport,
  SentMessageInfo,
  Transporter,
  SendMailOptions
} from 'nodemailer';
import {
  MailerModuleOptions,
  TemplateEngineOptions,
  RenderCallback
} from './mailer.interfac'

let nodemailer = require('nodemailer')

@Injectable()
export class MailerProvider {
  private transporter: Transporter;
  private precompiledTemplates: any;

  constructor(
    @Inject('MAILER_MODULE_OPTIONS')
    private readonly options: MailerModuleOptions
  ) {
    if (!this.options.transport || Object.keys(this.options.transport).length < 1) {
      throw new Error('Make sure to provide a nodemailer transport configuration object, connection url or a transport plugin instance');
    }
    this.setupTransporter(this.options.transport, this.options.defaults, this.options.templateDir, this.options.templateOptions);
  }

  private setupTransporter(transport: any, defaults?: any, templateDir?: string, templateOptions: TemplateEngineOptions = { engine: 'pug' }): void {
    this.transporter = createTransport(transport, defaults);
    this.precompiledTemplates = templateOptions.precompiledTemplates || {};
    if (templateOptions && typeof templateOptions.engineAdapter === 'function') {
      this.transporter.use('compile', this.renderTemplateWithAdapter(templateDir, templateOptions.engineAdapter));
    } else if (templateOptions.engine) {
      const engine = templateOptions.engine.toLowerCase();
      let adapter: (templateDir: string, mail: any, callback: RenderCallback) => any;

      if (engine === 'handlebars') {
        adapter = this.handlebarsAdapter.bind(this);
      } else if (engine === 'pug') {
        adapter = this.pugAdapter.bind(this);
      } else {
        throw new Error(`Unsuported template engine: ${engine}`);
      }

      this.transporter.use('compile', this.renderTemplateWithAdapter(templateDir, adapter));
    } else {
      throw new Error('Invalid template engine options: could not find engine or adapter');
    }
  }

  public sendMail(sendMailOptions: SendMailOptions) {
    return  new Promise((resolve, reject) => {
      this.transporter.sendMail(sendMailOptions, (error, info) => {
        if (error) {
          reject(error);
        }
        else {
          resolve(info.messageId);
        }
      });
    })
  }

  private getTemplatePath(templateDir: string, templateName?: string, extension?: string) {
    return path.join(process.cwd(), templateDir || './public/templates', templateName) + extension;
  }

  private renderTemplateWithAdapter(templateDir: string, templateAdapter: any) {
    return (mail, callback) => {
      if (mail.data.html) {
        return callback();
      }
      templateAdapter(templateDir, mail, callback);
    };
  }

  private pugAdapter(templateDir: string, mail: any, callback: RenderCallback) {
    const templatePath = this.getTemplatePath(templateDir, mail.data.template, '.pug');
    renderFile(templatePath, mail.data.context, (err, body) => {
      if (err) {
        return callback(err);
      }
      mail.data.html = body;
      return callback();
    });
  }

  private handlebarsAdapter(templateDir: string, mail: any, callback: RenderCallback) {
    const templatePath = this.getTemplatePath(templateDir, mail.data.template, '.hbs');
    const templateName = path.basename(mail.data.template, path.extname(mail.data.template));

    if (!this.precompiledTemplates[templateName]) {
      try {
        const templateString = fs.readFileSync(templatePath, 'UTF-8');
        this.precompiledTemplates[templateName] = Handlebars.compile(templateString);
      } catch (err) {
        return callback(err);
      }
    }
    mail.data.html = this.precompiledTemplates[templateName](mail.data.context);
    return callback();
  }

  public async testMail(sendMailOptions: SendMailOptions): Promise<SentMessageInfo> {

    let transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: 'navan0710@gmail.com', // generated ethereal user
        pass: 'Nav@123456' // generated ethereal password
      },
      use_authentication: false,
      tls: { rejectUnauthorized: false },
    });

    // setup email data with unicode symbols
    let mailOptions = {
      from: 'navan0710@gmail.com', // sender address
      to: 'nguyenanhvan.net@gmail.com', // list of receivers
      subject: 'Hello ✔', // Subject line
      text: 'Hello world?', // plain text body
      html: '<b>Hello world?</b>' // html body
    };

    // send mail with defined transport object
    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        return console.log(error);
      }
      console.log('Message sent: %s', info.messageId);
      // Preview only available when sending through an Ethereal account
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

      // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
      // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
    });
  }
}