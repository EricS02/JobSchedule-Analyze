import { cn } from '../lib/utils'
import Image from 'next/image'

export const Logo = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
    return (
        <>
            <Image
                src="/images/icon128-removebg-preview.png"
                alt="JobSync Logo"
                width={225}
                height={53}
                className={cn('h-12 w-auto dark:hidden', className)}
            />
            <Image
                src="/images/suitcase2.png"
                alt="JobSync Logo"
                width={225}
                height={53}
                className={cn('h-12 w-auto hidden dark:block', className)}
            />
        </>
    )
}

export const LogoIcon = ({ className, uniColor }: { className?: string; uniColor?: boolean }) => {
    return (
        <>
            <Image
                src="/images/icon128-removebg-preview.png"
                alt="JobSync Icon"
                width={53}
                height={53}
                className={cn('size-12 dark:hidden', className)}
            />
            <Image
                src="/images/suitcase2.png"
                alt="JobSync Icon"
                width={53}
                height={53}
                className={cn('size-12 hidden dark:block', className)}
            />
        </>
    )
}

export const LogoStroke = ({ className }: { className?: string }) => {
    return (
        <>
            <Image
                src="/images/icon128-removebg-preview.png"
                alt="JobSync Logo"
                width={188}
                height={66}
                className={cn('size-14 w-14 dark:hidden', className)}
            />
            <Image
                src="/images/suitcase2.png"
                alt="JobSync Logo"
                width={188}
                height={66}
                className={cn('size-14 w-14 hidden dark:block', className)}
            />
        </>
    )
}
