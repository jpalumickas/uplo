import type { UploOptionsAttachment, UploOptionsAttachments } from '../types'

/**
 * Finds attachment options by name in "model.attachment" format.
 * Only attachments defined in config are matched, so names like
 * "user.constructor" or "user.avatar.validate" return null.
 */
export const findAttachmentOptions = (attachments: UploOptionsAttachments, name: string) => {
  if (typeof name !== 'string') {
    return null
  }

  const parts = name.split('.')
  if (parts.length !== 2) {
    return null
  }

  const [modelName, attachmentName] = parts as [string, string]
  if (!modelName || !attachmentName || !Object.hasOwn(attachments, modelName)) {
    return null
  }

  const modelAttachments = attachments[modelName]
  if (!isObject(modelAttachments) || !Object.hasOwn(modelAttachments, attachmentName)) {
    return null
  }

  const options: unknown = modelAttachments[attachmentName]
  if (options !== true && !isObject(options)) {
    return null
  }

  return { modelName, attachmentName, options: options as UploOptionsAttachment | true }
}

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
