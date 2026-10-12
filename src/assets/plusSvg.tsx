import { ComponentProps, FC } from 'react';

/**
 * Плюс.
 *
 * `fill="currentColor"`, а не `#fff`: біла іконка на світлій кнопці «Додати»
 * ставала невидимою. Тепер колір береться з тексту кнопки — і на світлому,
 * і на темному варіанті.
 */
const PlusSvg: FC<ComponentProps<'svg'>> = ({ ...rest }) => {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            height="24px"
            viewBox="0 -960 960 960"
            width="24px"
            fill="currentColor"
            {...rest}
        >
            <path d="M444-444H240v-72h204v-204h72v204h204v72H516v204h-72v-204Z" />
        </svg>
    );
};

export default PlusSvg;
