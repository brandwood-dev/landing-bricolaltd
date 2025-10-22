import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { AlertTriangle, ArrowLeft, Shield } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  accountDeletionService,
  AccountDeletionValidation,
} from '@/services/accountDeletionService'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import authService from '@/services/authService'

interface ProfileHeaderProps {
  userInfo: {
    id: string
    firstName: string
    lastName: string
    email: string
    verified: boolean
    memberSince: string
    profilePicture?: string
    phoneNumber?: string
    phone_prefix?: string
  }
  stats: {
    activeAds: number
    averageRating: number
    completedRentals: number
    totalEarnings: number
  }
  isAccountDeletionPending: boolean
  onAccountDeletion: () => void
}

const ProfileHeader = ({ userInfo, stats }: ProfileHeaderProps) => {
  const { t, language } = useLanguage()
  const navigate = useNavigate()

  // Debug logs pour les statistiques
  console.log('ProfileHeader - stats received:', stats)
  console.log('ProfileHeader - userInfo received:', userInfo)

  // State management for deletion process
  const [deletionStep, setDeletionStep] = useState<
    'initial' | 'validation' | 'confirmation' | 'password'
  >('initial')
  const [validationResult, setValidationResult] =
    useState<AccountDeletionValidation | null>(null)
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  // Format memberSince date based on language
  const formatMemberSinceDate = (dateString: string, lang: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth()

    const monthNames = {
      fr: [
        'janvier',
        'février',
        'mars',
        'avril',
        'mai',
        'juin',
        'juillet',
        'août',
        'septembre',
        'octobre',
        'novembre',
        'décembre',
      ],
      ar: [
        'يناير',
        'فبراير',
        'مارس',
        'أبريل',
        'مايو',
        'يونيو',
        'يوليو',
        'أغسطس',
        'سبتمبر',
        'أكتوبر',
        'نوفمبر',
        'ديسمبر',
      ],
      en: [
        'January',
        'February',
        'March',
        'April',
        'May',
        'June',
        'July',
        'August',
        'September',
        'October',
        'November',
        'December',
      ],
    }

    const monthName =
      monthNames[lang as keyof typeof monthNames]?.[month] ||
      monthNames.en[month]
    return `${monthName} ${year}`
  }

  const formattedMemberSince = formatMemberSinceDate(
    userInfo.memberSince,
    language
  )

  return (
    <>
      {/* Back button */}
      <div className='mb-6'>
        <Link
          to='/'
          className='inline-flex items-center gap-2 text-accent hover:underline'
        >
          <ArrowLeft className='h-4 w-4' />
          {t('profile.back_home')}
        </Link>
      </div>

      {/* Profile header */}
      <div className='bg-white rounded-lg shadow-sm border p-4 sm:p-6 mb-8'>
        <div className='flex !flex-col gap-6'>
          {/* Profile info section */}
          <div
            className={`flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6 ${
              language == 'ar' ? '[direction:ltr]' : ''
            }`}
          >
            <Avatar className='h-20 w-20 sm:h-24 sm:w-24 flex-shrink-0'>
              <AvatarImage src={userInfo.profilePicture || ''} />
              <AvatarFallback className='text-xl sm:text-2xl'>
                {userInfo.firstName[0]}
                {userInfo.lastName[0]}
              </AvatarFallback>
            </Avatar>
            {/* User details */}
            <div className='flex-1 text-center sm:text-left w-full'>
              <div className='flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2'>
                <h1 className='text-2xl sm:text-3xl font-bold'>
                  {userInfo.firstName} {userInfo.lastName}
                </h1>
                <div className='flex flex-wrap justify-center sm:justify-start gap-2'>
                  {userInfo.verified && (
                    <Badge
                      variant='default'
                      className='flex items-center gap-1 text-xs'
                    >
                      <Shield className='h-3 w-3' />
                      {t('profile.verified')}
                    </Badge>
                  )}
                </div>
              </div>
              {/* {isAccountDeletionPending && (
                <Badge variant='destructive' className='mb-2 text-xs'>
                  {t('profile.account_deletion_pending')}
                </Badge>
              )} */}
              <div
                className={`text-gray-600 mb-4 text-sm sm:text-base ${
                  language === 'ar' ? 'text-right sm:text-right' : ''
                }`}
              >
                <p>
                  {t('profile.member_since').replace(
                    '{date}',
                    formattedMemberSince
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Quick stats */}
          <div className='grid grid-cols-2 lg:grid-cols-4 gap-4'>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <div className='text-lg sm:text-xl font-bold text-primary'>
                {stats?.totalEarnings ?? 0}€
              </div>
              <div className='text-xs sm:text-sm text-muted-foreground'>
                {t('profile.total_earnings')}
              </div>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <div className='text-lg sm:text-xl font-bold text-primary'>
                {stats?.activeAds ?? 0}
              </div>
              <div className='text-xs sm:text-sm text-muted-foreground'>
                {t('profile.active_ads')}
              </div>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <div className='text-lg sm:text-xl font-bold text-primary'>
                {stats?.completedRentals ?? 0}
              </div>
              <div className='text-xs sm:text-sm text-muted-foreground'>
                {t('profile.rentals_completed')}
              </div>
            </div>
            <div className='text-center p-3 bg-gray-50 rounded-lg'>
              <div className='text-lg sm:text-xl font-bold text-primary'>
                {stats?.averageRating ?? 0}
              </div>
              <div className='text-xs sm:text-sm text-muted-foreground'>
                {t('profile.average_rating')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default ProfileHeader
