export interface NotificationContentData {
  title?: string | null
  message?: string | null
  type?: string | null
}

type TranslationFn = (
  key: string,
  params?: Record<string, string | number>
) => string

type FormattedNotificationContent = {
  title: string
  message: string
}

type MessageTranslator = {
  match: RegExp
  key: string
  getParams: (match: RegExpMatchArray) => Record<string, string>
}

const normalize = (value?: string | null) => value?.trim().toLowerCase() || ''

const translateIfExists = (
  t: TranslationFn,
  key: string,
  params?: Record<string, string | number>
) => {
  const value = t(key, params)
  return value === key ? null : value
}

const TITLE_KEYS_BY_RAW_TITLE: Record<string, string> = {
  'réservation créée': 'notifications.content.booking_created_renter.title',
  'nouvelle demande de réservation':
    'notifications.content.booking_created_owner.title',
  'réservation confirmée':
    'notifications.content.booking_confirmed_renter.title',
  'réservation acceptée':
    'notifications.content.booking_accepted_renter.title',
  'demande de réservation refusée':
    'notifications.content.booking_rejected_renter.title',
  'réservation commencée':
    'notifications.content.booking_started_renter.title',
  'réservation terminée':
    'notifications.content.booking_completed_renter.title',
  'rappel de récupération':
    'notifications.content.booking_pickup_reminder.title',
  'rappel de remise': 'notifications.content.booking_handover_reminder.title',
  'rappel de retour': 'notifications.content.booking_return_reminder.title',
  'retour en retard': 'notifications.content.booking_overdue_renter.title',
  'paiement confirmé': 'notifications.content.payment_confirmed_renter.title',
  'paiement reçu': 'notifications.content.payment_received_owner.title',
  'échec du paiement': 'notifications.content.payment_failed.title',
  'outil retourné': 'notifications.content.tool_returned_owner.title',
  'retour confirmé': 'notifications.content.return_confirmed_renter.title',
  "paiement d'acompte requis":
    'notifications.content.deposit_required.title',
  'réservation annulée - acompte impayé':
    'notifications.content.deposit_overdue_cancelled.title',
  'acompte payé avec succès': 'notifications.content.deposit_paid_renter.title',
  'acompte reçu': 'notifications.content.deposit_received_owner.title',
  'nouvelle réclamation': 'notifications.content.dispute_created.title',
  'outil rejeté': 'notifications.content.tool_rejected.title',
  'retrait terminé': 'notifications.content.withdrawal_completed.title',
  'account deletion request':
    'notifications.content.account_deletion_request.title',
  'demande de suppression reçue':
    'notifications.content.account_deletion_request.title',
  'request pending': 'notifications.content.account_deletion_pending.title',
  'demande en attente': 'notifications.content.account_deletion_pending.title',
  'request approved': 'notifications.content.account_deletion_approved.title',
  'demande approuvée': 'notifications.content.account_deletion_approved.title',
  'request cancelled': 'notifications.content.account_deletion_cancelled.title',
  'demande annulée': 'notifications.content.account_deletion_cancelled.title',
}

const TITLE_KEYS_BY_TYPE: Record<string, string> = {
  booking_created: 'notifications.content.booking_created_renter.title',
  booking_confirmed: 'notifications.content.booking_confirmed_renter.title',
  booking_rejected: 'notifications.content.booking_rejected_renter.title',
  booking_cancelled: 'notifications.content.booking_cancelled_renter.title',
  booking_completed: 'notifications.content.booking_completed_renter.title',
  booking_reminder: 'notifications.content.booking_pickup_reminder.title',
  booking_overdue: 'notifications.content.booking_overdue_renter.title',
  payment_received: 'notifications.content.payment_received_owner.title',
  payment_failed: 'notifications.content.payment_failed.title',
  payment_reminder: 'notifications.content.deposit_required.title',
  dispute_created: 'notifications.content.dispute_created.title',
  tool_rejected: 'notifications.content.tool_rejected.title',
  tool_approved: 'notifications.content.tool_approved.title',
  withdrawal_completed: 'notifications.content.withdrawal_completed.title',
  account_deletion_request:
    'notifications.content.account_deletion_request.title',
  account_deletion_request_pending:
    'notifications.content.account_deletion_pending.title',
  account_deletion_request_approved:
    'notifications.content.account_deletion_approved.title',
  account_deletion_request_cancelled:
    'notifications.content.account_deletion_cancelled.title',
}

const FIXED_MESSAGES_BY_RAW_MESSAGE: Record<string, string> = {
  'your account deletion request has been received.':
    'notifications.content.account_deletion_request.message',
  'votre demande de suppression a été reçue.':
    'notifications.content.account_deletion_request.message',
  'your request is pending approval.':
    'notifications.content.account_deletion_pending.message',
  "votre demande est en attente d'approbation.":
    'notifications.content.account_deletion_pending.message',
  'your request has been approved.':
    'notifications.content.account_deletion_approved.message',
  'votre demande a été approuvée.':
    'notifications.content.account_deletion_approved.message',
  'your request has been cancelled.':
    'notifications.content.account_deletion_cancelled.message',
  'votre demande a été annulée.':
    'notifications.content.account_deletion_cancelled.message',
}

const MESSAGE_TRANSLATORS: MessageTranslator[] = [
  {
    match:
      /^Votre demande de réservation pour "(.+)" a été soumise et est en attente de confirmation\.$/,
    key: 'notifications.content.booking_created_renter.message',
    getParams: ([, toolName]) => ({ toolName }),
  },
  {
    match: /^(.+) souhaite réserver votre outil "(.+)" du (.+) au (.+)\.$/,
    key: 'notifications.content.booking_created_owner.message',
    getParams: ([, userName, toolName, startDate, endDate]) => ({
      userName,
      toolName,
      startDate,
      endDate,
    }),
  },
  {
    match:
      /^Votre réservation pour "(.+)" a été confirmée ! Vous pouvez récupérer l'outil le (.+)\.$/,
    key: 'notifications.content.booking_confirmed_renter.message',
    getParams: ([, toolName, startDate]) => ({ toolName, startDate }),
  },
  {
    match: /^Vous avez confirmé la réservation de "(.+)" pour (.+)\.$/,
    key: 'notifications.content.booking_confirmed_owner.message',
    getParams: ([, toolName, userName]) => ({ toolName, userName }),
  },
  {
    match:
      /^Votre réservation pour "(.+)" a été acceptée ! Code de validation: (.+)\. Présentez ce code lors de la récupération\.$/,
    key: 'notifications.content.booking_accepted_renter.message',
    getParams: ([, toolName, validationCode]) => ({ toolName, validationCode }),
  },
  {
    match:
      /^Vous avez accepté la réservation de "(.+)" pour (.+)\. Code de validation généré: (.+)$/,
    key: 'notifications.content.booking_accepted_owner.message',
    getParams: ([, toolName, userName, validationCode]) => ({
      toolName,
      userName,
      validationCode,
    }),
  },
  {
    match:
      /^Votre réservation pour "(.+)" a été annulée par le propriétaire\.(?: Raison: (.+))?$/,
    key: 'notifications.content.booking_cancelled_renter.message',
    getParams: ([, toolName, reason]) => ({
      toolName,
      reason: reason || '',
    }),
  },
  {
    match:
      /^(.+) a annulé sa réservation pour "(.+)"\.(?: Raison: (.+))?$/,
    key: 'notifications.content.booking_cancelled_owner.message',
    getParams: ([, userName, toolName, reason]) => ({
      userName,
      toolName,
      reason: reason || '',
    }),
  },
  {
    match:
      /^Votre demande de réservation pour "(.+)" a été refusée\.(?: Raison: (.+))?$/,
    key: 'notifications.content.booking_rejected_renter.message',
    getParams: ([, toolName, reason]) => ({
      toolName,
      reason: reason || '',
    }),
  },
  {
    match:
      /^Vous avez refusé la demande de réservation de "(.+)" par (.+)\.$/,
    key: 'notifications.content.booking_rejected_owner.message',
    getParams: ([, toolName, userName]) => ({ toolName, userName }),
  },
  {
    match:
      /^Votre réservation pour "(.+)" a commencé ! Profitez bien de votre location\.$/,
    key: 'notifications.content.booking_started_renter.message',
    getParams: ([, toolName]) => ({ toolName }),
  },
  {
    match: /^La réservation de "(.+)" par (.+) a commencé\.$/,
    key: 'notifications.content.booking_started_owner.message',
    getParams: ([, toolName, userName]) => ({ toolName, userName }),
  },
  {
    match:
      /^Votre réservation pour "(.+)" est maintenant terminée\. N'oubliez pas de laisser un avis ?!$/,
    key: 'notifications.content.booking_completed_renter.message',
    getParams: ([, toolName]) => ({ toolName }),
  },
  {
    match: /^La réservation de "(.+)" par (.+) est maintenant terminée\.$/,
    key: 'notifications.content.booking_completed_owner.message',
    getParams: ([, toolName, userName]) => ({ toolName, userName }),
  },
  {
    match: /^N'oubliez pas de récupérer "(.+)" demain \((.+)\)\.$/,
    key: 'notifications.content.booking_pickup_reminder.message',
    getParams: ([, toolName, startDate]) => ({ toolName, startDate }),
  },
  {
    match: /^Rappel: (.+) doit récupérer "(.+)" demain\.$/,
    key: 'notifications.content.booking_handover_reminder.message',
    getParams: ([, userName, toolName]) => ({ userName, toolName }),
  },
  {
    match: /^N'oubliez pas de retourner "(.+)" demain \((.+)\)\.$/,
    key: 'notifications.content.booking_return_reminder_renter.message',
    getParams: ([, toolName, endDate]) => ({ toolName, endDate }),
  },
  {
    match: /^Rappel: (.+) doit retourner "(.+)" demain\.$/,
    key: 'notifications.content.booking_return_reminder_owner.message',
    getParams: ([, userName, toolName]) => ({ userName, toolName }),
  },
  {
    match:
      /^Votre réservation pour "(.+)" est en retard\. Veuillez retourner l'outil dès que possible\.$/,
    key: 'notifications.content.booking_overdue_renter.message',
    getParams: ([, toolName]) => ({ toolName }),
  },
  {
    match: /^La réservation de "(.+)" par (.+) est en retard\.$/,
    key: 'notifications.content.booking_overdue_owner.message',
    getParams: ([, toolName, userName]) => ({ toolName, userName }),
  },
  {
    match:
      /^Votre paiement pour la réservation de "(.+)" a été confirmé\.$/,
    key: 'notifications.content.payment_confirmed_renter.message',
    getParams: ([, toolName]) => ({ toolName }),
  },
  {
    match:
      /^Le paiement pour la réservation de "(.+)" par (.+) a été reçu\.$/,
    key: 'notifications.content.payment_received_owner.message',
    getParams: ([, toolName, userName]) => ({ toolName, userName }),
  },
  {
    match:
      /^Le paiement pour votre réservation de "(.+)" a échoué\. Veuillez réessayer\.$/,
    key: 'notifications.content.payment_failed.message',
    getParams: ([, toolName]) => ({ toolName }),
  },
  {
    match:
      /^(.+) a confirmé le retour de "(.+)"\.(?: Notes: (.+))?$/,
    key: 'notifications.content.tool_returned_owner.message',
    getParams: ([, userName, toolName, notes]) => ({
      userName,
      toolName,
      notes: notes || '',
    }),
  },
  {
    match:
      /^Vous avez confirmé le retour de "(.+)". Merci pour votre location !$/,
    key: 'notifications.content.return_confirmed_renter.message',
    getParams: ([, toolName]) => ({ toolName }),
  },
  {
    match:
      /^Votre réservation pour "(.+)" nécessite un paiement d'acompte\. Veuillez effectuer le paiement pour confirmer votre réservation\.$/,
    key: 'notifications.content.deposit_required.message',
    getParams: ([, toolName]) => ({ toolName }),
  },
  {
    match:
      /^Votre réservation pour "(.+)" a été automatiquement annulée car l'acompte n'a pas été payé dans les délais\.$/,
    key: 'notifications.content.deposit_overdue_cancelled_renter.message',
    getParams: ([, toolName]) => ({ toolName }),
  },
  {
    match:
      /^La réservation de (.+) pour "(.+)" a été automatiquement annulée car l'acompte n'a pas été payé\.$/,
    key: 'notifications.content.deposit_overdue_cancelled_owner.message',
    getParams: ([, userName, toolName]) => ({ userName, toolName }),
  },
  {
    match:
      /^Votre acompte pour la réservation de "(.+)" a été payé avec succès\. Votre réservation est maintenant confirmée\.$/,
    key: 'notifications.content.deposit_paid_renter.message',
    getParams: ([, toolName]) => ({ toolName }),
  },
  {
    match:
      /^L'acompte pour la réservation de (.+) pour "(.+)" a été reçu\. La réservation est confirmée\.$/,
    key: 'notifications.content.deposit_received_owner.message',
    getParams: ([, userName, toolName]) => ({ userName, toolName }),
  },
  {
    match:
      /^(.+) a créé une réclamation concernant "(.+)". Motif: (.+)$/,
    key: 'notifications.content.dispute_created.message',
    getParams: ([, userName, toolName, reason]) => ({
      userName,
      toolName,
      reason,
    }),
  },
  {
    match: /^Votre outil "(.+)" a été rejeté\. Raison: (.+)\.$/,
    key: 'notifications.content.tool_rejected.message',
    getParams: ([, toolName, reason]) => ({ toolName, reason }),
  },
  {
    match: /^Votre retrait de (.+) a été effectué avec succès\.$/,
    key: 'notifications.content.withdrawal_completed.message',
    getParams: ([, amount]) => ({ amount }),
  },
]

const getLocalizedTitle = (notification: NotificationContentData, t: TranslationFn) => {
  const normalizedTitle = normalize(notification.title)
  const normalizedType = normalize(notification.type)

  const rawTitleKey =
    TITLE_KEYS_BY_RAW_TITLE[normalizedTitle] || TITLE_KEYS_BY_TYPE[normalizedType]

  return rawTitleKey
    ? translateIfExists(t, rawTitleKey) || notification.title || ''
    : notification.title || ''
}

const getLocalizedMessage = (
  notification: NotificationContentData,
  t: TranslationFn
) => {
  const rawMessage = notification.message || ''
  const normalizedMessage = normalize(rawMessage)

  const fixedMessageKey = FIXED_MESSAGES_BY_RAW_MESSAGE[normalizedMessage]
  if (fixedMessageKey) {
    return translateIfExists(t, fixedMessageKey) || rawMessage
  }

  for (const translator of MESSAGE_TRANSLATORS) {
    const match = rawMessage.match(translator.match)
    if (match) {
      return translateIfExists(t, translator.key, translator.getParams(match)) || rawMessage
    }
  }

  return rawMessage
}

export const formatNotificationContent = (
  notification: NotificationContentData,
  t: TranslationFn
): FormattedNotificationContent => {
  return {
    title: getLocalizedTitle(notification, t),
    message: getLocalizedMessage(notification, t),
  }
}

