/* eslint-disable @typescript-eslint/no-explicit-any */
import {
  TransactionalEmailsApi,
  SendSmtpEmail,
  TransactionalEmailsApiApiKeys,
} from '@getbrevo/brevo';
import logger from './logger';
import Handlebars from 'handlebars';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const { apiKey: brevoApiKey } = useRuntimeConfig().brevo;

const apiInstance = new TransactionalEmailsApi();

apiInstance.setApiKey(TransactionalEmailsApiApiKeys.apiKey, brevoApiKey);

const runtimeDir = fileURLToPath(new URL('../../server/templates', import.meta.url));
const partialsDir = path.join(runtimeDir, 'partials');
fs.readdirSync(partialsDir).forEach((file) => {
  const name = path.parse(file).name;
  const content = fs.readFileSync(path.join(partialsDir, file), 'utf8');
  Handlebars.registerPartial(name, content);
});

function compile(templateName: string, data: any): string {
  const templateString = fs.readFileSync(path.join(runtimeDir, `${templateName}.html`)).toString();
  const template: HandlebarsTemplateDelegate<any> = Handlebars.compile(templateString);
  return template({ ...data, recipient: 'Kevin' });
}

// Helper to encode text for URLs
Handlebars.registerHelper('urlencode', function (str) {
  return encodeURIComponent(str);
});

// Helper to join an array with a separator
Handlebars.registerHelper('join', function (arr, separator) {
  return arr.join(separator || ' ');
});

Handlebars.registerHelper('subjectForMailto', function (subject) {
  return encodeURIComponent(subject);
});

// Join array with newlines and encode
Handlebars.registerHelper('mailtoBody', function (prefix, textArray) {
  return `${encodeURIComponent(prefix + '\n')} ${encodeURIComponent(textArray.join('\n'))}`;
});

export default async function sendEmail(
  templateName: string,
  to: { email: string; name: string }[],
  subject: string,
  params?: any
) {
  const sendSmtpEmail = new SendSmtpEmail();

  sendSmtpEmail.htmlContent = compile(templateName, params ?? {});

  sendSmtpEmail.subject = subject;

  const { emailDomain } = useRuntimeConfig();
  const replyAddress = `squareov@${emailDomain}`;

  sendSmtpEmail.sender = { name: 'Square OV', email: replyAddress };
  sendSmtpEmail.to = to;
  sendSmtpEmail.replyTo = { email: replyAddress, name: 'Square OV' };

  await apiInstance.sendTransacEmail(sendSmtpEmail).then(
    function () {
      logger.debug('Email sent successfully');
    },
    function (error) {
      logger.error(error);
    }
  );
}
