import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useMemo,
} from 'react'

type Language = 'fr' | 'en' | 'ar'

interface LanguageContextType {
  language: Language
  setLanguage: (lang: Language) => void
  t: (key: string, params?: Record<string, string | number>) => string
}

const translations = {
  fr: {
    'login.signing': 'Connexion en cours...',
    'blog.category.general': 'Général',
    // AgeVerificationDialog
    'ageVerification.title': "Vérification de l'âge",
    'ageVerification.description':
      "Notre plateforme est accessible via des applications web et mobiles. Elle est strictement réservée aux utilisateurs âgés de 18 ans ou plus qui ont la capacité légale d'utiliser nos services.",
    'ageVerification.description2':
      "Bricola se réserve le droit de suspendre ou de résilier tout compte en cas de violations des politiques, de fraude ou d'abus.",
    'ageVerification.description3':
      "Pour plus de détails, veuillez consulter nos Conditions Générales d'Utilisation.",
    'ageVerification.confirmButton': "Oui, je confirme que j'ai 18 ans ou plus",
    'ageVerification.denyButton': "Non, j'ai moins de 18 ans",

    // UnderAge page
    'underAge.title': 'Accès non autorisé',
    'underAge.message':
      "Nous sommes désolés, vous n'êtes pas autorisé à utiliser la plateforme Bricola.",
    'underAge.message2':
      "Veuillez consulter nos Conditions Générales d'Utilisation.",
    'underAge.cguButton': 'Voir les CGU',
    // contrat
    'rentalContract.title': 'Contrat de Location',
    'rentalContract.subtitle':
      "Modèle de contrat de location d'outils entre particuliers",
    'rentalContract.cardTitle': "Contrat de Location d'Outil",
    'rentalContract.downloadButton': 'Télécharger PDF',
    'rentalContract.section.signatories.title': 'Entre les soussignés',
    'rentalContract.section.signatories.owner.name':
      'Le Loueur : [Nom et prénom du propriétaire]',
    'rentalContract.section.signatories.owner.address':
      'Adresse : [Adresse complète]',
    'rentalContract.section.signatories.owner.phone':
      'Téléphone : [Numéro de téléphone]',
    'rentalContract.section.signatories.owner.email': 'Email : [Adresse email]',
    'rentalContract.section.signatories.separator': 'ET',
    'rentalContract.section.signatories.tenant.name':
      'Le Locataire : [Nom et prénom du locataire]',
    'rentalContract.section.signatories.tenant.address':
      'Adresse : [Adresse complète]',
    'rentalContract.section.signatories.tenant.phone':
      'Téléphone : [Numéro de téléphone]',
    'rentalContract.section.signatories.tenant.email.fr':
      'Email : [Adresse email]',
    'rentalContract.article1.title': 'Article 1 - Objet du contrat',
    'rentalContract.article1.description':
      "Le présent contrat a pour objet la location de l'outil suivant :",
    'rentalContract.article1.fields.designation':
      "Désignation : [Nom de l'outil]",
    'rentalContract.article1.fields.brandModel':
      'Marque/Modèle : [Marque et modèle]',
    'rentalContract.article1.fields.serialNumber':
      'Numéro de série : [Si applicable]',
    'rentalContract.article1.fields.condition':
      "État : [Description de l'état]",
    'rentalContract.article1.fields.accessories':
      'Accessoires inclus : [Liste des accessoires]',
    'rentalContract.article2.title': 'Article 2 - Durée de la location',
    'rentalContract.article2.fields.startDate':
      'Date de début : [Date et heure de début]',
    'rentalContract.article2.fields.endDate':
      'Date de fin : [Date et heure de fin]',
    'rentalContract.article2.fields.handoverLocation':
      'Lieu de remise : [Adresse de remise]',
    'rentalContract.article2.fields.returnLocation':
      'Lieu de restitution : [Adresse de restitution]',
    'rentalContract.article3.title':
      'Article 3 - Prix et modalités de paiement',
    'rentalContract.article3.fields.rentalPrice':
      'Prix de location : [Montant] € pour [durée]',
    'rentalContract.article3.fields.deposit':
      'Caution : [Montant de la caution] €',
    'rentalContract.article3.fields.paymentMethod':
      'Mode de paiement : Via la plateforme Bricola',
    'rentalContract.article4.title': 'Article 4 - Obligations du locataire',
    'rentalContract.article4.list.1':
      "Utiliser l'outil conformément à sa destination normale",
    'rentalContract.article4.list.2':
      "Prendre toutes les précautions d'usage pour sa conservation",
    'rentalContract.article4.list.3':
      "Ne pas prêter ou sous-louer l'outil à un tiers",
    'rentalContract.article4.list.4':
      'Signaler immédiatement tout dysfonctionnement',
    'rentalContract.article4.list.5':
      "Restituer l'outil dans l'état où il a été remis",
    'rentalContract.article4.list.6': 'Respecter les horaires de restitution',
    'rentalContract.article5.title': 'Article 5 - Obligations du loueur',
    'rentalContract.article5.list.1':
      "Remettre l'outil en parfait état de fonctionnement",
    'rentalContract.article5.list.2':
      "Fournir les instructions d'utilisation si nécessaire",
    'rentalContract.article5.list.3':
      "Garantir la conformité de l'outil à sa description",
    'rentalContract.article5.list.4':
      'Être disponible pour la remise et la restitution',
    'rentalContract.article6.title': 'Article 6 - Assurance et responsabilité',
    'rentalContract.article6.intro':
      "L'outil est couvert par l'assurance Bricola pendant la durée de la location pour :",
    'rentalContract.article6.coverage.1': 'Les dommages accidentels',
    'rentalContract.article6.coverage.2': 'Le vol (sous certaines conditions)',
    'rentalContract.article6.coverage.3':
      "Les dommages causés par un défaut de l'outil",
    'rentalContract.article6.note':
      "Le locataire reste responsable des dommages résultant d'une utilisation non conforme ou d'une négligence grave.",
    'rentalContract.article7.title': 'Article 7 - Résolution des litiges',
    'rentalContract.article7.text':
      "En cas de litige, les parties s'engagent à rechercher une solution amiable. À défaut, le service client Bricola interviendra en médiation. Les litiges non résolus seront soumis aux tribunaux compétents.",
    'rentalContract.signatures.owner': 'Signature du Loueur',
    'rentalContract.signatures.tenant': 'Signature du Locataire',
    'rentalContract.instructions.title': "Instructions d'utilisation",
    'rentalContract.instructions.list.1':
      'Complétez toutes les sections marquées entre crochets avec les informations appropriées.',
    'rentalContract.instructions.list.2':
      'Assurez-vous que toutes les parties ont lu et compris le contrat avant signature.',
    'rentalContract.instructions.list.3':
      'Conservez une copie signée du contrat pendant toute la durée de la location.',
    'rentalContract.instructions.list.4':
      'En cas de questions, contactez le service client Bricola.',

    // Search page
    'search.noResults': 'Aucun outil trouvé',
    'search.tryDifferentCriteria':
      'Essayez de modifier vos critères de recherche',
    'search.resetFilters': 'Réinitialiser les filtres',

    // renters guide
    'rentersGuide.title': 'Pour les locataires',
    'rentersGuide.intro':
      'Bienvenue chez Bricola LTD ! Ce guide vous explique comment louer des outils facilement et en toute sécurité.',
    'rentersGuide.step1.title': 'Créer un Compte',
    'rentersGuide.step1.description':
      'Inscrivez-vous en tant que locataire en renseignant vos informations personnelles avec soin.',
    'rentersGuide.step2.title': 'Chercher un Outil',
    'rentersGuide.step2.description':
      'Utilisez le moteur de recherche ou les catégories pour trouver l’outil dont vous avez besoin.',
    'rentersGuide.step3.title': 'Lire les Détails',
    'rentersGuide.step3.description':
      'Prenez le temps de lire la description de l’outil et les conditions fixées par le propriétaire avant de réserver.',
    'rentersGuide.step4.title': 'Réserver et Payer',
    'rentersGuide.step4.description':
      'Choisissez la période de location souhaitée et réglez via le système de paiement sécurisé de la plateforme.',
    'rentersGuide.step5.title': 'Recevoir l’Outil',
    'rentersGuide.step5.description':
      'Organisez avec le propriétaire la méthode et le lieu de remise de l’outil.',
    'rentersGuide.step6.title': 'Utilisation',
    'rentersGuide.step6.description':
      'Manipulez l’outil avec soin et respectez les consignes données par le propriétaire.',
    'rentersGuide.step7.title': 'Retour',
    'rentersGuide.step7.description':
      'Rendez l’outil à temps et dans l’état où vous l’avez reçu.',
    'rentersGuide.step8.title': 'Évaluer',
    'rentersGuide.step8.description':
      'Après la location, laissez un avis sur le propriétaire pour contribuer à améliorer la qualité du service.',
    'rentersGuide.step9.title': 'Annulation et Remboursement',
    'rentersGuide.step9.description':
      'Consultez les pages dédiées sur le site pour connaître les règles en cas d’annulation ou de remboursement.',

    // owners guide
    'ownersGuide.title': 'Guide pour les propriétaires',
    'ownersGuide.intro':
      'Bienvenue chez Bricola LTD ! Ce guide va vous aider à tirer le meilleur profit de vos outils.',
    'ownersGuide.step1.title': 'Créez un compte',
    'ownersGuide.step1.description':
      'Inscrivez-vous en tant que propriétaire sur la plateforme en renseignant vos informations personnelles exactes, comme votre numéro de téléphone et votre adresse email.',
    'ownersGuide.step2.title': 'Ajoutez un outil',
    'ownersGuide.step2.description':
      'Publiez des photos nettes et de bonne qualité, décrivez bien votre outil, puis fixez un tarif journalier et un montant de caution.',
    'ownersGuide.step3.title': 'Définissez vos conditions',
    'ownersGuide.step3.description':
      'Indiquez la durée maximale de location autorisée ainsi que les consignes particulières d’utilisation de l’outil.',
    'ownersGuide.step4.title': 'Examinez les demandes',
    'ownersGuide.step4.description':
      'Vous recevrez des notifications à chaque nouvelle demande de location, que vous pourrez accepter ou refuser selon la disponibilité de l’outil.',
    'ownersGuide.step5.title': 'Organisez la livraison et la restitution',
    'ownersGuide.step5.description':
      'Mettez-vous d’accord avec le locataire sur le mode et le lieu de remise de l’outil pour que tout se passe facilement.',
    'ownersGuide.step6.title': 'Recevez vos paiements',
    'ownersGuide.step6.description':
      'Une fois la location terminée, le montant dû sera versé sur votre portefeuille virtuel. Vous pourrez retirer l’argent dès que vous atteindrez le seuil minimum.',
    'ownersGuide.step7.title': 'Conseils',
    'ownersGuide.step7.description':
      'Proposez des outils propres et en bon état, et entretenez de bonnes évaluations pour attirer plus de locataires.',

    // Refund Policy
    'refundPolicy.title': 'Politique de remboursement',
    'refundPolicy.intro':
      'Bricola LTD s’engage à garantir la sécurité et la satisfaction de ses utilisateurs. Voici les règles relatives aux remboursements :',
    'refundPolicy.renters.title': 'Remboursements pour les locataires :',
    'refundPolicy.renters.rule1':
      'En cas d’annulation faite au moins 24 heures avant le début de la location, le remboursement est intégral.',
    'refundPolicy.renters.rule2':
      'Si le propriétaire annule la réservation, le locataire bénéficie automatiquement d’un remboursement complet.',
    'refundPolicy.deposit.title': 'Caution et dégâts :',
    'refundPolicy.deposit.rule1':
      'Chaque location inclut une caution temporaire bloquée via Stripe.',
    'refundPolicy.deposit.rule2':
      'Cette caution est libérée 24 heures après la restitution de l’outil, sous réserve de vérification de son bon état.',
    'refundPolicy.deposit.rule3':
      'En cas de dommages, perte ou litige, Bricola peut retenir tout ou partie de la caution après avoir informé l’utilisateur par email.',
    'refundPolicy.lateReturns.title': 'Retards de retour et pénalités :',
    // Profile translations
    'profile.photo_title': 'Photo de profil',
    'profile.photo_description': 'Gérez votre photo de profil',
    'profile.personal_info_title': 'Informations personnelles',
    'profile.personal_info_description': 'Gérez vos informations personnelles',
    'profile.edit_button': 'Modifier',
    'profile.save_button': 'Enregistrer',
    'profile.cancel_button': 'Annuler',
    'profile.change_password': 'Changer le mot de passe',
    'profile.change_password_description': 'Modifiez votre mot de passe',
    'profile.current_password_placeholder': 'Entrez votre mot de passe actuel',
    'profile.current_password_validation':
      "Vérifiez d'abord votre mot de passe actuel",
    'profile.confirm_new_password': 'Confirmer le nouveau mot de passe',
    'profile.new_password_first': "Entrez d'abord votre nouveau mot de passe",
    'profile.saving': 'Enregistrement...',
    'profile.changing_password': 'Modification...',
    'profile.passwords_no_match': 'Les mots de passe ne correspondent pas',
    'profile.current_password_incorrect': 'Mot de passe actuel incorrect',

    // Notifications translations
    'notifications.title': 'Notifications',
    'notifications.subtitle': 'Gérez vos notifications et restez informé',
    'notifications.filter_all': 'Toutes',
    'notifications.filter_unread': 'Non lues',
    'notifications.filter_read': 'Lues',
    'notifications.manage': 'Gestion des notifications',
    'notifications.mark_all_read': 'Tout marquer comme lu',
    'notifications.clear_all': 'Tout effacer',
    'notifications.no_notifications': 'Aucune notification',
    'notifications.no_notifications_desc':
      "Vous n'avez aucune notification pour le moment.",
    'notifications.mark_as_read': 'Marquer comme lu',
    'notifications.mark_as_unread': 'Marquer comme non lu',
    'notifications.delete': 'Supprimer',
    'notifications.loading': 'Chargement des notifications...',
    'notifications.error': 'Erreur lors du chargement des notifications',
    'notifications.confirm_clear_all':
      'Êtes-vous sûr de vouloir supprimer toutes les notifications ?',
    'notifications.confirm_delete':
      'Êtes-vous sûr de vouloir supprimer cette notification ?',
    'notifications.just_now': "À l'instant",
    'notifications.minutes_ago': 'il y a {minutes} min',
    'notifications.hours_ago': 'il y a {hours}h',
    'notifications.days_ago': 'il y a {days}j',
    'notifications.weeks_ago': 'il y a {weeks}sem',
    'notifications.months_ago': 'il y a {months}mois',
    'notifications.booking_completed': 'Réservation terminée',
    'notifications.booking_created': 'Réservation créée',
    'notifications.tool_returned': 'Outil retourné',
    'notifications.booking_started': 'Réservation commencée',
    'notifications.booking_accepted': 'Réservation acceptée',

    'refundPolicy.lateReturns.rule':
      'Les retards dans la restitution peuvent entraîner des pénalités calculées à l’heure ou à la journée, selon les règles fixées par la plateforme.',
    'refundPolicy.disputes.title': 'Gestion des litiges :',
    'refundPolicy.disputes.rule1':
      'Toute réclamation doit être signalée dans les 24 heures suivant la date prévue de retour.',
    'refundPolicy.disputes.rule2':
      'L’équipe support de Bricola enquête sous 72 heures et prend une décision finale, qui est contraignante pour les deux parties.',
    'refundPolicy.payments.title': 'Paiements et frais :',
    'refundPolicy.payments.rule1':
      'Tous les paiements sont sécurisés et traités via Stripe.',
    'refundPolicy.payments.rule2':
      'Une commission de 15 % est prélevée sur chaque transaction réussie, et une commission de 6 % est appliquée aux locataires au moment du paiement (frais de traitement et fonctionnement de la plateforme).',

    // cancellationPolicy
    'cancellationPolicy.title': 'Politique d’annulation',
    'cancellationPolicy.intro':
      'Chez Bricola LTD, nous souhaitons offrir une expérience simple et transparente aux locataires et propriétaires. Voici les règles concernant les annulations :',
    'cancellationPolicy.renters.title': 'Pour les locataires :',
    'cancellationPolicy.renters.rule1':
      'Vous pouvez annuler votre réservation et bénéficier d’un remboursement intégral si l’annulation est faite au moins 24 heures avant le début de la location.',
    'cancellationPolicy.renters.rule2':
      'En cas d’annulation moins de 24 heures avant la location, aucun remboursement ne sera accordé et la réservation sera considérée comme ferme.',
    'cancellationPolicy.owners.title': 'Pour les propriétaires :',
    'cancellationPolicy.owners.rule1':
      'Si un propriétaire annule une réservation à tout moment, le locataire recevra un remboursement complet.',
    'cancellationPolicy.owners.rule2':
      'Les annulations répétées de la part des propriétaires peuvent entraîner des sanctions, voire la suspension de leur compte.',
    'cancellationPolicy.maxDuration.title': 'Durée maximale de location :',
    'cancellationPolicy.maxDuration.rule':
      'La location ne peut pas dépasser 5 jours par réservation. Pour prolonger la location, le locataire doit d’abord vérifier la disponibilité de l’outil auprès du propriétaire, puis effectuer une nouvelle réservation via la plateforme.',
    'cancellationPolicy.autoCancellations.title': 'Annulations automatiques :',
    'cancellationPolicy.autoCancellations.rule':
      'Si un utilisateur (locataire ou propriétaire) ne répond pas ou ne réalise pas une action dans un délai raisonnable, Bricola LTD se réserve le droit de confirmer automatiquement l’état de la transaction (livraison ou retour de l’outil) pour assurer la continuité du service.',

    //countries
    'country.kuwait': 'Kuwait',
    'country.ksa': 'Arabie Saoudite',
    'country.uae': 'Émirats Arabes Unis',
    'country.qatar': 'Qatar',
    'country.bahrain': 'Bahreïn',
    'country.oman': 'Oman',

    'review.modaltitle': 'Évaluer la location',
    'review.rate': 'Note par étoiles',
    'review.comment': 'Commentaire',
    'review.placeholdercomm': 'Partagez votre expérience...',
    'review.submitbtn': 'Soumettre l’évaluation',
    'review.popuptitle': 'Évaluation soumise',
    'review.modalmsg':
      'Merci pour votre évaluation. Le statut passe à "Terminé".',

    // reset password
    'resetpwd.emailtitle': 'Mot de passe oublié ?',
    'resetpwd.emailtxt':
      'Entrez votre adresse email pour recevoir un code de vérification',
    'resetpwd.emailfield': 'Adresse email',
    'resetpwd.emailplaceholder': 'votre@email.com',
    'resetpwd.sendbtn': 'Envoyer',
    'resetpwd.sendbtnpending': 'Envoi en cours...',
    'resetpwd.backlogin': 'Retour à la connexion',
    'resetpwd.popuptitle': 'Email envoyé',
    'resetpwd.popuptxt':
      'Un code de vérification a été envoyé à votre adresse email.',
    'resetpwd.verify': 'Vérifier',
    'resetpwd.verify_in_progress': 'Vérification en cours...',

    // deposit payment modal
    'deposit.modal.title': 'Paiement de l\'acompte requis',
    'deposit.modal.subtitle': 'Votre réservation nécessite un acompte de {amount} pour être confirmée.',
    'deposit.modal.payment_info': 'Informations de paiement',
    'deposit.modal.amount_label': 'Montant de l\'acompte',
    'deposit.modal.processing': 'Traitement en cours...',
    'deposit.modal.pay_button': 'Payer l\'acompte',
    'deposit.modal.cancel_button': 'Annuler la réservation',
    'deposit.modal.success': 'Acompte payé avec succès ! Votre réservation est maintenant confirmée.',
    'deposit.modal.error': 'Erreur lors du paiement de l\'acompte. Veuillez réessayer.',
    'deposit.modal.cancel_confirm': 'Êtes-vous sûr de vouloir annuler cette réservation ?',
    'deposit.modal.cancel_success': 'Réservation annulée avec succès.',
    'deposit.modal.cancel_error': 'Erreur lors de l\'annulation. Veuillez réessayer.',
    'deposit.modal.test_mode': 'Mode test activé',
    'deposit.modal.card_error': 'Erreur de carte de paiement',
    'deposit.modal.payment_failed': 'Le paiement a échoué',
    'deposit.modal.network_error': 'Erreur de connexion',

    // create password
    'password.create.title': 'Nouveau mot de passe',
    'password.create.description':
      'Choisissez un nouveau mot de passe sécurisé',
    'password.criteria': 'Critères du mot de passe :',
    'password.min_length': 'Au moins 8 caractères',
    'password.uppercase': 'Une lettre majuscule',
    'password.lowercase': 'Une lettre minuscule',
    'password.number': 'Un chiffre',
    'password.special_char': 'Un caractère spécial',
    'password.confirm': 'Confirmer le mot de passe',
    'password.match': 'Les mots de passe correspondent',
    'password.not_match': 'Les mots de passe ne correspondent pas',
    'password.update': 'Mettre à jour le mot de passe',
    'password.back_to_login': 'Retour à la connexion',

    'resetpwd.popupsuccupdate': 'Mot de passe modifié',
    'resetpwd.txtsucc': 'Votre mot de passe a été modifié avec succès.',
    'blog.Jardinage': 'Jardinage',
    'blog.Entretien': 'Entretien',
    'blog.Transport': 'Transport',
    'blog.Bricolage': 'Bricolage',
    'blog.Électricité': 'Électricité',
    'blog.Éclairage': 'Éclairage',
    'blog.Peinture': 'Peinture',
    'blog.Construction': 'Construction',
    'blog.Plantes': 'Plantes',
    'blog.Nettoyage': 'Nettoyage',
    'blog.Décoration': 'Décoration',
    'blog.Guide': 'Guide',
    // Status badges
    'status.pending': 'EN ATTENTE',
    'status.accepted': 'ACCEPTÉE',
    'status.cancelled': 'ANNULÉE',
    'status.completed': 'TERMINÉE',
    'status.rejected': 'REFUSÉE',
    'status.ongoing': 'EN COURS',

    // Location label
    'location.label': 'Localisation :',

    // Hard-coded texts from pages
    'general.loading': 'Chargement...',
    'general.min': ' min',
    'error.title': 'Erreur',
    'error.load_categories': 'Impossible de charger les catégories',
    'error.load_article': "Impossible de charger l'article",
    'error.create_tool': "Impossible de créer l'outil",
    'success.title': 'Succès',
    'success.tool_added': 'Votre outil a été ajouté avec succès',
    'validation.checking': 'Vérification en cours...',
    'validation.name_available': 'Nom disponible ✓',
    'validation.name_taken': 'Ce nom est déjà utilisé',
    'validation.verification_error': 'Erreur lors de la vérification',
    'validation.service_unavailable': 'Service de vérification non disponible',
    'validation.server_error': 'Erreur serveur, veuillez réessayer',
    'validation.title_required': 'Le titre est obligatoire',
    'validation.name_invalid': "Le nom de l'outil doit être unique",
    'validation.category_required': 'La catégorie est obligatoire',
    'validation.condition_required': "L'état de l'outil est obligatoire",
    'validation.price_invalid': 'Le prix par jour doit être supérieur à 0',
    'validation.limit_reached': 'Vous ne pouvez ajouter que 10 photos maximum',
    'validation.description_max_chars': 'Vous avez dépassé le nombre maximum de caractères autorisés (500).',
    'validation.instructions_max_chars': 'Vous avez dépassé le nombre maximum de caractères autorisés (300).',
    'validation.price_max_amount': 'Le prix maximum par jour est de 500 GBP.',
    'validation.deposit_max_amount': 'La caution maximale est de 500 GBP.',
    'validation.character_counter': 'Attention: {current}/{max} caractères utilisés.',
    'validation.char_count': '{current}/{max} caractères',

    // Currency names
    'currency.GBP': 'Livre Sterling Britannique',
    'currency.KWD': 'Dinar Koweïtien',
    'currency.SAR': 'Riyal Saoudien',
    'currency.BHD': 'Dinar Bahreïni',
    'currency.OMR': 'Rial Omanais',
    'currency.QAR': 'Riyal Qatarien',
    'currency.AED': 'Dirham des Émirats Arabes Unis',
    'currency.label': 'Devise',

    // Deposit Payment Modal (duplicated keys removed)
    'deposit.modal.description': 'Veuillez payer la caution pour confirmer votre réservation. Ce montant sera remboursé après la période de location si aucun dommage ne survient.',
    'deposit.modal.amount.label': 'Montant de la caution',
    'deposit.modal.payment.title': 'Informations de paiement',
    'deposit.modal.payment.description': 'Entrez les détails de votre carte pour payer la caution',
    'deposit.modal.buttons.cancel': 'Annuler la réservation',
    'deposit.modal.buttons.pay': 'Payer la caution',
    'deposit.modal.buttons.processing': 'Traitement en cours...',
    'deposit.modal.cancel.confirm.title': 'Annuler la réservation ?',
    'deposit.modal.cancel.confirm.message': 'Êtes-vous sûr de vouloir annuler cette réservation ? Cette action ne peut pas être annulée.',
    'deposit.modal.cancel.confirm.yes': 'Oui, annuler',
    'deposit.modal.cancel.confirm.no': 'Conserver la réservation',
    'deposit.modal.success.title': 'Paiement réussi !',
    'deposit.modal.success.message': 'Votre caution a été traitée avec succès. Votre réservation est maintenant confirmée.',
    'deposit.modal.error.payment': 'Échec du paiement. Veuillez réessayer.',
    'deposit.modal.error.cancel': 'Échec de l\'annulation de la réservation. Veuillez réessayer.',
    'deposit.modal.error.generic': 'Une erreur s\'est produite. Veuillez réessayer.',
    'deposit.notification.title': 'Paiement d\'acompte requis',
    'deposit.notification.message': 'Votre réservation commence dans 24 heures. Veuillez payer la caution pour confirmer.',
    'validation.first_name_required': 'Le prénom est obligatoire',
    'validation.last_name_required': 'Le nom de famille est obligatoire',
    'validation.email_required': "L'adresse email est obligatoire",
    'validation.password_required': 'Le mot de passe est obligatoire',
    'validation.terms_required':
      "Vous devez accepter les conditions d'utilisation",
    'validation.privacy_required':
      'Vous devez accepter la politique de confidentialité',
    'register.select_prefix': 'Sélectionnez le préfixe',
    // Contact form validation
    'contact.validation.firstName_required': 'Le prénom est obligatoire.',
    'contact.validation.firstName_min_length':
      'Le prénom doit contenir au moins 2 caractères.',
    'contact.validation.lastName_required': 'Le nom est obligatoire.',
    'contact.validation.lastName_min_length':
      'Le nom doit contenir au moins 2 caractères.',
    'contact.validation.email_required': "L'email est obligatoire.",
    'contact.validation.email_invalid':
      "Le format de l'email n'est pas valide.",
    'contact.validation.phone_invalid':
      "Le format du numéro de téléphone n'est pas valide.",
    'contact.validation.subject_required': 'Le sujet est obligatoire.',
    'contact.validation.subject_min_length':
      'Le sujet doit contenir au moins 5 caractères.',
    'contact.validation.message_required': 'Le message est obligatoire.',
    'contact.validation.message_min_length':
      'Le message doit contenir au moins 10 caractères.',
    'contact.validation.category_required': 'La catégorie est obligatoire.',

    // Contact form categories
    'contact.category.label': 'Catégorie *',
    'contact.category.placeholder': 'Sélectionnez une catégorie',
    'contact.category.technical': 'Technique',
    'contact.category.payment': 'Paiement',
    'contact.category.account': 'Compte',
    'contact.category.dispute': 'Litige',
    'contact.category.suggestion': 'Suggestion',
    'contact.category.other': 'Autre',
    'placeholder.tool_title': 'Ex: Perceuse électrique Bosch Professional',
    'placeholder.brand': 'Ex: Bosch',
    'placeholder.model': 'Ex: GSB 13 RE',
    'placeholder.description':
      'Décrivez votre outil, son état, ses accessoires...',
    'placeholder.address': 'Paris 15ème',
    'placeholder.instructions':
      'Ex: Prévoir une rallonge électrique, nettoyer après usage, manipulation délicate...',
    'loading.categories': 'Chargement...',
    'loading.choose_category_first': "Choisissez d'abord une catégorie",
    'blog.article_not_found': 'Article non trouvé',
    'blog.article_not_found_desc':
      "L'article que vous recherchez n'existe pas ou a été supprimé.",
    'blog.return_to_blog': 'Retour au blog',
    'blog.uncategorized': 'Non catégorisé',
    'errors.tool_not_found': 'Outil non trouvé',
    'errors.start_date_past': 'La date de début ne peut pas être dans le passé',
    'team.bricola': 'Équipe Bricola',

    // Email verification
    'email.verification.title': 'Vérification',
    'email.verification.description': 'Entrez le code de vérification envoyé à',
    'email.resend': 'Renvoyer le code',
    'email.invalid_code': 'Code incorrect',
    'email.resend.message': 'Code renvoyé',
    'email.resend.description':
      'Un nouveau code a été envoyé à votre adresse email',
    'email.valid_code': 'Code vérifié',
    'email.valid_code_message':
      'Code correct, redirection vers la réinitialisation du mot de passe',
    'verification.account_verified': 'Compte Vérifié',
    'verification.success_title': 'Email Vérifié !',
    'verification.success_message':
      'Votre adresse email a été vérifiée avec succès.',
    'verification.title': 'Vérification Email',
    'verification.description':
      'Entrez le code de vérification envoyé à {email}',
    'verification.code_label': 'Code de vérification',
    'verification.code_placeholder': 'Entrez le code à 6 chiffres',
    'verification.verifying': 'Vérification en cours...',
    'verification.verify_button': 'Vérifier le code',
    'verification.no_email': "Vous n'avez pas reçu l'email ?",
    'verification.resending': 'Envoi en cours...',
    'verification.resend_countdown': 'Renvoyer dans {seconds}s',
    'verification.resend_button': 'Renvoyer le code',
    'verification.back_to_login': 'Retour à la connexion',
    'verification.redirecting':
      'Redirection automatique dans quelques secondes...',
    'verification.resent': 'Code renvoyé avec succès',
    'verification.resend_error': "Erreur lors de l'envoi du code",

    // cancelation details
    'cancellation.details.title': "Détails de l'annulation",
    'cancellation.details.reason': 'Raison',
    'cancellation.details.message': 'Message',

    // Download report
    'download.report.title': 'Contrat téléchargé',
    'download.report.description':
      'Le contrat de location a été généré et téléchargé avec succès.',

    // confirm reservation
    'reservation.cancel.title': 'Annuler la réservation',
    'reservation.cancel.reason': 'Sélectionnez une raison',
    'reservation.cancel.reason.other_alternative':
      'Une autre alternative trouvée',
    'reservation.cancel.reason.not_needed': 'Pas besoin de l’outil',
    'reservation.cancel.reason.unavailable': 'Je suis indisponible',
    'reservation.cancel.reason.other': 'Autre',
    'reservation.cancel.message': 'Message complémentaire (optionnel)',
    'reservation.cancel.confirm': 'Confirmer l’annulation',

    'reservation.recap': 'Récapitulatif',
    'reservation.card': 'Carte bancaire',
    'reservation.back_to_details': 'Retour aux détails',
    'reservation.complete_booking': 'Terminer votre réservation',
    'reservation.rental_period': 'Période de location',
    'reservation.start_date': 'Date de début',
    'reservation.select_date': 'Sélectionner une date',
    'reservation.end_date': 'Date de fin',
    'reservation.pickup_time': 'Heure de récupération',
    'reservation.message_to_owner': 'Message au propriétaire(optionnel)',
    'reservation.message_placeholder':
      "Précisez l'usage prévu, vos questions...",
    'reservation.contact_information': 'Informations de contact',
    'reservation.confirm': 'Confirmer la réservation',
    'reservation.payment_method': 'Méthode de paiement',
    'reservation.price_per_day': 'Prix par jour',
    'reservation.number_of_days': 'Nombre de jours',
    'reservation.subtotal': 'Sous-total',
    'reservation.payment_fee': 'Frais de paiement sécurisé',
    'reservation.deposit': 'Caution (remboursable)',
    'reservation.total_amount': 'Total à payer',
    'reservation.included_protection': 'Protection incluse',
    'reservation.insurance_description':
      'Votre location est protégée par notre assurance en cas de dommage.',
    'reservation.confirmation_message':
      "En confirmant, vous acceptez nos conditions de location et notre politique d'annulation.",
    'reservation.confirmed': 'Réservation confirmée',
    'reservation.confirmed_message':
      'Votre réservation pour {{toolName}} a été confirmée. Vous recevrez un email de confirmation.',
    'reservation.refused_title': 'Motif du refus',
    'reservation.refused_reason': 'Sélectionnez une raison :',
    'reservation.refused_reason_maintenance': 'En maintenance',
    'reservation.refused_reason_already_booked': 'Déjà réservé',
    'reservation.refused_reason_other': 'Autre',
    'reservation.refused_message_placeholder': 'Message libre (optionnel)',
    'reservation.refused_confirm': 'Confirmer le refus',
    'reservation.no_reservations': 'Aucune réservation',
    'reservation.no_reservations_message':
      "Vous n'avez aucune réservation pour le moment. Explorez notre catalogue pour trouver des outils à louer.",

    // Calendar legend
    'calendar.legend': 'Légende du calendrier',
    'calendar.reserved_in_progress': 'Réservé/En cours',
    'calendar.pending_accepted': 'En attente/Accepté',
    'calendar.max_5_days': 'Max 5 jours consécutifs',

    // blog
    'blog.title': 'Blog Bricola LTD',
    'blog.description':
      "Découvrez nos conseils, guides et actualités sur l'univers des outils et du bricolage",
    'blog.popular_categories': 'Catégories  populaires',

    'blog.return': 'Retour au blog',
    'blog.share': 'Partager',
    'blog.like': "J'aime",
    'blog.similar_articles': 'Articles similaires',
    'blog.share_article': 'Partager cet article',
    // blog categories
    'blog.subcategory.tools': 'Outils',
    'blog.category.gardening': 'Jardinage',
    'blog.category.maintenance': 'Entretien',
    'blog.category.transport': 'Transport',
    'blog.category.diy': 'Bricolage',
    'blog.category.electricity': 'Électricité',
    'blog.category.lighting': 'Éclairage',
    'blog.category.painting': 'Peinture',
    'blog.category.construction': 'Construction',
    'blog.category.plants': 'Plantes',
    'blog.category.cleaning': 'Nettoyage',
    'blog.category.decoration': 'Décoration',
    'blog.category.guide': 'Guide',
    'blog.category.safety': 'Sécurité',

    // favorites
    'favorites.title': 'Mes Favoris',
    'fav.backhome': 'Retour à l’accueil',
    'fav.nofav': 'Aucun favori pour le moment',
    'fav.text':
      'Explorez notre catalogue et ajoutez vos outils préférés à vos favoris',
    'fav.btnexplore': 'Explorer le catalogue',

    // profile ads
    'ads.delete.success': 'Votre annonce a été bien supprimée.',
    'ads.delete.confirm.title': 'Confirmer la suppression',
    'ads.delete.confirm.description':
      'Êtes-vous sûr de vouloir supprimer cette annonce ? Cette action est irréversible.',
    'ads.view.title': 'Aperçu de l’annonce',
    'ads.rental_conditions': 'Conditions de location',

    'ads.success_message': 'Votre annonce a été modifiée avec succès.',
    'ads.search': 'Rechercher par titre ou catégorie...',
    'ads.update': 'Modifier l’annonce',
    'ads.general_information': 'Informations générales',
    'ads.listing_title': 'Titre de l’annonce',
    'ads.brand': 'Marque',
    'ads.model': 'Modèle',
    'ads.year_of_purchase': "Année d'achat",
    'ads.description': 'Description',
    'ads.description_placeholder':
      'Décrivez votre outil, son état, ses accessoires...',
    'ads.categorization': 'Catégorisation',
    'ads.category': 'Catégorie',
    'ads.sub_category': 'Sous-catégorie',
    'ads.sub_category_placeholder': 'Choisir une sous-catégorie',
    'ads.tool_condition': 'État de l’outil',
    'ads.pricing': 'Tarification',
    'ads.pricing_placeholder': 'Prix par jour (€)',
    'ads.deposit': 'Caution (€)',
    'ads.location': 'Localisation',
    'ads.location_placeholder': 'Adresse ou ville',
    'ads.photos': 'Photos',
    'ads.photos_placeholder':
      'Glissez vos images ici ou cliquez pour parcourir',
    'ads.browse_files': 'Parcourir les fichiers',
    'ads.usage_instructions': 'Consignes d’utilisation',
    'ads.owner_instructions': 'Consignes du propriétaire',
    'ads.owner_instructions_placeholder':
      'Prévoir une rallonge électrique, nettoyer après usage...',

    'claim.sent': 'Réclamation envoyée',
    'claim.sent_message':
      'Votre réclamation a bien été transmise à notre support. Elle sera traitée sous 48h.',
    'claim.in_progress': 'Réclamation en cours',
    // General
    'general.delete.confirm': 'Oui, je veux supprimer',
    'general.back': 'Retour',
    'general.in': 'dans',
    'general.example': 'Ex',
    'general.error': 'Erreur',
    'general.email_already_exists': 'Cette adresse email est déjà utilisée',
    'general.report_error_message':
      'Veuillez sélectionner une raison de signalement.',
    'general.copy_link': 'Copier le lien',
    'general.copy_link_message': 'lien copié !',

    'general.message': 'Message',
    'general.registered_under':
      'Enregistrée en Angleterre et au Pays de Galles sous le numéro : 16401372',
    'general.first_name': 'Prénom',
    'general.first_name_placeholder': 'votre prénom',
    'general.last_name': 'Nom',
    'general.last_name_placeholder': 'votre nom',
    'general.phone': 'Téléphone',
    'general.message_placeholder': 'Votre message...',
    'general.subject_placeholder': 'Sujet de votre message',
    'general.modify': 'Modifier',
    'general.see': 'Voir',
    'general.location': 'Locations',

    'general.published': 'Publié',
    'general.unpublished': 'Non publié',
    'general.view_details': 'Voir détails',
    'general.pending': 'En attente',
    'general.accepted': 'Acceptée',
    'general.ongoing': 'En cours',
    'general.completed': 'Terminée',
    'general.cancelled': 'Annulée',
    'general.declined': 'Refusée',
    'general.all': 'Tous',
    'general.all_periods': 'Toutes les périodes',
    'general.week': 'Cette semaine',
    'general.month': 'Ce mois',
    'general.year': 'Cette année',
    'general.reset': 'Réinitialiser',
    'general.day': 'jour',
    'general.by': 'par',
    'general.to': 'Au',
    'general.from': 'Du',
    'general.cancel': 'Annuler',
    'general.confirm': 'Confirmer',
    'general.report': 'Signaler',
    'general.download_contract': 'Télécharger le contrat',
    'general.hide': 'Masquer',
    'general.copy': 'Copier',
    'general.reference': 'Référence',
    'general.contact': 'Contacter',
    'general.show': 'Afficher',
    'general.confirmed': 'Confirmé',
    'general.rejected': 'Rejeté',
    'general.list': 'Liste',
    'general.grid': 'Grille',
    'general.status': 'Statut',
    'general.public': 'Public',
    'general.categories': 'Catégories',

    // bookings
    'booking.cancelled': 'Réservation annulée',
    'booking.cancelled_message': 'Votre réservation a été annulée avec succès.',
    'booking.wait': 'En attente de confirmation de remise par le propriétaire.',
    'booking.report.title': 'Signaler un problème',
    'booking.report.reason': 'Sélectionnez une raison',
    'booking.report.reason.no_answer': 'Ne répond pas',
    'booking.report.reason.wrong_number': 'Numéro incorrect',
    'booking.report.reason.inappropriate_behavior': 'Comportement inapproprié',
    'booking.report.reason.other': 'Autre',
    'booking.report.describe': 'Décrivez le problème',
    'booking.report.submit': 'Envoyer le signalement',

    'tool.return.title': 'Confirmer le retour de l’outil',
    'tool.return.option': 'Choisissez une option :',
    'tool.return.confirm': 'Je confirme que j’ai rendu l’outil',
    'tool.return.report': 'Signaler un problème',
    'tool.return.confirmed': 'Retour confirmé',
    'tool.return.confirmed_message':
      'Vous avez confirmé avoir rendu l’outil. En attente de confirmation de remise par le propriétaire.',

    'code.copied': 'Code copié',
    'code.copied_message':
      'Le code de validation a été copié dans le presse-papiers.',

    'booking.title': 'Mes Réservations',
    'booking.tool_returned': "J'ai rendu l'outil",
    'booking.search': "Rechercher par titre d'annonce...",
    'booking.verification_code': 'Code de vérification',
    'booking.present_code':
      "Présentez ce code au propriétaire lors de la récupération de l'outil le premier jour.",
    'booking.owner': 'Propriétaire',
    'booking.status.pending': 'En attente',
    'booking.status.confirmed': 'Confirmée',
    'booking.status.active': 'Active',
    'booking.status.completed': 'Terminée',
    'booking.status.cancelled': 'Annulée',
    'booking.confirm_return': 'Confirmer le retour',
    'booking.claim_in_progress': 'Réclamation en cours',
    'booking.download_contract': 'Télécharger le contrat',
    'booking.validation_code': 'Code de validation',
    'booking.cancelled_on': 'Annulée le',
    'booking.cancellation_reason': 'Raison',
    'booking.retry': 'Réessayer',
    'booking.cancel_reservation': 'Annuler',
    'booking.cancellation_title': 'Annuler la réservation',
    'booking.cancellation_reason_label': "Raison de l'annulation",
    'booking.cancellation_reason_placeholder': 'Sélectionnez une raison',
    'booking.cancellation_reasons.schedule_conflict': "Conflit d'horaire",
    'booking.cancellation_reasons.no_longer_needed': 'Plus besoin',
    'booking.cancellation_reasons.found_alternative': 'Trouvé une alternative',
    'booking.cancellation_reasons.other': 'Autre',
    'booking.cancellation_message_label': 'Message (optionnel)',
    'booking.cancellation_message_placeholder':
      'Expliquez la raison de votre annulation...',
    'booking.confirm_cancellation': "Confirmer l'annulation",
    'booking.claim_title': 'Signaler un problème',
    'booking.claim_type_label': 'Type de problème',
    'booking.claim_type_placeholder': 'Sélectionnez le type de problème',
    'booking.claim_types.damage': 'Outil endommagé',
    'booking.claim_types.missing_parts': 'Pièces manquantes',
    'booking.claim_types.not_working': 'Outil ne fonctionne pas',
    'booking.claim_types.dirty': 'Outil sale/non nettoyé',
    'booking.claim_types.other': 'Autre',
    'booking.claim_description_label': 'Description du problème',
    'booking.claim_description_placeholder':
      'Décrivez le problème en détail...',
    'booking.claim_upload_text':
      'Glissez vos fichiers ici ou cliquez pour sélectionner',
    'booking.claim_upload_hint': 'Images ou vidéos (max 10MB)',
    'booking.submit_claim': 'Envoyer la réclamation',
    'tool.return.confirm_title': "Confirmer le retour de l'outil",
    'tool.return.confirm_message':
      'Êtes-vous sûr de vouloir confirmer le retour de cet outil ?',
    'tool.return.report_issue': 'Signaler un problème',
    'tool.returned': 'outils récupérés',
    // pagination
    'pagination.next': 'Suivant',
    'pagination.previous': 'Précédent',

    // Messages de succès harmonisés
    'success.reservation.confirmed.title': '✅ Réservation confirmée !',
    'success.reservation.confirmed.message':
      'Votre réservation a été confirmée avec succès. Vous recevrez un email de confirmation.',

    'success.reservation.cancelled.title': '✅ Réservation annulée',
    'success.reservation.cancelled.message':
      'Votre réservation a été annulée avec succès. Vous recevrez un email de confirmation.',

    'success.report.sent.title': '✅ Signalement envoyé',
    'success.report.sent.message':
      'Votre signalement a été transmis avec succès à notre équipe. Nous traiterons votre demande dans les plus brefs délais.',

    'success.tool.return.confirmed.title': '✅ Retour confirmé',
    'success.tool.return.confirmed.message':
      "Vous avez confirmé le retour de l'outil avec succès. Le propriétaire sera notifié.",

    // requests
    'request.refuse': 'Demande refusée',
    'request.refuse.message': "Le refus a été transmis à l'administration.",
    'request.report.accepted.title': 'Signalement envoyé',
    'request.report.accepted.message':
      "Votre signalement a été transmis à l'administration.",

    'request.accepted.title': 'Demande acceptée',
    'request.accepted.message':
      "La demande de location a été acceptée. Vous pouvez maintenant confirmer la remise de l'outil.",

    'request.pickup_confirm_button': 'Récupération de l’outil',
    'request.title': 'Mes Demandes',
    'request.search': "Rechercher par titre d'annonce...",
    'request.all': 'Tous',
    'request.pending': 'En attente',
    'request.accepted': 'Acceptée',
    'request.ongoing': 'En cours',
    'request.completed': 'Terminée',
    'request.cancelled': 'Annulée',
    'request.declined': 'Refusée',
    'request.all_periods': 'Toutes les périodes',
    'request.week': 'Cette semaine',
    'request.month': 'Ce mois',
    'request.year': 'Cette année',
    'request.reset': 'Réinitialiser',
    'request.results_found': 'Résultats trouvés',
    'request.day': 'jour',
    'request.by': 'par',
    'request.reference': 'Référence',
    'request.pickup_time': 'Heure de récupération',
    'request.from': 'Du',
    'request.to': 'Au',
    'request.accept': 'Accepter',
    'request.decline': 'Refuser',
    'request.cancel': 'Annuler',
    'request.report': 'Signaler',
    'request.download_contract': 'Télécharger le contrat',
    'request.validation_code': 'Code de validation :',
    'request.enter_code': 'Entrez le code',
    'request.confirm': 'Confirmer',
    'request.contact': 'Contacter',
    'request.confirm_acceptence': "Confirmer l'acceptation",
    'request.confirm_acceptence_message':
      'Êtes-vous sûr de vouloir accepter cette demande de location ?',
    'request.validation_code_accepted': 'Remise confirmée',
    'request.validation_code_accepted_message':
      "L'outil a été remis avec succès. Le statut passe à 'En cours'.",
    'request.validation_code_rejected': 'Code invalide',
    'request.validation_code_rejected_message':
      'Le code de validation est incorrect.',
    'request.contact_renter_information': 'Informations du locataire',
    'request.contact_owner_information': 'Informations du propriétaire',
    'request.call': 'Appeler',
    'request.mail': 'E-mail',

    'request.pickup_confirm_title': 'Confirmer la récupération',
    'request.pickup_confirm_message1':
      'Voulez-vous vraiment confirmer la bonne réception de votre outil, sans déclaration de problème ?',
    'request.pickup_confirm_message2':
      'Si vous avez rencontré un souci, cliquez sur le lien "Signaler un problème"',
    'request.pickup_confirm': 'Oui, je confirme la bonne réception',
    'request.pickup_report': 'Signaler un problème',

    'request.report.title': 'Signaler un problème',
    'request.report.reason': 'Sélectionnez une raison',
    'request.report.reason.no_show': 'Locataire ne se présente pas',
    'request.report.reason.damaged_tool': 'Outil retourné endommagé',
    'request.report.reason.late_return': 'Retard de restitution',
    'request.report.reason.inappropriate_behavior': 'Comportement inapproprié',
    'request.report.reason.fraud_attempt': 'Tentative de fraude',
    'request.report.reason.other': 'Autre problème',
    'request.report.describe': 'Décrivez le problème',
    'request.report.submit': 'Envoyer le signalement',

    'request.claim.reason': 'Type de problème',
    'request.claim.reason_placeholder': 'Sélectionnez le type de problème',
    'request.claim.reason.damaged_tool': 'Outil endommagé',
    'request.claim.reason.no_showup': 'Locataire ne se présente pas',
    'request.claim.reason.late_return': 'Retard de restitution',
    'request.claim.reason.inappropriate_behavior': 'Comportement inapproprié',
    'request.claim.reason.fraud_attempt': 'Tentative de fraude',
    'request.claim.reason.missing_parts': 'Pièces manquantes',
    'request.claim.reason.not_working': 'Outil ne fonctionne pas',
    'request.claim.reason.other': 'Autre',
    'request.claim.evidence': 'Pièces justificatives',
    'request.claim.evidence_placeholder':
      'Glissez vos fichiers ici ou cliquez pour sélectionner',
    'request.claim.evidence_limit': 'Images ou vidéos (max 10MB)',
    'request.claim.describe': 'Décrivez le problème',
    'request.claim.describe_placeholder': 'Décrivez le problème rencontré...',
    'request.claim.submit': 'Envoyer la réclamation',
    'requests.cancellationDetails': "Détails de l'annulation",
    'request.message': 'Message',
    'request.reason': 'Raison',

    // catalog section
    'catalog_section.title': 'Outils trouvés',
    'catalog_section.by': 'Par',
    'catalog_section.category': 'Catégorie',
    'catalog_section.sort_by': 'Trier par',
    'catalog_section.most_recent': 'Plus récents',
    'catalog_section.price_low_to_high': 'Prix croissant',
    'catalog_section.price_high_to_low': 'Prix décroissant',
    'catalog_section.top_rated': 'Mieux notés',
    'catalog_section.filters': 'Filtres',
    'catalog_section.search': 'Recherche',
    'catalog_section.tool_name': "Nom de l'outil",
    'catalog_section.location': 'Localisation',
    'catalog_section.all_categories': 'Toutes les catégories',
    'catalog_section.sub_category': 'Sous-catégorie',
    'catalog_section.all_sub_categories': 'Toutes les sous-catégories',
    'catalog_section.daily_price': 'Prix par jour',
    'catalog_section.apply_filters': 'Appliquer les filtres',

    // blog section
    'blog_section.title': 'Derniers articles du blog',
    'blog_section.description':
      'Découvrez nos conseils, guides et actualités pour réussir tous vos projets de bricolage',
    'blog_section.min': 'min',
    'blog_section.read_article': "Lire l'article",
    'blog_section.view_all': 'Voir tous les articles',

    // customer reviews
    'customer_reviews.title': 'Avis de nos clients',
    'customer_reviews.description':
      'Découvrez ce que nos utilisateurs pensent de notre plateforme',

    // rental process
    'rental_process.title': 'Comment ça marche ?',
    'rental_process.description':
      'Louez vos outils en 4 étapes simples et commencez à générer des revenus',
    'rental_process.step1.title': 'Publiez votre annonce en quelques clics',
    'rental_process.step1.description':
      'Ajoutez vos outils avec photos et description détaillée en quelques minutes seulement.',
    'rental_process.step2.title': 'Maximisez votre visibilité',
    'rental_process.step2.description':
      "Votre annonce est visible par des milliers d'utilisateurs à la recherche d'outils.",
    'rental_process.step3.title': 'Recevez vos premières réservations',
    'rental_process.step3.description':
      'Les locataires vous contactent directement pour réserver vos outils aux dates souhaitées.',
    'rental_process.step4.title': 'Percevez vos revenus en toute sérénité',
    'rental_process.step4.description':
      'Recevez vos paiements de manière sécurisée et générez des revenus supplémentaires.',

    // Profile translations (some already added from ProfileInfo)
    'profile.first_name': 'Prénom',
    'profile.last_name': 'Nom',
    'profile.email': 'Email',
    'profile.phone': 'Téléphone',
    'profile.country': 'Pays',
    'profile.address': 'Adresse',
    'profile.edit_profile_photo':
      'Cliquez sur "Modifier" pour changer votre photo de profil',
    'profile.verified': 'Vérifié',
    'profile.account_type_individual': 'Particulier',
    'profile.account_type_company': 'Entreprise',
    'profile.average_rating': 'Note moyenne',
    'profile.rentals_completed': 'Locations réalisées',
    'profile.active_ads': 'Annonces actives',
    'profile.total_earnings': 'Gains totaux',
    'profile.delete_account': 'Supprimer mon compte',
    'profile.back_home': "Retour à l'accueil",
    'profile.profile': 'Profil',
    'profile.favorites': 'Favoris',
    'profile.ads': 'Annonces',
    'profile.reservations': 'Réservations',
    'profile.requests': 'Demandes',
    'profile.wallet': 'Portefeuille',
    'profile.edit': 'Modifier',
    'profile.member_since': 'Membre depuis {date}',
    'profile.select_country': 'Sélectionnez un pays',
    'profile.address_placeholder': 'Saisissez votre adresse complète',
    'profile.address_hint':
      'Saisissez une adresse valide compatible avec Google Maps',
    'profile.delete_confirm': 'Confirmez-vous la suppression de votre compte ?',
    'profile.delete_description':
      'Cette action est irréversible. Toutes vos données, annonces, réservations et historique de transactions seront définitivement supprimés.',
    'profile.account_deletion_pending': 'Compte en attente de suppression',
    'profile.delete_processing':
      "Votre demande sera traitée sous 72h, le temps pour notre équipe de vérifier qu'aucune réclamation ou litige en cours n'est rattaché à votre compte.",
    'profile.current_password': 'Mot de passe actuel',
    'profile.new_password': 'Nouveau mot de passe',

    // Action translations (assuming these exist from previous context)
    'action.cancel': 'Annuler',
    'action.confirm': 'Confirmer',

    // Wallet translations
    'wallet.title': 'Mon Portefeuille',
    'wallet.total': 'Total',
    'wallet.cumulative_balance': 'Solde cumulé',
    'wallet.available': 'Disponible',
    'wallet.available_balance': 'Solde disponible',
    'wallet.successful': 'Réussies',
    'wallet.successful_transactions': 'Transactions réussies',
    'wallet.withdraw_money': 'Retirer mon argent',
    'wallet.withdrawal_note':
      'Vous pouvez retirer votre argent à partir du moment où votre solde cumulé atteint 50 GBP.',
    'wallet.conversion_rate': '50 GBP = {minWithdrawalEUR} EUR',
    'wallet.dynamic_conversion':
      "Le taux de conversion s'actualise dynamiquement en fonction de la devise choisie dans le compte.",

    // recent transactions
    'wallet.recent_transactions': 'Transactions récentes',
    'wallet.select_time_period': 'Sélectionnez une période',
    'wallet.all_transactions': 'Toutes les transactions',
    'wallet.incoming_payments': 'Receptions',
    'wallet.withdrawal': 'Retrait',
    'wallet.reset': 'Réinitialiser',
    'wallet.completed': 'Terminée',
    'wallet.pending': 'En attente',
    'wallet.failed': 'Échouée',

    // New FAQ translations
    'faq.hero.title': 'Questions Fréquentes',
    'faq.hero.subtitle':
      'Trouvez rapidement les réponses à vos questions les plus courantes',
    'faq.title': 'Questions générales',
    'faq.general.q1': 'Qu’est-ce que Bricola et comment ça fonctionne ?',
    'faq.general.a1':
      "Bricola LTD est une plateforme de location d’outils entre particuliers. Les utilisateurs peuvent proposer leurs outils à la location ou en louer auprès d'autres membres. La plateforme gère les paiements, les cautions et les litiges.",
    'faq.general.q2': 'Quelles catégories d’outils peut-on proposer ?',
    'faq.general.a2':
      'Actuellement, Bricola prend en charge les outils de bricolage, jardinage, nettoyage et ceux liés aux événements. D’autres catégories pourront être ajoutées selon les besoins du marché.',
    'faq.general.q3': 'Existe-t-il une application mobile Bricola ?',
    'faq.general.a3':
      'Oui. Bricola est disponible sur iOS et Android, en plus de la version complète du site web.',
    'faq.general.q4': 'Puis-je utiliser Bricola depuis n’importe quel pays ?',
    'faq.general.a4':
      'Pour le moment, Bricola est disponible uniquement dans la région du Golfe. Une expansion est prévue prochainement.',
    'faq.general.q5': 'Les entreprises peuvent-elles proposer des outils ?',
    'faq.general.a5':
      'Oui, mais Bricola est principalement destiné aux particuliers. Les professionnels doivent respecter les lois et réglementations locales en vigueur.',
    'faq.general.q6': 'Quels objets sont interdits ?',
    'faq.general.a6':
      'Sont interdits : les objets illégaux, les équipements dangereux ou non conformes aux normes de sécurité.',
    'faq.general.q7': 'Puis-je suggérer une fonctionnalité ?',
    'faq.general.a7':
      'Oui, vos suggestions sont les bienvenues. Contactez notre support pour nous faire part de votre idée, nous l’étudierons pour les prochaines mises à jour.',
    'faq.general.q8': 'Comment contacter le service client ?',
    'faq.general.a8':
      'Utilisez le chat WhatsApp ou envoyez-nous un email à : support@bricolaltd.com. Notre équipe est disponible 7 jours sur 7.',
    'faq.renters.title': 'Pour les locataires',
    'faq.renters.q1': 'Comment créer un compte ?',
    'faq.renters.a1':
      'Il suffit de s’inscrire avec votre nom, votre email, votre numéro de téléphone et, si nécessaire, vos documents de vérification. Vous devrez confirmer votre numéro et votre adresse email.',
    'faq.renters.q2': 'Pourquoi la vérification d’identité est-elle demandée ?',
    'faq.renters.a2':
      'Pour garantir la sécurité et la confiance sur la plateforme, une vérification d’identité peut être exigée avant de louer des outils de grande valeur ou d’effectuer des retraits importants.',
    'faq.renters.q3': 'Que dois-je faire avant de recevoir un outil ?',
    'faq.renters.a3':
      'Assurez-vous de fournir une pièce d’identité valide, respectez les conditions de location, et examinez l’outil avec le propriétaire à la remise.',
    'faq.renters.q4':
      'Que faire si l’outil est endommagé pendant la location ?',
    'faq.renters.a4':
      'Informez immédiatement le propriétaire et le support. Des preuves peuvent être demandées pour activer un recours via la caution.',
    'faq.owners.title': 'Pour les propriétaires',
    'faq.owners.q1': 'Comment proposer un outil à la location ?',
    'faq.owners.a1':
      'Cliquez sur « Proposer un outil », téléchargez des photos claires, ajoutez une description, précisez l’état de l’outil, les garanties éventuelles, le prix par jour et le montant de la caution.',
    'faq.owners.q2': 'Que se passe-t-il après avoir proposé mon outil ?',
    'faq.owners.a2':
      'L’annonce sera d’abord vérifiée par notre équipe de modération. Vous serez ensuite notifié dès qu’un utilisateur effectue une réservation.',
    'faq.owners.q3': 'Puis-je refuser une demande de réservation ?',
    'faq.owners.a3':
      'Oui, le propriétaire peut accepter ou refuser une demande. Cependant, un trop grand nombre de refus sans justification peut nuire à la visibilité de vos annonces.',
    'faq.owners.q4':
      'Que dois-je faire avant de remettre l’outil au locataire ?',
    'faq.owners.a4':
      'Vérifiez l’identité du locataire, prenez des photos de l’état de l’outil, et convenez ensemble des conditions de retour.',
    'faq.owners.q5': 'Que faire si mon outil est endommagé ?',
    'faq.owners.a5':
      'Envoyez des preuves dans les 24 heures suivant le retour. L’équipe Bricola examinera le dossier et pourra décider d’un remboursement à partir de la caution.',
    'faq.owners.q6': 'Y a-t-il une assurance sur les outils proposés ?',
    'faq.owners.a6':
      'Non, Bricola ne propose pas encore d’assurance. Il est recommandé de ne proposer que les outils que vous êtes prêt à prêter en toute sécurité.',
    'faq.payment.title': 'Paiement et sécurité',
    'faq.payment.q1': 'Comment se passent les paiements ?',
    'faq.payment.a1':
      'Les paiements sont traités de manière sécurisée via Stripe. Le locataire paie à l’avance, y compris la caution.',
    'faq.payment.q2': 'Qu’est-ce que la caution ?',
    'faq.payment.a2':
      'Il s’agit d’un montant remboursable, conservé par Stripe pour couvrir d’éventuels dommages ou non-retours. Il est automatiquement restitué après le bon retour de l’outil.',
    'faq.payment.q3': 'Comment retirer mes gains ?',
    'faq.payment.a3':
      'Vous pouvez demander un virement vers votre compte bancaire via Wise.',
    'faq.payment.q4': 'Quels sont les frais appliqués par Bricola ?',
    'faq.payment.a4':
      'Bricola prélève une commission de 15 % sur chaque location réussie. Aucun frais d’inscription ou abonnement mensuel.',
    'faq.payment.q5': 'Comment sont traités les litiges ?',
    'faq.payment.a5':
      'Tous les litiges sont gérés par notre équipe d’assistance dans un délai de 72 heures. Leur décision est finale.',
    'faq.payment.q6': 'Quelles mesures de sécurité sont mises en place ?',
    'faq.payment.a6':
      'Vérification d’identité, évaluations utilisateurs, paiements sécurisés et surveillance par notre support assurent un environnement fiable.',

    // Navigation
    'nav.home': 'Accueil',
    'nav.catalog': 'Catalogue',
    'nav.navigation': 'navigation',
    'nav.propos': 'À propos',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact',
    'nav.rent': 'Louer',
    'nav.list': 'Proposer un outil',
    'nav.login': 'Connexion',
    'nav.signup': 'Inscription',
    'nav.profile': 'Profil',
    'nav.wallet': 'Portefeuille',
    'nav.settings': 'Paramètres',
    'nav.logout': 'Déconnexion',

    // Hero section
    'hero.title': 'Louez et partagez vos outils en toute simplicité',
    'hero.subtitle':
      "La plateforme qui connecte les propriétaires d'outils avec ceux qui en ont besoin. Particuliers et professionnels, trouvez l'outil parfait près de chez vous.",
    'hero.search.placeholder': 'Rechercher un outil...',
    'hero.search.location': 'Localisation',
    'hero.search.button': 'Rechercher',
    'hero.available_tools': 'Outils disponibles',
    'hero.active_users': 'Utilisateurs actifs',
    'hero.cities_covered': 'Villes couvertes',

    // Categories
    'categories.title': 'Nos catégories',
    'categories.description': "Trouvez l'outil parfait selon vos besoins",

    'categories.gardening': 'Jardinage',
    'subcategories.lawn-mowers': 'Tondeuses',
    'subcategories.hedge-trimmers': 'Taille-haies',
    'subcategories.pruning-tools': 'Outils de taille',
    'subcategories.watering': 'Arrosage',
    'subcategories.garden-hand-tools': 'Outils manuels',
    'subcategories.soil-maintenance': 'Entretien du sol',
    'subcategories.plant-care': 'Entretien des plantes',
    'subcategories.pruning-and-cutting': 'Taille et coupe',
    'subcategories.cleaning-and-collection': 'Nettoyage et ramassage',
    'subcategories.watering-and-irrigation': 'Arrosage et irrigation',

    'categories.cleaning': 'Nettoyage',
    'subcategories.vacuum-cleaners': 'Aspirateurs',
    'subcategories.pressure-washers': 'Nettoyeurs haute pression',
    'subcategories.floor-care': 'Entretien des sols',
    'subcategories.cleaning-supplies': 'Produits de nettoyage',
    'subcategories.indoor-cleaning': 'Nettoyage intérieur',
    'subcategories.outdoor-cleaning': 'Nettoyage extérieur',
    'subcategories.waste-management': 'Gestion des déchets et poussière',

    'categories.diy': 'Bricolage',
    'subcategories.power-tools': 'Outils électroportatifs',
    'subcategories.hand-tools': 'Outils manuels',
    'subcategories.measuring-tools': 'Outils de mesure',
    'subcategories.painting': 'Peinture',
    'subcategories.construction': 'Construction',
    'subcategories.electricity': 'Électricité',
    'subcategories.screws-and-bolts': 'Vis et boulons',

    'categories.events': 'Événementiel',
    'subcategories.party-equipment': 'Équipement de fête',
    'subcategories.sound-lighting': 'Son et lumière',
    'subcategories.event-decoration': 'Décoration',
    'subcategories.catering-equipment': 'Matériel de restauration',

    'subcategories.sound': 'Son',
    'subcategories.lighting': 'Éclairage',
    'subcategories.cooking': 'Cuisine',
    'subcategories.entertainment': 'Animation et jeux',
    'subcategories.decoration': 'Décoration',
    'subcategories.furniture': 'Mobilier',
    'subcategories.structure': 'Structure',

    'categories.transport': 'Transport',

    // Tools
    'tools.featured': 'Outils en vedette',
    'tools.description':
      'Les outils les mieux notés et les plus demandés de notre communauté',
    'tools.day': 'jour',
    'tools.display_all': 'Voir tous les outils',
    'tools.by': 'par',
    'tools.available': 'Disponible',
    'tools.rent': 'Louer',
    'tools.details': 'Voir détails',
    'tools.new_ad': 'Nouvelle annonce',
    'tools.my_ads': 'Mes annonces',
    'tools.edit': 'Modifier',
    'tools.view': 'Voir',
    'tools.delete': 'Supprimer',
    'tools.published': 'Publié',
    'tools.unpublished': 'Non publié',
    'tools.pending': 'En attente',
    'tools.approved': 'Approuvé',
    'tools.rejected': 'Rejeté',
    'tools.back_to_results': 'Retour aux résultats',
    'tools.verified': 'Vérifié',
    'tools.owner': 'Propriétaire',
    'tools.model': 'Modèle',
    'tools.brand': 'Marque',
    'tools.year_of_purchase': "Année d'achat",
    'tools.fees_and_taxes': 'Incluant taxes et frais',
    'tools.of': 'des',
    'tools.charged': 'saisis par le loueur',
    'tools.deposit': 'Caution',
    'tools.refunded': '(remboursée en fin de location)',
    'tools.rent_now': 'Louer maintenant',
    'tools.add_to_favorites': 'Ajouter aux favoris',
    'tools.desc': 'Description',
    'tools.remove_from_favorites': 'Retirer des favoris',
    'tools.instructions': 'Consigne du propriétaire',
    'tools.reviews': 'Avis des locataires',
    'tools.condition_new': 'Neuf',
    'tools.condition_like_new': 'Comme neuf',
    'tools.condition_good': 'Bon état',
    'tools.condition_fair': 'État correct',
    'tools.condition_poor': 'Mauvais état',
    'tools.condition_unknown': 'Inconnu',

    // Forms
    'form.first_name': 'Prénom',
    'form.last_name': 'Nom',
    'form.email': 'Email',
    'form.phone': 'Téléphone',
    'form.address': 'Adresse',
    'form.country': 'Pays',
    'form.password': 'Mot de passe',
    'form.confirm_password': 'Confirmer le mot de passe',
    'form.title': 'Titre',
    'form.description': 'Description',
    'form.price': 'Prix',
    'form.category': 'Catégorie',
    'form.location': 'Localisation',

    // Actions
    'action.search': 'Rechercher',
    'action.filter': 'Filtrer',
    'action.sort': 'Trier',
    'action.save': 'Enregistrer',
    'action.delete': 'Supprimer',
    'action.edit': 'Modifier',
    'action.view': 'Voir',
    'action.contact': 'Contacter',
    'action.close': 'Fermer',
    'action.back': 'Retour',
    'action.next': 'Suivant',
    'action.previous': 'Précédent',

    // Floating Action Button
    'fab.contact_support': 'Contacter le support',
    'fab.publish_ad': 'Publier une annonce',
    'fab.find_tool': 'Trouver mon outil',

    // Messages
    'message.success': 'Succès',
    'message.error': 'Erreur',
    'message.loading': 'Chargement...',
    'message.no_results': 'Aucun résultat trouvé',
    'message.confirm_delete': 'Êtes-vous sûr de vouloir supprimer ?',

    // Footer
    'footer.about': 'À propos',
    'footer.help': 'Aide',
    'footer.discover': 'Découvrir Bricola LTD',
    'footer.useful_links': 'Liens utiles',
    'footer.contact': 'Contact',
    'footer.legal': 'Mentions légales',
    'footer.rights': 'Tous droits réservés',
    'footer.cgu': 'CGU',
    'footer.privacy': 'Politique de confidentialité',
    'footer.faq': 'FAQ',
    'footer.description':
      "La plateforme de location d'outils qui met en relation les propriétaires avec ceux qui en ont besoin. Simple, sécurisée et locale. « www.bricolaltd.com » est une marque déposée de BRICOLA LTD. Enregistrée en Angleterre et au Pays de Galles sous le numéro : 16401372.",
    'footer.contrat': 'Contrat de location', // Added
    'footer.payment': 'Modes de paiement', // Added
    'footer.help_center': "Centre d'assistance", // Added
    'footer.owner_guide': 'Guide du loueur', // Added
    'footer.renter_guide': 'Guide du locataire', // Added
    'footer.terms_conditions': 'CGU', // Added (synonym for footer.cgu)
    // Login
    'login.title': 'Connexion',
    'login.subtitle': 'Connectez-vous à votre compte Bricola LTD',
    'login.email': 'Email',
    'login.password': 'Mot de passe',
    'login.signin': 'Se connecter',
    'login.no_account': "Pas encore de compte ? S'inscrire",
    'login.forgot_password': 'Mot de passe oublié ?',

    // Register
    'register.title': 'Inscription',
    'register.subtitle': 'Créez votre compte Bricola LTD',
    'register.user_type': "Type d'utilisateur",
    'register.individual': 'Particulier',
    'register.business': 'Entreprise',
    'register.first_name': 'Prénom',
    'register.last_name': 'Nom',
    'register.phone': 'Téléphone',
    'register.country': 'Pays',
    'register.address': 'Adresse',
    'register.address_help': 'Adresse complète avec code postal et ville',
    'register.password': 'Mot de passe',
    'register.confirm_password': 'Confirmer le mot de passe',
    'register.terms': "J'accepte les conditions Générales d'utilisation",
    'register.sales_conditions': "J'accepte la Politique de confidentialité",
    'register.create_account': 'Créer mon compte',
    'register.have_account': 'Déjà un compte ? Se connecter',
    'register.select_country': 'Sélectionnez un pays',

    // About
    'about.title': 'Bienvenue chez Bricola LTD',
    'about.subtitle':
      'Votre plateforme de confiance pour la location d’outils entre particuliers dans toute la région du Golfe.',
    'about.mission_title': 'Notre Mission',
    'about.mission_1':
      'Bricola LTD est une plateforme innovante, enregistrée au Royaume-Uni depuis 2025, qui offre un service 100 % digital permettant aux particuliers de louer facilement et en toute sécurité des outils entre eux.',
    'about.mission_2':
      'L’idée est née d’un constat simple : beaucoup de personnes possèdent des outils qu’elles utilisent rarement, tandis que d’autres ont besoin d’outils de qualité sans vouloir investir dans un achat coûteux. Nous avons donc créé une solution pratique et efficace pour rapprocher ces deux besoins.',
    'about.mission_3':
      'Nos services permettent de mettre en relation, via une application mobile et un site web simples d’utilisation, ceux qui cherchent des outils pour l’entretien de la maison, les projets de bricolage, le jardinage, le nettoyage ou l’organisation d’événements, avec des propriétaires d’outils proches de chez eux.',
    'about.mission_4':
      'Grâce à notre plateforme, chaque utilisateur peut proposer ses outils à la location en ajoutant toutes les informations nécessaires (photos, description, prix, caution), pour une courte ou longue durée. Les paiements se font via un système sécurisé et entièrement intégré.',
    'about.advantages': 'Nos atouts :',
    'about.advantages_1':
      'Une solution économique qui réduit le gaspillage et encourage la durabilité.',
    'about.advantages_2':
      'Un moyen rapide et simple de trouver l’outil qu’il faut en quelques minutes.',
    'about.advantages_3':
      'Un système de paiement sécurisé avec protection intégrée pour chaque transaction.',
    'about.advantages_4':
      'Une expérience transparente qui instaure la confiance entre loueurs et locataires.',
    'about.mission_5':
      'Choisir Bricola LTD, c’est économiser du temps et de l’argent, obtenir ce dont vous avez besoin de façon intelligente et durable, tout en participant à construire l’avenir de la location d’outils dans la région du Golfe.',
    'about.mission_6': 'Merci de faire partie de la communauté Bricola.',
    'about.values_title': 'Nos Valeurs',
    'about.community': 'Communauté',
    'about.community_desc':
      "Créer des liens entre voisins et favoriser l'entraide locale",
    'about.security': 'Sécurité',
    'about.security_desc':
      'Garantir des transactions sécurisées et une assurance complète',
    'about.quality': 'Qualité',
    'about.quality_desc':
      "S'assurer que tous les outils respectent nos standards de qualité",
    'about.simplicity': 'Simplicité',
    'about.simplicity_desc':
      "Rendre la location d'outils aussi simple qu'un clic",
    'about.stats_title': 'Bricola en chiffres',
    'about.tools_available': 'Outils disponibles',
    'about.active_users': 'Utilisateurs actifs',
    'about.cities_covered': 'Villes couvertes',
    'about.satisfaction': 'Satisfaction client',
    'about.team_title': 'Notre Équipe',
    'about.founder.name': 'Adel Jebali',
    'about.founder.role': 'CEO et Fondateur',
    'about.founder.bio':
      'Ph.D in Computer Science | Cybersecurity & Resiliency Consultant',

    // Contact
    'contact.title': 'Contactez-nous',
    'contact.subtitle':
      "Une question, un problème ou simplement envie d'échanger ? Notre équipe est là pour vous aider.",
    'contact.form_title': 'Envoyez-nous un message',
    'contact.first_name': 'Prénom',
    'contact.last_name': 'Nom',
    'contact.subject': 'Sujet',
    'contact.message': 'Message',
    'contact.phone': 'Téléphone',
    'contact.phone_placeholder': '+33 1 23 45 67 89',
    'contact.sending': 'Envoi en cours...',
    'contact.send': 'Envoyer le message',
    'contact.error_title': 'Erreur',
    'contact.error_message':
      "Une erreur est survenue lors de l'envoi de votre message. Veuillez réessayer.",
    'contact.success_title': 'Message envoyé !',
    'contact.success_message':
      'Votre message a été envoyé avec succès. Nous vous répondrons dans les plus brefs délais.',
    'contact.email_title': 'Email',
    'contact.phone_title': 'Téléphone',
    'contact.address_title': 'Adresse',
    'contact.hours_title': 'Horaires',
    'contact.hours_weekdays': 'Lundi - Vendredi : 9h00 - 18h00',
    'contact.hours_saturday': 'Samedi : 10h00 - 16h00',
    'contact.hours_sunday': 'Dimanche : Fermé',
    'contact.faq_title': 'Questions fréquentes',
    'contact.how_to_rent': 'Comment louer un outil ?',
    'contact.how_to_rent_answer':
      "Recherchez l'outil souhaité, sélectionnez les dates de location, et confirmez votre réservation. C'est aussi simple que ça !",
    'contact.problem': 'Que faire en cas de problème ?',
    'contact.problem_answer':
      'Contactez-nous immédiatement via notre support client. Nous sommes là pour résoudre tous vos problèmes rapidement.',
    'contact.how_to_list': 'Comment proposer mes outils ?',
    'contact.how_to_list_answer':
      'Cliquez sur "Proposer un outil" dans la navigation, ajoutez les détails et photos de votre outil, et commencez à gagner de l\'argent.',
    'contact.insurance': 'Les outils sont-ils assurés ?',
    'contact.insurance_answer':
      "Oui, tous les outils loués via Bricola sont couverts par notre assurance complète pour votre tranquillité d'esprit.",

    // Add Tool
    'add_tool.title': 'Proposer un outil',
    'add_tool.subtitle':
      'Partagez vos outils avec la communauté et générez des revenus en les louant facilement',
    'add_tool.info_title': "Informations de l'outil",
    'add_tool.general_info': 'Informations générales',
    'add_tool.ad_title': "Titre de l'annonce",
    'add_tool.brand': 'Marque',
    'add_tool.model': 'Modèle',
    'add_tool.year': "Année d'achat",
    'add_tool.description': 'Description',
    'add_tool.categorization': 'Catégorisation',
    'add_tool.category': 'Catégorie',
    'add_tool.subcategory': 'Sous-catégorie',
    'add_tool.condition': "État de l'outil",
    'add_tool.pricing': 'Tarification',
    'add_tool.price_per_day': 'Prix par jour ',
    'add_tool.deposit': 'Caution ',
    'add_tool.location_title': 'Localisation',
    'add_tool.address': 'Adresse ou ville',
    'add_tool.photos_title': 'Photos',
    'add_tool.add_photos': 'Ajoutez vos photos',
    'add_tool.drop_images': 'Glissez vos images ici ou cliquez pour parcourir',
    'add_tool.browse_files': 'Parcourir les fichiers',
    'add_tool.file_format': "PNG, JPG jusqu'à 10MB • 5 photos maximum",
    'add_tool.instructions_title': "Consignes d'utilisation",
    'add_tool.owner_instructions': 'Consignes du propriétaire',
    'add_tool.publish': "Publier l'annonce",
    'add_tool.choose_category': 'Choisir une catégorie',
    'add_tool.choose_subcategory': 'Choisir une sous-catégorie',
    'add_tool.condition_new': '✨ Neuf',
    'add_tool.condition_excellent': '🌟 Excellent',
    'add_tool.condition_good': '👍 Bon',
    'add_tool.condition_fair': '👌 Correct',
    'add_tool.title_placeholder': 'Entrez le titre de votre outil...',
    'add_tool.brand_placeholder': "Marque de l'outil",
    'add_tool.model_placeholder': "Modèle de l'outil",
    'add_tool.year_placeholder': "Année d'achat",
    'add_tool.description_placeholder':
      'Décrivez votre outil, son état, les accessoires inclus...',

    // Categories and subcategories
    'category.gardening': 'Jardinage',
    'category.gardening.lawn': 'Gazon',
    'category.gardening.soil': 'Terre',
    'category.gardening.wood': 'Bois',
    'category.gardening.tree': 'Arbre',
    'category.gardening.leaves': 'Feuilles',

    'category.cleaning': 'Nettoyage',
    'category.cleaning.fabric': 'Tissu',
    'category.cleaning.water': 'Eau',
    'category.cleaning.dust': 'Poussière',

    'category.diy': 'Bricolage',
    'category.diy.construction': 'Construction',
    'category.diy.electricity': 'Électricité',
    'category.diy.painting': 'Peinture',
    'category.diy.screws_and_bolts': 'Vis et Boulons',

    'category.transport': 'Transport',
    'category.transport.heavy_load': 'Charge Lourde',
    'category.transport.engine': 'Moteur',
    'category.transport.wheel': 'Roue',

    'category.event': 'Événementiel',
    'category.event.lighting': 'Éclairage',
    'category.event.kitchen': 'Cuisine',
    'category.event.entertainment_and_games': 'Animation et Jeux',
    'category.event.furniture': 'Mobilier',
    'category.event.decoration': 'Décoration',
    'category.event.structure': 'Structure',

    // Common
    'common.yes': 'Oui',
    'common.no': 'Non',
    'common.ok': 'OK',
    'common.language': 'Langue',
    'common.currency': 'Devise',
    'common.menu': 'Menu',
    'common.navigation': 'Navigation',
    'common.home': 'Accueil',
    'common.p': 'chargement des données',
    'common.loading': 'chargement des données',

    // CGU (Terms of Use)

    'cgu.title': "Conditions Générales d'Utilisation",

    'cgu.last_updated': 'Dernière mise à jour : 1er janvier 2025',

    'cgu.section1.title': '1. Introduction',

    'cgu.section1.p1':
      'La société Bricola LTD exploite une plateforme numérique de mise en relation entre particuliers, spécialisée dans la location d’outils et d’équipements destinés au bricolage, au jardinage, au nettoyage et à l’organisation d’événements.',

    'cgu.section1.p2':
      'Bricola agit exclusivement en qualité d’intermédiaire de confiance. À ce titre, elle n’est ni propriétaire, ni dépositaire des objets loués, et n’assure ni leur transport, ni leur manutention.',

    'cgu.section2.title': '2. Accès à la Plateforme',

    'cgu.section2.p1':
      'L’accès à la plateforme est possible via les applications web et mobiles.',

    'cgu.section2.p2':
      'L’utilisation du service est réservée aux personnes majeures (18 ans révolus) et juridiquement capables.',

    'cgu.section2.p3':
      'Bricola se réserve le droit de suspendre ou clôturer tout compte utilisateur en cas de manquement aux présentes conditions, d’activités frauduleuses ou d’abus constaté.',

    'cgu.section3.title': '3. Inscription et Vérification des Utilisateurs',

    'cgu.section3.li1':
      'L’inscription requiert une adresse email valide, un numéro de téléphone actif et une pièce d’identité officielle.',

    'cgu.section3.li2':
      'Pour toute demande de retrait, l’utilisateur doit fournir des coordonnées bancaires exactes.',

    'cgu.section3.li3':
      'Bricola se réserve le droit de demander des documents de vérification d’identité (KYC) pour les transactions de montant élevé.',

    'cgu.section3.li4':
      'L’accès au compte est strictement personnel et non transférable. Le partage, la duplication ou la cession du compte sont interdits',

    'cgu.section4.title': '4. Règles de Location et Responsabilités',

    'cgu.section4.li1':
      'Le locataire s’engage à restituer les objets loués dans leur état initial.',

    'cgu.section4.li2':
      'Le propriétaire garantit que les équipements proposés sont fonctionnels, propres et conformes à la législation en vigueur.',

    'cgu.section4.li3':
      'En cas de litige, Bricola peut exiger des éléments justificatifs (photographies, vidéos, attestations).',

    'cgu.section4.li4':
      'Tout retard de restitution peut entraîner des pénalités calculées à l’heure ou à la journée.',

    'cgu.section4.li5':
      'La durée de location ne peut excéder 5 jours consécutifs. Toute prolongation nécessite une nouvelle réservation via la plateforme, après confirmation de disponibilité par le propriétaire',

    'cgu.section4.li6':
      'En cas de perte de l’objet, la totalité du dépôt de garantie pourra être retenue.',

    'cgu.section4.li7':
      'Une utilisation abusive ou non conforme des équipements peut entraîner la suspension définitive du compte.',

    'cgu.section5.title': '5. Paiement, Commissions et Portefeuilles',

    'cgu.section5.li1':
      'Tous les paiements sont traités via Stripe, dans le respect des réglementations financières locales.',

    'cgu.section5.li2':
      'Des frais de service de 6 % sont appliqués au locataire lors du paiement. Ils couvrent les frais de traitement Stripe ainsi qu’une partie des coûts techniques de la plateforme (hébergement, maintenance, mises à jour).',

    'cgu.section5.li3':
      'Une commission de 15 % est automatiquement prélevée sur chaque transaction réussie.',

    'cgu.section5.li4':
      'Les revenus des propriétaires sont crédités sur un portefeuille interne, avec possibilité de retrait via Wise, dès que le solde atteint 50 £.',

    'cgu.section5.li5':
      'Cette limite vise à réduire les petites demandes de retrait, à optimiser les coûts bancaires et à fluidifier les opérations financières.',

    'cgu.section5.li6':
      'Bricola ne saurait être tenue responsable des délais de virement ou restrictions externes liés à Wise.',

    'cgu.section6.title': '6. Politique de Dépôt de Garantie',

    'cgu.section6.li1':
      'Chaque location implique un dépôt de garantie temporaire, bloqué via Stripe.',

    'cgu.section6.li2':
      'Ce dépôt est libéré 24 heures après la restitution du matériel, sous réserve de validation.',

    'cgu.section6.li3':
      'En cas de dommage, de perte ou de contestation, tout ou partie du dépôt pourra être prélevé.',

    'cgu.section6.li4':
      'L’utilisateur concerné sera informé par email avant toute retenue définitive.',

    'cgu.section7.title': '7. Gestion des Litiges',

    'cgu.section7.li1':
      'Tout différend doit être signalé dans un délai de 24 heures suivant la restitution prévue.',

    'cgu.section7.li2':
      'L’équipe de support s’engage à instruire le dossier dans un délai de 72 heures et à émettre une décision définitive.',

    'cgu.section7.li3':
      'Bricola se réserve le droit de jouer un rôle de médiateur et d’appliquer les ajustements financiers qu’elle juge appropriés.',

    'cgu.section7.li4':
      'La décision rendue est réputée définitive et contraignante pour les deux parties.',

    'cgu.section8.title': '8. Bon Usage et Intégrité de la Plateforme',

    'cgu.section8.li1':
      'Les annonces doivent refléter des objets réels et légalement détenus.',

    'cgu.section8.li2':
      'Le téléchargement massif ou automatisé de fausses annonces est interdit.',

    'cgu.section8.li3':
      'La mise en location d’objets interdits (armes, substances dangereuses, etc.) est strictement prohibée.',

    'cgu.section8.li4':
      'Les contrevenants récurrents seront définitivement exclus de la plateforme.',

    'cgu.section9.title': '9. Politique d’Annulation et de Remboursement',

    'cgu.section9.li1':
      'Le locataire peut annuler sa réservation et obtenir un remboursement intégral s’il effectue l’annulation au moins 24 heures avant le début de la location.',

    'cgu.section9.li2':
      'Aucune annulation avec remboursement ne sera acceptée dans les 24 heures précédant le début prévu.',

    'cgu.section9.li3':
      'Si l’annulation provient du propriétaire, le locataire sera intégralement remboursé. Des annulations répétées de la part des propriétaires peuvent entraîner des sanctions.',

    'cgu.section10.title': '10. Disponibilité du Service et Évolutions',

    'cgu.section10.li1':
      'Des interruptions ponctuelles peuvent survenir pour maintenance ou mise à jour.',

    'cgu.section10.li2':
      'Les utilisateurs seront informés à l’avance en cas d’indisponibilité programmée.',

    'cgu.section10.li3':
      'Bricola se réserve le droit de modifier ou supprimer certaines fonctionnalités sans préavis, dans le but d’optimiser l’expérience utilisateur.',

    'cgu.section11.title': '11. Protection des Données et Vie Privée',

    'cgu.section11.li1':
      'Les données personnelles sont traitées conformément au RGPD (Règlement Général sur la Protection des Données – Royaume-Uni et Union Européenne).',

    'cgu.section11.li2':
      'Les données sensibles sont chiffrées et conservées de manière sécurisée.',

    'cgu.section11.li3':
      'Chaque utilisateur peut demander la suppression, la modification ou l’export de ses données à tout moment.',

    'cgu.section11.li4':
      'Aucune donnée ne sera vendue ni partagée sans consentement explicite.',

    'cgu.section12.title': '12. Droit Applicable et Juridiction Compétente',

    'cgu.section12.li1':
      'Les présentes conditions sont régies par le droit anglais.',

    'cgu.section12.li2':
      'En cas de litige non résolu par voie amiable, compétence exclusive est attribuée aux tribunaux de Londres.',

    'cgu.section12.li3':
      'Toute mise à jour des présentes sera notifiée sur la plateforme. La poursuite de l’utilisation vaut acceptation des nouvelles conditions.',

    'cgu.section13.title': '13. Contact',

    'cgu.section13.p':
      'Dans certaines situations où un utilisateur (locataire ou propriétaire) ne réagit pas dans un délai raisonnable, Bricola LTD se réserve le droit de confirmer automatiquement l’état d’une transaction (livraison ou retour). Cette mesure vise à garantir la continuité et la fiabilité du service. Les utilisateurs sont donc invités à suivre et valider leurs opérations dans les temps impartis.',

    'cgu.section14.title': '14. Modification et Acceptation des Conditions',

    'cgu.section14.p1':
      'Les présentes CGU peuvent être modifiées à tout moment pour s’adapter aux évolutions légales, techniques ou opérationnelles.',

    'cgu.section14.p2':
      'Les utilisateurs seront informés des modifications substantielles.',

    'cgu.section14.p3':
      'L’utilisation continue de la plateforme après modification vaut acceptation tacite des nouvelles conditions.',

    'cgu.section15.title': '15. Contact et Notifications Officielles',

    'cgu.section15.p1':
      'Pour toute question, réclamation ou notification légale relative aux présentes conditions, les utilisateurs peuvent contacter Bricola LTD à l’adresse suivante : Contact@bricolaltd.com',

    'cgu.section15.p2':
      'Toute communication officielle sera transmise via l’adresse email associée au compte utilisateur.',

    // Privacy Policy

    'privacy.title': 'Politique de Confidentialité',

    'privacy.last_updated': 'Date d’entrée en vigueur : 1er septembre 2025',

    'privacy.section1.title': '1. Introduction',

    'privacy.section1.p1':
      'Bricola LTD accorde une importance capitale à la protection de votre vie privée et au respect de vos données personnelles.',

    'privacy.section1.p2':
      'Nous nous engageons à traiter vos informations conformément au Règlement Général sur la Protection des Données (RGPD) applicable au Royaume-Uni et dans l’Union européenne.',

    'privacy.section1.p3':
      'La présente politique décrit les données que nous collectons, les raisons de leur collecte et l’usage que nous en faisons.',

    'privacy.section2.title': '2. Données Collectées',

    'privacy.section2.p1':
      'Dans le cadre de l’utilisation de notre plateforme, nous sommes amenés à collecter les données suivantes :',

    'privacy.section2.identification': 'Informations d’identification :',

    'privacy.section2.identification.li1':
      'Nom, numéro de téléphone, adresse email',

    'privacy.section2.account': 'Informations de compte :',

    'privacy.section2.account.li1': 'Identifiant, mot de passe',

    'privacy.section2.payment': 'Informations de paiement :',

    'privacy.section2.payment.li1':
      'Nous ne collectons aucune information de paiement.',

    'privacy.section2.technical': 'Informations techniques :',

    'privacy.section2.technical.li1':
      'Adresse IP, type de navigateur, système d’exploitation, géolocalisation approximative',

    'privacy.section2.usage': 'Données d’usage :',

    'privacy.section2.usage.li1':
      'Clics, pages visitées, requêtes de recherche effectuées sur la plateforme',

    'privacy.section3.title': '3. Finalités de Traitement',

    'privacy.section3.p1':
      'Vos données personnelles sont utilisées dans les objectifs suivants :',

    'privacy.section3.li1':
      'Création, gestion et sécurisation de votre compte utilisateur',

    'privacy.section3.li2':
      'Traitement des paiements et garantie des transactions de location',

    'privacy.section3.li3':
      'Vérification d’identité et respect des obligations réglementaires',

    'privacy.section3.li4':
      'Assistance client, gestion des litiges et traitement des réclamations',

    'privacy.section3.li5':
      'Amélioration continue de la plateforme, détection des fraudes et analyse des comportements d’utilisation',

    'privacy.section4.title': '4. Fondements Juridiques du Traitement',

    'privacy.section4.consent':
      'Votre consentement explicite, notamment lors de l’inscription ou de la soumission d’informations personnelles',

    'privacy.section4.interest':
      'Notre intérêt légitime, afin d’assurer la sécurité de nos services et leur amélioration continue',

    'privacy.section4.legal':
      'Nos obligations légales, en matière de lutte contre la fraude ou de conformité aux réglementations financières et fiscales',

    'privacy.section5.title': '5. Partage des Données avec des Tiers',

    'privacy.section5.p1':
      'Nous ne partageons vos données qu’avec des partenaires de confiance et uniquement lorsque cela est nécessaire :',

    'privacy.section5.li1':
      'Prestataires de paiement : Wise, pour les virements des revenus aux propriétaires',

    'privacy.section5.li2':
      'Hébergeurs et partenaires de sécurité informatique, garantissant la disponibilité et la protection de la plateforme',

    'privacy.section5.li3':
      'Autorités compétentes, dans le cadre d’une obligation légale ou réglementaire',

    'privacy.section5.li4':
      'En aucun cas, nous ne vendons, ne louons ou ne cédons vos données à des tiers à des fins commerciales.',

    'privacy.section6.title': '6. Durée de Conservation des Données',

    'privacy.section6.p1':
      'Les données sont conservées aussi longtemps que votre compte est actif.',

    'privacy.section6.p2':
      'En l’absence d’activité pendant 3 ans, votre compte pourra être désactivé, puis vos données anonymisées ou supprimées, sauf si leur conservation est exigée par la loi (par exemple : facturation, litige, vérification fiscale).',

    'privacy.section7.title': '7. Sécurité des Données',

    'privacy.section7.p1':
      'Nous mettons en œuvre des protocoles de chiffrement avancés, des mesures de contrôle d’accès strictes et utilisons des serveurs sécurisés situés dans la zone UK/UE.',

    'privacy.section7.p2':
      'Notre priorité est de garantir l’intégrité, la confidentialité et la disponibilité de vos données à tout moment.',

    'privacy.section8.title': '8. Vos Droits',

    'privacy.section8.p1':
      'Conformément au RGPD, vous disposez des droits suivants :',

    'privacy.section8.access': 'Droit d’accès :',

    'privacy.section8.access.desc':
      'Obtenir une copie de vos données personnelles',

    'privacy.section8.rectification': 'Droit de rectification :',

    'privacy.section8.rectification.desc':
      'Corriger toute donnée inexacte ou obsolète',

    'privacy.section8.erasure': 'Droit à l’effacement :',

    'privacy.section8.erasure.desc':
      'Demander la suppression de vos données (dans les limites prévues par la loi)',

    'privacy.section8.withdrawal': 'Droit de retrait du consentement :',

    'privacy.section8.withdrawal.desc':
      'Retirer votre autorisation à tout moment',

    'privacy.section8.li1': 'Accéder à vos données',

    'privacy.section8.li2': 'Corriger les données inexactes',

    'privacy.section8.li3':
      'Demander la suppression (sous réserve de contraintes légales)',

    'privacy.section8.li4': 'Retirer le consentement à tout moment',

    'privacy.section8.p2':
      'Vous pouvez exercer ces droits en contactant support@bricolaltd.com.',

    'privacy.section8.contact':
      'Vous pouvez exercer ces droits à tout moment en écrivant à support@bricolaltd.com',

    'privacy.section9.title': '9. Transferts Internationaux',

    'privacy.section9.p1':
      'Si certaines données sont transférées en dehors de l’UE/Royaume-Uni, cela se fait dans un cadre contractuel sécurisé, via des clauses contractuelles types ou des accords avec les prestataires respectant les normes internationales de protection des données.',

    'privacy.section10.title':
      '10. Mise à Jour de la Politique de Confidentialité',

    'privacy.section10.p1':
      'Cette politique peut faire l’objet de mises à jour afin de refléter des évolutions techniques, juridiques ou organisationnelles.',

    'privacy.section10.p2':
      'Les utilisateurs seront informés de toute modification significative par email ou notification via l’application.',

    'privacy.section10.p3':
      'L’usage continu de la plateforme après modification vaut acceptation tacite de la nouvelle version.',
  },
  en: {
    'login.signing': 'Signing in...',
    'blog.category.general': 'General',
    'general.loading': 'loading...',
    // AgeVerificationDialog
    'ageVerification.title': 'Age Verification',
    'ageVerification.description':
      'Our platform is accessible via both web and mobile applications. It is strictly reserved for users aged 18 or older who have the legal capacity to use our services.',
    'ageVerification.description2':
      'Bricola reserves the right to suspend or terminate any account in case of policy violations, fraud, or abuse.',
    'ageVerification.description3':
      'For more details, please refer to our Terms and Conditions.',
    'ageVerification.confirmButton':
      'Yes, I confirm that I am 18 years old or older',
    'ageVerification.denyButton': 'No, I am under 18',

    // UnderAge page
    'underAge.title': 'Unauthorized Access',
    'underAge.message':
      "We're sorry, you are not authorized to use the Bricola platform.",
    'underAge.message2': 'Please refer to our Terms and Conditions.',
    'underAge.cguButton': 'View Terms and Conditions',
    // contrat

    'rentalContract.title': 'Rental Agreement',
    'rentalContract.subtitle':
      'Sample tool rental agreement between individuals',
    'rentalContract.cardTitle': 'Tool Rental Agreement',
    'rentalContract.downloadButton': 'Download PDF',
    'rentalContract.section.signatories.title': 'Between the undersigned',
    'rentalContract.section.signatories.owner.name':
      'The Owner: [Owner’s full name]',
    'rentalContract.section.signatories.owner.address':
      'Address: [Full address]',
    'rentalContract.section.signatories.owner.phone': 'Phone: [Phone number]',
    'rentalContract.section.signatories.owner.email': 'Email: [Email address]',
    'rentalContract.section.signatories.separator': 'AND',
    'rentalContract.section.signatories.tenant.name':
      'The Renter: [Renter’s full name]',
    'rentalContract.section.signatories.tenant.address':
      'Address: [Full address]',
    'rentalContract.section.signatories.tenant.phone': 'Phone: [Phone number]',
    'rentalContract.section.signatories.tenant.email': 'Email: [Email address]',
    'rentalContract.article1.title': 'Article 1 - Purpose of the Contract',
    'rentalContract.article1.description':
      'The purpose of this contract is to rent the following tool:',
    'rentalContract.article1.fields.designation': 'Designation: [Tool name]',
    'rentalContract.article1.fields.brandModel':
      'Brand/Model: [Brand and model]',
    'rentalContract.article1.fields.serialNumber':
      'Serial Number: [If applicable]',
    'rentalContract.article1.fields.condition':
      'Condition: [Condition description]',
    'rentalContract.article1.fields.accessories':
      'Included Accessories: [List of accessories]',
    'rentalContract.article2.title': 'Article 2 - Rental Duration',
    'rentalContract.article2.fields.startDate':
      'Start Date: [Start date and time]',
    'rentalContract.article2.fields.endDate': 'End Date: [End date and time]',
    'rentalContract.article2.fields.handoverLocation':
      'Handover Location: [Handover address]',
    'rentalContract.article2.fields.returnLocation':
      'Return Location: [Return address]',
    'rentalContract.article3.title': 'Article 3 - Price and Payment Terms',
    'rentalContract.article3.fields.rentalPrice':
      'Rental Price: [Amount] € for [duration]',
    'rentalContract.article3.fields.deposit': 'Deposit: [Deposit amount] €',
    'rentalContract.article3.fields.paymentMethod':
      'Payment Method: Via the Bricola platform',
    'rentalContract.article4.title': "Article 4 - Renter's Obligations",
    'rentalContract.article4.list.1':
      'Use the tool according to its intended purpose',
    'rentalContract.article4.list.2':
      'Take all necessary precautions to preserve it',
    'rentalContract.article4.list.3':
      'Do not lend or sublet the tool to a third party',
    'rentalContract.article4.list.4': 'Immediately report any malfunction',
    'rentalContract.article4.list.5':
      'Return the tool in the same condition it was received',
    'rentalContract.article4.list.6': 'Respect the agreed return times',
    'rentalContract.article5.title': "Article 5 - Owner's Obligations",
    'rentalContract.article5.list.1':
      'Deliver the tool in perfect working condition',
    'rentalContract.article5.list.2': 'Provide usage instructions if necessary',
    'rentalContract.article5.list.3': 'Ensure the tool matches its description',
    'rentalContract.article5.list.4': 'Be available for handover and return',
    'rentalContract.article6.title': 'Article 6 - Insurance and Liability',
    'rentalContract.article6.intro':
      'The tool is covered by Bricola insurance during the rental period for:',
    'rentalContract.article6.coverage.1': 'Accidental damage',
    'rentalContract.article6.coverage.2': 'Theft (under certain conditions)',
    'rentalContract.article6.coverage.3':
      'Damage caused by a defect in the tool',
    'rentalContract.article6.note':
      'The renter remains responsible for damage resulting from improper use or gross negligence.',
    'rentalContract.article7.title': 'Article 7 - Dispute Resolution',
    'rentalContract.article7.text':
      'In case of a dispute, the parties agree to seek an amicable solution. If this fails, Bricola customer service will intervene in mediation. Unresolved disputes will be submitted to the competent courts.',
    'rentalContract.signatures.owner': "Owner's Signature",
    'rentalContract.signatures.tenant': "Renter's Signature",
    'verification.account_verified': 'Account Verified',
    'rentalContract.instructions.title': 'Usage Instructions',
    'rentalContract.instructions.list.1':
      'Complete all sections marked in brackets with the appropriate information.',
    'rentalContract.instructions.list.2':
      'Ensure all parties have read and understood the contract before signing.',
    'rentalContract.instructions.list.3':
      'Keep a signed copy of the contract for the entire rental period.',
    'rentalContract.instructions.list.4':
      'If you have any questions, contact Bricola customer service.',

    // renters guide
    // Search page
    'search.noResults': 'No tools found',
    'search.tryDifferentCriteria': 'Try modifying your search criteria',
    'search.resetFilters': 'Reset filters',

    'rentersGuide.title': 'For Renters Guide',
    'rentersGuide.intro':
      'Welcome to Bricola LTD! This guide explains how to rent tools easily and securely.',
    'rentersGuide.step1.title': 'Create an Account',
    'rentersGuide.step1.description':
      'Sign up as a renter and enter your personal details accurately.',
    'rentersGuide.step2.title': 'Search for a Tool',
    'rentersGuide.step2.description':
      'Use the search engine or categories to find the tool you need.',
    'rentersGuide.step3.title': 'Read the Details',
    'rentersGuide.step3.description':
      'Make sure to read the tool description and the owner’s conditions before booking.',
    'rentersGuide.step4.title': 'Book and Pay',
    'rentersGuide.step4.description':
      'Select the desired rental period and pay using the platform’s secure payment system.',
    'rentersGuide.step5.title': 'Receive the Tool',
    'rentersGuide.step5.description':
      'Coordinate with the owner on the delivery method and location.',
    'rentersGuide.step6.title': 'Usage',
    'rentersGuide.step6.description':
      'Handle the tool with care and follow the owner’s instructions.',
    'rentersGuide.step7.title': 'Return',
    'rentersGuide.step7.description':
      'Return the tool on time and in the same condition you received it.',
    'rentersGuide.step8.title': 'Review',
    'rentersGuide.step8.description':
      'After completion, rate the owner to help improve service quality.',
    'rentersGuide.step9.title': 'Cancellation and Refund Policy',
    'rentersGuide.step9.description':
      'Check the dedicated pages on the website for more details.',

    // owners guide
    'ownersGuide.title': 'For Owners Guide',
    'ownersGuide.intro':
      'Welcome to Bricola LTD! This guide will help you maximize your earnings from your tools.',
    'ownersGuide.step1.title': 'Create an account',
    'ownersGuide.step1.description':
      'Sign up as an owner on the platform and provide accurate personal details, including phone number and email.',
    'ownersGuide.step2.title': 'Add a tool',
    'ownersGuide.step2.description':
      'Upload clear, high-quality photos, provide a detailed description, and set the daily rate and deposit amount.',
    'ownersGuide.step3.title': 'Set your conditions',
    'ownersGuide.step3.description':
      'Define the allowed rental duration and any special instructions for using the tool.',
    'ownersGuide.step4.title': 'Review requests',
    'ownersGuide.step4.description':
      'You will receive notifications for new rental requests, and you can accept or decline based on availability.',
    'ownersGuide.step5.title': 'Delivery and pickup',
    'ownersGuide.step5.description':
      'Coordinate with the renter on the method and location of delivery for a smooth experience.',
    'ownersGuide.step6.title': 'Receive payments',
    'ownersGuide.step6.description':
      'After the rental is completed, the due amount will be transferred to your wallet, and you can withdraw it once you reach the minimum payout.',
    'ownersGuide.step7.title': 'Tips',
    'ownersGuide.step7.description':
      'Provide clean, functional tools and maintain high ratings to attract more customers.',

    // Refund Policy
    'refundPolicy.title': 'Refund Policy',
    'refundPolicy.intro':
      'Bricola LTD is committed to ensuring the security and satisfaction of its users. Here are the refund rules:',
    'refundPolicy.renters.title': 'For renters:',
    'refundPolicy.renters.rule1':
      'Full refunds are issued if cancellations occur at least 24 hours before the rental start.',
    'refundPolicy.renters.rule2':
      'If the owner cancels, the renter automatically receives a full refund.',
    'refundPolicy.deposit.title': 'Security deposit and damages:',
    'refundPolicy.deposit.rule1':
      'Each rental includes a temporary security deposit held via Stripe.',
    'refundPolicy.deposit.rule2':
      'The deposit is released 24 hours after the tool’s return, pending condition verification.',
    'refundPolicy.deposit.rule3':
      'In cases of damage, loss, or disputes, Bricola may withhold part or all of the deposit after notifying the user by email.',
    'refundPolicy.lateReturns.title': 'Late returns and penalties:',
    'refundPolicy.lateReturns.rule':
      'Late returns may result in penalties charged hourly or daily, according to platform rules.',
    'refundPolicy.disputes.title': 'Dispute resolution:',
    'refundPolicy.disputes.rule1':
      'Disputes must be reported within 24 hours after the scheduled return date.',
    'refundPolicy.disputes.rule2':
      'Bricola’s support team investigates within 72 hours and issues a final, binding decision.',
    'refundPolicy.payments.title': 'Payments and fees:',
    'refundPolicy.payments.rule1':
      'All payments are secured and processed via Stripe.',
    'refundPolicy.payments.rule2':
      'A 15% commission is deducted from each successful transaction, and renters pay a 6% fee at payment (processing and platform maintenance costs).',

    // cancellationPolicy
    'cancellationPolicy.title': 'Cancellation Policy',
    'cancellationPolicy.intro':
      'At Bricola LTD, we strive to provide a simple and transparent experience for renters and owners. Here are the cancellation rules:',
    'cancellationPolicy.renters.title': 'For renters:',
    'cancellationPolicy.renters.rule1':
      'You may cancel your booking and receive a full refund if the cancellation is made at least 24 hours before the rental start time.',
    'cancellationPolicy.renters.rule2':
      'Cancellations made less than 24 hours before the rental start will not be refunded, and the booking will be considered final.',
    'cancellationPolicy.owners.title': 'For owners:',
    'cancellationPolicy.owners.rule1':
      'If an owner cancels a booking at any time, the renter will receive a full refund.',
    'cancellationPolicy.owners.rule2':
      'Repeated cancellations by owners may lead to penalties or account suspension.',
    'cancellationPolicy.maxDuration.title': 'Maximum rental duration:',
    'cancellationPolicy.maxDuration.rule':
      'Rentals cannot exceed 5 days per booking. To extend the rental period, renters must first check the tool’s availability with the owner, then make a new booking via the platform.',
    'cancellationPolicy.autoCancellations.title': 'Automatic cancellations:',
    'cancellationPolicy.autoCancellations.rule':
      'If a user (renter or owner) fails to respond or take necessary actions within a reasonable time, Bricola LTD reserves the right to automatically confirm the status of a transaction (delivery or return) to ensure service continuity.',

    // countries
    'country.kuwait': 'Kuwait',
    'country.ksa': 'KSA',
    'country.uae': 'UAE',
    'country.qatar': 'Qatar',
    'country.bahrain': 'Bahrain',
    'country.oman': 'Oman',

    'review.modaltitle': 'Rate the Rental',
    'review.rate': 'Star Rating',
    'review.comment': 'Comment',
    'review.placeholdercomm': 'Share your experience...',
    'review.submitbtn': 'Submit Review',
    'review.popuptitle': 'Review Submitted',
    'review.modalmsg':
      'Thank you for your review. The status has been updated to "Completed".',

    // reset password
    'resetpwd.emailtitle': 'Forgot Password?',
    'resetpwd.emailtxt':
      'Enter your email address to receive a verification code',
    'resetpwd.emailfield': 'Email address',
    'resetpwd.emailplaceholder': 'your@email.com',
    'resetpwd.sendbtn': 'Send',
    'resetpwd.sendbtnpending': 'Sending...',
    'resetpwd.backlogin': 'Back to LogIn',
    'resetpwd.popuptitle': 'Email sent',
    'resetpwd.popuptxt':
      'A verification code has been sent to your email address.',
    'resetpwd.verify': 'Verify',
    'resetpwd.verify_in_progress': 'Verifying...',

    // deposit payment modal
    'deposit.modal.title': 'Deposit Payment Required',
    'deposit.modal.subtitle': 'Your reservation requires a deposit of {amount} to be confirmed.',
    'deposit.modal.payment_info': 'Payment Information',
    'deposit.modal.amount_label': 'Deposit Amount',
    'deposit.modal.processing': 'Processing...',
    'deposit.modal.pay_button': 'Pay Deposit',
    'deposit.modal.cancel_button': 'Cancel Reservation',
    'deposit.modal.success': 'Deposit paid successfully! Your reservation is now confirmed.',
    'deposit.modal.error': 'Error processing deposit payment. Please try again.',
    'deposit.modal.cancel_confirm': 'Are you sure you want to cancel this reservation?',
    'deposit.modal.cancel_success': 'Reservation cancelled successfully.',
    'deposit.modal.cancel_error': 'Error cancelling reservation. Please try again.',
    'deposit.modal.test_mode': 'Test mode enabled',
    'deposit.modal.card_error': 'Payment card error',
    'deposit.modal.payment_failed': 'Payment failed',
    'deposit.modal.network_error': 'Connection error',

    // create password
    'password.create.title': 'New Password',
    'password.create.description': 'Choose a secure new password',
    'password.criteria': 'Password criteria:',
    'password.min_length': 'At least 8 characters',
    'password.uppercase': 'One uppercase letter',
    'password.lowercase': 'One lowercase letter',
    'password.number': 'One number',
    'password.special_char': 'One special character',
    'password.confirm': 'Confirm password',
    'password.match': 'Passwords match',
    'password.no_match': 'Passwords do not match',
    'password.update': 'Update password',
    'password.back_to_login': 'Back to login',

    'resetpwd.popupsuccupdate': 'Password Changed',
    'resetpwd.txtsucc': 'Your password has been successfully changed.',

    // email verification
    'email.verification.title': 'Verification',
    'email.verification.description': 'Enter the verification code sent to ',
    'email.resend': 'Resend Code',
    'email.invalid_code': 'Incorrect code!',
    'email.resend.message': 'Code resent',
    'email.resend.description':
      'A new code has been sent to your email address.',
    'email.valid_code': 'Code Verified',
    'email.valid_code_message': 'Code correct, redirecting to password reset.',
    'verification.success_title': 'Email Verified Successfully',
    'verification.success_message':
      'Your email has been verified. You can now access all features.',
    'verification.redirecting': 'Redirecting...',
    'verification.title': 'Email Verification',
    'verification.description':
      'Please enter the 6-digit verification code sent to your email address.',
    'verification.code_label': 'Verification Code',
    'verification.verify_button': 'Verify',
    'verification.resend_button': 'Resend Code',
    'verification.resent': 'Code Resent',
    'verification.resent_message':
      'A new verification code has been sent to your email.',
    'verification.invalid_code': 'Invalid verification code. Please try again.',
    'verification.error':
      'An error occurred during verification. Please try again.',
    'verification.expired':
      'Verification code has expired. Please request a new one.',
    'verification.success': 'Verification successful!',
    'verification.loading': 'Verifying...',

    'cancellation.details.title': 'Cancellation Details',
    'cancellation.details.reason': 'Reason',
    'cancellation.details.message': 'Message',

    // Download report
    'download.report.title': 'Contract downloaded',
    'download.report.description':
      'The rental contract has been successfully generated and downloaded.',

    // Status badges
    'status.pending': 'PENDING',
    'status.accepted': 'ACCEPTED',
    'status.cancelled': 'CANCELLED',
    'status.completed': 'COMPLETED',
    'status.rejected': 'REFUSED',
    'status.ongoing': 'ONGOING',
    'location.label': 'Location:',

    // confirm reservation
    'reservation.cancel.title': 'Cancel Reservation',
    'reservation.cancel.reason': 'Select a reason',
    'reservation.cancel.reason.other_alternative': 'Found another alternative',
    'reservation.cancel.reason.not_needed': 'Do not need the tool',
    'reservation.cancel.reason.unavailable': 'I am unavailable',
    'reservation.cancel.reason.other': 'Other',
    'reservation.cancel.message': 'Additional message (optional)',
    'reservation.cancel.confirm': 'Confirm cancellation',
    'reservation.no_reservations': 'No reservations',
    'reservation.no_reservations_message':
      'You have no reservations at the moment. Explore our catalog to find tools to rent.',

    'reservation.recap': 'Recap',
    'reservation.card': 'Credit Card',
    'reservation.back_to_details': 'Back to details',
    'reservation.complete_booking': 'Complete your booking',
    'reservation.rental_period': 'Rental period',
    'reservation.start_date': 'Start date',
    'reservation.select_date': 'Select a date',
    'reservation.end_date': 'End date',
    'reservation.pickup_time': 'Pick-up time',
    'reservation.message_to_owner': 'Message to owner (optional)',
    'reservation.message_placeholder':
      'Specify intended use, your questions...',
    'reservation.contact_information': 'Contact information',
    'reservation.confirm': 'Confirm reservation',
    'reservation.payment_method': 'Payment method',
    'reservation.price_per_day': 'Price per day',
    'reservation.number_of_days': 'Number of days',
    'reservation.subtotal': 'Subtotal',
    'reservation.payment_fee': 'Secure payment fee',
    'reservation.deposit': 'Deposit (refundable)',
    'reservation.total_amount': 'Total amount Due',
    'reservation.included_protection': 'Included protection',
    'reservation.insurance_description':
      'Your rental is covered by our insurance against damages.',
    'reservation.confirmation_message':
      'By confirming, you agree to our rental terms and cancellation policy.',
    'reservation.confirmed': 'Booking Confirmed!',
    'reservation.confirmed_message':
      'Your booking for {toolName} has been confirmed. You will receive a confirmation email.',
    'reservation.refused_title': 'Reason for Rejection',
    'reservation.refused_reason': 'Select a reason:',
    'reservation.refused_reason_maintenance': 'Under maintenance',
    'reservation.refused_reason_already_booked': 'Already booked',
    'reservation.refused_reason_other': 'Other',
    'reservation.refused_message_placeholder': 'Optional Message',
    'reservation.refused_confirm': 'Confirm Rejection',

    // Calendar legend
    'calendar.legend': 'Calendar Legend',
    'calendar.reserved_in_progress': 'Reserved/In Progress',
    'calendar.pending_accepted': 'Pending/Accepted',
    'calendar.max_5_days': 'Max 5 consecutive days',

    // blog
    'blog.title': 'Bricola LTD Blog',
    'blog.description':
      'Explore our tips, guides, and news from the world of tools and DIY',
    'blog.popular_categories': 'Popular Categories',

    'blog.return': 'Return to Blog',
    'blog.share': 'Share',
    'blog.like': 'Like',
    'blog.similar_articles': 'Similar Articles',
    'blog.share_article': 'Share this article',

    // blog categories
    'blog.subcategory.tools': 'Tools',
    'blog.category.safety': 'Safety',
    'blog.category.gardening': 'Gardening',
    'blog.category.maintenance': 'Maintenance',
    'blog.category.transport': 'Transport',
    'blog.category.diy': 'DIY',
    'blog.category.electricity': 'Electricity',
    'blog.category.lighting': 'Lighting',
    'blog.category.painting': 'Painting',
    'blog.category.construction': 'Construction',
    'blog.category.plants': 'Plants',
    'blog.category.cleaning': 'Cleaning',
    'blog.category.decoration': 'Decoration',
    'blog.category.guide': 'Guide',
    'tool.returned': 'Returned tools',
    // favorites
    'favorites.title': 'My Favorites',
    'fav.backhome': 'Back to Home',
    'fav.nofav': 'No favorites yet',
    'fav.text':
      'Browse our catalog and add your favorite tools to your favorites',
    'fav.btnexplore': 'Browse Catalog',

    // ads profile
    'ads.delete.success': 'Listing Deleted',
    'ads.delete.confirm.title': 'Confirm Deletion',
    'ads.delete.confirm.description':
      'Are you sure you want to delete this listing? This action is irreversible.',
    'ads.view.title': 'Listing Preview',
    'ads.rental_conditions': 'Rental Conditions',
    'ads.success_message': 'Your listing has been successfully updated.',
    'ads.search': 'Search by Listing Title or Category...',
    'ads.update': 'Edit Listing',
    'ads.general_information': 'General Information',
    'ads.listing_title': 'Listing Title',
    'ads.brand': 'Brand',
    'ads.model': 'Model',
    'ads.year_of_purchase': 'Year of Purchase',
    'ads.description': 'Description',
    'ads.description_placeholder':
      'Describe your tool, its condition, accessories...',
    'ads.categorization': 'Categorization',
    'ads.category': 'Category',
    'ads.sub_category': 'Sub-category',
    'ads.sub_category_placeholder': 'Choose a sub-category',
    'ads.tool_condition': 'Tool Condition',
    'ads.pricing': 'Pricing',
    'ads.pricing_placeholder': 'Price per day (€)',
    'ads.deposit': 'Deposit (€)',
    'ads.location': 'Location',
    'ads.location_placeholder': 'Address or city',
    'ads.photos': 'Photos',
    'ads.photos_placeholder': 'Drag your images here or click to browse',
    'ads.browse_files': 'Browse files',
    'ads.usage_instructions': 'Usage instructions',
    'ads.owner_instructions': 'Owner’s instructions',
    'ads.owner_instructions_placeholder':
      'Provide an extension cord, clean after use...',

    'claim.sent': 'Claim Submitted',
    'claim.sent_message':
      'Your claim has been successfully sent to our support team. It will be processed within 48 hours.',
    'claim.in_progress': 'Claim in Progress',
    // General
    'general.copy_link': 'Copy Link',
    'general.copy_link_message': 'The link has been copied !',
    'general.delete.confirm': 'Confirm Deletion',
    'general.back': 'Back',
    'general.in': 'in',
    'general.example': 'Ex',
    'general.error': 'Error',
    'general.email_already_exists': 'This email address is already in use',
    'errors.tool_not_found': 'Tool not found',
    'errors.start_date_past': 'Start date cannot be in the past',
    'general.report_error_message': 'Please select a reason for the report.',

    'general.registered_under':
      'Registered in England and Wales under number: 16401372',
    'general.subject_placeholder': 'Subject of the Request',
    'general.message_placeholder': 'Describe Your Request',
    'general.first_name': 'First Name',
    'general.first_name_placeholder': 'your first name',
    'general.last_name': 'Last Name',
    'general.last_name_placeholder': 'your last name',
    'general.phone': 'Phone',
    'general.min': 'min',
    'general.modify': 'Modify',
    'general.see': 'See',
    'general.location': 'Rentals',
    'general.list': 'List',
    'general.grid': 'Grid',
    'general.status': 'Status',
    'general.public': 'Public',
    'general.categories': 'Categories',
    'general.published': 'Published',
    'general.unpublished': 'Unpublished',
    'general.view_details': 'View Details',
    'general.pending': 'Pending',
    'general.show': 'Show',
    'general.accepted': 'Accepted',
    'general.ongoing': 'Ongoing',
    'general.completed': 'Completed',
    'general.cancelled': 'Cancelled',
    'general.declined': 'Declined',
    'general.all': 'All',
    'general.all_periods': 'All Periods',
    'general.week': 'This Week',
    'general.month': 'This Month',
    'general.year': 'This Year',
    'general.reset': 'Reset',
    'general.day': 'day',
    'general.by': 'by',
    'general.to': 'To',
    'general.from': 'From',
    'general.cancel': 'Cancel',
    'general.confirm': 'Confirm',
    'general.report': 'Report',
    'general.download_contract': 'Download Contract',
    'general.hide': 'Hide',
    'general.copy': 'Copy',
    'general.reference': 'Reference',
    'general.contact': 'Contact',
    'general.confirmed': 'Confirmed',
    'general.rejected': 'Rejected',
    'general.message': 'Message',

    // bookings
    'booking.cancelled': 'Reservation Cancelled',
    'booking.cancelled_message':
      'Your reservation has been successfully cancelled.',
    'booking.wait': 'Waiting for Owner Confirmation',
    'booking.report.title': 'Report a Problem',
    'booking.report.reason': 'Select a reason',
    'booking.report.reason.no_answer': 'No response',
    'booking.report.reason.wrong_number': 'Incorrect number',
    'booking.report.reason.inappropriate_behavior': 'Inappropriate behavior',
    'booking.report.reason.other': 'Other',
    'booking.report.describe': 'Describe the problem',
    'booking.report.submit': 'Submit Report',

    'tool.return.title': 'Confirm Tool Return',
    'tool.return.option': 'Choose an option:',
    'tool.return.confirm': 'I confirm that I have returned the tool',
    'tool.return.report': 'Report a problem',
    'tool.return.confirmed': 'Return Confirmed',
    'tool.return.confirmed_message':
      'You have confirmed that the tool has been returned. Awaiting confirmation of receipt by the owner.',

    'code.copied': 'Code Copied',
    'code.copied_message':
      'The verification code has been copied to the clipboard.',

    'booking.title': 'My Reservations',
    'booking.tool_returned': 'Tool Returned',
    'booking.search': 'Search by Listing Title...',
    'booking.verification_code': 'Verification Code',
    'booking.present_code':
      'Show this code to the owner when picking up the tool on the first day.',
    'booking.owner': 'Owner',
    'booking.status.pending': 'Pending',
    'booking.status.confirmed': 'Confirmed',
    'booking.status.active': 'Active',
    'booking.status.completed': 'Completed',
    'booking.status.cancelled': 'Cancelled',
    'booking.confirm_return': 'Confirm Return',
    'booking.claim_in_progress': 'Claim in Progress',
    'booking.download_contract': 'Download Contract',
    'booking.validation_code': 'Validation Code',
    'booking.cancelled_on': 'Cancelled on',
    'booking.cancellation_reason': 'Reason',
    'booking.retry': 'Retry',
    'booking.cancel_reservation': 'Cancel',
    'booking.cancellation_title': 'Cancel Reservation',
    'booking.cancellation_reason_label': 'Cancellation Reason',
    'booking.cancellation_reason_placeholder': 'Select a reason',
    'booking.cancellation_reasons.schedule_conflict': 'Schedule Conflict',
    'booking.cancellation_reasons.no_longer_needed': 'No Longer Needed',
    'booking.cancellation_reasons.found_alternative': 'Found Alternative',
    'booking.cancellation_reasons.other': 'Other',
    'booking.cancellation_message_label': 'Message (optional)',
    'booking.cancellation_message_placeholder':
      'Explain the reason for your cancellation...',
    'booking.confirm_cancellation': 'Confirm Cancellation',
    'booking.claim_title': 'Report a Problem',
    'booking.claim_type_label': 'Problem Type',
    'booking.claim_type_placeholder': 'Select problem type',
    'booking.claim_types.damage': 'Tool Damaged',
    'booking.claim_types.missing_parts': 'Missing Parts',
    'booking.claim_types.not_working': 'Tool Not Working',
    'booking.claim_types.dirty': 'Tool Dirty/Not Cleaned',
    'booking.claim_types.other': 'Other',
    'booking.claim_description_label': 'Problem Description',
    'booking.claim_description_placeholder':
      'Describe the problem in detail...',
    'booking.claim_upload_text': 'Drag your files here or click to select',
    'booking.claim_upload_hint': 'Images or videos (max 10MB)',
    'booking.submit_claim': 'Submit Claim',
    'tool.return.confirm_title': 'Confirm Tool Return',
    'tool.return.confirm_message':
      'Are you sure you want to confirm the return of this tool?',
    'tool.return.report_issue': 'Report an Issue',

    // Messages de succès harmonisés - Anglais
    'success.reservation.confirmed.title': '✅ Booking Confirmed!',
    'success.reservation.confirmed.message':
      'Your reservation has been successfully confirmed. You will receive a confirmation email.',

    'success.reservation.cancelled.title': '✅ Reservation Cancelled',
    'success.reservation.cancelled.message':
      'Your reservation has been successfully cancelled. You will receive a confirmation email.',

    'success.report.sent.title': '✅ Report Sent',
    'success.report.sent.message':
      'Your report has been successfully submitted to our team. We will process your request as soon as possible.',

    'success.tool.return.confirmed.title': '✅ Return Confirmed',
    'success.tool.return.confirmed.message':
      'You have successfully confirmed the tool return. The owner will be notified.',

    // requests
    'request.refuse': 'Request Denied',
    'request.refuse.message':
      'The denial has been forwarded to the administration.',
    'request.report.accepted.title': 'Report Sent',
    'request.report.accepted.message':
      'Your report has been submitted to the administration.',

    'request.accepted.title': 'Request Accepted',
    'request.accepted.message':
      'The reservation request has been successfully accepted.',

    'request.claim.reason': 'Problem Type',
    'request.claim.reason_placeholder': 'Select the type of problem',
    'request.claim.reason.damaged_tool': 'Damaged Tool',
    'request.claim.reason.no_showup': 'Renter Did Not Show Up',
    'request.claim.reason.late_return': 'Late Return',
    'request.claim.reason.inappropriate_behavior': 'Inappropriate Behavior',
    'request.claim.reason.fraud_attempt': 'Fraud Attempt',
    'request.claim.reason.missing_parts': 'Missing Parts',
    'request.claim.reason.not_working': 'Not Working Tool',
    'request.claim.reason.other': 'Other',
    'request.claim.evidence': 'Supporting Documents',
    'request.claim.evidence_placeholder':
      'Drag your files here or click to select',
    'request.claim.evidence_limit': 'Images or videos (max 10MB)',
    'request.claim.describe': 'Describe the problem',
    'request.claim.describe_placeholder': 'Describe the problem encountered...',
    'request.claim.submit': 'Submit Claim',

    'request.report.title': 'Report an Issue',
    'request.report.reason': 'Select a reason:',
    'request.report.reason.no_show': 'Renter did not show up',
    'request.report.reason.damaged_tool': 'Returned tool damaged',
    'request.report.reason.late_return': 'Late return',
    'request.report.reason.inappropriate_behavior': 'Inappropriate behavior',
    'request.report.reason.fraud_attempt': 'Fraud attempt',
    'request.report.reason.other': 'Other issue',
    'request.report.describe': 'Describe the issue',
    'request.report.submit': 'Submit Report',

    'request.pickup_confirm_button': 'Tool pickup',
    'request.pickup_confirm_title': 'Confirm Tool Pickup',
    'request.pickup_confirm_message1':
      'Are you sure you want to confirm that you’ve received your tool without reporting any issues?',
    'request.pickup_confirm_message2':
      'If you encountered a problem, click the link "Report an Issue"',
    'request.pickup_confirm': 'Yes, I confirm proper reception',
    'request.pickup_report': 'Report an Issue',

    'request.confirm_acceptence': 'Confirm Acceptance',
    'request.confirm_acceptence_message':
      'Are you sure you want to accept this rental request?',
    'request.title': 'My Reservation requests',
    'request.contact': 'Contact',
    'request.search': 'Search by Listing Title',
    'request.all': 'All',
    'request.pending': 'Pending',
    'request.accepted': 'Accepted',
    'request.ongoing': 'Ongoing',
    'request.completed': 'Completed',
    'request.cancelled': 'Cancelled',
    'request.declined': 'Declined',
    'request.all_periods': 'All Periods',
    'request.week': 'This Week',
    'request.month': 'This Month',
    'request.year': 'This Year',
    'request.reset': 'Reset',
    'request.results_found': 'Results Found',
    'request.day': 'day',
    'request.by': 'by',
    'request.reference': 'Reference',
    'request.pickup_time': 'Pick-up Time',
    'request.from': 'From',
    'request.to': 'To',
    'request.accept': 'Accept',
    'request.decline': 'Decline',
    'request.cancel': 'Cancel',
    'request.report': 'Report',
    'request.download_contract': 'Download Contract',
    'request.validation_code': 'Validation Code :',
    'request.enter_code': 'Enter Code',
    'request.confirm': 'Confirm',
    'request.validation_code_accepted': 'Return confirmed',
    'request.validation_code_accepted_message':
      'The tool has been successfully returned. The status is now "In Progress".',
    'request.validation_code_rejected': 'Invalid Code',
    'request.validation_code_rejected_message':
      'The verification code is incorrect!',
    'request.contact_renter_information': 'Renter Information',
    'request.contact_owner_information': 'Owner Information',
    'request.call': 'Call',
    'request.mail': 'E-mail',
    'requests.cancellationDetails': 'Cancellation Details',
    'request.message': 'Message',
    'request.reason': 'Reason',

    // pagination
    'pagination.next': 'Next',
    'pagination.previous': 'Previous',

    // catalog section
    'catalog_section.title': 'Tools Found',
    'catalog_section.by': 'By',
    'catalog_section.category': 'Category',
    'catalog_section.sort_by': 'Sort by',
    'catalog_section.most_recent': 'Most Recent',
    'catalog_section.price_low_to_high': 'Price: Low to High',
    'catalog_section.price_high_to_low': 'Price: High to Low',
    'catalog_section.top_rated': 'Top Rated',
    'catalog_section.filters': 'Filters',
    'catalog_section.search': 'Search',
    'catalog_section.tool_name': 'Tool Name',
    'catalog_section.location': 'Location',
    'catalog_section.all_categories': 'All Categories',
    'catalog_section.sub_category': 'Sub-category',
    'catalog_section.all_sub_categories': 'All Sub-categories',
    'catalog_section.daily_price': 'Daily Price',
    'catalog_section.apply_filters': 'Apply Filters',

    // blog section
    'blog_section.title': 'Latest Blog Articles',
    'blog_section.description':
      'Explore our tips, guides, and updates to succeed in all your DIY projects',
    'blog_section.min': 'min',
    'blog_section.read_article': 'Read Article',
    'blog_section.view_all': 'View all articles',
    'blog.Jardinage': 'Gardening',
    'blog.Entretien': 'Maintenance',
    'blog.Transport': 'Transport',
    'blog.Bricolage': 'Bricolage',
    'blog.Électricité': 'Electricity',
    'blog.Éclairage': 'Lighting',
    'blog.Peinture': 'Painting',
    'blog.Construction': 'Construction',
    'blog.Plantes': 'Plants',
    'blog.Nettoyage': 'Cleaning',
    'blog.Décoration': 'Decoration',
    'blog.Guide': 'Guide',

    // customer reviews
    'customer_reviews.title': 'What our users say',
    'customer_reviews.description':
      'Find out what our users think about our platform.',

    // rental process
    'rental_process.title': 'How does it work?',
    'rental_process.description': 'Rent your tools in 4 simple steps...',
    'rental_process.step1.title': 'Post your listing in a few clicks',
    'rental_process.step1.description':
      'Add your tools with photos and a detailed description in just a few minutes.',
    'rental_process.step2.title': 'Maximize your visibility',
    'rental_process.step2.description':
      'Your listing is seen by thousands of users looking for tools.',
    'rental_process.step3.title': 'Receive your first bookings',
    'rental_process.step3.description':
      'Renters contact you directly to reserve your tools for the desired dates.',
    'rental_process.step4.title': 'Collect your earnings with peace of mind',
    'rental_process.step4.description':
      'Receive your payments securely and generate additional income.',

    // Profile translations
    'profile.first_name': 'First name',
    'profile.last_name': 'Last name',
    'profile.email': 'Email',
    'profile.phone': 'Phone number',
    'profile.country': 'Country',
    'profile.address': 'Address',
    'profile.edit_profile_photo':
      'Click on "Edit" to change your profile photo',
    'profile.verified': 'Verified',
    'profile.account_type_individual': 'Individual',
    'profile.account_type_company': 'Company',
    'profile.average_rating': 'Average rating',
    'profile.rentals_completed': 'Rentals completed',
    'profile.active_ads': 'Active ads',
    'profile.total_earnings': 'Total earnings',
    'profile.delete_account': 'Delete my account',
    'profile.back_home': 'Back to home',
    'profile.profile': 'Profile',
    'profile.favorites': 'Favorites',
    'profile.ads': 'Ads',
    'profile.reservations': 'Reservations',
    'profile.requests': 'Requests',
    'profile.wallet': 'Wallet',
    'profile.edit': 'Edit',
    'profile.member_since': 'Member since {date}',
    'profile.select_country': 'Select a country',
    'profile.address_placeholder': 'Enter your full address',
    'profile.address_hint': 'Enter a valid address compatible with Google Maps',
    'profile.delete_confirm': 'Are you sure you want to delete your account?',
    'profile.delete_description':
      'This action is irreversible. All your data, ads, reservations, and transaction history will be permanently deleted.',
    'profile.account_deletion_pending': 'Account pending deletion',
    'profile.delete_processing':
      'Your request will be processed within 72 hours, allowing our team to verify that no ongoing claims or disputes are linked to your account.',
    'profile.current_password': 'Current Password',
    'profile.new_password': 'New Password',

    // Wallet translations
    'wallet.title': 'My Wallet',
    'wallet.total': 'Total',
    'wallet.cumulative_balance': 'Cumulative balance',
    'wallet.available': 'Available',
    'wallet.available_balance': 'Available balance',
    'wallet.successful': 'Successful',
    'wallet.successful_transactions': 'Successful transactions',
    'wallet.withdraw_money': 'Withdraw my money',
    'wallet.withdrawal_note':
      'You can withdraw your money once your cumulative balance reaches 50 GBP.',
    'wallet.conversion_rate': '50 GBP = {minWithdrawalEUR} EUR',
    'wallet.dynamic_conversion':
      'The conversion rate updates dynamically based on the currency selected in the account.',

    // recent transactions
    'wallet.recent_transactions': 'Recent Transactions',
    'wallet.select_time_period': 'Select a time period',
    'wallet.all_transactions': 'All transactions',
    'wallet.incoming_payments': 'Incoming payments',
    'wallet.withdrawal': 'Withdrawal',
    'wallet.reset': 'Reset',
    'wallet.completed': 'Completed',
    'wallet.pending': 'Pending',
    'wallet.failed': 'Failed',

    // New FAQ translations
    'faq.hero.title': 'Frequently Asked Questions',
    'faq.hero.subtitle': 'Find quick answers to your most common questions',
    'faq.title': 'General Questions',
    'faq.general.q1': 'What is Bricola and how does it work?',
    'faq.general.a1':
      'Bricola LTD is a peer-to-peer rental platform for tools and equipment. Users can list their tools for rent or rent tools from others. The platform manages transactions, deposits, and dispute resolution.',
    'faq.general.q2': 'What categories of tools can be listed?',
    'faq.general.a2':
      'Currently, Bricola supports DIY, gardening, cleaning, and event-related equipment. More categories may be added based on market needs.',
    'faq.general.q3': 'Is there a mobile app for Bricola?',
    'faq.general.a3':
      'Yes. Bricola is available on both iOS and Android, in addition to a full-featured web platform.',
    'faq.general.q4': 'Can I use Bricola from any country?',
    'faq.general.a4':
      'Currently, Bricola serves users in the Gulf region. Expansion to other regions is planned.',
    'faq.general.q5': 'Can businesses list tools?',
    'faq.general.a5':
      'Yes, but Bricola is primarily designed for individual users. Professional listings must comply with local business regulations.',
    'faq.general.q6': 'What items are prohibited?',
    'faq.general.a6':
      'Illegal items, hazardous equipment, or tools that violate safety laws are strictly forbidden.',
    'faq.general.q7': 'Can I suggest a feature?',
    'faq.general.a7':
      'Yes, we welcome feedback. Contact support with your idea and we’ll consider it for future updates.',
    'faq.general.q8': 'How do I contact customer support?',
    'faq.general.a8':
      'Use the WhatsApp chat, or email us at support@bricolaltd.com. Our team is available 7 days a week.',
    'faq.renters.title': 'For Renters',
    'faq.renters.q1': 'How do I create an account?',
    'faq.renters.a1':
      'Register with your name, email, phone number, and verification documents if required. You will need to confirm your phone and email.',
    'faq.renters.q2': 'Why is ID verification required?',
    'faq.renters.a2':
      'To ensure trust and security, ID verification may be requested before renting out high-value tools or making large withdrawals.',
    'faq.renters.q3': 'What should I do before receiving a tool?',
    'faq.renters.a3':
      'Make sure your ID is verified, agree on rental terms with the owner, and inspect the tool upon handover.',
    'faq.renters.q4': 'What if the tool gets damaged during my rental?',
    'faq.renters.a4':
      'Inform the owner and support immediately. You may be asked to provide evidence so the issue can be resolved through the deposit.',
    'faq.owners.title': 'For Owners',
    'faq.owners.q1': 'How do I list a tool?',
    'faq.owners.a1':
      'Go to "List a Tool", upload clear photos, provide a description, condition, guarantee, price per day, and select the required deposit.',
    'faq.owners.q2': 'What happens after I list my item?',
    'faq.owners.a2':
      'It will be reviewed by our moderation team before going live. You’ll be notified when someone makes a booking.',
    'faq.owners.q3': 'Can I reject a booking request?',
    'faq.owners.a3':
      'Yes, owners can accept or reject requests. However, excessive rejections without valid reason may affect your visibility.',
    'faq.owners.q4': 'What should I do before handing over my tool?',
    'faq.owners.a4':
      'Check the renter’s ID, document the tool’s condition with photos, and agree on return terms.',
    'faq.owners.q5': 'What if the tool is damaged?',
    'faq.owners.a5':
      'Submit evidence within 24 hours of return. Bricola will review and decide whether to compensate from the deposit.',
    'faq.owners.q6': 'Is there insurance for listed tools?',
    'faq.owners.a6':
      'Currently, Bricola does not offer insurance. Owners are advised to list only tools they can risk renting.',
    'faq.payment.title': 'Payments & Safety',
    'faq.payment.q1': 'How are payments handled?',
    'faq.payment.a1':
      'Payments are processed securely via Stripe. Renters pay in advance, including the deposit.',
    'faq.payment.q2': 'What is the security deposit?',
    'faq.payment.a2':
      'A refundable amount held by Stripe to cover potential damages or non-return. It’s automatically released upon successful return.',
    'faq.payment.q3': 'How do I withdraw my earnings?',
    'faq.payment.a3': 'You can request a payout to your bank account via Wise.',
    'faq.payment.q4': 'What fees does Bricola charge?',
    'faq.payment.a4':
      'Bricola charges a 15% commission on every successful rental. No listing or monthly fees.',
    'faq.payment.q5': 'How are disputes handled?',
    'faq.payment.a5':
      'All disputes are handled by our internal support team within 72 hours. Their decision is final.',
    'faq.payment.q6': 'What measures are in place for safety?',
    'faq.payment.a6':
      'ID verification, user reviews, secure payments, and support monitoring ensure a safe and trusted environment.',
    // Navigation
    'nav.home': 'Home',
    'nav.catalog': 'Catalogue',
    'nav.navigation': 'navigation',
    'nav.propos': 'About Us',
    'nav.blog': 'Blog',
    'nav.contact': 'Contact Us',
    'nav.rent': 'Rent',
    'nav.list': 'List a tool',
    'nav.login': 'Login',
    'nav.signup': 'Sign up',
    'nav.profile': 'Profile',
    'nav.wallet': 'Wallet',
    'nav.settings': 'Settings',
    'nav.logout': 'Logout',

    // Hero section
    'hero.title': 'Rent and share your tools with ease',
    'hero.subtitle':
      'The platform that connects tool owners with those who need them. Individuals and professionals, find the perfect tool near you.',
    'hero.search.placeholder': 'Search for a tool...',
    'hero.search.location': 'Location',
    'hero.search.button': 'Search',
    'hero.available_tools': 'Tools Available',
    'hero.active_users': 'Active Users',
    'hero.cities_covered': 'Cities Covered',

    // Categories
    'categories.title': 'Our Categories',
    'categories.description': 'Find the perfect tool for your needs',

    'categories.gardening': 'Gardening',
    'subcategories.lawn-mowers': 'Lawn Mowers',
    'subcategories.hedge-trimmers': 'Hedge Trimmers',
    'subcategories.pruning-tools': 'Pruning Tools',
    'subcategories.watering': 'Watering',
    'subcategories.garden-hand-tools': 'Garden Hand Tools',

    'subcategories.soil-maintenance': 'Soil Maintenance',
    'subcategories.plant-care': 'Plant Care',
    'subcategories.pruning-and-cutting': 'Pruning and Cutting',
    'subcategories.cleaning-and-collection': 'Cleaning and Collection',
    'subcategories.watering-and-irrigation': 'Watering and Irrigation',

    'categories.cleaning': 'Cleaning',

    'subcategories.vacuum-cleaners': 'Vacuum Cleaners',
    'subcategories.pressure-washers': 'Pressure Washers',
    'subcategories.floor-care': 'Floor Care',
    'subcategories.cleaning-supplies': 'Cleaning Supplies',
    //     Nettoyage intérieur | Indoor Cleaning | التنظيف الداخلي
    // Nettoyage extérieur | Outdoor Cleaning | التنظيف الخارجي
    // Gestion des déchets et poussière | Waste and Dust Management | إدارة النفايات والغبار
    'subcategories.indoor-cleaning': 'Indoor Cleaning',
    'subcategories.outdoor-cleaning': 'Outdoor Cleaning',
    'subcategories.waste-and-dust-management': 'Waste and Dust Management',

    'categories.diy': 'DIY',

    'subcategories.power-tools': 'Power Tools',
    'subcategories.hand-tools': 'Hand Tools',
    'subcategories.measuring-tools': 'Measuring Tools',
    'subcategories.painting': 'Painting',

    'subcategories.construction': 'Construction',
    'subcategories.electricity': 'Electricity',
    'subcategories.screws-and-bolts': 'Screws and Bolts',

    'categories.events': 'Events',
    'subcategories.party-equipment': 'Party Equipment',
    'subcategories.sound-lighting': 'Sound & Lighting',
    'subcategories.event-decoration': 'Event Decoration',
    'subcategories.catering-equipment': 'Catering Equipment',
    //     Son | Sound | صوت
    // Éclairage | Lighting | إضاءة
    // Cuisine | Cooking | طبخ
    // Animation et jeux | Entertainment & Games | ترفيه وألعاب
    // Décoration | Decoration | زينة
    // Mobilier | Furniture | أثاث
    // Structure | Structure | هيكل
    'subcategories.sound': 'Sound',
    'subcategories.lighting': 'Lighting',
    'subcategories.cooking': 'Cooking',
    'subcategories.entertainment-games': 'Entertainment & Games',
    'subcategories.decoration': 'Decoration',
    'subcategories.furniture': 'Furniture',
    'subcategories.structure': 'Structure',

    'categories.transport': 'Transport',
    // Tools
    'tools.featured': 'Featured tools',
    'tools.description': 'Top-rated and most requested tools by our community',
    'tools.display_all': 'View All Tools',
    'tools.by': 'by',
    'tools.day': 'day',
    'tools.available': 'Available',
    'tools.rent': 'Rent',
    'tools.details': 'View details',
    'tools.new_ad': 'New ad',
    'tools.my_ads': 'My ads',
    'tools.edit': 'Edit',
    'tools.view': 'View',
    'tools.delete': 'Delete',
    'tools.published': 'Published',
    'tools.unpublished': 'Unpublished',
    'tools.pending': 'Pending',
    'tools.approved': 'Approved',

    // AddTool translations
    'addtool.verification_in_progress': 'Verification in progress...',
    'addtool.name_available': 'Name available ✓',
    'addtool.name_already_used': 'This name is already used',
    'addtool.error_occurred': 'An error occurred',
    'addtool.error_name_check': 'Error checking name availability',
    'addtool.error_upload': 'Error uploading image',
    'addtool.error_create_tool': 'Error creating tool',
    'addtool.success_created': 'Tool successfully created!',
    'addtool.success_updated': 'Tool successfully updated!',

    // validation
    'validation.checking': 'Checking...',
    'validation.name_available': 'Name available ✓',
    'validation.name_taken': 'This name is already taken',
    'validation.verification_error': 'Verification error',
    'validation.service_unavailable': 'Verification service unavailable',
    'validation.server_error': 'Server error, please try again',
    'validation.title_required': 'Title is required',
    'validation.name_invalid': 'Tool name must be unique',
    'validation.category_required': 'Category is required',
    'validation.condition_required': 'Tool condition is required',
    'validation.price_invalid': 'Price per day must be greater than 0',
    'validation.limit_reached': 'You can add a maximum of 10 photos',
    'validation.description_max_chars': 'You have exceeded the maximum number of allowed characters (500).',
    'validation.instructions_max_chars': 'You have exceeded the maximum number of allowed characters (300).',
    'validation.price_max_amount': 'The maximum price per day is 500 GBP.',
    'validation.deposit_max_amount': 'The maximum deposit is 500 GBP.',
    'validation.character_counter': 'Warning: {current}/{max} characters used.',
    'validation.char_count': '{current}/{max} characters',

    // Currency names
    'currency.GBP': 'British Pound Sterling',
    'currency.KWD': 'Kuwaiti Dinar',
    'currency.SAR': 'Saudi Riyal',
    'currency.BHD': 'Bahraini Dinar',
    'currency.OMR': 'Omani Rial',
    'currency.QAR': 'Qatari Riyal',
    'currency.AED': 'United Arab Emirates Dirham',
    'currency.label': 'Currency',

    // Deposit Payment Modal (duplicated keys removed)
    'deposit.modal.description': 'Please pay the security deposit to confirm your reservation. This amount will be refunded after the rental period if no damages occur.',
    'deposit.modal.amount.label': 'Deposit Amount',
    'deposit.modal.payment.title': 'Payment Information',
    'deposit.modal.payment.description': 'Enter your card details to pay the deposit',
    'deposit.modal.buttons.cancel': 'Cancel Reservation',
    'deposit.modal.buttons.pay': 'Pay Deposit',
    'deposit.modal.buttons.processing': 'Processing...',
    'deposit.modal.cancel.confirm.title': 'Cancel Reservation?',
    'deposit.modal.cancel.confirm.message': 'Are you sure you want to cancel this reservation? This action cannot be undone.',
    'deposit.modal.cancel.confirm.yes': 'Yes, Cancel',
    'deposit.modal.cancel.confirm.no': 'Keep Reservation',
    'deposit.modal.success.title': 'Payment Successful!',
    'deposit.modal.success.message': 'Your deposit has been processed successfully. Your reservation is now confirmed.',
    'deposit.modal.error.payment': 'Payment failed. Please try again.',
    'deposit.modal.error.cancel': 'Failed to cancel reservation. Please try again.',
    'deposit.modal.error.generic': 'An error occurred. Please try again.',
    'deposit.notification.title': 'Deposit Payment Required',
    'deposit.notification.message': 'Your reservation starts in 24 hours. Please pay the deposit to confirm.',
    'validation.first_name_required': 'First name is required',
    'validation.last_name_required': 'Last name is required',
    'validation.email_required': 'Email address is required',
    'validation.password_required': 'Password is required',
    'validation.terms_required': 'You must accept the terms of use',
    'validation.privacy_required': 'You must accept the privacy policy',

    // Contact form validation
    'contact.validation.firstName_required': 'First name is required.',
    'contact.validation.firstName_min_length':
      'First name must be at least 2 characters.',
    'contact.validation.lastName_required': 'Last name is required.',
    'contact.validation.lastName_min_length':
      'Last name must be at least 2 characters.',
    'contact.validation.email_required': 'Email is required.',
    'contact.validation.email_invalid': 'Email format is invalid.',
    'contact.validation.phone_invalid': 'Phone number format is invalid.',
    'contact.validation.subject_required': 'Subject is required.',
    'contact.validation.subject_min_length':
      'Subject must be at least 5 characters.',
    'contact.validation.message_required': 'Message is required.',
    'contact.validation.message_min_length':
      'Message must be at least 10 characters.',
    'contact.validation.category_required': 'Category is required.',
    'contact.category.label': 'Category *',
    'contact.category.placeholder': 'Select a category',
    'contact.category.technical': 'Technical',
    'contact.category.payment': 'Payment',
    'contact.category.account': 'Account',
    'contact.category.dispute': 'Dispute',
    'contact.category.suggestion': 'Suggestion',
    'contact.category.other': 'Other',
    'addtool.name_placeholder': 'Tool name',
    'addtool.description_placeholder': 'Describe your tool...',
    'addtool.category_gardening': 'Gardening',
    'addtool.category_construction': 'Construction',
    'addtool.category_automotive': 'Automotive',
    'addtool.category_electronics': 'Electronics',
    'addtool.category_cleaning': 'Cleaning',
    'addtool.category_painting': 'Painting',
    'addtool.category_plumbing': 'Plumbing',
    'addtool.category_electrical': 'Electrical',
    'addtool.category_woodworking': 'Woodworking',
    'addtool.category_other': 'Other',
    'tools.rejected': 'Rejected',
    'tools.back_to_results': 'Back to Results',
    'tools.verified': 'Verified',
    'tools.owner': 'Owner',
    'tools.model': 'Model',
    'tools.brand': 'Brand',
    'tools.year_of_purchase': 'Year of Purchase',
    'tools.fees_and_taxes': 'Including fees and tax',
    'tools.of': 'of',
    'tools.charged': 'charged',
    'tools.deposit': 'Deposit',
    'tools.refunded': '(refunded at the end of rental)',
    'tools.rent_now': 'Rent Now',
    'tools.add_to_favorites': 'Add to Favorites',
    'tools.remove_from_favorites': 'Remove from Favorites',
    'tools.desc': 'Description',
    'tools.instructions': "Owner's Instructions",
    'tools.reviews': 'Renter Reviews',
    'tools.condition_new': 'New',
    'tools.condition_like_new': 'Like New',
    'tools.condition_good': 'Good',
    'tools.condition_fair': 'Fair',
    'tools.condition_poor': 'Poor',
    'tools.condition_unknown': 'Unknown',

    // Forms
    'form.first_name': 'First name',
    'form.last_name': 'Last name',
    'form.email': 'Email',
    'form.phone': 'Phone',
    'form.address': 'Address',
    'form.country': 'Country',
    'form.password': 'Password',
    'form.confirm_password': 'Confirm password',
    'form.title': 'Title',
    'form.description': 'Description',
    'form.price': 'Price',
    'form.category': 'Category',
    'form.location': 'Location',

    // Actions
    'action.search': 'Search',
    'action.filter': 'Filter',
    'action.sort': 'Sort',
    'action.save': 'Save',
    'action.cancel': 'Cancel',
    'action.confirm': 'Confirm',
    'action.delete': 'Delete',
    'action.edit': 'Edit',
    'action.view': 'View',
    'action.contact': 'Contact',
    'action.close': 'Close',
    'action.back': 'Back',
    'action.next': 'Next',
    'action.previous': 'Previous',

    // Floating Action Button
    'fab.contact_support': 'Contact support',
    'fab.publish_ad': 'Publish ad',
    'fab.find_tool': 'Find my tool',

    // Messages
    'message.success': 'Success',
    'message.error': 'Error',
    'message.loading': 'Loading...',
    'message.no_results': 'No results found',
    'message.confirm_delete': 'Are you sure you want to delete?',

    // Footer
    'footer.about': 'About',
    'footer.help': 'Help',
    'footer.discover': 'Discover Bricola',
    'footer.useful_links': 'Useful links',
    'footer.contact': 'Contact',
    'footer.legal': 'Legal',
    'footer.rights': 'All rights reserved',
    'footer.cgu': 'Terms',
    'footer.privacy': 'Privacy policy',
    'footer.faq': 'FAQ',
    'footer.description':
      'The tool rental platform that connects owners with those who need them. Simple, secure, and local.“www.bricolaltd.com” is a trademark of BRICOLA LTD.Registered in England and Wales under number: 16401372',
    'footer.contrat': 'Rental Agreement', // Added
    'footer.payment': 'Payment Methods', // Added
    'footer.help_center': 'Help Center', // Added
    'footer.owner_guide': 'Owner’s Guide', // Added
    'footer.renter_guide': 'Renter’s Guide', // Added
    'footer.terms_conditions': 'Terms & Conditions', // Added

    // Login
    'login.title': 'Login',
    'login.subtitle': 'Connect to your Bricola LTD account',
    'login.email': 'Email',
    'login.password': 'Password',
    'login.signin': 'Sign in',
    'login.no_account': 'No account yet? Sign up',
    'login.forgot_password': 'Forgot password?',

    // Register
    'register.title': 'Sign up',
    'register.subtitle': 'Create your Bricola LTD account',
    'register.user_type': 'User type',
    'register.individual': 'Individual',
    'register.business': 'Business',
    'register.first_name': 'First name',
    'register.last_name': 'Last name',
    'register.phone': 'Phone',
    'register.country': 'Country',
    'register.address': 'Address',
    'register.address_help': 'Complete address with postal code and city',
    'register.password': 'Password',
    'register.confirm_password': 'Confirm password',
    'register.terms': 'I accept the General terms of use',
    'register.sales_conditions': 'I accept the Privacy Policy',
    'register.create_account': 'Create my account',
    'register.have_account': 'Already have an account? Sign in',
    'register.select_country': 'Select a country',

    // About
    'about.title': 'Welcome to Bricola LTD ',
    'about.subtitle':
      'Your trusted platform for peer-to-peer tool rentals across the Gulf region',
    'about.mission_title': 'About Us',
    'about.mission_1':
      'Bricola LTD is a leading platform registered in the United Kingdom since 2025, providing a fully digital service that enables individuals to rent tools to and from each other easily and securely.',
    'about.mission_2':
      'Our idea was born from a clear need: many people own tools they rarely use, while others need access to high-quality tools without the cost of purchasing them. We provide a practical, efficient solution to bridge this gap.',
    'about.mission_3':
      'Our services focus on connecting people who need tools for home maintenance, DIY projects, gardening, cleaning, or events, with local tool owners via an easy-to-use mobile app and website.',
    'about.mission_4':
      'Through our platform, users can list their tools with detailed information (photos, description, price, deposit) for others to rent on a short- or long-term basis, with payments processed through a secure, integrated digital system.',
    'about.advantages': 'Our value proposition includes:',
    'about.advantages_1':
      'A cost-effective solution that reduces waste and promotes sustainability.',
    'about.advantages_2':
      'A quick and easy way to find the right tools within minutes.',
    'about.advantages_3':
      'A secure payment system with built-in protection for every transaction.',
    'about.advantages_4':
      'A transparent experience that builds trust between owners and renters.',
    'about.mission_5':
      'Choosing Bricola LTD means saving money and time, getting what you need in a smart and sustainable way, and contributing to building the future of tool rental in the Gulf region.',
    'about.mission_6': 'Thank you for being part of the Bricola community.',
    'about.values_title': 'Our Values',
    'about.community': 'Community',
    'about.community_desc':
      'Create connections between neighbors and promote local mutual aid',
    'about.security': 'Security',
    'about.security_desc':
      'Guarantee secure transactions and comprehensive insurance',
    'about.quality': 'Quality',
    'about.quality_desc': 'Ensure all tools meet our quality standards',
    'about.simplicity': 'Simplicity',
    'about.simplicity_desc': 'Make tool rental as simple as a click',
    'about.stats_title': 'Bricola in numbers',
    'about.tools_available': 'Tools available',
    'about.active_users': 'Active users',
    'about.cities_covered': 'Cities covered',
    'about.satisfaction': 'Customer satisfaction',
    'about.team_title': 'Our Team',
    'about.founder.name': 'Adel Jebali',
    'about.founder.role': 'CEO et Founder',
    'about.founder.bio':
      'Ph.D in Computer Science | Cybersecurity & Resiliency Consultant',

    // Contact
    'contact.title': 'Contact us',
    'contact.subtitle':
      'A question, a problem or just want to chat? Our team is here to help you.',
    'contact.form_title': 'Send us a message',
    'contact.first_name': 'First name',
    'contact.last_name': 'Last name',
    'contact.subject': 'Subject',
    'contact.message': 'Message',
    'contact.phone': 'Phone',
    'contact.phone_placeholder': '+44 20 1234 5678',
    'contact.sending': 'Sending...',
    'contact.send': 'Send message',
    'contact.error_title': 'Error',
    'contact.error_message':
      'An error occurred while sending your message. Please try again.',
    'contact.success_title': 'Message sent!',
    'contact.success_message':
      'Your message has been sent successfully. We will respond to you as soon as possible.',
    'contact.email_title': 'Email',
    'contact.phone_title': 'Phone',
    'contact.address_title': 'Address',
    'contact.hours_title': 'Hours',
    'contact.hours_weekdays': 'Monday - Friday: 9:00 AM - 6:00 PM',
    'contact.hours_saturday': 'Saturday: 10:00 AM - 4:00 PM',
    'contact.hours_sunday': 'Sunday: Closed',
    'contact.faq_title': 'Frequently asked questions',
    'contact.how_to_rent': 'How to rent a tool?',
    'contact.how_to_rent_answer':
      "Search for the desired tool, select rental dates, and confirm your reservation. It's that simple!",
    'contact.problem': 'What to do in case of a problem?',
    'contact.problem_answer':
      'Contact us immediately via our customer support. We are here to solve all your problems quickly.',
    'contact.how_to_list': 'How to list my tools?',
    'contact.how_to_list_answer':
      'Click on "List a tool" in the navigation, add details and photos of your tool, and start earning money.',
    'contact.insurance': 'Are tools insured?',
    'contact.insurance_answer':
      'Yes, all tools rented via Bricola are covered by our comprehensive insurance for your peace of mind.',

    // Add Tool
    'add_tool.title': 'List a tool',
    'add_tool.subtitle':
      'Share your tools with the community and generate income by renting them easily',
    'add_tool.info_title': 'Tool information',
    'add_tool.general_info': 'General information',
    'add_tool.ad_title': 'Ad title',
    'add_tool.brand': 'Brand',
    'add_tool.model': 'Model',
    'add_tool.year': 'Purchase year',
    'add_tool.description': 'Description',
    'add_tool.categorization': 'Categorization',
    'add_tool.category': 'Category',
    'add_tool.subcategory': 'Subcategory',
    'add_tool.condition': 'Tool condition',
    'add_tool.pricing': 'Pricing',
    'add_tool.price_per_day': 'Price per day ',
    'add_tool.deposit': 'Deposit ',
    'add_tool.location_title': 'Location',
    'add_tool.address': 'Address or city',
    'add_tool.photos_title': 'Photos',
    'add_tool.add_photos': 'Add your photos',
    'add_tool.drop_images': 'Drop your images here or click to browse',
    'add_tool.browse_files': 'Browse files',
    'add_tool.file_format': 'PNG, JPG up to 10MB • 5 photos maximum',
    'add_tool.instructions_title': 'Usage instructions',
    'add_tool.owner_instructions': 'Owner instructions',
    'add_tool.publish': 'Publish ad',
    'add_tool.choose_category': 'Choose a category',
    'add_tool.choose_subcategory': 'Choose a subcategory',
    'add_tool.condition_new': '✨ New',
    'add_tool.condition_excellent': '🌟 Excellent',
    'add_tool.condition_good': '👍 Good',
    'add_tool.condition_fair': '👌 Fair',
    'add_tool.title_placeholder': 'Enter your tool title...',
    'add_tool.brand_placeholder': 'Tool brand',
    'add_tool.model_placeholder': 'Tool model',
    'add_tool.year_placeholder': 'Purchase year',
    'add_tool.description_placeholder':
      'Describe your tool, its condition, included accessories...',

    // Categories and subcategories
    'category.gardening': 'Gardening',
    'category.gardening.lawn': 'Lawn',
    'category.gardening.soil': 'Soil',
    'category.gardening.wood': 'Wood',
    'category.gardening.tree': 'Tree',
    'category.gardening.leaves': 'Leaves',

    'category.cleaning': 'Cleaning',
    'category.cleaning.fabric': 'Fabric',
    'category.cleaning.water': 'Water',
    'category.cleaning.dust': 'Dust',

    'category.diy': 'DIY',
    'category.diy.construction': 'Construction',
    'category.diy.electricity': 'Electricity',
    'category.diy.painting': 'Painting',
    'category.diy.screws_and_bolts': 'Screws and Bolts',

    'category.transport': 'Transport',
    'category.transport.heavy_load': 'Heavy Load',
    'category.transport.engine': 'Engine',
    'category.transport.wheel': 'Wheel',

    'category.event': 'Event',
    'category.event.lighting': 'Lighting',
    'category.event.kitchen': 'Kitchen',
    'category.event.entertainment_and_games': 'Entertainment and Games',
    'category.event.furniture': 'Furniture',
    'category.event.decoration': 'Decoration',
    'category.event.structure': 'Structure',

    // Common
    'common.yes': 'Yes',
    'common.no': 'No',
    'common.ok': 'OK',
    'common.language': 'Language',
    'common.currency': 'Currency',
    'common.menu': 'Menu',
    'common.navigation': 'Navigation',
    'common.home': 'Home',
    'common.p': 'loading data',
    'common.loading': 'loading data',

    // CGU (Terms of Use)

    'cgu.title': 'Terms of Use',

    'cgu.last_updated': 'Last updated: January 1, 2025',

    'cgu.section1.title': '1. Introduction',

    'cgu.section1.p1':
      'Bricola LTD is an online peer-to-peer rental platform specialized in tools and equipment for DIY, gardening, cleaning, and event organization.',

    'cgu.section1.p2':
      'Bricola acts solely as a trusted intermediary. It does not own, store, transport, or handle any of the rented items.',

    'cgu.section2.title': '2. Access to the Platform',

    'cgu.section2.p1':
      'Access to the platform is available via web and mobile applications.',

    'cgu.section2.p2':
      'The service is reserved for adults (18 years and older) who are legally capable.',

    'cgu.section2.p3':
      'Bricola reserves the right to suspend or terminate any user account in case of a breach of these terms, fraudulent activity, or abuse.',

    'cgu.section3.title': '3. User Registration and Verification',

    'cgu.section3.li1':
      'Registration requires a valid email address, an active phone number, and official identification.',

    'cgu.section3.li2':
      'To request withdrawals, users must provide accurate bank account details.',

    'cgu.section3.li3':
      'Bricola reserves the right to request identity verification documents (KYC) for high-value transactions.',

    'cgu.section3.li4':
      'Account access is strictly personal and non-transferable. Sharing, duplicating, or transferring the account is prohibited.',

    'cgu.section4.title': '4. Rental Rules and Responsibilities',

    'cgu.section4.li1':
      'Renters agree to return rented items in their original condition.',

    'cgu.section4.li2':
      'Owners guarantee that listed items are functional, clean, and compliant with current laws.',

    'cgu.section4.li3':
      'In case of disputes, Bricola may require supporting evidence (photos, videos, statements).',

    'cgu.section4.li4':
      'Delayed returns may incur penalties calculated hourly or daily.',

    'cgu.section4.li5':
      'The rental duration may not exceed 5 consecutive days. Extensions require a new booking on the platform, after availability is confirmed by the owner.',

    'cgu.section4.li6':
      'In the event of item loss, the full security deposit may be retained.',

    'cgu.section4.li7':
      'Abuse or misuse of equipment may result in permanent account suspension.',

    'cgu.section5.title': '5. Payments, Commission & Wallets',

    'cgu.section5.li1':
      'All payments are processed via Stripe, in accordance with local financial regulations.',

    'cgu.section5.li2':
      'A 6% service fee is applied to the renter at checkout. This covers Stripe processing fees and a portion of the platform’s technical costs (hosting, maintenance, updates).',

    'cgu.section5.li3':
      'A 15% commission is automatically deducted from each successful transaction.',

    'cgu.section5.li4':
      'Owner earnings are credited to an internal wallet and can be withdrawn via Wise when the balance reaches £50.',

    'cgu.section5.li5':
      'This threshold helps reduce small withdrawal requests, minimize banking fees, and streamline financial operations.',

    'cgu.section5.li6':
      'Bricola is not responsible for delays or external restrictions related to Wise transfers.',

    'cgu.section6.title': '6. Security Deposit Policy',

    'cgu.section6.li1':
      'Each rental involves a temporary security deposit held via Stripe.',

    'cgu.section6.li2':
      'This deposit is released 24 hours after item return, subject to validation.',

    'cgu.section6.li3':
      'In case of damage, loss, or dispute, all or part of the deposit may be withheld.',

    'cgu.section6.li4':
      'The affected user will be notified by email before any final deduction.',

    'cgu.section7.title': '7. Dispute Handling',

    'cgu.section7.li1':
      'All disputes must be reported within 24 hours of the scheduled return.',

    'cgu.section7.li2':
      'The support team will investigate the case within 72 hours and issue a final decision.',

    'cgu.section7.li3':
      'Bricola reserves the right to mediate and apply any financial adjustments it deems necessary.',

    'cgu.section7.li4':
      'The decision is considered final and binding for both parties.',

    'cgu.section8.title': '8. Fair Use and Platform Integrity',

    'cgu.section8.li1': 'Listings must represent real, legally owned items.',

    'cgu.section8.li2':
      'Mass or automated uploading of fake listings is prohibited.',

    'cgu.section8.li3':
      'The listing of prohibited items (weapons, hazardous substances, etc.) is strictly forbidden.',

    'cgu.section8.li4':
      'Repeat offenders will be permanently banned from the platform.',

    'cgu.section9.title': '9. Cancellations & Refund Policy',

    'cgu.section9.li1':
      'Renters may cancel and receive a full refund if cancellation is made at least 24 hours before the rental start time.',

    'cgu.section9.li2':
      'No refund will be issued for cancellations made within 24 hours of the rental start.',

    'cgu.section9.li3':
      'If the owner cancels, the renter will receive a full refund. Repeated cancellations by owners may lead to sanctions.',

    'cgu.section10.title': '10. Service Availability & Updates',

    'cgu.section10.li1':
      'Occasional service interruptions may occur due to maintenance or updates.',

    'cgu.section10.li2':
      'Users will be notified in advance in the case of planned downtime.',

    'cgu.section10.li3':
      'Bricola reserves the right to modify or remove certain features without prior notice to optimize user experience.',

    'cgu.section11.title': '11. Data Protection and Privacy',

    'cgu.section11.li1':
      'Personal data is processed in accordance with GDPR (UK and EU General Data Protection Regulation).',

    'cgu.section11.li2': 'Sensitive data is encrypted and securely stored.',

    'cgu.section11.li3':
      'Users may request deletion, modification, or export of their data at any time.',

    'cgu.section11.li4':
      'No data will be sold or shared without explicit consent.',

    'cgu.section12.title': '12. Jurisdiction and Legal Framework',

    'cgu.section12.li1': 'These terms are governed by English law.',

    'cgu.section12.li2':
      'If no amicable solution is found, disputes shall be resolved exclusively by the courts of London.',

    'cgu.section12.li3':
      'Any updates to these terms will be notified on the platform. Continued use implies acceptance of the revised terms.',

    'cgu.section13.title': '13. Automatic Confirmation in Case of Inactivity',

    'cgu.section13.p':
      'In certain cases where a user (renter or owner) does not respond within a reasonable time, Bricola LTD reserves the right to automatically confirm the status of a transaction (delivery or return). This ensures continuity and reliability of service. Users are encouraged to follow up and validate their actions promptly.',

    'cgu.section14.title': '14. Modification and Acceptance of Terms',

    'cgu.section14.p1':
      'These Terms of Use may be modified at any time to reflect legal, technical, or operational changes.',

    'cgu.section14.p2': 'Users will be notified of any substantial updates.',

    'cgu.section14.p3':
      'Continued use of the platform after changes implies acceptance of the new terms.',

    'cgu.section15.title': '15. Contact and Official Communication',

    'cgu.section15.p1':
      'For questions, complaints, or legal notices related to these terms, users can contact Bricola LTD at: contact@bricolaltd.com',

    'cgu.section15.p2':
      'All official communications will be sent to the email address associated with the user account.', // Privacy Policy

    'privacy.title': 'Privacy Policy',

    'privacy.last_updated': 'Effective Date: September 1, 2025',

    'privacy.section1.title': '1. Introduction',

    'privacy.section1.p1':
      'Bricola LTD is committed to protecting your privacy and handling your data in compliance with applicable UK and EU data protection laws (GDPR).',

    'privacy.section1.p2':
      'We are committed to processing your information in accordance with the General Data Protection Regulation (GDPR) applicable in the United Kingdom and the European Union.',

    'privacy.section1.p3':
      'This policy explains what personal data we collect, why we collect it, and how we use it.',

    'privacy.section2.title': '2. Data We Collect',

    'privacy.section2.p1':
      'As part of using our platform, we collect the following data:',

    'privacy.section2.identification': 'Identification information:',

    'privacy.section2.identification.li1': 'Name, phone number, email address',

    'privacy.section2.account': 'Account information:',

    'privacy.section2.account.li1': 'Username, password',

    'privacy.section2.payment': 'Payment information:',

    'privacy.section2.payment.li1':
      'We do not collect any payment information.',

    'privacy.section2.technical': 'Technical information:',

    'privacy.section2.technical.li1':
      'IP address, browser type, operating system, approximate geolocation',

    'privacy.section2.usage': 'Usage data:',

    'privacy.section2.usage.li1':
      'Clicks, page visits, search queries performed on the platform',

    'privacy.section3.title': '3. How We Use Your Data',

    'privacy.section3.p1':
      'Your personal data is used for the following purposes:',

    'privacy.section3.li1': 'Creating, managing and securing your user account',

    'privacy.section3.li2':
      'Processing payments and securing rental transactions',

    'privacy.section3.li3': 'Identity verification and regulatory compliance',

    'privacy.section3.li4':
      'Customer support, dispute management and complaint handling',

    'privacy.section3.li5':
      'Continuous platform improvement, fraud detection and usage behavior analysis',

    'privacy.section4.title': '4. Legal Basis for Processing',

    'privacy.section4.p1':
      'We process personal data based on user consent, legitimate interest, and legal obligations (e.g., fraud prevention).',

    'privacy.section4.consent':
      'Your explicit consent, particularly during registration or submission of personal information',

    'privacy.section4.interest':
      'Our legitimate interest, to ensure the security of our services and their continuous improvement',

    'privacy.section4.legal':
      'Our legal obligations, regarding fraud prevention or compliance with financial and tax regulations',

    'privacy.section5.title': '5. Sharing Data With Third Parties',

    'privacy.section5.p1': 'We only share necessary data with:',

    'privacy.section5.li1': 'Payment processors (Wise)',

    'privacy.section5.li2': 'Hosting providers and platform security partners',

    'privacy.section5.li3': 'Authorities if required by law',

    'privacy.section5.li4':
      'We do not sell personal data under any circumstances.',

    'privacy.section6.title': '6. Data Retention',

    'privacy.section6.p1':
      'We retain your data for as long as your account is active or as needed to comply with legal obligations.',

    'privacy.section6.p2':
      'Inactive accounts may be anonymized or deleted after 3 years of inactivity.',

    'privacy.section7.title': '7. Data Security',

    'privacy.section7.p1':
      'We implement strong encryption and access controls to protect your data.',

    'privacy.section7.p2':
      'Data is stored in secure servers in the EU/UK region.',

    'privacy.section8.title': '8. Your Rights',

    'privacy.section8.p1':
      'In accordance with GDPR, you have the following rights:',

    'privacy.section8.access': 'Right of access:',

    'privacy.section8.access.desc': 'Obtain a copy of your personal data',

    'privacy.section8.rectification': 'Right of rectification:',

    'privacy.section8.rectification.desc':
      'Correct any inaccurate or outdated data',

    'privacy.section8.erasure': 'Right to erasure:',

    'privacy.section8.erasure.desc':
      'Request deletion of your data (within legal limits)',

    'privacy.section8.withdrawal': 'Right to withdraw consent:',

    'privacy.section8.withdrawal.desc':
      'Withdraw your authorization at any time',

    'privacy.section8.li1': 'Access your data',

    'privacy.section8.li2': 'Correct inaccurate data',

    'privacy.section8.li3': 'Request deletion (subject to legal constraints)',

    'privacy.section8.li4': 'Withdraw consent at any time',

    'privacy.section8.p2':
      'You may exercise these rights by contacting support@bricolaltd.com.',

    'privacy.section8.contact':
      'You can exercise these rights at any time by writing to support@bricolaltd.com',

    'privacy.section9.title': '9. International Transfers',

    'privacy.section9.p1':
      'Data transfers outside the UK/EU are safeguarded by contractual clauses and agreements with service providers.',

    'privacy.section10.title': '10. Updates to This Policy',

    'privacy.section10.p1':
      'We may update this privacy policy from time to time.',

    'privacy.section10.p2': 'You will be notified by email or in-app notice.',

    'privacy.section10.p3':
      'Continued use of our services implies acceptance of the updated terms.',
    'register.select_prefix': 'Choose prefix',

    // Profile translations
    'profile.photo_title': 'Profile Picture',
    'profile.photo_description': 'Manage your profile picture',
    'profile.personal_info_title': 'Personal Information',
    'profile.personal_info_description': 'Manage your personal information',
    'profile.edit_button': 'Edit',
    'profile.change_password': 'Change Password',
    'profile.change_password_description': 'Change your password',
    'profile.current_password_placeholder': 'Enter your current password',
    'profile.verify_current_password_placeholder':
      'First verify your current password',
    'profile.confirm_new_password_label': 'Confirm new password',
    'profile.enter_new_password_placeholder': 'First enter your new password',
    'profile.save_button': 'Save',
    'profile.cancel_button': 'Cancel',
    'profile.current_password_validation': 'First verify your current password',
    'profile.confirm_new_password': 'Confirm new password',
    'profile.new_password_first': 'First enter your new password',
    'profile.saving': 'Saving...',
    'profile.changing_password': 'Changing...',
    'profile.passwords_no_match': 'Passwords do not match',
    'profile.current_password_incorrect': 'Current password incorrect',

    // Notifications
    'notifications.title': 'Notifications',
    'notifications.subtitle': 'Manage your notifications and stay informed',
    'notifications.filter_all': 'All',
    'notifications.filter_unread': 'Unread',
    'notifications.filter_read': 'Read',
    'notifications.manage': 'Manage notifications',
    'notifications.mark_as_read': 'Mark as read',
    'notifications.mark_as_unread': 'Mark as unread',
    'notifications.delete': 'Delete',
    'notifications.mark_all_read': 'Mark all as read',
    'notifications.clear_all': 'Clear all',
    'notifications.no_notifications': 'No notifications',
    'notifications.no_unread': 'No unread notifications',
    'notifications.no_read': 'No read notifications',
    'notifications.confirm_delete':
      'Are you sure you want to delete this notification?',
    'notifications.confirm_clear_all':
      'Are you sure you want to clear all notifications?',
    'notifications.confirm_mark_all_read':
      'Are you sure you want to mark all notifications as read?',
    'notifications.loading': 'Loading notifications...',
    'notifications.error': 'Error loading notifications',
    'notifications.deleted_success': 'Notification deleted successfully',
    'notifications.marked_read_success': 'Notification marked as read',
    'notifications.marked_unread_success': 'Notification marked as unread',
    'notifications.all_marked_read_success': 'All notifications marked as read',
    'notifications.all_cleared_success': 'All notifications cleared',
    'notifications.time_now': 'now',
    'notifications.time_minutes_ago': 'minutes ago',
    'notifications.time_hours_ago': 'hours ago',
    'notifications.time_days_ago': 'days ago',
    'notifications.time_weeks_ago': 'weeks ago',
    'notifications.time_months_ago': 'months ago',
    'notifications.booking_completed': 'Booking Completed',
    'notifications.booking_created': 'Booking Created',
    'notifications.tool_returned': 'Tool Returned',
    'notifications.booking_started': 'Booking Started',
    'notifications.booking_accepted': 'Booking Accepted',
  },
  ar: {
    'login.signing': 'تسجيل الدخول...',
    'blog.category.general': 'عام',
    'general.loading': 'جاري التحميل...',
    // AgeVerificationDialog
    'register.select_prefix': 'اختر فكس',

    // Profile translations
    'profile.photo_title': 'صورة الملف الشخصي',
    'profile.photo_description': 'إدارة صورة ملفك الشخصي',
    'profile.personal_info_title': 'المعلومات الشخصية',
    'profile.personal_info_description': 'إدارة معلوماتك الشخصية',
    'profile.edit_button': 'تعديل',
    'profile.change_password': 'تغيير كلمة المرور',
    'profile.change_password_description': 'تغيير كلمة المرور الخاصة بك',
    'profile.current_password_placeholder': 'أدخل كلمة المرور الحالية',
    'profile.verify_current_password_placeholder':
      'تحقق أولاً من كلمة المرور الحالية',
    'profile.confirm_new_password_label': 'تأكيد كلمة المرور الجديدة',
    'profile.enter_new_password_placeholder': 'أدخل كلمة المرور الجديدة أولاً',
    'profile.save_button': 'حفظ',
    'profile.cancel_button': 'إلغاء',
    'profile.current_password_validation': 'تحقق أولاً من كلمة المرور الحالية',
    'profile.confirm_new_password': 'تأكيد كلمة المرور الجديدة',
    'profile.new_password_first': 'أدخل كلمة المرور الجديدة أولاً',
    'profile.saving': 'جاري الحفظ...',
    'profile.changing_password': 'جاري التغيير...',
    'profile.passwords_no_match': 'كلمات المرور غير متطابقة',
    'profile.current_password_incorrect': 'كلمة المرور الحالية غير صحيحة',

    // Notifications
    'notifications.title': 'الإشعارات',
    'notifications.subtitle': 'إدارة إشعاراتك والبقاء على اطلاع',
    'notifications.filter_all': 'الكل',
    'notifications.filter_unread': 'غير مقروءة',
    'notifications.filter_read': 'مقروءة',
    'notifications.manage': 'إدارة الإشعارات',
    'notifications.mark_as_read': 'تحديد كمقروءة',
    'notifications.mark_as_unread': 'تحديد كغير مقروءة',
    'notifications.delete': 'حذف',
    'notifications.mark_all_read': 'تحديد الكل كمقروء',
    'notifications.clear_all': 'مسح الكل',
    'notifications.no_notifications': 'لا توجد إشعارات',
    'notifications.no_unread': 'لا توجد إشعارات غير مقروءة',
    'notifications.no_read': 'لا توجد إشعارات مقروءة',
    'notifications.confirm_delete': 'هل أنت متأكد من حذف هذا الإشعار؟',
    'notifications.confirm_clear_all': 'هل أنت متأكد من مسح جميع الإشعارات؟',
    'notifications.confirm_mark_all_read':
      'هل أنت متأكد من تحديد جميع الإشعارات كمقروءة؟',
    'notifications.loading': 'جاري تحميل الإشعارات...',
    'notifications.error': 'خطأ في تحميل الإشعارات',
    'notifications.deleted_success': 'تم حذف الإشعار بنجاح',
    'notifications.marked_read_success': 'تم تحديد الإشعار كمقروء',
    'notifications.marked_unread_success': 'تم تحديد الإشعار كغير مقروء',
    'notifications.all_marked_read_success': 'تم تحديد جميع الإشعارات كمقروءة',
    'notifications.all_cleared_success': 'تم مسح جميع الإشعارات',
    'notifications.time_now': 'الآن',
    'notifications.time_minutes_ago': 'منذ دقائق',
    'notifications.time_hours_ago': 'منذ ساعات',
    'notifications.time_days_ago': 'منذ أيام',
    'notifications.time_weeks_ago': 'منذ أسابيع',
    'notifications.time_months_ago': 'منذ أشهر',
    'notifications.booking_completed': 'اكتملت الحجز',
    'notifications.booking_created': 'تم إنشاء الحجز',
    'notifications.tool_returned': 'تم إرجاع الأداة',
    'notifications.booking_started': 'بدأ الحجز',
    'notifications.booking_accepted': 'تم قبول الحجز',

    'ageVerification.title': 'التحقق من العمر',
    'ageVerification.description':
      'منصتنا متاحة عبر تطبيقات الويب والهاتف المحمول. وهي مخصصة حصرياً للمستخدمين الذين تبلغ أعمارهم 18 عاماً أو أكثر والذين يتمتعون بالأهلية القانونية لاستخدام خدماتنا.',
    'ageVerification.description2':
      'تحتفظ بريكولا بالحق في تعليق أو إنهاء أي حساب في حالة انتهاك السياسات أو الاحتيال أو سوء الاستخدام.',
    'ageVerification.description3':
      'لمزيد من التفاصيل، يرجى الرجوع إلى شروط وأحكام الاستخدام.',
    'ageVerification.confirmButton':
      'نعم، أؤكد أنني أبلغ من العمر 18 عاماً أو أكثر',
    'ageVerification.denyButton': 'لا، أنا أقل من 18 عاماً',

    // UnderAge page
    'underAge.title': 'وصول غير مسموح',
    'underAge.message': 'نأسف، لكنك غير مخول لاستخدام منصة بريكولا.',
    'underAge.message2': 'يرجى الرجوع إلى شروط وأحكام الاستخدام.',
    'underAge.cguButton': 'عرض الشروط والأحكام',
    // contrat
    'rentalContract.title': 'عقد الإيجار',
    'rentalContract.subtitle': 'نموذج عقد إيجار أدوات بين الأفراد',
    'rentalContract.cardTitle': 'عقد إيجار أداة',
    'rentalContract.downloadButton': 'تحميل PDF',
    'rentalContract.section.signatories.title': 'بين الأطراف الموقعة',
    'rentalContract.section.signatories.owner.name':
      'المؤجر: [الاسم الكامل للمالك]',
    'rentalContract.section.signatories.owner.address':
      'العنوان: [العنوان الكامل]',
    'rentalContract.section.signatories.owner.phone': 'الهاتف: [رقم الهاتف]',
    'rentalContract.section.signatories.owner.email':
      'البريد الإلكتروني: [عنوان البريد الإلكتروني]',
    'rentalContract.section.signatories.separator': 'و',
    'rentalContract.section.signatories.tenant.name':
      'المستأجر: [الاسم الكامل للمستأجر]',
    'rentalContract.section.signatories.tenant.address':
      'العنوان: [العنوان الكامل]',
    'rentalContract.section.signatories.tenant.phone': 'الهاتف: [رقم الهاتف]',
    'rentalContract.section.signatories.tenant.email':
      'البريد الإلكتروني: [عنوان البريد الإلكتروني]',
    'rentalContract.article1.title': 'المادة 1 - موضوع العقد',
    'rentalContract.article1.description':
      'الغرض من هذا العقد هو تأجير الأداة التالية:',
    'rentalContract.article1.fields.designation': 'التسمية: [اسم الأداة]',
    'rentalContract.article1.fields.brandModel':
      'العلامة/الموديل: [العلامة التجارية والموديل]',
    'rentalContract.article1.fields.serialNumber':
      'الرقم التسلسلي: [إذا كان متاحاً]',
    'rentalContract.article1.fields.condition': 'الحالة: [وصف الحالة]',
    'rentalContract.article1.fields.accessories':
      'الملحقات المضمنة: [قائمة الملحقات]',
    'rentalContract.article2.title': 'المادة 2 - مدة الإيجار',
    'rentalContract.article2.fields.startDate': 'تاريخ البدء: [التاريخ والوقت]',
    'rentalContract.article2.fields.endDate':
      'تاريخ الانتهاء: [التاريخ والوقت]',
    'rentalContract.article2.fields.handoverLocation':
      'مكان التسليم: [عنوان التسليم]',
    'rentalContract.article2.fields.returnLocation':
      'مكان الإرجاع: [عنوان الإرجاع]',
    'rentalContract.article3.title': 'المادة 3 - السعر وشروط الدفع',
    'rentalContract.article3.fields.rentalPrice':
      'سعر الإيجار: [المبلغ] € لمدة [المدة]',
    'rentalContract.article3.fields.deposit': 'التأمين: [مبلغ التأمين] €',
    'rentalContract.article3.fields.paymentMethod':
      'طريقة الدفع: عبر منصة Bricola',
    'rentalContract.article4.title': 'المادة 4 - التزامات المستأجر',
    'rentalContract.article4.list.1': 'استخدام الأداة وفقاً لغرضها الطبيعي',
    'rentalContract.article4.list.2':
      'اتخاذ جميع الاحتياطات اللازمة للحفاظ عليها',
    'rentalContract.article4.list.3': 'عدم إقراض أو تأجير الأداة لطرف ثالث',
    'rentalContract.article4.list.4': 'إبلاغ فوراً عن أي عطل',
    'rentalContract.article4.list.5':
      'إعادة الأداة في نفس الحالة التي استلمت بها',
    'rentalContract.article4.list.6': 'الالتزام بمواعيد الإرجاع',
    'rentalContract.article5.title': 'المادة 5 - التزامات المؤجر',
    'rentalContract.article5.list.1': 'تسليم الأداة في حالة تشغيل ممتازة',
    'rentalContract.article5.list.2': 'تقديم تعليمات الاستخدام إذا لزم الأمر',
    'rentalContract.article5.list.3': 'ضمان مطابقة الأداة لوصفها',
    'rentalContract.article5.list.4': 'التواجد لتسليم واستلام الأداة',
    'rentalContract.article6.title': 'المادة 6 - التأمين والمسؤولية',
    'rentalContract.article6.intro':
      'الأداة مشمولة بتأمين Bricola طوال مدة الإيجار ضد:',
    'rentalContract.article6.coverage.1': 'الأضرار العرضية',
    'rentalContract.article6.coverage.2': 'السرقة (تحت شروط معينة)',
    'rentalContract.article6.coverage.3': 'الأضرار الناتجة عن عيب في الأداة',
    'rentalContract.article6.note':
      'المستأجر مسؤول عن الأضرار الناتجة عن الاستخدام غير السليم أو الإهمال الجسيم.',
    'rentalContract.article7.title': 'المادة 7 - حل النزاعات',
    'rentalContract.article7.text':
      'في حالة النزاع، يلتزم الطرفان بالبحث عن حل ودي. إذا تعذر ذلك، سيتدخل خدمة عملاء Bricola كوسيط. النزاعات التي لم تُحل ستخضع للمحاكم المختصة.',
    'rentalContract.signatures.owner': 'توقيع المؤجر',
    'rentalContract.signatures.tenant': 'توقيع المستأجر',
    'verification.account_verified': 'تم التحقق من الحساب',
    'rentalContract.instructions.title': 'تعليمات الاستخدام',
    'rentalContract.instructions.list.1':
      'أكمل جميع الأقسام المميزة بين أقواس بالمعلومات المناسبة.',
    'rentalContract.instructions.list.2':
      'تأكد من أن جميع الأطراف قد قرأت وفهمت العقد قبل التوقيع.',
    'rentalContract.instructions.list.3':
      'احتفظ بنسخة موقعة من العقد طوال مدة الإيجار.',
    'rentalContract.instructions.list.4':
      'في حال وجود أسئلة، اتصل بخدمة عملاء Bricola.',

    // renters guide
    // Search page
    'search.noResults': 'لم يتم العثور على أدوات',
    'search.tryDifferentCriteria': 'حاول تعديل معايير البحث',
    'search.resetFilters': 'إعادة تعيين المرشحات',

    'rentersGuide.title': 'دليل المستأجر',
    'rentersGuide.intro':
      'مرحباً بك في Bricola LTD! يوضح هذا الدليل كيفية استئجار الأدوات بسهولة وأمان.',
    'rentersGuide.step1.title': 'إنشاء حساب',
    'rentersGuide.step1.description':
      'قم بالتسجيل كمستأجر وأدخل بياناتك الشخصية بدقة.',
    'rentersGuide.step2.title': 'البحث عن أداة',
    'rentersGuide.step2.description':
      'استخدم محرك البحث أو التصنيفات للعثور على الأداة التي تحتاجها.',
    'rentersGuide.step3.title': 'قراءة التفاصيل',
    'rentersGuide.step3.description':
      'تأكد من قراءة وصف الأداة وشروط المؤجر قبل الحجز.',
    'rentersGuide.step4.title': 'الحجز والدفع',
    'rentersGuide.step4.description':
      'حدد مدة الإيجار المناسبة وقم بالدفع عبر نظام الدفع الآمن في المنصة.',
    'rentersGuide.step5.title': 'استلام الأداة',
    'rentersGuide.step5.description':
      'اتفق مع المؤجر على طريقة ومكان الاستلام.',
    'rentersGuide.step6.title': 'الاستخدام',
    'rentersGuide.step6.description':
      'استخدم الأداة بحرص ووفقاً لتعليمات المؤجر.',
    'rentersGuide.step7.title': 'الإرجاع',
    'rentersGuide.step7.description':
      'أعد الأداة في الوقت المحدد وبنفس الحالة التي استلمتها بها.',
    'rentersGuide.step8.title': 'التقييم',
    'rentersGuide.step8.description':
      'بعد انتهاء العملية، قيّم المؤجر لتساعد في تحسين جودة الخدمة.',
    'rentersGuide.step9.title': 'سياسة الإلغاء والاسترجاع',
    'rentersGuide.step9.description':
      'راجع الصفحات المخصصة على الموقع لمزيد من التفاصيل.',

    // owners guide
    'ownersGuide.title': 'دلیل المؤجر',
    'ownersGuide.intro':
      'مرحباً بك في منصة Bricola LTD! يهدف هذا الدليل إلى مساعدتك كمؤجر لتحقيق أقصى استفادة من أدواتك.',
    'ownersGuide.step1.title': 'إنشاء حساب',
    'ownersGuide.step1.description':
      'قم بإنشاء حساب مؤجر على المنصة وأدخل بدقة بياناتك الشخصية، بما في ذلك رقم الهاتف والبريد الإلكتروني.',
    'ownersGuide.step2.title': 'إضافة أداة',
    'ownersGuide.step2.description':
      'التقط صوراً واضحة وعالية الجودة، وأضف وصفاً شاملاً للأداة، وحدد السعر اليومي ومبلغ التأمين.',
    'ownersGuide.step3.title': 'تحديد شروطك',
    'ownersGuide.step3.description':
      'حدد مدة الإيجار المسموح بها، وأي تعليمات خاصة باستخدام الأداة.',
    'ownersGuide.step4.title': 'مراجعة الطلبات',
    'ownersGuide.step4.description':
      'ستتلقى إشعارات عند وجود طلب جديد، ويمكنك قبول أو رفض الطلب بناءً على توفر الأداة.',
    'ownersGuide.step5.title': 'التسليم والاستلام',
    'ownersGuide.step5.description':
      'اتفق مع المستأجر على طريقة ومكان التسليم لضمان تجربة سلسة.',
    'ownersGuide.step6.title': 'استلام الأموال',
    'ownersGuide.step6.description':
      'سيتم تحويل المبلغ المستحق إلى محفظتك في المنصة بعد إتمام الإيجار، ويمكنك سحبه بعد الوصول للحد الأدنى للسحب.',
    'ownersGuide.step7.title': 'نصائح',
    'ownersGuide.step7.description':
      'وفر أدوات نظيفة وصالحة للاستعمال، وحافظ على تقييمات عالية لجذب المزيد من العملاء.',

    // Refund Policy
    'refundPolicy.title': 'سیاسة الاسترجاع',
    'refundPolicy.intro':
      'تلتزم Bricola LTD بضمان أمان ورضا المستخدمین. فیما يلي قواعد الاسترجاع:',
    'refundPolicy.renters.title': 'للمستأجرین:',
    'refundPolicy.renters.rule1':
      'یتم إصدار استرداد كامل إذا تم الإلغاء قبل موعد بدء الإيجار بـ 24 ساعة على الأقل.',
    'refundPolicy.renters.rule2':
      'إذا قام المالك بالإلغاء، يحصل المستأجر تلقائيًا على استرداد كامل.',
    'refundPolicy.deposit.title': 'الودیعة والتلفیات:',
    'refundPolicy.deposit.rule1':
      'تشمل كل عملیة إیجار ودیعة مؤقتة یتم حجزھا عبر Stripe.',
    'refundPolicy.deposit.rule2':
      'تُفرج الودیعة بعد 24 ساعة من إرجاع الأداة، بشرط التحقق من حالتھا.',
    'refundPolicy.deposit.rule3':
      'في حالات التلف أو الفقدان أو النزاعات، قد تحتفظ Bricola بجزء أو كامل الودیعة بعد إعلام المستخدم عبر البريد الإلكتروني.',
    'refundPolicy.lateReturns.title': 'التأخیر في الإرجاع والعقوبات:',
    'refundPolicy.lateReturns.rule':
      'قد یؤدي التأخیر في الإرجاع إلى فرض عقوبات تُحسب بالساعة أو الیوم وفقًا لقواعد المنصة.',
    'refundPolicy.disputes.title': 'حل النزاعات:',
    'refundPolicy.disputes.rule1':
      'یجب الإبلاغ عن النزاعات خلال 24 ساعة من تاریخ الإرجاع المحدد.',
    'refundPolicy.disputes.rule2':
      'یحقق فریق الدعم خلال 72 ساعة ویصدر قرارًا نھائیًا وملزمًا للطرفین.',
    'refundPolicy.payments.title': 'المدفوعات والرسوم:',
    'refundPolicy.payments.rule1': 'جمیع المدفوعات مؤمنة وتعالج عبر Stripe.',
    'refundPolicy.payments.rule2':
      'تُخصم عمولة بنسبة %15 من كل معاملة ناجحة، ویدفع المستأجرون رسوم بنسبة %6 عند الدفع (تكالیف المعالجة وصیانة المنصة).',
    // cancellationPolicy
    'cancellationPolicy.title': 'سیاسة الالغاء',
    'cancellationPolicy.intro':
      'في Bricola LTD ، نسعى لتقديم تجربة بسيطة وشفافة للمستأجرین والمالكین. فیما يلي قواعد الإلغاء:',
    'cancellationPolicy.renters.title': 'للمستأجرین:',
    'cancellationPolicy.renters.rule1':
      'یُمكنكم إلغاء الحجز واسترداد المبلغ كاملاً إذا تم الإلغاء قبل موعد بدء الإيجار بـ 24 ساعة على الأقل.',
    'cancellationPolicy.renters.rule2':
      'في حال الإلغاء خلال أقل من 24 ساعة من موعد بدء الإيجار، لن يتم استرداد المبلغ وتُعتبر الحجز نهائيًا.',
    'cancellationPolicy.owners.title': 'للمالكین:',
    'cancellationPolicy.owners.rule1':
      'إذا قام المالك بإلغاء الحجز في أي وقت، سيحصل المستأجر على استرداد كامل.',
    'cancellationPolicy.owners.rule2':
      'قد تؤدي الإلغاءات المتكررة من قبل المالكین إلى عقوبات أو تعليق الحساب.',
    'cancellationPolicy.maxDuration.title': 'المدة القصوى للإيجار:',
    'cancellationPolicy.maxDuration.rule':
      'لا يمكن أن تتجاوز مدة الإيجار 5 أيام لكل حجز. لتمديد مدة الإيجار، يجب على المستأجر التحقق أولاً من توفر الأداة لدى المالك، ثم إجراء حجز جديد عبر المنصة.',
    'cancellationPolicy.autoCancellations.title': 'الإلغاءات التلقائیة:',
    'cancellationPolicy.autoCancellations.rule':
      'إذا لم يقم المستخدم (مستأجر أو مالك) بالرد أو اتخاذ الإجراءات اللازمة خلال فترة زمنية معقولة، تحتفظ Bricola LTD بالحق في تأكيد حالة المعاملة (التسليم أو الإرجاع) تلقائيًا لضمان استمرارية الخدمة.',

    // Countries
    'country.kuwait': 'الكويت',
    'country.ksa': 'السعودية',
    'country.uae': 'الإمارات',
    'country.qatar': 'قطر',
    'country.bahrain': 'البحرين',
    'country.oman': 'عمان',

    'review.modaltitle': 'تقييم الإيجار',
    'review.rate': 'تقييم ',
    'review.comment': 'تعليق',
    'review.placeholdercomm': ' …شارك تجربتك',
    'review.submitbtn': 'إرسال التقييم',
    'review.popuptitle': 'تم إرسال التقييم',
    'review.modalmsg': 'شكرًا على تقييمك',

    // reset password
    'resetpwd.emailtitle': 'هل نسيت كلمة المرور؟',
    'resetpwd.emailtxt': 'أدخل عنوان بريدك الإلكتروني لاستلام رمز التحقق',
    'resetpwd.emailfield': 'عنوان البريد الإلكتروني',
    'resetpwd.emailplaceholder': 'your@email.com',
    'resetpwd.sendbtn': 'إرسال',
    'resetpwd.sendbtnpending': 'جارٍ الإرسال...',
    'resetpwd.backlogin': 'العودة إلى تسجيل الدخول',
    'resetpwd.popuptitle': 'تم إرسال البريد الإلكتروني',
    'resetpwd.popuptxt': 'تم إرسال رمز التحقق إلى عنوان بريدك الإلكتروني.',
    'resetpwd.verify': 'التحقق من الرمز',
    'resetpwd.verify_in_progress': 'جارٍ التحقق من الرمز...',

    // create password
    'password.create.title': 'كلمة مرور جديدة',
    'password.create.description': 'اختر كلمة مرور جديدة آمنة',
    'password.criteria': 'معايير كلمة المرور:',
    'password.min_length': '8 أحرف على الأقل',
    'password.uppercase': 'حرف كبير واحد',
    'password.lowercase': 'حرف صغير واحد',
    'password.number': 'رقم واحد',
    'password.special_char': 'حرف خاص واحد',
    'password.confirm': 'تأكيد كلمة المرور',
    'password.match': 'تتطابق كلمات المرور',
    'password.not_match': 'كلمات المرور غير متطابقة',
    'password.update': 'تحديث كلمة المرور',
    'password.back_to_login': 'العودة إلى تسجيل الدخول',

    // deposit payment modal
    'deposit.modal.title': 'دفع الأمانة',
    'deposit.modal.subtitle': 'يجب دفع الأمانة لتأكيد حجزك',
    'deposit.modal.payment_info': 'معلومات الدفع',
    'deposit.modal.amount_label': 'مبلغ الأمانة',
    'deposit.modal.processing': 'جاري المعالجة...',
    'deposit.modal.success': 'تم دفع الأمانة بنجاح!',
    'deposit.modal.error': 'حدث خطأ أثناء معالجة الدفع',
    'deposit.modal.cancel_reservation': 'إلغاء الحجز',
    'deposit.modal.test_mode': 'وضع الاختبار - لن يتم خصم أي مبلغ',

    'resetpwd.popupsuccupdate': 'تم تغيير كلمة المرور',
    'resetpwd.txtsucc': '.تم تغيير كلمة المرور الخاصة بك بنجاح',

    // email verification
    'email.verification.title': 'التحقق',
    'email.verification.description': 'أدخل رمز التحقق المرسل إلى',
    'email.resend': 'إعادة إرسال الرمز',
    'email.invalid_code': 'الرمز غير صحيح!',
    'email.resend.message': 'تم إعادة إرسال الرمز',
    'email.resend.description': 'تم إرسال رمز جديد إلى عنوان بريدك الإلكتروني.',
    'email.valid_code': 'تم التحقق من الرمز',
    'email.valid_code_message':
      'الرمز صحيح، جاري التوجيه إلى إعادة تعيين كلمة المرور.',
    'verification.success_title': 'تم التحقق من البريد الإلكتروني بنجاح',
    'verification.success_message':
      'تم التحقق من بريدك الإلكتروني. يمكنك الآن الوصول إلى جميع الميزات.',
    'verification.redirecting': 'جاري التوجيه...',
    'verification.title': 'التحقق من البريد الإلكتروني',
    'verification.description':
      'يرجى إدخال رمز التحقق المكون من 6 أرقام المرسل إلى عنوان بريدك الإلكتروني.',
    'verification.code_label': 'رمز التحقق',
    'verification.verify_button': 'تحقق',
    'verification.resend_button': 'إعادة إرسال الرمز',
    'verification.resent': 'تم إعادة إرسال الرمز',
    'verification.resent_message':
      'تم إرسال رمز تحقق جديد إلى بريدك الإلكتروني.',
    'verification.invalid_code': 'رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.',
    'verification.error': 'حدث خطأ أثناء التحقق. يرجى المحاولة مرة أخرى.',
    'verification.expired': 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.',
    'verification.success': 'تم التحقق بنجاح!',
    'verification.loading': 'جاري التحقق...',

    'cancellation.details.title': 'تفاصيل الإلغاء',
    'cancellation.details.reason': 'السبب',
    'cancellation.details.message': 'رسالة',
    'tool.returned': 'أدوات مستردة',
    // Download report
    'download.report.title': 'تم تنزيل العقد',
    'download.report.description': 'تم إنشاء عقد الإيجار وتنزيله بنجاح.',

    // Status badges
    'status.pending': 'في الانتظار',
    'status.accepted': 'مقبولة',
    'status.cancelled': 'ملغية',
    'status.completed': 'مكتملة',
    'status.rejected': 'مرفوضة',
    'status.ongoing': 'مستمر',
    'location.label': 'الموقع:',

    // confirm reservation

    'reservation.cancel.title': 'إلغاء الحجز',
    'reservation.cancel.reason': 'اختر سبباً',
    'reservation.cancel.reason.other_alternative': 'تم العثور على بديل آخر',
    'reservation.cancel.reason.not_needed': 'لست بحاجة إلى الأداة',
    'reservation.cancel.reason.unavailable': 'أنا غير متاح',
    'reservation.cancel.reason.other': 'سبب آخر',
    'reservation.cancel.message': 'رسالة إضافية (اختياري)',
    'reservation.cancel.confirm': 'تأكيد الإلغاء',
    'reservation.no_reservations': 'لا توجد حجوزات',
    'reservation.no_reservations_message':
      'ليس لديك أي حجوزات في الوقت الحالي. استكشف كتالوجنا للعثور على أدوات للإيجار.',

    'reservation.recap': 'ملخص',
    'reservation.card': 'بطاقة ائتمان',
    'reservation.back_to_details': 'العودة إلى التفاصيل',
    'reservation.complete_booking': 'إتمام الحجز',
    'reservation.rental_period': 'مدة الإيجار',
    'reservation.start_date': 'تاريخ البدء',
    'reservation.select_date': 'اختر تاريخًا',
    'reservation.end_date': 'تاريخ الانتهاء',
    'reservation.pickup_time': 'وقت الاستلام',
    'reservation.message_to_owner': 'رسالة إلى المالك (اختياري)',
    'reservation.message_placeholder':
      'حدد الغرض من الاستخدام أو اطرح أسئلتك...',
    'reservation.contact_information': 'معلومات الاتصال',
    'reservation.confirm': 'تأكيد الحجز',
    'reservation.payment_method': 'طريقة الدفع',
    'reservation.price_per_day': 'سعر اليوم',
    'reservation.number_of_days': 'عدد الأيام',
    'reservation.subtotal': 'الإجمالي الفرعي',
    'reservation.payment_fee': 'رسوم الدفع الآمن',
    'reservation.deposit': 'الضمان (قابل للاسترداد)',
    'reservation.total_amount': 'الإجمالي المستحق',
    'reservation.included_protection': 'الحماية مشمولة',
    'reservation.insurance_description': 'إيجارك محمي بتأمين ضد الأضرار.',
    'reservation.confirmation_message':
      'بتأكيد الحجز، فإنك توافق على شروط الإيجار وسياسة الإلغاء الخاصة بنا.',
    'reservation.confirmed': 'تم تأكيد الحجز!',
    'reservation.confirmed_message':
      'تم تأكيد حجزك {toolName}. ستتلقى رسالة تأكيد عبر البريد الإلكتروني.',
    'reservation.refused_title': 'سبب الرفض',
    'reservation.refused_reason': ':يرجى اختيار سبب',
    'reservation.refused_reason_maintenance': 'قيد الصيانة',
    'reservation.refused_reason_already_booked': 'محجوز مسبقًا',
    'reservation.refused_reason_other': 'آخر',
    'reservation.refused_message_placeholder': 'رسالة اختيارية (إن وُجدت)',
    'reservation.refused_confirm': 'تأكيد الرفض',

    // Calendar legend
    'calendar.legend': 'مفتاح التقويم',
    'calendar.reserved_in_progress': 'محجوز/قيد التنفيذ',
    'calendar.pending_accepted': 'في الانتظار/مقبول',
    'calendar.max_5_days': 'حد أقصى 5 أيام متتالية',

    // blog
    'blog.title': 'مدونة بريكولا المحدودة',
    'blog.description':
      'اكتشف نصائحنا، وأدلّتنا، وآخر الأخبار في عالم الأدوات والأعمال اليدوية',
    'blog.popular_categories': 'الفئات الشائعة',
    // blog categories
    'blog.subcategory.tools': 'الأدوات',
    'blog.category.safety': 'السلامة',
    'blog.category.gardening': 'البستنة',
    'blog.category.maintenance': 'الصيانة',
    'blog.category.transport': 'النقل',
    'blog.category.diy': 'الأعمال اليدوية',
    'blog.category.electricity': 'الكهرباء',
    'blog.category.lighting': 'الإضاءة',
    'blog.category.painting': 'الطلاء',
    'blog.category.construction': 'البناء',
    'blog.category.plants': 'النباتات',
    'blog.category.cleaning': 'التنظيف',
    'blog.category.decoration': 'الديكور',
    'blog.category.guide': 'دليل',

    'blog.return': 'عودة إلى المدونة',
    'blog.share': 'مشاركة',
    'blog.like': 'إعجاب',
    'blog.similar_articles': 'مقالات مشابهة',
    'blog.share_article': 'مشاركة هذه المقالة',
    'blog.Jardinage': 'البستنة',
    'blog.Entretien': 'الصيانة',
    'blog.Transport': 'النقل',
    'blog.Bricolage': 'إصلاح سريع',
    'blog.Électricité': 'الكهرباء',
    'blog.Éclairage': 'الإضاءة',
    'blog.Peinture': 'الطلاء',
    'blog.Construction': 'البناء',
    'blog.Plantes': 'النباتات',
    'blog.Nettoyage': 'التنظيف',
    'blog.Décoration': 'الديكور',
    'blog.Guide': 'دليل',
    // favorites
    'favorites.title': 'قائمة المفضلات',
    'fav.backhome': 'العودة إلى الصفحة الرئيسية',
    'fav.nofav': 'لا توجد أدوات مفضلة حالياً',
    'fav.text': 'تصفح الكتالوج وأضف أدواتك المفضلة إلى قائمة المفضلة',
    'fav.btnexplore': 'تصفح الدليل',

    // ads profile
    'ads.delete.success': 'تم حذف الإعلان بنجاح',
    'ads.delete.confirm.title': 'تأكيد حذف الإعلان',
    'ads.delete.confirm.description':
      'هل أنت متأكد أنك تريد حذف هذا الإعلان؟ هذه العملية غير قابلة للتراجع.',
    'ads.view.title': 'معاينة الإعلان',
    'ads.rental_conditions': 'شروط الإيجار',
    'ads.success_message': 'تم تعديل إعلانك بنجاح.',
    'ads.search': 'ابحث بواسطة عنوان الإعلان أو الفئة...',

    'ads.update': 'تعديل الإعلان',
    'ads.general_information': 'المعلومات العامة',
    'ads.listing_title': 'عنوان الإعلان',
    'ads.brand': 'لماركة',
    'ads.model': 'الموديل',
    'ads.year_of_purchase': 'سنة الشراء',
    'ads.description': 'الوصف',
    'ads.description_placeholder': 'صف أداتك، حالتها، ملحقاتها...',
    'ads.categorization': 'التصنيف',
    'ads.category': 'الفئة',
    'ads.sub_category': 'الفئة الفرعية',
    'ads.sub_category_placeholder': 'اختر فئة فرعية',
    'ads.tool_condition': 'حالة الأداة',
    'ads.pricing': 'التسعير',
    'ads.pricing_placeholder': 'لسعر يومياً (€)',
    'ads.deposit': 'التأمين (€)',
    'ads.location': 'الموقع',
    'ads.location_placeholder': 'العنوان أو المدينة',
    'ads.photos': 'الصور',
    'ads.photos_placeholder': 'اسحب صورك هنا أو انقر للاستعراض',
    'ads.browse_files': 'استعراض الملفات',
    'ads.usage_instructions': 'تعليمات الاستخدام',
    'ads.owner_instructions': 'تعليمات المالك',
    'ads.owner_instructions_placeholder':
      'يرجى توفير سلك تمديد كهربائي، التنظيف بعد الاستخدام...',

    'claim.sent': 'تم إرسال الشكوى',
    'claim.sent_message':
      'تم إرسال شكواك إلى فريق الدعم، وسيتم معالجتها خلال 48 ساعة.',
    'claim.in_progress': 'الشكوى قيد المعالجة',
    // General
    'general.copy_link': 'نسخ الرابط',
    'general.copy_link_message': 'تم نسخ الرابط بنجاح',
    'general.delete.confirm': 'تأكيد الحذف',
    'general.back': 'رجوع',
    'general.in': 'خلال',
    'general.example': 'مثال',
    'general.error': 'خطأ',
    'general.email_already_exists': 'عنوان البريد الإلكتروني مستخدم بالفعل',
    'general.report_error_message': 'يرجى اختيار سبب للإبلاغ.',

    'general.message': 'رسالة',
    'general.registered_under': 'مسجّلة في إنجلترا وويلز تحت الرقم: 16401372',
    'general.first_name': 'الاسم',
    'general.first_name_placeholder': 'اسمك',
    'general.last_name': 'اسم العائلة',
    'general.last_name_placeholder': 'اسم العائلة',
    'general.phone': 'رقم الهاتف',
    'general.message_placeholder': 'وصف الطلب',
    'general.subject_placeholder': 'موضوع الطلب',

    'general.min': 'دقيقة',
    'general.modify': 'تعديل',
    'general.see': 'عرض',
    'general.location': 'الإيجارات',

    'general.list': 'قائمة',
    'general.grid': 'شبكة',
    'general.status': 'الحالة',
    'general.public': 'عام',
    'general.categories': 'الفئات',
    'general.published': 'تم النشر',
    'general.unpublished': 'غير منشور',
    'general.view_details': 'عرض التفاصيل',
    'general.pending': 'قيد الانتظار',
    'general.show': 'عرض',
    'general.accepted': 'مقبولة',
    'general.ongoing': 'جارية',
    'general.completed': 'مكتملة',
    'general.cancelled': 'ملغاة',
    'general.declined': 'مرفوضة',
    'general.all': 'جميع',
    'general.all_periods': 'جميع الفترات',
    'general.week': 'هذا الأسبوع',
    'general.month': 'هذا الشهر',
    'general.year': 'هذا العام',
    'general.reset': 'إعادة تعيين',
    'general.day': 'يوم',
    'general.by': 'بواسطة',
    'general.to': 'إلى',
    'general.from': 'من',
    'general.cancel': 'إلغاء',
    'general.confirm': 'تأكيد',
    'general.report': 'الإبلاغ',
    'general.download_contract': 'تحميل العقد',
    'general.hide': 'إخفاء',
    'general.copy': 'نسخ',
    'general.reference': 'رقم المرجع',
    'general.contact': 'اتصل',
    'general.confirmed': 'تم التأكيد',
    'general.rejected': 'مرفوض',

    // bookings
    'booking.cancelled': 'تم إلغاء الحجز',
    'booking.cancelled_message': '.تم إلغاء حجزك بنجاح',
    'booking.wait': 'في انتظار تأكيد المالك',
    'booking.report.title': 'الإبلاغ عن مشكلة',
    'booking.report.reason': 'اختر سبباً',
    'booking.report.reason.no_answer': 'لا يرد',
    'booking.report.reason.wrong_number': 'رقم غير صحيح',
    'booking.report.reason.inappropriate_behavior': 'سلوك غير لائق',
    'booking.report.reason.other': 'سبب آخر',
    'booking.report.describe': 'وصف المشكلة',
    'booking.report.submit': 'إرسال التقرير',

    'tool.return.title': 'تأكيد إعادة الأداة',
    'tool.return.option': 'اختر خياراً:',
    'tool.return.confirm': 'أؤكد أنني قد أعدت الأداة',
    'tool.return.report': 'الإبلاغ عن مشكلة',
    'tool.return.confirmed': 'تم تأكيد الإعادة',
    'tool.return.confirmed_message':
      'لقد أكدت أنك أعدت الأداة. في انتظار تأكيد الاستلام من المالك.',

    'code.copied': 'تم نسخ الرمز',
    'code.copied_message': 'تم نسخ رمز التحقق إلى الحافظة.',

    'booking.title': 'حجوزاتي',
    'booking.tool_returned': 'تم إرجاع الأداة',
    'booking.search': 'ابحث بواسطة عنوان الإعلان...',
    'booking.verification_code': 'رمز التحقق',
    'booking.present_code':
      'قدم هذا الرمز للمالك عند استلام الأداة في اليوم الأول.',
    'booking.owner': 'المالك',
    'booking.status.pending': 'في الانتظار',
    'booking.status.confirmed': 'مؤكد',
    'booking.status.active': 'نشط',
    'booking.status.completed': 'مكتمل',
    'booking.status.cancelled': 'ملغي',
    'booking.confirm_return': 'تأكيد الإرجاع',
    'booking.claim_in_progress': 'شكوى قيد المعالجة',
    'booking.download_contract': 'تحميل العقد',
    'booking.validation_code': 'رمز التحقق',
    'booking.cancelled_on': 'ألغي في',
    'booking.cancellation_reason': 'السبب',
    'booking.retry': 'إعادة المحاولة',
    'booking.cancel_reservation': 'إلغاء',
    'booking.cancellation_title': 'إلغاء الحجز',
    'booking.cancellation_reason_label': 'سبب الإلغاء',
    'booking.cancellation_reason_placeholder': 'اختر سبباً',
    'booking.cancellation_reasons.schedule_conflict': 'تعارض في الجدول الزمني',
    'booking.cancellation_reasons.no_longer_needed': 'لم تعد هناك حاجة',
    'booking.cancellation_reasons.found_alternative': 'وجدت بديلاً',
    'booking.cancellation_reasons.other': 'أخرى',
    'booking.cancellation_message_label': 'رسالة (اختيارية)',
    'booking.cancellation_message_placeholder': 'اشرح سبب الإلغاء...',
    'booking.confirm_cancellation': 'تأكيد الإلغاء',
    'booking.claim_title': 'الإبلاغ عن مشكلة',
    'booking.claim_type_label': 'نوع المشكلة',
    'booking.claim_type_placeholder': 'اختر نوع المشكلة',
    'booking.claim_types.damage': 'أداة تالفة',
    'booking.claim_types.missing_parts': 'أجزاء مفقودة',
    'booking.claim_types.not_working': 'أداة لا تعمل',
    'booking.claim_types.dirty': 'أداة متسخة/غير نظيفة',
    'booking.claim_types.other': 'أخرى',
    'booking.claim_description_label': 'وصف المشكلة',
    'booking.claim_description_placeholder': 'اوصف المشكلة بالتفصيل...',
    'booking.claim_upload_text': 'اسحب ملفاتك هنا أو انقر للاختيار',
    'booking.claim_upload_hint': 'صور أو فيديوهات (حد أقصى 10 ميجابايت)',
    'booking.submit_claim': 'إرسال الشكوى',
    'tool.return.confirm_title': 'تأكيد إرجاع الأداة',
    'tool.return.confirm_message': 'هل أنت متأكد من تأكيد إرجاع هذه الأداة؟',
    'tool.return.report_issue': 'الإبلاغ عن مشكلة',

    // Messages de succès harmonisés - Arabe
    'success.reservation.confirmed.title': '✅ تم تأكيد الحجز!',
    'success.reservation.confirmed.message':
      'تم تأكيد حجزك بنجاح. ستتلقى رسالة تأكيد عبر البريد الإلكتروني.',

    'success.reservation.cancelled.title': '✅ تم إلغاء الحجز',
    'success.reservation.cancelled.message':
      'تم إلغاء حجزك بنجاح. ستتلقى رسالة تأكيد عبر البريد الإلكتروني.',

    'success.report.sent.title': '✅ تم إرسال البلاغ',
    'success.report.sent.message':
      'تم إرسال بلاغك بنجاح إلى فريقنا. سنقوم بمعالجة طلبك في أقرب وقت ممكن.',

    'success.tool.return.confirmed.title': '✅ تم تأكيد الإرجاع',
    'success.tool.return.confirmed.message':
      'لقد أكدت بنجاح إرجاع الأداة. سيتم إشعار المالك.',

    // requests
    'request.refuse': 'تم رفض الطلب',
    'request.refuse.message': 'تم إرسال الرفض إلى الإدارة.',
    'request.report.accepted.title': 'تم إرسال البلاغ',
    'request.report.accepted.message': 'تم إرسال بلاغك إلى الإدارة.',

    'request.accepted.title': 'تم قبول الطلب',
    'request.accepted.message': 'تم قبول طلب الحجز بنجاح.',

    'request.claim.reason': 'نوع المشكلة',
    'request.claim.reason_placeholder': 'حدد نوع المشكلة',
    'request.claim.reason.damaged_tool': 'أداة تالفة',
    'request.claim.reason.no_showup': 'لم يظهر المستأجر',
    'request.claim.reason.late_return': 'إرجاع متأخر',
    'request.claim.reason.inappropriate_behavior': 'سلوك غير لائق',
    'request.claim.reason.fraud_attempt': 'محاولة احتيال',
    'request.claim.reason.missing_parts': 'أجزاء مفقودة',
    'request.claim.reason.not_working': 'أداة غير عاملة',
    'request.claim.reason.other': 'أخرى',
    'request.claim.evidence': 'المستندات الداعمة',
    'request.claim.evidence_placeholder':
      'قم بسحب الملفات هنا أو انقر للاختيار',
    'request.claim.evidence_limit': 'الصور أو الفيديوهات (حد أقصى 10 MB)',
    'request.claim.describe': 'وصف المشكلة',
    'request.claim.describe_placeholder': 'وصف المشكلة التي واجهتها...',
    'request.claim.submit': 'إرسال البلاغ',

    'request.report.title': 'الإبلاغ عن مشكلة',
    'request.report.reason': 'اختر سببًا',
    'request.report.reason.no_show': 'لم يظهر المستأجر',
    'request.report.reason.damaged_tool': 'الأداة المعادة تالفة',
    'request.report.reason.late_return': 'إرجاع متأخر',
    'request.report.reason.inappropriate_behavior': 'سلوك غير لائق',
    'request.report.reason.fraud_attempt': 'محاولة احتيال',
    'request.report.reason.other': 'مشكلة أخرى',
    'request.report.describe': 'وصف المشكلة',
    'request.report.submit': 'إرسال البلاغ',

    'request.pickup_confirm_button': 'استرجاع الأداة',
    'request.pickup_confirm_title': 'تأكيد الاستلام',
    'request.pickup_confirm_message1':
      'هل أنت متأكد من أنك استلمت الأداة بدون أي مشكلة؟',
    'request.pickup_confirm_message2':
      'إذا واجهت مشكلة، اضغط على الرابط "الإبلاغ عن مشكلة"',
    'request.pickup_confirm': 'نعم، أؤكد الاستلام الصحيح',
    'request.pickup_report': 'الإبلاغ عن مشكلة',

    'request.confirm_acceptence': 'تأكيد القبول',
    'request.confirm_acceptence_message':
      'هل أنت متأكد من رغبتك في قبول طلب الإيجار هذا؟',
    'request.title': 'طلبات الحجز الخاصة بي',
    'request.contact': 'اتصل',
    'request.search': 'ابحث بواسطة عنوان الإعلان',
    'request.all': 'الكل',
    'request.pending': 'قيد الانتظار',
    'request.accepted': 'مقبولة',
    'request.ongoing': 'جارية',
    'request.completed': 'مكتملة',
    'request.cancelled': 'ملغاة',
    'request.declined': 'مرفوضة',
    'request.all_periods': 'جميع الفترات',
    'request.this_week': 'هذا الأسبوع',
    'request.this_month': 'هذا الشهر',
    'request.this_year': 'هذا العام',
    'request.reset': 'إعادة تعيين',
    'request.results_found': 'طلبات تم العثور عليها',
    'request.day': 'يوم',
    'request.by': 'بواسطة',
    'request.reference': 'رقم المرجع',
    'request.pickup_time': 'وقت الاستلام',
    'request.from': 'من',
    'request.to': 'إلى',
    'request.accept': 'قبول',
    'request.decline': 'رفض',
    'request.cancel': 'إلغاء',
    'request.report': 'الإبلاغ',
    'request.download_contract': 'تحميل العقد',
    'request.validation_code': ': رمز التحقق',
    'request.enter_code': 'أدخل الرمز',
    'request.confirm': 'تأكيد',
    'request.validation_code_accepted': 'تم تأكيد الإرجاع',
    'request.validation_code_accepted_message':
      'تمت إعادة الأداة بنجاح. الحالة الآن "قيد التقدم".',
    'request.validation_code_rejected': 'رمز غير صالح',
    'request.validation_code_rejected_message': 'رمز التحقق غير صحيح!',
    'request.contact_renter_information': 'معلومات المستأجر',
    'request.contact_owner_information': 'معلومات المالك',
    'request.call': 'اتصل',
    'request.mail': 'البريد الإلكتروني',
    'requests.cancellationDetails': 'تفاصيل الإلغاء',
    'request.message': 'الرسالة',
    'request.reason': 'سبب الإلغاء',

    // pagination
    'pagination.next': 'التالي',
    'pagination.previous': 'السابق',

    // catalog section
    'catalog_section.title': 'أداة معثور عليها',
    'catalog_section.category': 'الفئة',
    'catalog_section.sort_by': 'ترتيب حسب',
    'catalog_section.most_recent': 'الأحدث',
    'catalog_section.price_low_to_high': 'السعر: من الأدنى إلى الأعلى',
    'catalog_section.price_high_to_low': 'السعر: من الأعلى إلى الأدنى ',
    'catalog_section.top_rated': 'الأعلى تقييمًا',
    'catalog_section.filters': 'المرشحات',
    'catalog_section.search': 'البحث',
    'catalog_section.tool_name': 'اسم الأداة',
    'catalog_section.location': 'الموقع',
    'catalog_section.all_categories': 'جميع الفئات',
    'catalog_section.sub_category': 'فئة فرعية',
    'catalog_section.all_sub_categories': 'جميع الفئات الفرعية',
    'catalog_section.daily_price': 'السعر اليومي',
    'catalog_section.apply_filters': 'بحث',
    'catalog_section.by': 'بواسطة',

    // blog section
    'blog_section.title': 'أحدث مقالات المدونة',
    'blog_section.description':
      'اكتشف نصائحنا وأدلتنا وآخر الأخبار لإنجاح جميع مشاريعك في الأشغال اليدوية',
    'blog_section.min': 'دقيقة',
    'blog_section.read_article': 'قراءة المقال',
    'blog_section.view_all': 'عرض جميع المقالات',

    // customer reviews
    'customer_reviews.title': 'آراء عملائنا',
    'customer_reviews.description': 'اكتشف آراء مستخدمينا حول المنصة',

    // rental process
    'rental_process.title': 'كيف يعمل النظام؟',
    'rental_process.description': 'أجر أدواتك في 4 خطوات بسيطة',
    'rental_process.step1.title': 'أنشر إعلانك ببضع نقرات',
    'rental_process.step1.description':
      'أضف أدواتك مع الصور والوصف المفصل  في دقائق معدودة.',
    'rental_process.step2.title': 'زد من ظهور إعلانك',
    'rental_process.step2.description':
      'إعلانك مرئي لآلاف المستخدمين الباحثين عن الأدوات.',
    'rental_process.step3.title': 'استقبل أولى الحجوزات',
    'rental_process.step3.description':
      'يتواصل معك المستأجرون مباشرةً لحجز أدواتك في التواريخ المطلوبة.',
    'rental_process.step4.title': 'احصل على أرباحك بأمان',
    'rental_process.step4.description':
      'استلم دفعاتك بأمان وحقق دخلاً إضافياً.',

    // Wallet translations
    'wallet.title': 'محفظتي',
    'wallet.total': 'الإجمالي',
    'wallet.cumulative_balance': 'الرصيد الإجمالي',
    'wallet.available': 'متاح',
    'wallet.available_balance': 'الرصيد المتاح',
    'wallet.successful': 'ناجحة',
    'wallet.successful_transactions': 'المعاملات الناجحة',
    'wallet.withdraw_money': 'سحب أموالي',
    'wallet.withdrawal_note':
      '.يمكنك سحب أموالك بمجرد أن يصل رصيدك الإجمالي إلى 50 جنيهًا إسترلينيًا',
    'wallet.conversion_rate': '50£ = {minWithdrawalEUR} €',
    'wallet.dynamic_conversion':
      'يتم تحديث سعر الصرف تلقائيًا حسب العملة المختارة في الحساب.',

    // recent transactions
    'wallet.recent_transactions': 'المعاملات الأخيرة',
    'wallet.select_time_period': 'اختر فترة زمنية',
    'wallet.all_transactions': 'جميع المعاملات',
    'wallet.incoming_payments': 'المدفوعات الواردة',
    'wallet.withdrawal': 'السحب',
    'wallet.reset': 'إعادة تعيين',
    'wallet.completed': 'مكتملة',
    'wallet.pending': 'قيد الانتظار',
    'wallet.failed': 'فشلت',

    // Navigation
    'nav.home': 'الرئيسية',
    'nav.catalog': 'الكتالوج',
    'nav.navigation': 'التصفح',
    'nav.propos': 'من نحن',
    'nav.blog': 'المدونة',
    'nav.contact': 'تواصل معنا',
    'nav.rent': 'استئجار',
    'nav.list': 'إضافة أداة',
    'nav.login': 'تسجيل الدخول',
    'nav.signup': 'إنشاء حساب',
    'nav.profile': 'الملف الشخصي',
    'nav.wallet': 'المحفظة',
    'nav.settings': 'الإعدادات',
    'nav.logout': 'تسجيل الخروج',

    // Hero section
    'hero.title': 'استأجر وشارك أدواتك بسهولة',
    'hero.subtitle':
      'المنصة التي تربط أصحاب الأدوات مع من يحتاجونها. أفراد ومحترفون، اعثر على الأداة المثالية بالقرب منك.',
    'hero.search.placeholder': 'البحث عن أداة...',
    'hero.search.location': 'الموقع',
    'hero.search.button': 'بحث',
    'hero.available_tools': 'أداة متاحة',
    'hero.active_users': 'مستخدم نشط',
    'hero.cities_covered': 'مدينة مشمولة',

    // New FAQ translations
    'faq.hero.title': 'الأسئلة الشائعة',
    'faq.hero.subtitle': 'اعثر على إجابات سريعة لأسئلتك الأكثر شيوعًا',
    'faq.title': 'أسئلة عامة',
    'faq.general.q1': 'ما هي Bricola وكيف تعمل؟',
    'faq.general.a1':
      'Bricola LTD هي منصة تأجير أدوات ومعدات بين الأفراد. يمكن للمستخدمين عرض أدواتهم للإيجار أو استئجار أدوات من الآخرين. تتولى المنصة إدارة المعاملات، والودائع (التأمينات)، وحل النزاعات.',
    'faq.general.q2': 'ما هي فئات الأدوات التي يمكن عرضها؟',
    'faq.general.a2':
      'حاليًا، تدعم Bricola أدوات ومعدات الأعمال اليدوية، والبستنة، والتنظيف، والمناسبات. يمكن إضافة فئات أخرى لاحقًا حسب احتياجات السوق.',
    'faq.general.q3': 'هل يوجد تطبيق مخصص لـ Bricola؟',
    'faq.general.a3':
      'نعم، Bricola متاحة على كل من أنظمة iOS وAndroid، بالإضافة إلى منصة ويب شاملة.',
    'faq.general.q4': 'هل يمكنني استخدام Bricola من أي دولة؟',
    'faq.general.a4':
      'حاليًا، تقتصر خدمات Bricola على منطقة الخليج، مع وجود خطط للتوسع إلى مناطق أخرى مستقبلًا.',
    'faq.general.q5': 'هل يمكن للشركات عرض أدواتها؟',
    'faq.general.a5':
      'نعم، ولكن Bricola مصممة أساسًا للأفراد. يجب على المستخدمين المحترفين الالتزام بالقوانين واللوائح المحلية الخاصة بالأعمال.',
    'faq.general.q6': 'ما هي العناصر الممنوعة؟',
    'faq.general.a6':
      'يُمنع تمامًا عرض أو تأجير العناصر غير القانونية، أو المعدات الخطرة، أو الأدوات التي تنتهك قوانين السلامة.',
    'faq.general.q7': 'هل يمكنني اقتراح ميزة جديدة؟',
    'faq.general.a7':
      'نعم، نرحب بجميع الاقتراحات. يمكنك التواصل مع الدعم الفني بمقترحك، وسنقوم بدراسته للتحديثات المستقبلية.',
    'faq.general.q8': 'كيف يمكنني التواصل مع خدمة العملاء؟',
    'faq.general.a8':
      'يمكنك استخدام دردشة WhatsApp، أو مراسلتنا عبر البريد الإلكتروني: support@bricolaltd.com. فريقنا متاح طوال أيام الأسبوع.',
    'faq.renters.title': 'للمستأجرين',
    'faq.renters.q1': 'كيف أنشئ حسابًا؟',
    'faq.renters.a1':
      'سجّل باسمك، وبريدك الإلكتروني، ورقم هاتفك، وقد يُطلب منك تقديم مستندات للتحقق من الهوية. ستحتاج أيضًا إلى تأكيد بريدك الإلكتروني ورقم هاتفك.',
    'faq.renters.q2': 'لماذا يُطلب التحقق من الهوية؟',
    'faq.renters.a2':
      'لضمان الأمان والثقة على المنصة، قد يُطلب التحقق من الهوية قبل استئجار أدوات عالية القيمة أو سحب مبالغ كبيرة.',
    'faq.renters.q3': 'ماذا يجب أن أفعل قبل استلام الأداة؟',
    'faq.renters.a3':
      'تأكد من التحقق من هويتك، واتفق مع المالك على شروط الإيجار، وافحص الأداة عند استلامها.',
    'faq.renters.q4': 'ماذا لو تعرضت الأداة للتلف أثناء فترة الإيجار؟',
    'faq.renters.a4':
      'أخطر المالك وفريق الدعم فورًا. قد يُطلب منك تقديم أدلة لمعالجة المشكلة من خلال مبلغ التأمين.',
    'faq.owners.title': 'لأصحاب الأدوات',
    'faq.owners.q1': 'كيف أعرض أداة للإيجار؟',
    'faq.owners.a1':
      'انتقل إلى "عرض أداة"، وقم برفع صور واضحة، وأضف وصفًا للحالة، والضمانات إن وُجدت، وسعر الإيجار اليومي، وحدد مبلغ التأمين المطلوب.',
    'faq.owners.q2': 'ماذا يحدث بعد أن أُدرج أداتي؟',
    'faq.owners.a2':
      'سيتم مراجعة الإعلان من قبل فريق الإشراف قبل أن يظهر للمستخدمين. سيتم إشعارك عند قيام أحدهم بالحجز.',
    'faq.owners.q3': 'هل يمكنني رفض طلب الحجز؟',
    'faq.owners.a3':
      'نعم، يمكنك قبول أو رفض أي طلب. لكن تكرار الرفض دون أسباب مقنعة قد يؤثر على ظهور أدواتك على المنصة.',
    'faq.owners.q4': 'ماذا يجب أن أفعل قبل تسليم الأداة؟',
    'faq.owners.a4':
      'تحقق من هوية المستأجر، وثق حالة الأداة بالصور، واتفق معه على شروط الإرجاع.',
    'faq.owners.q5': 'ماذا أفعل إذا تضررت أداتي؟',
    'faq.owners.a5':
      'أرسل الأدلة خلال 24 ساعة من استرجاع الأداة. ستقوم Bricola بمراجعة الحالة وقد تُصدر تعويضًا من مبلغ التأمين.',
    'faq.owners.q6': 'هل توجد تأمينات على الأدوات المعروضة؟',
    'faq.owners.a6':
      'حاليًا، لا توفر Bricola تأمينًا. ننصح بعرض الأدوات التي يمكنك تحمل تأجيرها في حال حدوث أي ضرر.',
    'faq.payment.title': 'الدفع والسلامة',
    'faq.payment.q1': 'كيف تتم معالجة عملية الدفع؟',
    'faq.payment.a1':
      'تتم جميع الدفعات بأمان من خلال نظام Stripe. يدفع المستأجر مقدمًا، بما في ذلك مبلغ التأمين.',
    'faq.payment.q2': 'ما هو مبلغ التأمين؟',
    'faq.payment.a2':
      'هو مبلغ قابل للاسترداد تحتفظ به Stripe لتغطية أي أضرار أو حالات عدم الإرجاع. يُعاد تلقائيًا بعد استرجاع الأداة بنجاح.',
    'faq.payment.q3': 'كيف أسحب أرباحي؟',
    'faq.payment.a3':
      'يمكنك طلب تحويل أرباحك إلى حسابك البنكي من خلال خدمة Wise.',
    'faq.payment.q4': 'ما هي الرسوم التي تفرضها Bricola؟',
    'faq.payment.a4':
      'تتقاضى Bricola عمولة بنسبة 15% على كل عملية تأجير ناجحة. لا توجد رسوم على الإدراج أو اشتراكات شهرية.',
    'faq.payment.q5': 'كيف يتم التعامل مع النزاعات؟',
    'faq.payment.a5':
      'يتم حل جميع النزاعات من خلال فريق الدعم الداخلي خلال 72 ساعة. القرار الصادر يعتبر نهائيًا.',
    'faq.payment.q6': 'ما هي تدابير السلامة المطبقة؟',
    'faq.payment.a6':
      'التحقق من الهوية، تقييمات المستخدمين، المدفوعات الآمنة، ومتابعة مستمرة من فريق الدعم لضمان بيئة موثوقة وآمنة.',
    // Categories
    'categories.title': 'الفئات المتوفرة',
    'categories.description': 'ابحث عن الأداة المناسبة حسب احتياجك',

    // Categories

    'categories.gardening': 'البستنة',
    'subcategories.lawn-mowers': ' التمويه',
    'subcategories.hedge-trimmers': ' التقطي',
    'subcategories.pruning-tools': ' التخلص',
    'subcategories.watering': ' الري',
    'subcategories.garden-hand-tools': ' اليد',
    //     Entretien du sol | Soil Maintenance | صيانة التربة
    // Entretien des plantes | Plant Care | العناية بالنباتات
    // Taille et coupe | Pruning and Cutting | التقليم والقطع
    // Nettoyage et ramassage | Cleaning and Collection | التنظيف والجمع
    // Arrosage et irrigation | Watering and Irrigation | الريّ والسقي
    'subcategories.soil-maintenance': 'صيانة التربة',
    'subcategories.plant-care': 'عناية بالنباتات',
    'subcategories.pruning-and-cutting': 'التقليم والقطع',
    'subcategories.cleaning-and-collection': 'تنظيف وإجمع',
    'subcategories.watering-and-irrigation': ' الريّ والسقي',

    'categories.cleaning': 'التنظيف',

    'subcategories.vacuum-cleaners': ' التمويه',
    'subcategories.pressure-washers': ' الضغط',
    'subcategories.floor-care': ' التنظيف',
    'subcategories.cleaning-supplies': ' التنظيف',

    // Nettoyage intérieur | Indoor Cleaning | التنظيف الداخلي
    // Nettoyage extérieur | Outdoor Cleaning | التنظيف الخارجي
    // Gestion des déchets et poussière | Waste and Dust Management | إدارة النفايات والغبار
    'subcategories.indoor-cleaning': 'التنظيف الداخلي',
    'subcategories.outdoor-cleaning': 'التنظيف الخارجي',
    'subcategories.waste-and-dust-management': 'إدارة النفايات والغبار',

    'categories.diy': 'الأشغال اليدوية',

    'subcategories.power-tools': 'الطاقة',
    'subcategories.hand-tools': 'اليد',
    'subcategories.measuring-tools': 'التقييم',

    //     Construction | Construction | البناء
    // Électricité | Electricity | الكهرباء
    // Peinture | Painting | الطلاء
    // Vis et boulons | Screws and Bolts | المسامير والصواميل
    'subcategories.painting': 'الرسم',
    'subcategories.construction': 'البناء',
    'subcategories.electricity': 'الكهرباء',
    'subcategories.screws-and-bolts': 'المسامير والصواميل',

    'categories.events': 'معدات الحفلات',
    'subcategories.party-equipment': 'معدات الحفلات',
    'subcategories.sound-lighting': 'الصوت والضياء',
    'subcategories.event-decoration': 'زينة الحفلات',
    'subcategories.catering-equipment': 'تقديم الطعام',
    'subcategories.sound': 'صوت',
    'subcategories.lighting': 'إضاءة',
    'subcategories.cooking': 'طبخ',
    'subcategories.entertainment-games': 'ترفيه وألعاب',
    'subcategories.decoration': 'زينة',
    'subcategories.furniture': 'أثاث',
    'subcategories.structure': 'هيكل',

    // Tools
    'tools.featured': 'الأدوات المميزة',
    'tools.description': 'الأدوات الأعلى تقييماً والأكثر طلباً من مجتمعنا',
    'tools.by': 'بواسطة',
    'tools.display_all': 'عرض جميع الأدوات',
    'tools.day': 'يوم',
    'tools.available': 'متاح',
    'tools.rent': 'استئجار',
    'tools.details': 'عرض التفاصيل',
    'tools.new_ad': 'إعلان جديد',
    'tools.my_ads': 'إعلاناتي',
    'tools.edit': 'تعديل',
    'tools.view': 'عرض',
    'tools.delete': 'حذف',
    'tools.published': 'منشور',
    'tools.unpublished': 'غير منشور',
    'tools.pending': 'في الانتظار',
    'tools.approved': 'مُوافق عليه',
    'tools.rejected': 'مرفوض',
    'tools.back_to_results': 'الرجوع إلى النتائج',
    'tools.verified': 'موثق',
    'tools.owner': 'المؤجر',
    'tools.model': 'لطراز',
    'tools.brand': 'العلامة التجارية',
    'tools.year_of_purchase': 'سنة الشراء',
    'tools.fees_and_taxes': 'يشمل الضرائب والرسوم',
    'tools.of': 'من',
    'tools.charged': 'التي يحددها المؤجر',
    'tools.deposit': 'تأمين',
    'tools.refunded': '(يُسترد عند نهاية الإيجار)',
    'tools.rent_now': 'استأجر الآن',
    'tools.add_to_favorites': 'أضف إلى قائمة المفضّلات',
    'tools.remove_from_favorites': 'إزالة من قائمة المفضّلات',
    'tools.desc': 'الوصف',
    'tools.instructions': 'تعليمات المؤجر',
    'tools.reviews': 'تقييمات المستأجرين',
    'tools.condition_new': 'جديد',
    'tools.condition_like_new': 'كالجديد',
    'tools.condition_good': 'حالة جيدة',
    'tools.condition_fair': 'حالة مقبولة',
    'tools.condition_poor': 'حالة سيئة',
    'tools.condition_unknown': 'غير معروف',

    // Profile translations
    'profile.first_name': 'الاسم',
    'profile.last_name': 'اللقب',
    'profile.email': 'البريد الإلكتروني',
    'profile.phone': 'رقم الهاتف',
    'profile.country': 'البلد',
    'profile.address': 'العنوان',
    'profile.edit_profile_photo': 'انقر على "تعديل" لتغيير صورة ملفك الشخصي',
    'profile.verified': 'موثّق',
    'profile.account_type_individual': 'شخصي',
    'profile.account_type_company': 'شركة',
    'profile.average_rating': 'متوسط التقييم',
    'profile.rentals_completed': 'عمليات الإيجار المنجزة',
    'profile.active_ads': 'الإعلانات المنشورة',
    'profile.total_earnings': 'الأرباح الإجمالية',
    'profile.delete_account': 'حذف حسابي',
    'profile.back_home': 'العودة للرئيسية',
    'profile.profile': 'الملف الشخصي',
    'profile.favorites': 'المفضلة',
    'profile.ads': 'الإعلانات',
    'profile.reservations': 'الحجوزات',
    'profile.requests': 'الطلبات',
    'profile.wallet': 'المحفظة',
    'profile.edit': 'تعديل',
    'profile.member_since': 'عضو منذ {date}',
    'profile.select_country': 'اختر بلداً',
    'profile.address_placeholder': 'أدخل عنوانك الكامل',
    'profile.address_hint': 'أدخل عنوانًا صالحًا متوافقًا مع خرائط Google',
    'profile.delete_confirm': 'هل أنت متأكد من حذف حسابك؟',
    'profile.delete_description':
      'هذا الإجراء لا رجعة فيه. سيتم حذف جميع بياناتك، إعلاناتك، حجوزاتك، وسجل معاملاتك نهائيًا.',
    'profile.account_deletion_pending': 'الحساب في انتظار الحذف',
    'profile.delete_processing':
      'سيتم معالجة طلبك خلال 72 ساعة، وهو الوقت اللازم لفريقنا للتحقق من عدم وجود شكاوى أو نزاعات مرتبطة بحسابك.',
    'profile.current_password': 'كلمة المرور الحالية',
    'profile.new_password': 'كلمة المرور الجديدة',

    // Forms
    'form.first_name': 'الاسم الأول',
    'form.last_name': 'الاسم الأخير',
    'form.email': 'البريد الإلكتروني',
    'form.phone': 'الهاتف',
    'form.address': 'العنوان',
    'form.country': 'البلد',
    'form.password': 'كلمة المرور',
    'form.confirm_password': 'تأكيد كلمة المرور',
    'form.title': 'العنوان',
    'form.description': 'الوصف',
    'form.price': 'السعر',
    'form.category': 'الفئة',
    'form.location': 'الموقع',

    // Actions
    'action.search': 'بحث',
    'action.filter': 'تصفية',
    'action.sort': 'ترتيب',
    'action.save': 'حفظ',
    'action.cancel': 'إلغاء',
    'action.confirm': 'تأكيد',
    'action.delete': 'حذف',
    'action.edit': 'تعديل',
    'action.view': 'عرض',
    'action.contact': 'اتصال',
    'action.close': 'إغلاق',
    'action.back': 'رجوع',
    'action.next': 'التالي',
    'action.previous': 'السابق',

    // Floating Action Button
    'fab.contact_support': 'اتصل بالدعم',
    'fab.publish_ad': 'نشر إعلان',
    'fab.find_tool': 'البحث عن أداة',

    // Messages
    'message.success': 'نجح',
    'message.error': 'خطأ',
    'message.loading': 'جاري التحميل...',
    'message.no_results': 'لم يتم العثور على نتائج',
    'message.confirm_delete': 'هل أنت متأكد من الحذف؟',

    // Footer
    'footer.about': 'حول',
    'footer.help': 'مساعدة',
    'footer.discover': 'اكتشف بريكولا',
    'footer.contact': 'اتصال',
    'footer.legal': 'قانوني',
    'footer.rights': 'جميع الحقوق محفوظة',
    'footer.cgu': 'الشروط',
    'footer.privacy': 'سياسة الخصوصية',
    'footer.faq': 'الأسئلة الشائعة',
    'footer.description':
      'المنصة التي تربط أصحاب الأدوات بمن يحتاجون إليها. بسيطة، آمنة، ومحلية« www.bricolaltd.com » هي علامة تجارية تابعة لشركة « BRICOLA LTD »مسجلة في إنجلترا وويلز تحت الرقم: 16401372',
    'footer.contrat': 'عقد الإيجار', // Added
    'footer.payment': 'وسائل الدفع', // Added
    'footer.useful_links': 'روابط مفيدة', // Added
    'footer.help_center': 'مركز المساعدة', // Added
    'footer.owner_guide': 'دليل المؤجر', // Added
    'footer.renter_guide': 'دليل المستأجر', // Added
    'footer.terms_conditions': 'الشروط والأحكام', // Added
    // Login
    'login.title': 'تسجيل الدخول',
    'login.subtitle': 'اتصل بحسابك في Bricola LTD',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.signin': 'تسجيل الدخول',
    'login.no_account': 'ليس لديك حساب؟ إنشاء حساب',
    'login.forgot_password': 'نسيت كلمة المرور؟',

    // Register
    'register.title': 'إنشاء حساب',
    'register.subtitle': 'أنشئ حسابك في Bricola LTD',
    'register.user_type': 'نوع المستخدم',
    'register.individual': 'فرد',
    'register.business': 'شركة',
    'register.first_name': 'الاسم الأول',
    'register.last_name': 'الاسم الأخير',
    'register.phone': 'الهاتف',
    'register.country': 'البلد',
    'register.address': 'العنوان',
    'register.address_help': 'العنوان الكامل مع الرمز البريدي والمدينة',
    'register.password': 'كلمة المرور',
    'register.confirm_password': 'تأكيد كلمة المرور',
    'register.terms': 'أوافق على شروط الاستخدام',
    'register.sales_conditions': 'أوافق على سياسة الخصوصية',
    'register.create_account': 'إنشاء حسابي',
    'register.have_account': 'لديك حساب بالفعل؟ تسجيل الدخول',
    'register.select_country': 'اختر بلداً',

    // About
    'about.title': 'مرحبًا بكم في Bricola LTD',
    'about.subtitle':
      ' منصتكم الموثوقة لتأجير الأدوات بين الأفراد في منطقة الخليج',
    'about.mission_title': 'من نحن',
    'about.mission_1':
      'LTD Bricola هي منصة رائدة مسجلة في المملكة المتحدة منذ عام ،2025 تقدم خدمة رقمية متكاملة لتمكين األفراد من تأجير األدوات فيما بينهم بسهولة وأمان.',
    'about.mission_2':
      'ولدت فكرتنا من حاجة واضحة: كثير من األشخاص يمتلكون أدوات نادراً ما يستخدمونها، في حين لردم يحتاج آخرون للوصول إلى أدوات عالية الجودة دون الحاجة لشرائها. نحن نوفر حالً عملياً وفعاالً هذه الفجوة.',
    'about.mission_3':
      'خدماتنا تركز على ربط من يحتاج أدوات للصيانة المنزلية، أو األشغال اليدوية، أو البستنة، أو التنظيف، أو المناسبات، مع أصحاب األدوات المحليين عبر تطبيق وموقع إلكتروني سهل االستخدام.',
    'about.mission_4':
      'من خالل منصتنا، يمكن للمستخدمين عرض أدواتهم مع تفاصيل دقيقة )صور، وصف، سعر، تأمين( ليستأجرها اآلخرون لفترات قصيرة أو طويلة، ويتم الدفع عبر نظام رقمي آمن ومتكامل.',
    'about.advantages': 'قيمتنا المضافة تكمن في أننا نوفر:',
    'about.advantages_1': 'حل اقتصادي يقلل من الهدر ويشجع على االستدامة.',
    'about.advantages_2':
      ' وسيلة سهلة وسريعة للعثور على األدوات المناسبة في دقائق.',
    'about.advantages_3': 'نظام دفع آمن وحماية مدمجة لكل عملية.',
    'about.advantages_4': 'تجربة شفافة تعزز الثقة بين المؤجرين والمستأجرين.',
    'about.mission_5':
      'اختيارك لـ LTD Bricola يعني توفير المال والوقت، والحصول على ما تحتاجه بطريقة ذكية ومستدامة، والمساهمة في بناء مستقبل لتأجير األدوات في منطقة الخليج.',
    'about.mission_6': 'شكرا النضمامك إلى مجتمع Bricola.',
    'about.values_title': 'قيمنا',
    'about.community': 'المجتمع',
    'about.community_desc': 'إنشاء روابط بين الجيران وتعزيز التعاون المحلي',
    'about.security': 'الأمان',
    'about.security_desc': 'ضمان المعاملات الآمنة والتأمين الشامل',
    'about.quality': 'الجودة',
    'about.quality_desc': 'التأكد من أن جميع الأدوات تلبي معايير الجودة لدينا',
    'about.simplicity': 'البساطة',
    'about.simplicity_desc': 'جعل تأجير الأدوات بسيط كالنقر على زر',
    'about.stats_title': 'Bricola في الأرقام',
    'about.tools_available': 'الأدوات المتاحة',
    'about.active_users': 'المستخدمون النشطون',
    'about.cities_covered': 'المدن المغطاة',
    'about.satisfaction': 'رضا العملاء',
    'about.team_title': 'فريقنا',
    'about.founder.name': 'عادل الجبالي',
    'about.founder.role': 'الرئيس التنفيذي والمؤسس',
    'about.founder.bio':
      'دكتوراه في علوم الحاسوب | مستشار في الأمن السيبراني والمرونة الرقمية',

    // Contact
    'contact.title': 'اتصل بنا',
    'contact.subtitle':
      'لديك سؤال أو مشكلة أو تريد التحدث؟ فريقنا هنا لمساعدتك.',
    'contact.form_title': 'أرسل لنا رسالة',
    'contact.first_name': 'الاسم الأول',
    'contact.last_name': 'الاسم الأخير',
    'contact.subject': 'الموضوع',
    'contact.message': 'الرسالة',
    'contact.phone': 'الهاتف',
    'contact.phone_placeholder': '+966 11 234 5678',
    'contact.sending': 'جاري الإرسال...',
    'contact.send': 'إرسال الرسالة',
    'contact.error_title': 'خطأ',
    'contact.error_message':
      'حدث خطأ أثناء إرسال رسالتك. يرجى المحاولة مرة أخرى.',
    'contact.success_title': 'تم إرسال الرسالة!',
    'contact.success_message':
      'تم إرسال رسالتك بنجاح. سنرد عليك في أقرب وقت ممكن.',
    'contact.email_title': 'البريد الإلكتروني',
    'contact.phone_title': 'الهاتف',
    'contact.address_title': 'العنوان',
    'contact.hours_title': 'ساعات العمل',
    'contact.hours_weekdays': 'الاثنين - الجمعة: 9:00 صباحاً - 6:00 مساءً',
    'contact.hours_saturday': 'السبت: 10:00 صباحاً - 4:00 مساءً',
    'contact.hours_sunday': 'الأحد: مغلق',
    'contact.faq_title': 'الأسئلة الشائعة',
    'contact.how_to_rent': 'كيفية استئجار أداة؟',
    'contact.how_to_rent_answer':
      'ابحث عن الأداة المطلوبة، اختر تواريخ الاستئجار، وأكد حجزك. الأمر بهذه البساطة!',
    'contact.problem': 'ماذا أفعل في حالة وجود مشكلة؟',
    'contact.problem_answer':
      'اتصل بنا فوراً عبر دعم العملاء. نحن هنا لحل جميع مشاكلك بسرعة.',
    'contact.how_to_list': 'كيفية عرض أدواتي؟',
    'contact.how_to_list_answer':
      'انقر على "عرض أداة" في التنقل، أضف تفاصيل وصور أداتك، وابدأ في كسب المال.',
    'contact.insurance': 'هل الأدوات مؤمنة؟',
    'contact.insurance_answer':
      'نعم، جميع الأدوات المستأجرة عبر Bricola مغطاة بتأميننا الشامل لراحة بالك.',

    // Add Tool
    'add_tool.title': 'عرض أداة',
    'add_tool.subtitle':
      'شارك أدواتك مع المجتمع واحصل على دخل من تأجيرها بسهولة',
    'add_tool.info_title': 'معلومات الأداة',
    'add_tool.general_info': 'المعلومات العامة',
    'add_tool.ad_title': 'عنوان الإعلان',
    'add_tool.brand': 'العلامة التجارية',
    'add_tool.model': 'الطراز',
    'add_tool.year': 'سنة الشراء',
    'add_tool.description': 'الوصف',
    'add_tool.categorization': 'التصنيف',
    'add_tool.category': 'الفئة',
    'add_tool.subcategory': 'الفئة الفرعية',
    'add_tool.condition': 'حالة الأداة',
    'add_tool.pricing': 'التسعير',
    'add_tool.price_per_day': 'السعر في اليوم ',
    'add_tool.deposit': 'التأمين ',
    'add_tool.location_title': 'الموقع',
    'add_tool.address': 'العنوان أو المدينة',
    'add_tool.photos_title': 'الصور',
    'add_tool.add_photos': 'أضف صورك',
    'add_tool.drop_images': 'اسحب صورك هنا أو انقر للتصفح',
    'add_tool.browse_files': 'تصفح الملفات',
    'add_tool.file_format': 'PNG، JPG حتى 10MB • 5 صور كحد أقصى',
    'add_tool.instructions_title': 'تعليمات الاستخدام',
    'add_tool.owner_instructions': 'تعليمات المالك',
    'add_tool.publish': 'نشر الإعلان',
    'add_tool.choose_category': 'اختر فئة',
    'add_tool.choose_subcategory': 'اختر فئة فرعية',
    'add_tool.condition_new': '✨ جديد',
    'add_tool.condition_excellent': '🌟 ممتاز',
    'add_tool.condition_good': '👍 جيد',
    'add_tool.condition_fair': '👌 مقبول',
    'add_tool.title_placeholder': 'أدخل عنوان أداتك...',
    'add_tool.brand_placeholder': 'علامة الأداة التجارية',
    'add_tool.model_placeholder': 'طراز الأداة',
    'add_tool.year_placeholder': 'سنة الشراء',
    'add_tool.description_placeholder': 'صف أداتك وحالتها والملحقات المرفقة...',

    // Categories and subcategories
    'category.gardening': 'البستنة',
    'category.gardening.lawn': 'العشب',
    'category.gardening.soil': 'التربة',
    'category.gardening.wood': 'الخشب',
    'category.gardening.tree': 'الشجرة',
    'category.gardening.leaves': 'الأوراق',

    'category.cleaning': 'التنظيف',
    'category.cleaning.fabric': 'الأقمشة',
    'category.cleaning.water': 'الماء',
    'category.cleaning.dust': 'الغبار',

    'category.diy': 'الأشغال اليدوية',
    'category.diy.construction': 'البناء',
    'category.diy.electricity': 'الكهرباء',
    'category.diy.painting': 'الطلاء',
    'category.diy.screws_and_bolts': 'البراغي والصواميل',

    'category.transport': 'النقل',
    'category.transport.heavy_load': 'الأحمال الثقيلة',
    'category.transport.engine': 'المحرك',
    'category.transport.wheel': 'العجل',

    'category.event': 'معدات المناسبات',
    'category.event.lighting': 'الإضاءة',
    'category.event.kitchen': 'المطبخ',
    'category.event.entertainment_and_games': 'الترفيه والألعاب',
    'category.event.furniture': 'الأثاث',
    'category.event.decoration': 'الزينة',
    'category.event.structure': 'الهياكل',

    // AddTool verification and messages
    'addtool.verification_in_progress': 'التحقق جاري...',
    'addtool.name_available': 'الاسم متاح ✓',
    'addtool.name_already_used': 'هذا الاسم مستخدم بالفعل',
    'addtool.error_occurred': 'حدث خطأ',
    'addtool.success_message': 'تم بنجاح!',
    'addtool.placeholder_text': 'أدخل النص هنا...',
    'addtool.category_gardening': 'البستنة',
    'addtool.category_cleaning': 'التنظيف',
    'addtool.category_diy': 'الأشغال اليدوية',
    'addtool.category_transport': 'النقل',
    'addtool.category_event': 'معدات المناسبات',

    // Common
    'common.yes': 'نعم',
    'common.no': 'لا',
    'common.ok': 'موافق',
    'common.language': 'اللغة',
    'common.currency': 'العملة',
    'common.menu': 'القائمة',
    'common.navigation': 'التنقل',
    'common.home': 'الرئيسية',
    'common.p': 'تحميل البيانات',
    'common.loading': 'تحميل البيانات',

    // CGU (Terms of Use - Arabic)
    'cgu.title': 'شروط الاستخدام',
    'cgu.last_updated': 'تاريخ السريان: 1 سبتمبر 2025',
    'cgu.section1.title': '1. مقدمة',
    'cgu.section1.p1':
      'Bricola LTD هي منصة رقمية تربط بين الأفراد لتبادل كراء الأدوات المتعلقة بالبستنة، التنظيف، الأشغال اليدوية، وتنظيم المناسبات.',
    'cgu.section1.p2':
      'تعمل المنصة كوسيط رقمي موثوق ولا تتحمل مسؤولية الأدوات فعليًا أو عمليات التوصيل.',

    'cgu.section2.title': '2. الوصول إلى المنصة',
    'cgu.section2.p1':
      'يمكن استخدام المنصة عبر الموقع الإلكتروني أو التطبيقات.',
    'cgu.section2.p2':
      'يُشترط أن يكون المستخدم راشدًا (18 سنة أو أكثر) ويتمتع بالأهلية القانونية.',
    'cgu.section2.p3':
      'تحتفظ بريكولا بحقها في تعليق أو إيقاف الحسابات في حال مخالفة الشروط أو الاستعمال غير القانوني.',

    'cgu.section3.title': '3. التسجيل والتحقق من الهوية',
    'cgu.section3.li1':
      'يجب على المستخدم تقديم بريد إلكتروني صالح، رقم هاتف، وبيانات هوية دقيقة.',
    'cgu.section3.li2':
      'يجب على المؤجرين تقديم بياناتهم البنكية بدقة لتلقي الأرباح عبر Wise.',
    'cgu.section3.li3':
      'تحتفظ بريكولا بحق طلب وثائق تحقق قبل تفعيل بعض المعاملات.',
    'cgu.section3.li4': 'لا يُسمح بمشاركة أو بيع الحسابات بين الأطراف.',

    'cgu.section4.title': '4. شروط الكراء وواجبات المستخدم',
    'cgu.section4.li1':
      'يجب على المستأجر إرجاع الأدوات في نفس الحالة التي استلمها بها.',
    'cgu.section4.li2':
      'المؤجر مسؤول عن صلاحية، نظافة، وسلامة الأدوات قبل نشرها.',
    'cgu.section4.li3':
      'في حال وجود ضرر أو نزاع، قد تطلب المنصة أدلة (صور أو فيديو).',
    'cgu.section4.li4':
      'التأخير في الإرجاع يؤدي إلى خصومات من الضمان بمعدل يومي أو ساعي.',
    'cgu.section4.li5':
      'لا يمكن أن تتجاوز مدة الكراء 5 أيام في العملية الواحدة. في حال رغبة المستأجر في تمديد المدة، يجب أولًا التحقق من توفر الأداة لدى المؤجر، ثم إعادة إجراء عملية حجز جديدة عبر المنصة.',
    'cgu.section4.li6': 'فقدان الأداة يؤدي إلى خسارة الضمان بالكامل.',
    'cgu.section4.li7': 'سوء استخدام الأدوات قد يؤدي إلى تعليق الحساب.',

    'cgu.section5.title': '5. الدفع والعمولة والمحفظة',
    'cgu.section5.li1':
      'تُدار عمليات الدفع عبر Stripe، وتخضع للوائح المالية المحلية.',
    'cgu.section5.li2':
      'تُحمّل نسبة 6% من كل عملية كراء على المستأجر عند الدفع، وهي تغطي مصاريف الدفع الإلكتروني عبر Stripe إضافة إلى جزء من تكاليف تطوير وتشغيل المنصة (صيانة، استضافة، تحسينات تقنية).',
    'cgu.section5.li3': 'تُقتطع عمولة بنسبة 15% من كل عملية كراء ناجحة.',
    'cgu.section5.li4':
      'تُودع أرباح المؤجر في محفظة رقمية داخلية ويمكن سحبها عبر Wise.',
    'cgu.section5.li5':
      'لا يمكن للمؤجر سحب الرصيد المتوفر في محفظته إلا إذا بلغ الحد الأدنى وهو 50 جنيهًا إسترلينيًا. هذا الإجراء يهدف إلى تقليص عدد عمليات السحب الصغيرة، وتفادي التكاليف المرتفعة المرتبطة بالتحويلات، وضمان انسيابية العمليات داخل المنصة.',
    'cgu.section5.li6':
      'لا تتحمل بريكولا مسؤولية التأخيرات الناتجة عن الأنظمة البنكية الخارجية.',

    'cgu.section6.title': '6. سياسة مبلغ الضمان',
    'cgu.section6.li1': 'يتم حجز مبلغ ضمان لكل عملية كراء عبر Stripe.',
    'cgu.section6.li2':
      'يُفرج عن المبلغ بعد مرور 24 ساعة من الإرجاع والتحقق من الحالة.',
    'cgu.section6.li3': 'في حال وجود ضرر، يتم إعلام المستخدم قبل خصم أي مبلغ.',
    'cgu.section6.li4': 'يمكن استخدام الضمان كليًا أو جزئيًا لتعويض المؤجر.',

    'cgu.section7.title': '7. معالجة النزاعات',
    'cgu.section7.li1':
      'يجب الإبلاغ عن أي نزاع خلال 24 ساعة من وقت الإرجاع المحدد.',
    'cgu.section7.li2':
      'يقوم فريق الدعم بالتحقيق خلال 72 ساعة ويصدر قرارًا نهائيًا.',
    'cgu.section7.li3': 'تحتفظ بريكولا بحق اتخاذ قرار عادل بناءً على الأدلة.',
    'cgu.section7.li4': 'القرار الصادر عن الفريق ملزم للطرفين.',

    'cgu.section8.title': '8. الاستخدام العادل وسلامة المنصة',
    'cgu.section8.li1': 'يُمنع عرض أدوات غير قانونية أو غير مملوكة.',
    'cgu.section8.li2': 'تُحظر الإعلانات المزيفة أو العشوائية.',
    'cgu.section8.li3': 'يُمنع تأجير أدوات خطرة أو محظورة قانونيًا.',
    'cgu.section8.li4': 'يتعرض المستخدمون المخالفون لحظر دائم.',

    'cgu.section9.title': '9. سياسة الإلغاء والاسترجاع',
    'cgu.section9.li1':
      'يحق للمستأجر إلغاء الحجز واسترجاع المبلغ كاملًا (100%) في حال تم الإلغاء قبل 24 ساعة على الأقل من موعد بداية الكراء.',
    'cgu.section9.li2':
      'إذا تم الإلغاء خلال 24 ساعة الأخيرة قبل الموعد، فلن يتم استرجاع أي مبلغ، ويُعتبر الحجز نهائي.',
    'cgu.section9.li3':
      'في حال قام المؤجّر بإلغاء الحجز في أي وقت، يتم إرجاع كامل المبلغ للمستأجر، ويمكن أن تتخذ إدارة المنصة إجراءات ضد المؤجّر في حال تكرار الإلغاء.',

    'cgu.section10.title': '10. توافر الخدمة والتحديثات',
    'cgu.section10.li1': 'قد يتم تعليق المنصة مؤقتًا لأسباب تقنية أو تحديثات.',
    'cgu.section10.li2':
      'تُرسل إشعارات للمستخدمين مسبقًا في حال التوقف المبرمج.',
    'cgu.section10.li3':
      'يمكن للمنصة تعديل أو إضافة ميزات دون إشعار مسبق لضمان تحسين الخدمة.',

    'cgu.section11.title': '11. حماية البيانات والخصوصية',
    'cgu.section11.li1':
      'تلتزم بريكولا بتطبيق قوانين حماية البيانات البريطانية والأوروبية (GDPR).',
    'cgu.section11.li2': 'يتم حفظ البيانات بشكل آمن ومشفّر.',
    'cgu.section11.li3': 'يمكن للمستخدم طلب حذف أو تعديل بياناته في أي وقت.',
    'cgu.section11.li4': 'لا يتم بيع أو مشاركة البيانات مع طرف ثالث دون إذن.',

    'cgu.section12.title': '12. القانون المعتمد والاختصاص القضائي',
    'cgu.section12.li1': 'تخضع هذه الشروط للقانون البريطاني.',
    'cgu.section12.li2':
      'في حال عدم التوصل لحل داخلي، يتم عرض النزاع أمام محاكم لندن المختصة.',
    'cgu.section12.li3':
      'يُعتبر استمرار استخدام المنصة موافقة تلقائية على الشروط الجديدة.',

    'cgu.section13.title': '13. التأكيد التلقائي في حال عدم التفاعل',
    'cgu.section13.p':
      'في بعض الحالات التي لا يقوم فيها المستخدم (سواء المستأجر أو المالك) باتخاذ الإجراء اللازم أو الرد خلال فترة زمنية معقولة، تحتفظ Bricola LTD بحقها في تأكيد حالة العملية تلقائيًا (مثل تسليم الأداة أو إرجاعها). يهدف هذا الإجراء إلى ضمان استمرارية الخدمة ومصداقيتها. ننصح المستخدمين بمتابعة معاملاتهم والتفاعل في الوقت المناسب لتفادي التأكيد التلقائي.',

    'cgu.section14.title': '14. تعديل الشروط والموافقة عليها',
    'cgu.section14.p1':
      'قد يتم تحديث شروط الاستخدام من وقت لآخر لتعكس التغيرات التقنية أو القانونية أو التشغيلية.',
    'cgu.section14.p2': 'سيتم إعلام المستخدمين بالتحديثات الجوهرية عبر المنصة.',
    'cgu.section14.p3':
      'يُعتبر استمرار استخدام الخدمة بعد هذه التعديلات موافقة ضمنية على الشروط الجديدة.',

    'cgu.section15.title': '15. الاتصال والتواصل',
    'cgu.section15.p1':
      'لأي استفسارات أو ملاحظات أو مراسلات قانونية بخصوص شروط الاستخدام، يمكن للمستخدمين التواصل مع Bricola LTD عبر البريد الإلكتروني: contact@bricolaltd.com.',
    'cgu.section15.p2':
      'تُرسل المراسلات الرسمية على البريد الإلكتروني المُسجل من طرف المستخدم.',

    // Privacy Policy
    'privacy.title': 'سياسة الخصوصية – Bricola LTD',
    'privacy.last_updated': 'تاريخ السريان: 1 سبتمبر 2025',
    'privacy.section1.title': '1. المقدمة',
    'privacy.section1.p1':
      'تلتزم Bricola LTD بحماية خصوصيتك ومعالجة بياناتك طبقًا لقوانين حماية البيانات المعتمدة في المملكة المتحدة والاتحاد الأوروبي (GDPR).',
    'privacy.section1.p2':
      'نحن ملتزمون بمعالجة معلوماتك وفقًا للائحة العامة لحماية البيانات (GDPR) المطبقة في المملكة المتحدة والاتحاد الأوروبي.',
    'privacy.section1.p3':
      'تشرح هذه السياسة أنواع البيانات التي نجمعها وأسباب جمعها وكيفية استخدامها.',

    'privacy.section2.title': '2. البيانات التي نجمعها',
    'privacy.section2.p1':
      'كجزء من استخدام منصتنا، نقوم بجمع البيانات التالية:',
    'privacy.section2.identification': 'معلومات الهوية:',
    'privacy.section2.identification.li1':
      'الاسم، رقم الهاتف، البريد الإلكتروني',
    'privacy.section2.account': 'بيانات الحساب:',
    'privacy.section2.account.li1': 'اسم المستخدم، كلمة المرور',
    'privacy.section2.payment': 'معلومات الدفع:',
    'privacy.section2.payment.li1':
      'نحن لا نقوم بجمع اي معلومات خاصة بوسائل الدفع.',
    'privacy.section2.technical': 'المعلومات التقنية:',
    'privacy.section2.technical.li1':
      'عنوان IP، نوع المتصفح، نظام التشغيل، الموقع الجغرافي التقريبي',
    'privacy.section2.usage': 'بيانات الاستخدام:',
    'privacy.section2.usage.li1':
      'النقرات، الصفحات المزارة، استعلامات البحث المنجزة على المنصة',

    'privacy.section3.title': '3. كيف نستخدم بياناتك',
    'privacy.section3.p1': 'تُستخدم بياناتك الشخصية للأغراض التالية:',
    'privacy.section3.li1': 'إنشاء وإدارة وتأمين حساب المستخدم الخاص بك',
    'privacy.section3.li2': 'معالجة المدفوعات وتأمين معاملات الإيجار',
    'privacy.section3.li3': 'التحقق من الهوية وضمان الامتثال التنظيمي',
    'privacy.section3.li4': 'دعم العملاء وإدارة النزاعات ومعالجة الشكاوى',
    'privacy.section3.li5':
      'التحسين المستمر للمنصة وكشف الاحتيال وتحليل سلوك الاستخدام',

    'privacy.section4.title': '4. الأساس القانوني للمعالجة',
    'privacy.section4.p1':
      'نعالج البيانات الشخصية بناءً على موافقة المستخدم والمصلحة المشروعة والالتزامات القانونية (مثل منع الاحتيال).',
    'privacy.section4.consent':
      'موافقتك الصريحة، خاصة أثناء التسجيل أو تقديم المعلومات الشخصية',
    'privacy.section4.interest':
      'مصلحتنا المشروعة، لضمان أمان خدماتنا وتحسينها المستمر',
    'privacy.section4.legal':
      'التزاماتنا القانونية، فيما يتعلق بمنع الاحتيال أو الامتثال للوائح المالية والضريبية',

    'privacy.section5.title': '5. مشاركة البيانات مع أطراف خارجية',
    'privacy.section5.p1':
      'نشارك بياناتك فقط مع شركاء موثوقين وفقط عند الضرورة:',
    'privacy.section5.li1':
      'معالجات الدفع: Wise، للتحويلات المالية لأصحاب الأدوات',
    'privacy.section5.li2':
      'مقدمو الاستضافة وشركاء الأمن المعلوماتي، لضمان توفر وحماية المنصة',
    'privacy.section5.li3': 'السلطات المختصة، في إطار التزام قانوني أو تنظيمي',
    'privacy.section5.li4':
      'لا نبيع أو نؤجر أو ننقل بياناتك لأطراف ثالثة لأغراض تجارية في أي حال.',

    'privacy.section6.title': '6. مدة الاحتفاظ بالبيانات',
    'privacy.section6.p1': 'نحتفظ بالبيانات طالما أن حسابك نشط.',
    'privacy.section6.p2':
      'في حالة عدم النشاط لمدة 3 سنوات، قد يتم إلغاء تنشيط حسابك، ثم إخفاء هوية بياناتك أو حذفها، إلا إذا كان الاحتفاظ بها مطلوبًا بموجب القانون (مثل: الفوترة، النزاعات، التحقق الضريبي).',

    'privacy.section7.title': '7. أمن البيانات',
    'privacy.section7.p1':
      'نطبق بروتوكولات تشفير متقدمة وإجراءات مراقبة وصول صارمة ونستخدم خوادم آمنة تقع في منطقة المملكة المتحدة/الاتحاد الأوروبي.',
    'privacy.section7.p2':
      'أولويتنا هي ضمان سلامة وسرية وتوفر بياناتك في جميع الأوقات.',

    'privacy.section8.title': '8. حقوقك',
    'privacy.section8.p1': 'وفقًا لـ GDPR، لديك الحقوق التالية:',
    'privacy.section8.access': 'حق الوصول:',
    'privacy.section8.access.desc': 'الحصول على نسخة من بياناتك الشخصية',
    'privacy.section8.rectification': 'حق التصحيح:',
    'privacy.section8.rectification.desc': 'تصحيح أي بيانات غير دقيقة أو قديمة',
    'privacy.section8.erasure': 'حق المحو:',
    'privacy.section8.erasure.desc':
      'طلب حذف بياناتك (ضمن الحدود المنصوص عليها في القانون)',
    'privacy.section8.withdrawal': 'حق سحب الموافقة:',
    'privacy.section8.withdrawal.desc': 'سحب تصريحك في أي وقت',
    'privacy.section8.li1': 'الوصول إلى بياناتك',
    'privacy.section8.li2': 'تصحيح البيانات الخاطئة',
    'privacy.section8.li3': 'طلب حذف البيانات (مع مراعاة الالتزامات القانونية)',
    'privacy.section8.li4': 'سحب الموافقة في أي وقت',
    'privacy.section8.p2':
      'يمكنك ممارسة هذه الحقوق عبر: support@bricolaltd.com',
    'privacy.section8.contact':
      'يمكنك ممارسة هذه الحقوق في أي وقت بالكتابة إلى support@bricolaltd.com',

    'privacy.section9.title': '9. النقل الدولي للبيانات',
    'privacy.section9.p1':
      'إذا تم نقل بعض البيانات خارج الاتحاد الأوروبي/المملكة المتحدة، فيتم ذلك في إطار تعاقدي آمن، عبر بنود تعاقدية نمطية أو اتفاقيات مع مقدمي الخدمات الذين يحترمون المعايير الدولية لحماية البيانات.',

    'privacy.section10.title': '10. تحديث سياسة الخصوصية',
    'privacy.section10.p1':
      'قد تخضع هذه السياسة للتحديثات لتعكس التطورات التقنية أو القانونية أو التنظيمية.',
    'privacy.section10.p2':
      'سيتم إعلام المستخدمين بأي تعديل جوهري عبر البريد الإلكتروني أو الإشعار عبر التطبيق.',
    'privacy.section10.p3':
      'استمرار استخدام المنصة بعد التعديل يعني القبول الضمني للنسخة الجديدة.',

    // validation
    'validation.checking': 'جاري التحقق...',
    'validation.name_available': 'الاسم متاح',
    'validation.name_taken': 'الاسم مُستخدم بالفعل',
    'validation.first_name_required': 'الاسم الأول مطلوب',
    'validation.last_name_required': 'الاسم الأخير مطلوب',
    'validation.email_required': 'البريد الإلكتروني مطلوب',
    'validation.password_required': 'كلمة المرور مطلوبة',
    'validation.terms_required': 'يجب الموافقة على الشروط والأحكام',
    'validation.privacy_required': 'يجب الموافقة على سياسة الخصوصية',

    // Contact form validation
    'contact.validation.firstName_required': 'الاسم الأول مطلوب.',
    'contact.validation.firstName_min_length':
      'يجب أن يحتوي الاسم الأول على حرفين على الأقل.',
    'contact.validation.lastName_required': 'اسم العائلة مطلوب.',
    'contact.validation.lastName_min_length':
      'يجب أن يحتوي اسم العائلة على حرفين على الأقل.',
    'contact.validation.email_required': 'البريد الإلكتروني مطلوب.',
    'contact.validation.email_invalid': 'تنسيق البريد الإلكتروني غير صحيح.',
    'contact.validation.phone_invalid': 'تنسيق رقم الهاتف غير صحيح.',
    'contact.validation.subject_required': 'الموضوع مطلوب.',
    'contact.validation.subject_min_length':
      'يجب أن يحتوي الموضوع على 5 أحرف على الأقل.',
    'contact.validation.message_required': 'الرسالة مطلوبة.',
    'contact.validation.message_min_length':
      'يجب أن تحتوي الرسالة على 10 أحرف على الأقل.',
    'contact.validation.category_required': 'الفئة مطلوبة.',
    'contact.category.label': 'الفئة *',
    'contact.category.placeholder': 'اختر فئة',
    'contact.category.technical': 'تقني',
    'contact.category.payment': 'دفع',
    'contact.category.account': 'حساب',
    'contact.category.dispute': 'نزاع',
    'contact.category.suggestion': 'اقتراح',
    'contact.category.other': 'أخرى',
    'validation.title_required': 'العنوان مطلوب',
    'validation.description_required': 'الوصف مطلوب',
    'validation.price_required': 'السعر مطلوب',
    'validation.category_required': 'الفئة مطلوبة',
    'validation.location_required': 'الموقع مطلوب',
    'validation.images_required': 'الصور مطلوبة',
    'validation.deposit_required': 'مبلغ التأمين مطلوب',
    'validation.phone_required': 'رقم الهاتف مطلوب',
    'validation.address_required': 'العنوان مطلوب',
    'validation.country_required': 'البلد مطلوب',
    'validation.invalid_email': 'البريد الإلكتروني غير صحيح',
    'validation.invalid_phone': 'رقم الهاتف غير صحيح',
    'validation.password_too_short':
      'كلمة المرور قصيرة جداً (8 أحرف على الأقل)',
    'validation.passwords_dont_match': 'كلمات المرور غير متطابقة',
    'validation.invalid_price': 'السعر غير صحيح',
    'validation.invalid_deposit': 'مبلغ التأمين غير صحيح',
    'validation.description_max_chars': 'لقد تجاوزت العدد الأقصى المسموح به من الأحرف (500).',
    'validation.instructions_max_chars': 'لقد تجاوزت العدد الأقصى المسموح به من الأحرف (300).',
    'validation.price_max_amount': 'الحد الأقصى للسعر اليومي هو 500 جنيه إسترليني.',
    'validation.deposit_max_amount': 'الحد الأقصى للتأمين هو 500 جنيه إسترليني',
    'validation.character_counter': 'تحذير: {current}/{max} حرف مستخدم.',
    'validation.char_count': '{current}/{max} حرف',

    // Currency names
    'currency.GBP': 'الجنيه الإسترليني البريطاني',
    'currency.KWD': 'الدينار الكويتي',
    'currency.SAR': 'الريال السعودي',
    'currency.BHD': 'الدينار البحريني',
    'currency.OMR': 'الريال العماني',
    'currency.QAR': 'الريال القطري',
    'currency.AED': 'درهم الإمارات العربية المتحدة',
    'currency.label': 'العملة',

    // Deposit Payment Modal (duplicated keys removed)
    'deposit.modal.description': 'يرجى دفع التأمين لتأكيد حجزك. سيتم استرداد هذا المبلغ بعد فترة الإيجار إذا لم تحدث أضرار.',
    'deposit.modal.amount.label': 'مبلغ التأمين',
    'deposit.modal.payment.title': 'معلومات الدفع',
    'deposit.modal.payment.description': 'أدخل تفاصيل بطاقتك لدفع التأمين',
    'deposit.modal.buttons.cancel': 'إلغاء الحجز',
    'deposit.modal.buttons.pay': 'دفع التأمين',
    'deposit.modal.buttons.processing': 'جاري المعالجة...',
    'deposit.modal.cancel.confirm.title': 'إلغاء الحجز؟',
    'deposit.modal.cancel.confirm.message': 'هل أنت متأكد من رغبتك في إلغاء هذا الحجز؟ لا يمكن التراجع عن هذا الإجراء.',
    'deposit.modal.cancel.confirm.yes': 'نعم، إلغاء',
    'deposit.modal.cancel.confirm.no': 'الاحتفاظ بالحجز',
    'deposit.modal.success.title': 'تم الدفع بنجاح!',
    'deposit.modal.success.message': 'تم معالجة التأمين بنجاح. تم تأكيد حجزك الآن.',
    'deposit.modal.error.payment': 'فشل في الدفع. يرجى المحاولة مرة أخرى.',
    'deposit.modal.error.cancel': 'فشل في إلغاء الحجز. يرجى المحاولة مرة أخرى.',
    'deposit.modal.error.generic': 'حدث خطأ. يرجى المحاولة مرة أخرى.',
    'deposit.notification.title': 'مطلوب دفع العربون',
    'deposit.notification.message': 'يبدأ حجزك خلال 24 ساعة. يرجى دفع التأمين للتأكيد.',
  },
}

const LanguageContext = createContext<LanguageContextType | undefined>(
  undefined
)

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Initialize language from localStorage or default to 'en'
  const [language, setLanguage] = useState<Language>(() => {
    try {
      const savedLanguage = localStorage.getItem('selectedLanguage') as Language
      return savedLanguage && ['fr', 'en', 'ar'].includes(savedLanguage)
        ? savedLanguage
        : 'en'
    } catch (error) {
      console.warn('Failed to load language from localStorage:', error)
      return 'en'
    }
  })

  // Custom setLanguage function that also saves to localStorage
  const updateLanguage = (lang: Language) => {
    try {
      localStorage.setItem('selectedLanguage', lang)
      setLanguage(lang)
    } catch (error) {
      console.warn('Failed to save language to localStorage:', error)
      setLanguage(lang)
    }
  }

  const t = (key: string): string => {
    return (
      translations[language][
        key as keyof (typeof translations)[typeof language]
      ] || key
    )
  }

  // Set document direction for Arabic
  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr'
    document.documentElement.lang = language
  }, [language])

  // Memoize the context value to prevent unnecessary re-renders
  const contextValue = useMemo(
    () => ({
      language,
      setLanguage: updateLanguage,
      t,
    }),
    [language]
  )

  return (
    <LanguageContext.Provider value={contextValue}>
      {children}
    </LanguageContext.Provider>
  )
}

export const useLanguage = () => {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}
