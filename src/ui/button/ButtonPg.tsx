/**
 * Historical alias для кнопки пагінації.
 *
 * Був окремою, старішою копією тієї самої shadcn-кнопки з власним набором
 * варіантів — два джерела правди для одного вигляду. Тепер просто реекспорт
 * кнопки з `ui/shadcn/button`, щоб пагінація не роз'їжджалася з рештою
 * інтерфейсу при кожній зміні стилів.
 */
export { Button as default, Button as ButtonPg, type ButtonProps } from '@/ui/shadcn/button';
