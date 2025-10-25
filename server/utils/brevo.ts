import { TransactionalEmailsApi, SendSmtpEmail, TransactionalEmailsApiApiKeys } from '@getbrevo/brevo';
import logger from './logger';
import Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const { apiKey: brevoApiKey } = useRuntimeConfig().brevo;

let apiInstance = new TransactionalEmailsApi();

apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);

function compile(templateName: string, data: any): string {
  const runtimeDir = fileURLToPath(new URL('../../server/templates', import.meta.url));
  logger.info(`runtimeDir: ${runtimeDir}`);
  const templateString = fs.readFileSync(path.join(runtimeDir, `${templateName}.html`)).toString();
  const template: HandlebarsTemplateDelegate<any> = Handlebars.compile(templateString);
  return template({ ...data, recipient: 'Kevin' });
}

export default function sendEmail(templateName: string, subject: string, params?: any) {
  const sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.htmlContent = compile(templateName, params ?? {});

  sendSmtpEmail.subject = subject;

  sendSmtpEmail.sender = { name: 'SE-MON', email: 'noreply@squareevents.org' };
  sendSmtpEmail.to = [{ email: 'kevin@kpturner.co.uk', name: 'Kevin Turner' }];
  sendSmtpEmail.replyTo = { email: 'noreply@squareevents.org', name: 'SE-MON' };

  apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function () {
      logger.debug('Email sent successfully');
    },
    function (error) {
      logger.error(error);
    }
  );
}
