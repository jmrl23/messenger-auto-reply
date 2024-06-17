import mustache from 'mustache';
import path from 'node:path';
import { TEMPLATE_DIR } from '../constants/paths.constant';
import isFileExists from '../utils/isFileExists';
import readFile from '../utils/readFile';

export default class TemplateService {
  private static dir = TEMPLATE_DIR;
  private static extension = 'mustache';

  private constructor() {}

  public static async renderTemplate(
    name: string,
    data: object = {},
  ): Promise<string> {
    const templatePath = path.resolve(
      TemplateService.dir,
      `${name}.${TemplateService.extension}`,
    );

    if (!isFileExists(templatePath)) {
      throw new Error(`Template not found: ${templatePath}`);
    }

    const template = await readFile(templatePath);
    const renderedTemplate = mustache.render(template, data).trim();

    return renderedTemplate;
  }
}
